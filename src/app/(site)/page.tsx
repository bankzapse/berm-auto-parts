import Link from 'next/link';
import {
  getSettings,
  getCategories,
  getFeaturedProducts,
  getFeatures,
  getGallery,
  formatAddress,
  lineHref,
  lineIsLinkable,
} from '@/lib/data';
import ProductCard from '@/components/ProductCard';

// รูปอะไหล่ฟรี (Unsplash) ที่ตรวจแล้วว่าโหลดได้จริง — ใช้เป็น fallback ถ้ายังไม่อัปรูปจริง
const IMG = {
  hero: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=70', // เครื่องยนต์/สายพาน
  about: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=70', // ช่างขันน็อต
  cta: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=70', // เติมน้ำมันเครื่อง
};

const BRANDS = ['TOYOTA', 'ISUZU', 'HONDA', 'NISSAN', 'MITSUBISHI', 'MAZDA', 'FORD', 'CHEVROLET', 'SUZUKI', 'HINO', 'YAMAHA', 'HONDA'];

export default async function HomePage() {
  const [s, categories, featured, features, gallery] = await Promise.all([
    getSettings(),
    getCategories(),
    getFeaturedProducts(),
    getFeatures(),
    getGallery(),
  ]);

  const tel = (s.phone2 || s.phone).replace(/[^0-9+]/g, '');
  const line = lineIsLinkable(s.lineId) ? lineHref(s.lineId) : '';
  const heroImg = s.heroImage || IMG.hero;
  const aboutImg = s.heroImage || IMG.about;

  // คำค้นหายอดนิยม (จาก SEO keywords หรือค่าเริ่มต้น) — สไตล์เว็บขายส่ง + ดี SEO
  const kwFromSeo = (s.seoKeywords || '').split(',').map((k) => k.trim()).filter(Boolean);
  const keywords = (kwFromSeo.length > 0 ? kwFromSeo : [
    'น้ำมันเครื่อง', 'แบตเตอรี่', 'ยางรถยนต์', 'ผ้าเบรก', 'โช้คอัพ', 'ไดสตาร์ท',
    'กรองอากาศ', 'สายพาน', 'ลูกหมาก', 'หลอดไฟ LED', 'อะไหล่ป่าซาง', 'อะไหล่ลำพูน',
  ]).slice(0, 16);

  const stats = [
    { icon: '🔧', value: '1,000+', label: 'รายการอะไหล่' },
    { icon: '✅', value: 'แท้ & เทียบ', label: 'มีให้เลือกครบ' },
    { icon: '📦', value: 'พร้อมส่ง', label: 'ของในสต๊อก' },
    { icon: '📍', value: 'ป่าซาง', label: 'จ.ลำพูน' },
  ];

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <img
          src={heroImg}
          alt={`ร้าน ${s.shopName}`}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-brand-900/40" />
        {/* เฟืองหมุนตกแต่ง (transform ล้วน) */}
        <Gear className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 animate-spin-slow text-white/5" />
        <Gear className="pointer-events-none absolute bottom-4 right-40 hidden h-28 w-28 animate-spin-slow text-white/5 lg:block" />

        <div className="container-x relative py-20 sm:py-28">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <span className="h-2 w-2 animate-float rounded-full bg-green-400" /> เปิดแล้ววันนี้ • อ.ป่าซาง จ.ลำพูน
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight drop-shadow sm:text-6xl">{s.shopName}</h1>
            <p className="mt-4 max-w-xl text-lg text-brand-100 sm:text-xl">{s.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${tel}`} className="btn-white shadow-lg">📞 โทรเลย {s.phone2 || s.phone}</a>
              <Link href="/products" className="btn-outline border-white text-white hover:bg-white/10">ดูสินค้าทั้งหมด →</Link>
              {line ? (
                <a href={line} target="_blank" rel="noopener noreferrer" className="btn text-white shadow-lg" style={{ backgroundColor: '#06C755' }}>💬 LINE</a>
              ) : null}
            </div>
          </div>
        </div>
        {/* ขอบล่างเฉียง */}
        <svg className="absolute bottom-0 left-0 w-full text-brand-50" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: 40 }}>
          <path fill="currentColor" d="M0,40 C360,70 1080,10 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-brand-50">
        <div className="container-x grid grid-cols-2 gap-4 py-8 sm:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label} className="group rounded-2xl bg-white p-4 text-center shadow-sm transition-transform duration-200 hover:-translate-y-1">
              <div className="text-2xl transition-transform duration-200 group-hover:scale-110">{st.icon}</div>
              <div className="mt-1 text-xl font-extrabold text-brand-800 sm:text-2xl">{st.value}</div>
              <div className="mt-0.5 text-xs text-neutral-600 sm:text-sm">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BRAND MARQUEE ===== */}
      <section className="border-y border-neutral-200 bg-white py-5">
        <div className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">มีอะไหล่สำหรับรถทุกยี่ห้อ</div>
        <div className="relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-10 pr-10">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <span key={i} className="whitespace-nowrap text-2xl font-black text-neutral-300">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== หมวดอะไหล่ ===== */}
      <section className="container-x py-16">
        <SectionHeading title="หมวดอะไหล่" subtitle="เลือกดูอะไหล่ตามหมวดที่ต้องการ" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.length === 0 ? (
            <p className="col-span-full text-neutral-500">ยังไม่มีหมวดสินค้า</p>
          ) : (
            categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?cat=${c.slug}`}
                className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
              >
                <span className="absolute inset-x-0 top-0 h-1 scale-x-0 bg-brand-600 transition-transform duration-200 group-hover:scale-x-100" />
                <span className="text-4xl transition-transform duration-200 group-hover:scale-110">{c.icon || '🔧'}</span>
                <span className="font-semibold text-neutral-800 group-hover:text-brand-800">{c.name}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ===== สินค้ายอดนิยม ===== */}
      {featured.length > 0 && (
        <section className="bg-neutral-50 py-16">
          <div className="container-x">
            <SectionHeading title="สินค้ายอดนิยม" subtitle="อะไหล่ขายดี มีของพร้อมส่ง" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((p, i) => (
                <ProductCard key={p.id} p={p} priority={i < 4} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/products" className="btn-primary shadow-md">ดูสินค้าทั้งหมด →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== จุดเด่น ===== */}
      {features.length > 0 && (
        <section className="container-x py-16">
          <SectionHeading title="ทำไมต้องเบิ้มอะไหล่ยนต์" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.id} className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition-transform duration-200 group-hover:scale-110 group-hover:bg-brand-100">
                  {f.icon || '✅'}
                </div>
                <h3 className="mt-3 font-bold text-neutral-800">{f.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== เกี่ยวกับเรา ===== */}
      <section className="bg-brand-50 py-16">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="text-sm font-bold uppercase tracking-widest text-brand-600">เกี่ยวกับเรา</span>
            <h2 className="mt-2 text-3xl font-bold text-brand-900">{s.aboutTitle}</h2>
            <p className="mt-4 leading-relaxed text-neutral-700">{s.aboutText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/about" className="btn-outline">อ่านเพิ่มเติม</Link>
              <a href={`tel:${tel}`} className="btn-primary">📞 ปรึกษาเรื่องอะไหล่</a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-full w-full rounded-2xl border-2 border-brand-300" />
            <img
              src={aboutImg}
              alt={`ภายในร้าน ${s.shopName}`}
              className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-xl"
              loading="lazy"
              width={800}
              height={600}
            />
          </div>
        </div>
      </section>

      {/* ===== แกลเลอรี ===== */}
      {gallery.length > 0 && (
        <section className="container-x py-16">
          <SectionHeading title="ผลงาน & บรรยากาศร้าน" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.slice(0, 6).map((g) => (
              <div key={g.id} className="group overflow-hidden rounded-xl">
                <img
                  src={g.url}
                  alt={g.caption || 'ผลงานร้านเบิ้มอะไหล่ยนต์'}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  width={400}
                  height={400}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== คำค้นหายอดนิยม (สไตล์เว็บขายส่ง + SEO) ===== */}
      <section className="border-t border-neutral-200 bg-white py-14">
        <div className="container-x">
          <SectionHeading title="ค้นหายอดนิยม" subtitle="อะไหล่ที่ลูกค้าถามหาบ่อย" />
          <div className="flex flex-wrap justify-center gap-2.5">
            {keywords.map((k) => (
              <Link
                key={k}
                href="/products"
                className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 transition-transform duration-150 hover:-translate-y-0.5 hover:border-accent-400 hover:bg-accent-50 hover:text-accent-800"
              >
                {k}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA โทร (รูปพื้นหลังน้ำมันเครื่อง) ===== */}
      <section className="relative overflow-hidden py-20 text-white">
        <img src={IMG.cta} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-brand-900/90" />
        <Gear className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 animate-spin-slow text-white/5" />
        <div className="container-x relative text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">หาอะไหล่ไม่เจอ? โทรถามเราได้เลย</h2>
          <p className="mx-auto mt-3 max-w-2xl text-brand-100">
            แจ้งรุ่นรถและอะไหล่ที่ต้องการ เราหาให้ตรงรุ่น • {formatAddress(s) || 'อ.ป่าซาง จ.ลำพูน'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={`tel:${s.phone.replace(/[^0-9+]/g, '')}`} className="btn-white shadow-lg">📞 {s.phone}</a>
            <a href={`tel:${tel}`} className="btn-white shadow-lg">📱 {s.phone2}</a>
            {line ? (
              <a href={line} target="_blank" rel="noopener noreferrer" className="btn text-white shadow-lg" style={{ backgroundColor: '#06C755' }}>💬 แชท LINE</a>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-3xl font-bold text-brand-900 sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-neutral-600">{subtitle}</p> : null}
      <div className="mx-auto mt-4 flex items-center justify-center gap-2">
        <span className="h-1 w-8 rounded bg-brand-200" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        <span className="h-1 w-16 rounded bg-brand-500" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        <span className="h-1 w-8 rounded bg-brand-200" />
      </div>
    </div>
  );
}

// เฟือง SVG สำหรับตกแต่ง (มีรูตรงกลางในตัว, แสดงเสมอ ไม่พึ่ง opacity/JS)
function Gear({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.03 7.03 0 00-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.48.48 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.13.22.39.31.62.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.23.09.49 0 .62-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z" />
    </svg>
  );
}
