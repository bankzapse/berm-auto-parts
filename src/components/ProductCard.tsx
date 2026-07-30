import type { Product, Category } from '@prisma/client';

export function formatPrice(p: Product): string {
  if (p.price == null) return 'สอบถามราคา';
  const num = new Intl.NumberFormat('th-TH').format(p.price);
  return `฿${num}${p.priceLabel ? ' ' + p.priceLabel : ''}`;
}

export default function ProductCard({
  p,
  priority = false,
}: {
  p: Product & { category?: Category | null };
  priority?: boolean;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <img
          src={p.image || 'https://picsum.photos/seed/part/800/600'}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          {...(priority ? { fetchPriority: 'high' as const } : {})}
          width={400}
          height={300}
        />
        {p.brand ? (
          <span className="absolute left-2 top-2 rounded-md bg-brand-700 px-2 py-1 text-xs font-semibold text-white shadow">
            {p.brand}
          </span>
        ) : null}
        <span
          className={`absolute right-2 top-2 rounded-md px-2 py-1 text-xs font-semibold text-white shadow ${
            p.inStock ? 'bg-green-600' : 'bg-neutral-700'
          }`}
        >
          {p.inStock ? 'มีของ' : 'สั่งจอง'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {p.category ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-accent-700">{p.category.name}</span>
        ) : null}
        <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] font-semibold text-neutral-800 group-hover:text-brand-800">
          {p.name}
        </h3>
        {p.fitment ? (
          <p className="mt-1 line-clamp-1 text-xs text-neutral-500">🚗 {p.fitment}</p>
        ) : p.sku ? (
          <p className="mt-1 text-xs text-neutral-400">รหัส: {p.sku}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between border-t border-neutral-100 pt-3">
          <div className="text-lg font-bold text-brand-800">{formatPrice(p)}</div>
          {p.price != null ? <span className="pb-0.5 text-xs text-neutral-400">/ {p.unit || 'ชิ้น'}</span> : null}
        </div>
      </div>
    </article>
  );
}
