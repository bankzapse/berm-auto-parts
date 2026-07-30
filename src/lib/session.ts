import { cache } from 'react';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { SESSION_COOKIE, parseSessionToken, type Session } from './auth';

// อ่าน session จาก cookie แล้วตรวจซ้ำกับฐานข้อมูล (memoize ต่อ 1 request)
// - เจ้าของ (env, userId 'owner') ไม่ต้องเช็ก DB
// - ผู้ใช้จริง: ต้องยัง active และใช้ role ล่าสุดจาก DB (ปิดบัญชี/ลด role แล้วหมดสิทธิ์ทันที)
export const getSession = cache(async (): Promise<Session | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const parsed = await parseSessionToken(token);
  if (!parsed) return null;
  if (parsed.userId === 'owner') return parsed;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parsed.userId },
      select: { active: true, role: true },
    });
    if (!user || !user.active) return null;
    return { userId: parsed.userId, role: user.role as Session['role'] };
  } catch {
    return null; // DB ล่ม → ปฏิเสธผู้ใช้ (fail closed); เจ้าของผ่าน env ยังใช้งานได้
  }
});

export async function isAuthed(): Promise<boolean> {
  return (await getSession()) !== null;
}

export async function isOwner(): Promise<boolean> {
  const s = await getSession();
  return s?.role === 'OWNER';
}
