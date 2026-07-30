'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/products', label: 'สินค้า/อะไหล่' },
  { href: '/gallery', label: 'ผลงาน' },
  { href: '/about', label: 'เกี่ยวกับเรา' },
  { href: '/contact', label: 'ติดต่อ' },
];

export default function Navbar({
  shopName,
  logo,
  phone,
}: {
  shopName: string;
  logo?: string;
  phone: string;
}) {
  const [open, setOpen] = useState(false);
  const tel = phone.replace(/[^0-9+]/g, '');

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          {logo ? (
            <img
              src={logo}
              alt={`โลโก้ ${shopName}`}
              className="h-11 w-11 rounded-full object-cover"
              width={44}
              height={44}
            />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-700 font-bold text-white">
              B.B.
            </span>
          )}
          <span className="text-lg font-bold text-brand-800">{shopName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-brand-50 hover:text-brand-800"
            >
              {n.label}
            </Link>
          ))}
          <a href={`tel:${tel}`} className="btn-primary ml-2 px-4 py-2 text-sm">
            📞 โทรเลย
          </a>
        </nav>

        <button
          type="button"
          aria-label="เมนู"
          className="rounded-lg p-2 text-brand-800 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-neutral-200 bg-white md:hidden">
          <div className="container-x flex flex-col py-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 font-medium text-neutral-700 hover:bg-brand-50"
              >
                {n.label}
              </Link>
            ))}
            <a href={`tel:${tel}`} className="btn-primary mt-2">
              📞 โทรเลย {phone}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
