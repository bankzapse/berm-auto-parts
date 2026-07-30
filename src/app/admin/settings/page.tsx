import { getSettings } from '@/lib/data';
import { isOwner } from '@/lib/session';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  if (!(await isOwner())) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800">
        🔒 หน้านี้สำหรับ<strong>เจ้าของร้าน</strong>เท่านั้น
      </div>
    );
  }
  const s = await getSettings();
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">ข้อมูลร้าน & SEO</h1>
      <p className="mb-6 text-neutral-500">แก้ไขข้อมูลติดต่อ ที่อยู่ และค่า SEO ของเว็บไซต์</p>
      <SettingsForm initial={s} />
    </div>
  );
}
