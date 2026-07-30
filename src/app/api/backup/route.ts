import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOwner } from '@/lib/session';

// สำรองข้อมูลทั้งหมดเป็น JSON (เฉพาะเจ้าของ) — ไม่รวมรหัสผ่านผู้ใช้
export async function GET() {
  if (!(await isOwner())) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  try {
    const [settings, categories, products, gallery, team, features, suppliers, customers, documents, purchaseOrders, movements] =
      await Promise.all([
        prisma.settings.findUnique({ where: { id: 'singleton' } }),
        prisma.category.findMany(),
        prisma.product.findMany(),
        prisma.galleryImage.findMany(),
        prisma.teamMember.findMany(),
        prisma.feature.findMany(),
        prisma.supplier.findMany(),
        prisma.customer.findMany(),
        prisma.document.findMany({ include: { items: true } }),
        prisma.purchaseOrder.findMany({ include: { items: true } }),
        prisma.stockMovement.findMany({ take: 5000, orderBy: { createdAt: 'desc' } }),
      ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      data: { settings, categories, products, gallery, team, features, suppliers, customers, documents, purchaseOrders, movements },
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="berm-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'export failed' }, { status: 500 });
  }
}
