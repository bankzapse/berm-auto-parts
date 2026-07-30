import { prisma } from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/lib/data';
import { isOwner } from '@/lib/session';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  if (!(await isOwner())) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800">
         หน้านี้สำหรับ<strong>เจ้าของร้าน</strong>เท่านั้น
      </div>
    );
  }

  // อ่านแบบไม่กลืน error เพื่อให้รู้ทันทีถ้าต่อ DB ไม่ได้ (ไม่งั้นฟอร์มจะโชว์ค่า default แล้วบันทึกไม่ได้)
  let dbOk = true;
  let s = DEFAULT_SETTINGS;
  try {
    const row = await prisma.settings.findUnique({ where: { id: 'singleton' } });
    if (row) s = row;
  } catch {
    dbOk = false;
  }

  return <SettingsForm initial={s} dbOk={dbOk} />;
}
