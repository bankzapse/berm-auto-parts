import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';

// ฟิลด์ที่อนุญาตให้แก้ไข (กันการยัดฟิลด์แปลกปลอม)
const ALLOWED = [
  'shopName', 'tagline', 'shopType', 'aboutTitle', 'aboutText',
  'phone', 'phone2', 'lineId', 'facebookUrl',
  'addressLine', 'subDistrict', 'district', 'province', 'postalCode',
  'latitude', 'longitude', 'mapEmbedUrl', 'openHours',
  'taxId', 'docFooter', 'alertWebhookUrl',
  'heroImage', 'logoImage',
  'seoTitle', 'seoDescription', 'seoKeywords', 'ogImage',
] as const;

export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) {
      if (key === 'latitude' || key === 'longitude') {
        const n = Number(body[key]);
        if (!Number.isNaN(n)) data[key] = n;
      } else {
        data[key] = String(body[key] ?? '');
      }
    }
  }
  // ฟิลด์ boolean
  if ('lowStockAlert' in body) {
    data.lowStockAlert = body.lowStockAlert === true || body.lowStockAlert === 'true';
  }

  try {
    const saved = await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    });
    return NextResponse.json({ ok: true, settings: saved });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'save failed' },
      { status: 500 },
    );
  }
}
