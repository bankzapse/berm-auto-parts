import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategoriesWithProducts, getSettings } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import PageHeader from '@/components/PageHeader';

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
    <>
      <PageHeader title="สินค้า / อะไหล่" subtitle="เลือกดูอะไหล่ตามหมวด • มีทั้งอะไหล่แท้และเทียบ ราคาถูก มีของพร้อมส่ง" />
      <div className="container-x py-10">
      {/* ตัวกรองหมวด */}
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip href="/products" label="ทั้งหมด" active={active === 'all'} />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            href={`/products?cat=${c.slug}`}
            label={c.name}
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
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-md">
                    <GearSvg className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-bold text-brand-900">{c.name}</h2>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-500">
                    {c.products.length} รายการ
                  </span>
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
    </>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'rounded-full bg-gradient-to-r from-brand-600 to-brand-800 px-4 py-2 text-sm font-semibold text-white shadow-md'
          : 'rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-brand-400 hover:text-brand-700'
      }
    >
      {label}
    </Link>
  );
}

function GearSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.03 7.03 0 00-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.48.48 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.13.22.39.31.62.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.23.09.49 0 .62-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z" />
    </svg>
  );
}
