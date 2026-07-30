'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from './ui';

// แสดงเมื่อ session ใช้ไม่ได้แล้ว (ถูกปิดบัญชี/ลดสิทธิ์/หมดอายุ) — ไม่ render เนื้อหา admin
export default function SessionExpired() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function relogin() {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4"><div className="card max-w-sm p-8 text-center"><div className="text-4xl"></div><h1 className="mt-3 text-lg font-bold text-neutral-800">เซสชันหมดสิทธิ์</h1><p className="mt-2 text-sm text-neutral-600">
          บัญชีของคุณอาจถูกปิดใช้งานหรือเปลี่ยนสิทธิ์ กรุณาเข้าสู่ระบบใหม่
        </p><button onClick={relogin} disabled={busy} className="btn-primary mt-6 w-full disabled:opacity-70">
          {busy ? <><Spinner /> กำลังออก…</> : 'ออกจากระบบ & เข้าใหม่'}
        </button></div></div> );
}
