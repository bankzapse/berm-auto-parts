import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';
import { computeTotals, docPrefix, DOC_TYPES, DOC_STATUS, type DocTypeKey } from '@/lib/documents';
import { checkLowStockAlert } from '@/lib/notify';

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: 'unauthorized', items: [] }, { status: 401 });
  }
  try {
    const items = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      take: 200,
    });
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: 'อ่านข้อมูลไม่สำเร็จ', items: [] }, { status: 500 });
  }
}

// สร้างเลขที่เอกสาร: ใช้เลขต่อจากตัวสูงสุดของเดือน (ไม่ใช่ count) — กันเลขชนหลังลบเอกสาร
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function nextDocNumber(tx: any, type: DocTypeKey): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${docPrefix(type)}${yy}${mm}-`;
  const latest = await tx.document.findFirst({
    where: { type, docNumber: { startsWith: prefix } },
    orderBy: { docNumber: 'desc' },
    select: { docNumber: true },
  });
  let seq = 1;
  if (latest) {
    const n = parseInt(String(latest.docNumber).slice(prefix.length), 10);
    if (Number.isFinite(n)) seq = n + 1;
  }
  return `${prefix}${String(seq).padStart(3, '0')}`;
}

function isUniqueError(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'code' in e && (e as { code?: string }).code === 'P2002';
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }

  // ตรวจ enum ก่อน (กันค่าแปลกปลอมทะลุไป Prisma แล้ว 500)
  const type = String(body.type || 'RECEIPT') as DocTypeKey;
  if (!DOC_TYPES.some((t) => t.value === type)) {
    return NextResponse.json({ ok: false, error: 'ประเภทเอกสารไม่ถูกต้อง' }, { status: 400 });
  }
  const status = String(body.status || 'ISSUED');
  if (!DOC_STATUS.some((s) => s.value === status)) {
    return NextResponse.json({ ok: false, error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
  }

  const deductStock = body.deductStock === true && type === 'RECEIPT';

  try {
    // คำนวณยอดในบล็อกที่จับ error (กัน items รูปแบบผิดทำให้ 500 ดิบ)
    const totals = computeTotals(
      Array.isArray(body.items) ? (body.items as never[]) : [],
      Number(body.discount) || 0,
      Number(body.vatRate) || 0,
    );
    if (totals.items.length === 0) {
      return NextResponse.json({ ok: false, error: 'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ' }, { status: 400 });
    }

    // ลองสร้างพร้อม retry ถ้าเลขที่ชนกัน (P2002)
    let created;
    let insufficient: string | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        created = await prisma.$transaction(async (tx) => {
          const docNumber = await nextDocNumber(tx, type);
          const doc = await tx.document.create({
            data: {
              docNumber,
              type,
              status: status as never,
              issueDate: body.issueDate ? new Date(String(body.issueDate)) : new Date(),
              dueDate: body.dueDate ? new Date(String(body.dueDate)) : null,
              customerId: body.customerId ? String(body.customerId) : null,
              customerName: String(body.customerName || ''),
              customerAddress: String(body.customerAddress || ''),
              customerPhone: String(body.customerPhone || ''),
              customerTaxId: String(body.customerTaxId || ''),
              note: String(body.note || ''),
              paymentMethod: String(body.paymentMethod || 'cash'),
              paidAmount: Number(body.paidAmount) || 0,
              discount: totals.discount,
              vatRate: totals.vatRate,
              subtotal: totals.subtotal,
              vatAmount: totals.vatAmount,
              total: totals.total,
              stockDeducted: deductStock,
              items: { create: totals.items },
            },
            include: { items: true },
          });

          if (deductStock) {
            for (const it of totals.items) {
              if (!it.productId || it.quantity <= 0) continue;
              const qty = Math.round(it.quantity);
              // ตัดสต็อกแบบ atomic + กันติดลบ (เงื่อนไข stock >= qty)
              const upd = await tx.product.updateMany({
                where: { id: it.productId, stock: { gte: qty } },
                data: { stock: { decrement: qty } },
              });
              if (upd.count === 0) {
                const p = await tx.product.findUnique({ where: { id: it.productId } });
                insufficient = `สต็อกไม่พอ: ${it.name} (คงเหลือ ${p?.stock ?? 0} ${p?.unit ?? ''})`;
                throw new Error('INSUFFICIENT_STOCK');
              }
              const p = await tx.product.findUnique({ where: { id: it.productId }, select: { stock: true } });
              const newStock = p?.stock ?? 0;
              await tx.product.update({ where: { id: it.productId }, data: { inStock: newStock > 0 } });
              await tx.stockMovement.create({
                data: {
                  productId: it.productId,
                  type: 'OUT',
                  quantity: qty,
                  balance: newStock,
                  note: 'ตัดสต็อกจากการขาย',
                  refDoc: doc.docNumber,
                },
              });
            }
          }
          return doc;
        });
        break; // สำเร็จ
      } catch (e) {
        if (insufficient) return NextResponse.json({ ok: false, error: insufficient }, { status: 400 });
        if (isUniqueError(e) && attempt < 3) continue; // เลขที่ชน → ลองใหม่
        throw e;
      }
    }

    if (deductStock) {
      const ids = totals.items.map((it) => it.productId).filter((x): x is string => !!x);
      await checkLowStockAlert(ids);
    }

    return NextResponse.json({ ok: true, item: created });
  } catch (e) {
    console.error('create document failed:', e);
    return NextResponse.json({ ok: false, error: 'สร้างเอกสารไม่สำเร็จ' }, { status: 500 });
  }
}
