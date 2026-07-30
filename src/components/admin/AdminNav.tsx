'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Spinner } from './ui';

const LINKS = [
  { href: '/admin', label: 'แดชบอร์ด', icon: '📊' },
  { href: '/admin/products', label: 'สินค้า / อะไหล่', icon: '📦' },
  { href: '/admin/inventory', label: 'จัดการสต็อก', icon: '📥' },
  { href: '/admin/documents', label: 'ใบเสร็จ/ใบวางบิล', icon: '🧾' },
  { href: '/admin/stickers', label: 'พิมพ์สติกเกอร์', icon: '🏷️' },
  { href: '/admin/categories', label: 'หมวดสินค้า', icon: '🗂️' },
  { href: '/admin/gallery', label: 'แกลเลอรี', icon: '🖼️' },
  { href: '/admin/team', label: 'ทีมงาน', icon: '👥' },
  { href: '/admin/features', label: 'จุดเด่น/บริการ', icon: '✨' },
  { href: '/admin/settings', label: 'ข้อมูลร้าน & SEO', icon: '⚙️' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [out, setOut] = useState(false);

  async function logout() {
    setOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col gap-1 bg-brand-950 p-3 text-brand-100 md:h-screen md:w-64 md:sticky md:top-0">
      <div className="mb-2 px-2 py-3">
        <div className="text-lg font-bold text-white">เบิ้มอะไหล่ยนต์</div>
        <div className="text-xs text-brand-300">ระบบผู้ดูแล</div>
      </div>
      <nav className="grid grid-cols-2 gap-1 md:grid-cols-1">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                active ? 'bg-brand-700 text-white' : 'hover:bg-brand-900'
              }`}
            >
              <span>{l.icon}</span> {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1 pt-3">
        <Link href="/" target="_blank" className="rounded-lg px-3 py-2 text-sm hover:bg-brand-900">
          🌐 เปิดหน้าเว็บ
        </Link>
        <button
          onClick={logout}
          disabled={out}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-900"
        >
          {out ? <Spinner className="h-4 w-4" /> : '🚪'} ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
