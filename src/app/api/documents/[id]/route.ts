import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';
import { computeTotals } from '@/lib/documents';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const item = await prisma.document.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!item) return NextResponse.json({ ok: false, error: 'ไม่พบเอกสาร' }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }

  const totals = computeTotals(
    Array.isArray(body.items) ? (body.items as never[]) : [],
    Number(body.discount) || 0,
    Number(body.vatRate) || 0,
  );
  if (totals.items.length === 0) {
    return NextResponse.json({ ok: false, error: 'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ' }, { status: 400 });
  }

  try {
    // แทนที่รายการสินค้าทั้งหมด แล้วอัปเดตยอดรวม (ไม่แตะสต็อกซ้ำ)
    const updated = await prisma.$transaction(async (tx) => {
      await tx.documentItem.deleteMany({ where: { documentId: id } });
      return tx.document.update({
        where: { id },
        data: {
          status: (String(body.status || 'ISSUED') as never),
          issueDate: body.issueDate ? new Date(String(body.issueDate)) : undefined,
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
          items: { create: totals.items },
        },
        include: { items: true },
      });
    });
    return NextResponse.json({ ok: true, item: updated });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ' },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'ลบไม่สำเร็จ' },
      { status: 500 },
    );
  }
}
