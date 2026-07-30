import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let password = '';
  try {
    const body = await req.json();
    password = String(body?.password ?? '');
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: 'ยังไม่ได้ตั้งค่า ADMIN_PASSWORD ในระบบ' },
      { status: 500 },
    );
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  const { value, maxAge } = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return res;
}
