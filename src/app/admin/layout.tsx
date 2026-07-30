import AdminNav from '@/components/admin/AdminNav';
import { getSession } from '@/lib/session';

export const metadata = {
  title: 'ระบบผู้ดูแล',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // หน้า login (ยังไม่ล็อกอิน) แสดงแบบไม่มีเมนู
  if (!session) {
    return <div className="min-h-screen bg-neutral-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-100 md:flex">
      <AdminNav role={session.role} />
      <div className="flex-1">
        <div className="mx-auto max-w-4xl p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
