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
  return <SettingsForm initial={s} />;
}
