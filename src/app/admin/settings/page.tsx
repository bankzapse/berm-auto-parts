import { getSettings } from '@/lib/data';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-neutral-800">ข้อมูลร้าน & SEO</h1>
      <p className="mb-6 text-neutral-500">แก้ไขข้อมูลติดต่อ ที่อยู่ และค่า SEO ของเว็บไซต์</p>
      <SettingsForm initial={s} />
    </div>
  );
}
