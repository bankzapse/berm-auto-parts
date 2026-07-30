import { headers } from 'next/headers';
import AdminNav from '@/components/admin/AdminNav';
import SessionExpired from '@/components/admin/SessionExpired';
import { getSession } from '@/lib/session';

export const metadata = {
  title: 'ระบบผู้ดูแล',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const pathname = (await headers()).get('x-pathname') || '';
  const isLogin = pathname.endsWith('/admin/login');

  // หน้า login (ยังไม่ล็อกอิน) แสดงแบบไม่มีเมนู
  if (!session) {
    if (isLogin) return <div className="min-h-screen bg-neutral-100">{children}</div>;
    // มี cookie ผ่าน middleware แต่ session ใช้ไม่ได้ (ถูกปิดบัญชี/ลดสิทธิ์) → ไม่ render เนื้อหา
    return <SessionExpired />;
  }

  return (
    <div className="min-h-screen bg-neutral-100 md:flex">
      <AdminNav role={session.role} />
      <div className="flex-1">
        <div className="mx-auto max-w-5xl p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
