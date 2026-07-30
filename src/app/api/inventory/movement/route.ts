import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';
import { checkLowStockAlert } from '@/lib/notify';

// รับรายการเคลื่อนไหวสต็อก แล้วอัปเดตยอดคงเหลือแบบ transaction
// body: { productId, type: 'IN'|'OUT'|'ADJUST', quantity, note?, unitCost?, refDoc? }
// - IN: quantity = จำนวนรับเข้า
// - OUT: quantity = จำนวนตัดออก
// - ADJUST: quantity = ยอดนับจริง (ตั้งค่าคงเหลือใหม่)
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

  const productId = String(body.productId || '');
  const type = String(body.type || '');
  const qtyRaw = Number(body.quantity);
  const note = String(body.note || '');
  const refDoc = String(body.refDoc || '');
  const unitCost = body.unitCost === '' || body.unitCost == null ? null : Number(body.unitCost);

  if (!productId || !['IN', 'OUT', 'ADJUST'].includes(type)) {
    return NextResponse.json({ ok: false, error: 'ข้อมูลไม่ครบ' }, { status: 400 });
  }
  // กันค่าที่ไม่ใช่จำนวนจริง (NaN/Infinity/ติดลบ/ใหญ่เกิน)
  if (!Number.isFinite(qtyRaw) || qtyRaw < 0 || qtyRaw > 1_000_000) {
    return NextResponse.json({ ok: false, error: 'จำนวนไม่ถูกต้อง' }, { status: 400 });
  }
  if (unitCost != null && (!Number.isFinite(unitCost) || unitCost < 0)) {
    return NextResponse.json({ ok: false, error: 'ต้นทุนไม่ถูกต้อง' }, { status: 400 });
  }

  const qty = Math.round(qtyRaw);

  try {
    const result = await prisma.$transaction(async (tx) => {
      let newStock: number;
      let movementQty: number;

      if (type === 'IN') {
        movementQty = qty;
        const upd = await tx.product.updateMany({ where: { id: productId }, data: { stock: { increment: qty } } });
        if (upd.count === 0) throw new Error('ไม่พบสินค้า');
      } else if (type === 'OUT') {
        movementQty = qty;
        // ตัดออกแบบ atomic + กันติดลบ (เงื่อนไข stock >= qty)
        const upd = await tx.product.updateMany({
          where: { id: productId, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (upd.count === 0) {
          throw new Error('INSUFFICIENT');
        }
      } else {
        // ADJUST: ตั้งยอดใหม่เท่ากับที่นับได้ (อ่านค่าปัจจุบันเพื่อบันทึกส่วนต่าง)
        const cur = await tx.product.findUnique({ where: { id: productId }, select: { stock: true } });
        if (!cur) throw new Error('ไม่พบสินค้า');
        movementQty = Math.abs(qty - cur.stock);
        await tx.product.update({ where: { id: productId }, data: { stock: qty } });
      }

      const fresh = await tx.product.findUnique({ where: { id: productId } });
      if (!fresh) throw new Error('ไม่พบสินค้า');
      newStock = fresh.stock;

      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          inStock: newStock > 0,
          ...(type === 'IN' && unitCost != null ? { cost: unitCost } : {}),
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type: type as 'IN' | 'OUT' | 'ADJUST',
          quantity: movementQty,
          balance: newStock,
          unitCost: type === 'IN' ? unitCost : null,
          note,
          refDoc,
        },
      });

      return { movement, product: updated };
    });

    if (type === 'OUT' || type === 'ADJUST') await checkLowStockAlert([productId]);

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof Error && e.message === 'INSUFFICIENT') {
      const p = await prisma.product.findUnique({ where: { id: productId }, select: { stock: true, unit: true } }).catch(() => null);
      return NextResponse.json({ ok: false, error: `สต็อกไม่พอ (คงเหลือ ${p?.stock ?? 0} ${p?.unit ?? ''})` }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: e instanceof Error && e.message === 'ไม่พบสินค้า' ? 'ไม่พบสินค้า' : 'ทำรายการไม่สำเร็จ' }, { status: 400 });
  }
}
