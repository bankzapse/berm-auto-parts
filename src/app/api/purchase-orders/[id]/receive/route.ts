import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';

// รับของเข้าสต็อกตามใบสั่งซื้อ — สร้างรายการรับเข้า (IN) และเพิ่มยอดคงเหลือ
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
      if (!po) throw new Error('ไม่พบใบสั่งซื้อ');
      if (po.received) throw new Error('ใบสั่งซื้อนี้รับของเข้าแล้ว');

      let receivedCount = 0;
      for (const it of po.items) {
        if (!it.productId || it.quantity <= 0) continue;
        const product = await tx.product.findUnique({ where: { id: it.productId } });
        if (!product) continue;
        const qty = Math.round(it.quantity);
        const newStock = product.stock + qty;
        await tx.stockMovement.create({
          data: {
            productId: it.productId,
            type: 'IN',
            quantity: qty,
            balance: newStock,
            unitCost: it.unitCost || null,
            note: 'รับเข้าตามใบสั่งซื้อ',
            refDoc: po.poNumber,
          },
        });
        await tx.product.update({
          where: { id: it.productId },
          data: {
            stock: newStock,
            inStock: newStock > 0,
            ...(it.unitCost ? { cost: it.unitCost } : {}),
          },
        });
        receivedCount++;
      }

      const updated = await tx.purchaseOrder.update({
        where: { id },
        data: { received: true, status: 'RECEIVED' },
      });
      return { po: updated, receivedCount };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'รับของไม่สำเร็จ' }, { status: 400 });
  }
}
