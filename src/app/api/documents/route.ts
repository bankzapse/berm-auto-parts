import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';
import { computeTotals, docPrefix, type DocTypeKey } from '@/lib/documents';

export async function GET() {
  try {
    const items = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      take: 200,
    });
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'error', items: [] },
      { status: 500 },
    );
  }
}

async function nextDocNumber(type: DocTypeKey): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const count = await prisma.document.count({
    where: { type, createdAt: { gte: start, lt: end } },
  });
  const seq = String(count + 1).padStart(3, '0');
  return `${docPrefix(type)}${yy}${mm}-${seq}`;
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

  const type = (String(body.type || 'RECEIPT') as DocTypeKey);
  const totals = computeTotals(
    Array.isArray(body.items) ? (body.items as never[]) : [],
    Number(body.discount) || 0,
    Number(body.vatRate) || 0,
  );
  if (totals.items.length === 0) {
    return NextResponse.json({ ok: false, error: 'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ' }, { status: 400 });
  }

  const deductStock = body.deductStock === true && type === 'RECEIPT';

  try {
    const created = await prisma.$transaction(async (tx) => {
      const docNumber = await nextDocNumber(type);
      const doc = await tx.document.create({
        data: {
          docNumber,
          type,
          status: (String(body.status || 'ISSUED') as never),
          issueDate: body.issueDate ? new Date(String(body.issueDate)) : new Date(),
          dueDate: body.dueDate ? new Date(String(body.dueDate)) : null,
          customerName: String(body.customerName || ''),
          customerAddress: String(body.customerAddress || ''),
          customerPhone: String(body.customerPhone || ''),
          customerTaxId: String(body.customerTaxId || ''),
          note: String(body.note || ''),
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
          const p = await tx.product.findUnique({ where: { id: it.productId } });
          if (!p) continue;
          const qty = Math.round(it.quantity);
          const newStock = p.stock - qty;
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
          await tx.product.update({
            where: { id: it.productId },
            data: { stock: newStock, inStock: newStock > 0 },
          });
        }
      }

      return doc;
    });

    return NextResponse.json({ ok: true, item: created });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'สร้างเอกสารไม่สำเร็จ' },
      { status: 500 },
    );
  }
}
