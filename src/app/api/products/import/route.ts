import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';

function slugify(s: string): string {
  const base = s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9฀-๿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return base || 'cat';
}

// นำเข้าสินค้าจำนวนมาก (จาก CSV/ตารางที่วาง) — ตรวจ auth, กันซ้ำด้วย SKU, สร้างหมวดอัตโนมัติได้
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return NextResponse.json({ ok: false, error: 'ไม่มีข้อมูลให้นำเข้า' }, { status: 400 });
  if (items.length > 1000) return NextResponse.json({ ok: false, error: 'นำเข้าได้ครั้งละไม่เกิน 1000 แถว' }, { status: 400 });

  try {
    const cats = await prisma.category.findMany();
    const bySlug = new Map(cats.map((c) => [c.slug.toLowerCase(), c.id]));
    const byName = new Map(cats.map((c) => [c.name.trim().toLowerCase(), c.id]));
    let order = cats.length;

    const existingSkus = new Set(
      (await prisma.product.findMany({ where: { NOT: { sku: '' } }, select: { sku: true } })).map((p) =>
        p.sku.toLowerCase(),
      ),
    );

    let created = 0;
    let skipped = 0;
    const seenSkuThisBatch = new Set<string>();

    for (const it of items) {
      const name = String(it.name ?? '').trim();
      if (!name) {
        skipped++;
        continue;
      }
      const sku = String(it.sku ?? '').trim();
      const skuKey = sku.toLowerCase();
      if (sku && (existingSkus.has(skuKey) || seenSkuThisBatch.has(skuKey))) {
        skipped++; // กันซ้ำ
        continue;
      }

      // หาหมวด: slug → name → สร้างใหม่ถ้ามีชื่อ
      let categoryId: string | null = null;
      const cslug = String(it.categorySlug ?? '').trim().toLowerCase();
      const cname = String(it.category ?? it.categoryName ?? '').trim();
      if (cslug && bySlug.has(cslug)) categoryId = bySlug.get(cslug)!;
      else if (cname && byName.has(cname.toLowerCase())) categoryId = byName.get(cname.toLowerCase())!;
      else if (cname) {
        let slug = slugify(cname);
        while (bySlug.has(slug)) slug = `${slug}-${order + 1}`;
        try {
          const nc = await prisma.category.create({ data: { name: cname, slug, order: order++ } });
          bySlug.set(slug, nc.id);
          byName.set(cname.toLowerCase(), nc.id);
          categoryId = nc.id;
        } catch {
          /* ข้ามถ้าสร้างหมวดไม่ได้ */
        }
      }

      const priceNum = it.price === '' || it.price == null ? null : Number(it.price);
      const costNum = it.cost === '' || it.cost == null ? null : Number(it.cost);
      const stock = Math.max(0, Math.round(Number(it.stock) || 0));

      try {
        await prisma.product.create({
          data: {
            name,
            sku,
            brand: String(it.brand ?? ''),
            unit: String(it.unit ?? 'ชิ้น') || 'ชิ้น',
            price: priceNum != null && Number.isFinite(priceNum) ? priceNum : null,
            cost: costNum != null && Number.isFinite(costNum) ? costNum : null,
            fitment: String(it.fitment ?? ''),
            oem: String(it.oem ?? ''),
            barcode: String(it.barcode ?? ''),
            image: String(it.image ?? ''),
            description: String(it.description ?? ''),
            stock,
            inStock: true,
            categoryId,
          },
        });
        if (sku) seenSkuThisBatch.add(skuKey);
        created++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({ ok: true, created, skipped });
  } catch (e) {
    console.error('import failed:', e);
    return NextResponse.json({ ok: false, error: 'นำเข้าไม่สำเร็จ' }, { status: 500 });
  }
}
