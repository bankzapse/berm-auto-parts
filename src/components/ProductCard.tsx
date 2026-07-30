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
    <article className="card group overflow-hidden transition-transform duration-200 hover:-translate-y-1">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <img
          src={p.image || 'https://picsum.photos/seed/part/800/600'}
          alt={p.name}
          className="h-full w-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
          {...(priority ? { fetchPriority: 'high' as const } : {})}
          width={400}
          height={300}
        />
        {p.brand ? (
          <span className="absolute left-2 top-2 rounded-md bg-brand-700 px-2 py-1 text-xs font-semibold text-white">
            {p.brand}
          </span>
        ) : null}
        {!p.inStock ? (
          <span className="absolute right-2 top-2 rounded-md bg-neutral-800 px-2 py-1 text-xs font-semibold text-white">
            สั่งจอง
          </span>
        ) : null}
      </div>
      <div className="p-4">
        {p.category ? (
          <span className="text-xs font-medium text-brand-600">{p.category.name}</span>
        ) : null}
        <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] font-semibold text-neutral-800">
          {p.name}
        </h3>
        <div className="mt-2 text-lg font-bold text-brand-800">{formatPrice(p)}</div>
      </div>
    </article>
  );
}
