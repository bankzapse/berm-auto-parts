import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanItems(raw: any[]) {
  return (Array.isArray(raw) ? raw : [])
    .filter((it) => it && String(it.name || '').trim() !== '')
    .map((it, i) => {
      const quantity = Number(it.quantity) || 0;
      const unitCost = Number(it.unitCost) || 0;
      return {
        productId: it.productId || null,
        name: String(it.name).trim(),
        sku: String(it.sku || ''),
        unit: String(it.unit || 'ชิ้น'),
        quantity,
        unitCost,
        amount: Math.round(quantity * unitCost * 100) / 100,
        order: i,
      };
    });
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const item = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } }, supplier: true },
    });
    if (!item) return NextResponse.json({ ok: false, error: 'ไม่พบเอกสาร' }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }
  const items = cleanItems(body.items as never[]);
  if (items.length === 0) return NextResponse.json({ ok: false, error: 'กรุณาเพิ่มรายการอย่างน้อย 1 รายการ' }, { status: 400 });
  const total = items.reduce((s, it) => s + it.amount, 0);

  const validStatus = ['DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED'];
  const status = String(body.status || 'DRAFT');
  if (!validStatus.includes(status)) {
    return NextResponse.json({ ok: false, error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const existing = await prisma.purchaseOrder.findUnique({ where: { id }, select: { received: true } });
    if (!existing) return NextResponse.json({ ok: false, error: 'ไม่พบใบสั่งซื้อ' }, { status: 404 });
    // ใบสั่งซื้อที่รับของแล้ว ห้ามแก้รายการ (กันสต็อกเพี้ยน)
    if (existing.received) {
      return NextResponse.json({ ok: false, error: 'ใบสั่งซื้อนี้รับของเข้าแล้ว แก้ไขไม่ได้' }, { status: 400 });
    }

    const po = await prisma.$transaction(async (tx) => {
      await tx.purchaseOrderItem.deleteMany({ where: { poId: id } });
      return tx.purchaseOrder.update({
        where: { id },
        data: {
          supplierId: body.supplierId ? String(body.supplierId) : null,
          status: status as never,
          orderDate: body.orderDate ? new Date(String(body.orderDate)) : undefined,
          note: String(body.note || ''),
          total: Math.round(total * 100) / 100,
          items: { create: items },
        },
        include: { items: true, supplier: true },
      });
    });
    return NextResponse.json({ ok: true, item: po });
  } catch (e) {
    console.error('update PO failed:', e);
    return NextResponse.json({ ok: false, error: 'บันทึกไม่สำเร็จ' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const po = await prisma.purchaseOrder.findUnique({ where: { id }, select: { received: true } });
    if (!po) return NextResponse.json({ ok: false, error: 'ไม่พบใบสั่งซื้อ' }, { status: 404 });
    // รับของแล้วห้ามลบ (กันสต็อกที่เพิ่มไปค้างโดยไม่มีเอกสารอ้างอิง)
    if (po.received) {
      return NextResponse.json(
        { ok: false, error: 'ใบสั่งซื้อนี้รับของเข้าสต็อกแล้ว ลบไม่ได้ — ถ้าต้องแก้สต็อกให้ปรับที่หน้าจัดการสต็อก' },
        { status: 400 },
      );
    }
    await prisma.purchaseOrder.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('delete PO failed:', e);
    return NextResponse.json({ ok: false, error: 'ลบไม่สำเร็จ' }, { status: 500 });
  }
}
