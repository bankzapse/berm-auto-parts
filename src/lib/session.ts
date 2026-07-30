import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from './auth';

// ตรวจสอบว่า request ปัจจุบันล็อกอินแล้วหรือไม่ (ใช้ใน server component / route handler)
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
