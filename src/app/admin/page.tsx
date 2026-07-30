import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function safeCount(fn: () => Promise<number>): Promise<number | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export default async function AdminDashboard() {
  const [products, categories, gallery, team, features, documents, lowStock] = await Promise.all([
    safeCount(() => prisma.product.count()),
    safeCount(() => prisma.category.count()),
    safeCount(() => prisma.galleryImage.count()),
    safeCount(() => prisma.teamMember.count()),
    safeCount(() => prisma.feature.count()),
    safeCount(() => prisma.document.count()),
    safeCount(() => prisma.product.count({ where: { stock: { lte: 0 } } })),
  ]);

  const cards = [
    { label: 'สินค้า/อะไหล่', count: products, href: '/admin/products', icon: '📦' },
    { label: 'เอกสารขาย', count: documents, href: '/admin/documents', icon: '🧾' },
    { label: 'สินค้าหมดสต็อก', count: lowStock, href: '/admin/inventory', icon: '📥' },
    { label: 'หมวดสินค้า', count: categories, href: '/admin/categories', icon: '🗂️' },
    { label: 'รูปแกลเลอรี', count: gallery, href: '/admin/gallery', icon: '🖼️' },
    { label: 'ทีมงาน', count: team, href: '/admin/team', icon: '👥' },
    { label: 'จุดเด่น/บริการ', count: features, href: '/admin/features', icon: '✨' },
  ];

  const dbOk = products !== null;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">แดชบอร์ด</h1>
      <p className="mb-6 text-neutral-500">ยินดีต้อนรับสู่ระบบจัดการเว็บไซต์เบิ้มอะไหล่ยนต์</p>

      {!dbOk && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠️ เชื่อมต่อฐานข้อมูลไม่ได้ — ตรวจสอบ <code>DATABASE_URL</code> / <code>DIRECT_URL</code>{' '}
          ในไฟล์ <code>.env</code> แล้วรัน <code>npm run db:push</code>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card p-5 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{c.icon}</span>
              <span className="text-2xl font-bold text-brand-800">{c.count ?? '—'}</span>
            </div>
            <div className="mt-2 font-medium text-neutral-700">{c.label}</div>
          </Link>
        ))}
        <Link
          href="/admin/stickers"
          className="card flex flex-col justify-between bg-brand-700 p-5 text-white transition-transform hover:-translate-y-1"
        >
          <span className="text-3xl">🏷️</span>
          <div className="mt-2 font-semibold">พิมพ์สติกเกอร์ติดสินค้า →</div>
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href="/admin/settings" className="btn-outline">
          ⚙️ แก้ข้อมูลร้าน & SEO
        </Link>
        <Link href="/admin/products" className="btn-primary">
          ➕ จัดการสินค้า
        </Link>
      </div>
    </div>
  );
}
