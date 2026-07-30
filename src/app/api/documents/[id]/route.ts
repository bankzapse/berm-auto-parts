import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';
import { computeTotals, DOC_STATUS } from '@/lib/documents';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const item = await prisma.document.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!item) return NextResponse.json({ ok: false, error: 'ไม่พบเอกสาร' }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, error: 'อ่านข้อมูลไม่สำเร็จ' }, { status: 500 });
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

  const status = String(body.status || 'ISSUED');
  if (!DOC_STATUS.some((s) => s.value === status)) {
    return NextResponse.json({ ok: false, error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ ok: false, error: 'ไม่พบเอกสาร' }, { status: 404 });

    // ฟิลด์ที่แก้ได้เสมอ (ไม่กระทบสต็อก)
    const metaData = {
      status: status as never,
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
    };

    // เอกสารที่ตัดสต็อกไปแล้ว: ห้ามแก้รายการ/ยอด (กันสต็อกเพี้ยน) — แก้ได้เฉพาะข้อมูลหัวเอกสาร/การชำระ
    if (existing.stockDeducted) {
      const updated = await prisma.document.update({
        where: { id },
        data: metaData,
        include: { items: { orderBy: { order: 'asc' } } },
      });
      return NextResponse.json({ ok: true, item: updated, note: 'เอกสารตัดสต็อกแล้ว แก้ได้เฉพาะข้อมูลหัว/การชำระ' });
    }

    const totals = computeTotals(
      Array.isArray(body.items) ? (body.items as never[]) : [],
      Number(body.discount) || 0,
      Number(body.vatRate) || 0,
    );
    if (totals.items.length === 0) {
      return NextResponse.json({ ok: false, error: 'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.documentItem.deleteMany({ where: { documentId: id } });
      return tx.document.update({
        where: { id },
        data: {
          ...metaData,
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
    console.error('update document failed:', e);
    return NextResponse.json({ ok: false, error: 'บันทึกไม่สำเร็จ' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.$transaction(async (tx) => {
      const doc = await tx.document.findUnique({ where: { id }, include: { items: true } });
      if (!doc) return;
      // คืนสต็อกถ้าเอกสารนี้เคยตัดสต็อกไปแล้ว
      if (doc.stockDeducted) {
        for (const it of doc.items) {
          if (!it.productId || it.quantity <= 0) continue;
          const qty = Math.round(it.quantity);
          const p = await tx.product.update({
            where: { id: it.productId },
            data: { stock: { increment: qty }, inStock: true },
            select: { stock: true },
          }).catch(() => null);
          if (!p) continue;
          await tx.stockMovement.create({
            data: {
              productId: it.productId,
              type: 'IN',
              quantity: qty,
              balance: p.stock,
              note: 'คืนสต็อกจากการลบเอกสารขาย',
              refDoc: doc.docNumber,
            },
          });
        }
      }
      await tx.document.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('delete document failed:', e);
    return NextResponse.json({ ok: false, error: 'ลบไม่สำเร็จ' }, { status: 500 });
  }
}
