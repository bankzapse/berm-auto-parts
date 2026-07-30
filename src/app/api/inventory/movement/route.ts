import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';

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
  if (Number.isNaN(qtyRaw) || qtyRaw < 0) {
    return NextResponse.json({ ok: false, error: 'จำนวนไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('ไม่พบสินค้า');

      let newStock: number;
      let movementQty: number;
      if (type === 'IN') {
        movementQty = Math.round(qtyRaw);
        newStock = product.stock + movementQty;
      } else if (type === 'OUT') {
        movementQty = Math.round(qtyRaw);
        if (movementQty > product.stock) {
          throw new Error(`สต็อกไม่พอ (คงเหลือ ${product.stock} ${product.unit})`);
        }
        newStock = product.stock - movementQty;
      } else {
        // ADJUST: ตั้งยอดใหม่ = qty ที่นับได้
        newStock = Math.round(qtyRaw);
        movementQty = Math.abs(newStock - product.stock);
      }

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

      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
          inStock: newStock > 0,
          // อัปเดตต้นทุนล่าสุดเมื่อรับเข้าและระบุต้นทุน
          ...(type === 'IN' && unitCost != null ? { cost: unitCost } : {}),
        },
      });

      return { movement, product: updated };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ' },
      { status: 400 },
    );
  }
}
