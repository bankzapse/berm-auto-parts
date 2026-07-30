import Link from 'next/link';
import {
  getSettings,
  getCategories,
  getFeaturedProducts,
  getFeatures,
  getGallery,
  formatAddress,
} from '@/lib/data';
import ProductCard from '@/components/ProductCard';

export default async function HomePage() {
  const [s, categories, featured, features, gallery] = await Promise.all([
    getSettings(),
    getCategories(),
    getFeaturedProducts(),
    getFeatures(),
    getGallery(),
  ]);

  const tel = (s.phone2 || s.phone).replace(/[^0-9+]/g, '');
  const stats = [
    { value: '1,000+', label: 'รายการอะไหล่' },
    { value: 'แท้ & เทียบ', label: 'มีให้เลือกครบ' },
    { value: 'พร้อมส่ง', label: 'ของในสต๊อก' },
    { value: 'ป่าซาง', label: 'จ.ลำพูน' },
  ];

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <img
          src={s.heroImage || 'https://picsum.photos/seed/berm-hero/1600/900'}
          alt={`ร้าน ${s.shopName}`}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-900/85 to-brand-800/60" />
        <div className="container-x relative py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
              อ.ป่าซาง จ.ลำพูน
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-5xl">
              {s.shopName}
            </h1>
            <p className="mt-4 text-lg text-brand-100 sm:text-xl">{s.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${tel}`} className="btn-white">
                📞 โทรเลย {s.phone2 || s.phone}
              </a>
              <Link href="/products" className="btn-outline border-white text-white hover:bg-white/10">
                ดูสินค้าทั้งหมด
              </Link>
              {s.facebookUrl ? (
                <a
                  href={s.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline border-white text-white hover:bg-white/10"
                >
                  👍 Facebook
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="border-b border-neutral-200 bg-brand-50">
        <div className="container-x grid grid-cols-2 gap-4 py-8 sm:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label} className="text-center">
              <div className="text-2xl font-bold text-brand-800 sm:text-3xl">{st.value}</div>
              <div className="mt-1 text-sm text-neutral-600">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== หมวดอะไหล่ ===== */}
      <section className="container-x py-14">
        <SectionHeading title="หมวดอะไหล่" subtitle="เลือกดูอะไหล่ตามหมวดที่ต้องการ" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.length === 0 ? (
            <p className="col-span-full text-neutral-500">ยังไม่มีหมวดสินค้า</p>
          ) : (
            categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?cat=${c.slug}`}
                className="card flex flex-col items-center gap-2 p-6 text-center transition-transform hover:-translate-y-1 hover:border-brand-300"
              >
                <span className="text-4xl">{c.icon || '🔧'}</span>
                <span className="font-semibold text-neutral-800">{c.name}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ===== สินค้ายอดนิยม ===== */}
      {featured.length > 0 && (
        <section className="bg-neutral-50 py-14">
          <div className="container-x">
            <SectionHeading title="สินค้ายอดนิยม" subtitle="อะไหล่ขายดี มีของพร้อมส่ง" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((p, i) => (
                <ProductCard key={p.id} p={p} priority={i < 4} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/products" className="btn-primary">
                ดูสินค้าทั้งหมด →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== จุดเด่น ===== */}
      {features.length > 0 && (
        <section className="container-x py-14">
          <SectionHeading title="ทำไมต้องเบิ้มอะไหล่ยนต์" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.id} className="card p-6">
                <div className="text-3xl">{f.icon || '✅'}</div>
                <h3 className="mt-3 font-bold text-neutral-800">{f.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== เกี่ยวกับเรา ===== */}
      <section className="bg-brand-50 py-14">
        <div className="container-x grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-brand-800 sm:text-3xl">{s.aboutTitle}</h2>
            <p className="mt-4 leading-relaxed text-neutral-700">{s.aboutText}</p>
            <div className="mt-6">
              <Link href="/about" className="btn-outline">
                อ่านเพิ่มเติม
              </Link>
            </div>
          </div>
          <img
            src={s.heroImage || 'https://picsum.photos/seed/berm-shop/800/600'}
            alt={`ภายในร้าน ${s.shopName}`}
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md"
            loading="lazy"
            width={800}
            height={600}
          />
        </div>
      </section>

      {/* ===== แกลเลอรี ===== */}
      {gallery.length > 0 && (
        <section className="container-x py-14">
          <SectionHeading title="ผลงาน & บรรยากาศร้าน" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.slice(0, 6).map((g) => (
              <img
                key={g.id}
                src={g.url}
                alt={g.caption || 'ผลงานร้านเบิ้มอะไหล่ยนต์'}
                className="aspect-square w-full rounded-xl object-cover"
                loading="lazy"
                width={400}
                height={400}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===== CTA โทร ===== */}
      <section className="bg-brand-800 py-14 text-white">
        <div className="container-x text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">หาอะไหล่ไม่เจอ? โทรถามเราได้เลย</h2>
          <p className="mt-3 text-brand-100">
            แจ้งรุ่นรถและอะไหล่ที่ต้องการ เราหาให้ตรงรุ่น • {formatAddress(s) || 'อ.ป่าซาง จ.ลำพูน'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={`tel:${s.phone.replace(/[^0-9+]/g, '')}`} className="btn-white">
              📞 {s.phone}
            </a>
            <a href={`tel:${tel}`} className="btn-white">
              📱 {s.phone2}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-bold text-brand-800 sm:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-neutral-600">{subtitle}</p> : null}
      <div className="mx-auto mt-3 h-1 w-16 rounded bg-brand-500" />
    </div>
  );
}
