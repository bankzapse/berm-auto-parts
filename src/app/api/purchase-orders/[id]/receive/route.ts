import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';

// รับของเข้าสต็อกตามใบสั่งซื้อ — สร้างรายการรับเข้า (IN) และเพิ่มยอดคงเหลือ
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // กัน double-receive แบบ atomic: อัปเดตเฉพาะเมื่อ received=false เท่านั้น
      const claim = await tx.purchaseOrder.updateMany({
        where: { id, received: false },
        data: { received: true, status: 'RECEIVED' },
      });
      if (claim.count === 0) {
        // อาจไม่มี PO นี้ หรือถูกรับไปแล้ว
        const exists = await tx.purchaseOrder.findUnique({ where: { id }, select: { id: true } });
        throw new Error(exists ? 'ใบสั่งซื้อนี้รับของเข้าแล้ว' : 'ไม่พบใบสั่งซื้อ');
      }

      const po = await tx.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
      if (!po) throw new Error('ไม่พบใบสั่งซื้อ');

      let receivedCount = 0;
      for (const it of po.items) {
        if (!it.productId || it.quantity <= 0) continue;
        const qty = Math.round(it.quantity);
        // เพิ่มสต็อกแบบ atomic
        const upd = await tx.product.updateMany({
          where: { id: it.productId },
          data: { stock: { increment: qty }, inStock: true, ...(it.unitCost ? { cost: it.unitCost } : {}) },
        });
        if (upd.count === 0) continue; // สินค้าถูกลบไปแล้ว
        const fresh = await tx.product.findUnique({ where: { id: it.productId }, select: { stock: true } });
        await tx.stockMovement.create({
          data: {
            productId: it.productId,
            type: 'IN',
            quantity: qty,
            balance: fresh?.stock ?? qty,
            unitCost: it.unitCost || null,
            note: 'รับเข้าตามใบสั่งซื้อ',
            refDoc: po.poNumber,
          },
        });
        receivedCount++;
      }

      return { po, receivedCount };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'รับของไม่สำเร็จ' }, { status: 400 });
  }
}
