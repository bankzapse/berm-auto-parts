import Link from 'next/link';

// หัวหน้าเพจแบบ corporate (ไล่สีแดง→น้ำเงิน) ใช้ร่วมทุกหน้าลูกค้าให้เข้าชุดกัน
export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-950 to-accent-950 text-white">
      {/* เฟืองตกแต่ง หมุนช้า (transform ล้วน) */}
      <svg
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 animate-spin-slow text-white/5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.03 7.03 0 00-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.48.48 0 00-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.13.22.39.31.62.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.23.09.49 0 .62-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z" />
      </svg>
      <div className="container-x relative py-12 sm:py-14">
        <nav className="mb-2 flex items-center gap-2 text-sm text-brand-200">
          <Link href="/" className="hover:text-white">หน้าแรก</Link>
          <span>/</span>
          <span className="text-white">{title}</span>
        </nav>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-brand-100">{subtitle}</p> : null}
      </div>
    </section>
  );
}
