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

export async function GET() {
  try {
    const items = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { supplier: true },
      take: 200,
    });
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'error', items: [] }, { status: 500 });
  }
}

async function nextPoNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const count = await prisma.purchaseOrder.count({ where: { createdAt: { gte: start, lt: end } } });
  return `PO${yy}${mm}-${String(count + 1).padStart(3, '0')}`;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }
  const items = cleanItems(body.items as never[]);
  if (items.length === 0) return NextResponse.json({ ok: false, error: 'กรุณาเพิ่มรายการอย่างน้อย 1 รายการ' }, { status: 400 });
  const total = items.reduce((s, it) => s + it.amount, 0);

  try {
    const poNumber = await nextPoNumber();
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: body.supplierId ? String(body.supplierId) : null,
        status: (String(body.status || 'DRAFT') as never),
        orderDate: body.orderDate ? new Date(String(body.orderDate)) : new Date(),
        note: String(body.note || ''),
        total: Math.round(total * 100) / 100,
        items: { create: items },
      },
      include: { items: true, supplier: true },
    });
    return NextResponse.json({ ok: true, item: po });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'สร้างไม่สำเร็จ' }, { status: 500 });
  }
}
