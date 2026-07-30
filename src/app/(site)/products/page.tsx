import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategoriesWithProducts, getSettings } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: 'สินค้า/อะไหล่',
    description: `รวมอะไหล่ยนต์ทุกหมวดที่ ${s.shopName} — น้ำมันเครื่อง แบตเตอรี่ ยาง ช่วงล่าง เบรก ไฟฟ้า เครื่องยนต์`,
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const categories = await getCategoriesWithProducts();
  const active = cat && categories.some((c) => c.slug === cat) ? cat : 'all';
  const shown = active === 'all' ? categories : categories.filter((c) => c.slug === active);

  return (
    <div className="container-x py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-800">สินค้า / อะไหล่</h1>
        <p className="mt-2 text-neutral-600">
          เลือกดูอะไหล่ตามหมวด • มีทั้งอะไหล่แท้และเทียบ ราคาถูก มีของพร้อมส่ง
        </p>
      </header>

      {/* ตัวกรองหมวด */}
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip href="/products" label="ทั้งหมด" active={active === 'all'} />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            href={`/products?cat=${c.slug}`}
            label={`${c.icon || ''} ${c.name}`.trim()}
            active={active === c.slug}
          />
        ))}
      </div>

      {shown.length === 0 || shown.every((c) => c.products.length === 0) ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          ยังไม่มีสินค้าในหมวดนี้ — โทรสอบถามได้เลย
        </p>
      ) : (
        <div className="space-y-12">
          {shown.map((c) =>
            c.products.length === 0 ? null : (
              <section key={c.id} id={c.slug}>
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl">{c.icon}</span>
                  <h2 className="text-xl font-bold text-neutral-800">{c.name}</h2>
                  <span className="text-sm text-neutral-400">({c.products.length})</span>
                </div>
                {c.description ? (
                  <p className="mb-4 text-sm text-neutral-600">{c.description}</p>
                ) : null}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {c.products.map((p) => (
                    <ProductCard key={p.id} p={{ ...p, category: c }} />
                  ))}
                </div>
              </section>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white'
          : 'rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:border-brand-400 hover:text-brand-700'
      }
    >
      {label}
    </Link>
  );
}
