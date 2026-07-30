'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Spinner } from './ui';

type NavLink = { href: string; label: string; icon: string; ownerOnly?: boolean };
const LINKS: NavLink[] = [
  { href: '/admin', label: 'แดชบอร์ด', icon: '' },
  { href: '/admin/pos', label: 'ขายหน้าร้าน (POS)', icon: '' },
  { href: '/admin/products', label: 'สินค้า / อะไหล่', icon: '' },
  { href: '/admin/inventory', label: 'จัดการสต็อก', icon: '' },
  { href: '/admin/documents', label: 'ใบเสร็จ/ใบวางบิล', icon: '' },
  { href: '/admin/purchase-orders', label: 'ใบสั่งซื้อ (รับเข้า)', icon: '' },
  { href: '/admin/suppliers', label: 'ซัพพลายเออร์', icon: '' },
  { href: '/admin/customers', label: 'ลูกค้า / ค้างชำระ', icon: '' },
  { href: '/admin/stickers', label: 'พิมพ์สติกเกอร์', icon: '' },
  { href: '/admin/reports', label: 'รายงาน/ปิดยอด', icon: '', ownerOnly: true },
  { href: '/admin/categories', label: 'หมวดสินค้า', icon: '' },
  { href: '/admin/gallery', label: 'แกลเลอรี', icon: '' },
  { href: '/admin/team', label: 'ทีมงาน', icon: '' },
  { href: '/admin/features', label: 'จุดเด่น/บริการ', icon: '' },
  { href: '/admin/settings', label: 'ข้อมูลร้าน & SEO', icon: '', ownerOnly: true },
  { href: '/admin/users', label: 'ผู้ใช้งาน & สิทธิ์', icon: '', ownerOnly: true },
];

export default function AdminNav({ role = 'OWNER' }: { role?: 'OWNER' | 'STAFF' }) {
  const links = LINKS.filter((l) => !l.ownerOnly || role === 'OWNER');
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
    <aside className="flex w-full flex-col gap-1 bg-brand-950 p-3 text-brand-100 md:sticky md:top-0 md:h-screen md:w-64 md:overflow-y-auto"><div className="mb-2 px-2 py-3"><div className="text-lg font-bold text-white">เบิ้มอะไหล่ยนต์</div><div className="text-xs text-brand-300">ระบบผู้ดูแล</div></div><nav className="grid grid-cols-2 gap-1 md:grid-cols-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium ${
                active ? 'border-accent-500 bg-brand-800 text-white' : 'border-transparent hover:bg-brand-900'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav><div className="mt-auto flex flex-col gap-1 pt-3"><Link href="/" target="_blank" className="rounded-lg px-3 py-2 text-sm hover:bg-brand-900">
          เปิดหน้าเว็บ 
        </Link><button
          onClick={logout}
          disabled={out}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-900"
        >
          {out ? <Spinner className="h-4 w-4" /> : null} ออกจากระบบ
        </button></div></aside> );
}
