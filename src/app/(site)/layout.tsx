import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CallBar from '@/components/CallBar';
import TopBar from '@/components/TopBar';
import { getSettings } from '@/lib/data';

// อ่านข้อมูลสดจาก DB ทุกครั้ง — แก้ใน admin แล้วขึ้นหน้าเว็บทันที (ไม่ต้อง redeploy)
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <TopBar s={s} />
      <Navbar shopName={s.shopName} logo={s.logoImage} phone={s.phone2 || s.phone} />
      <main className="min-h-[60vh] pb-20 md:pb-0">{children}</main>
      <Footer s={s} />
      <CallBar s={s} />
    </>
  );
}
