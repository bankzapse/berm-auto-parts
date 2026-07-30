import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  checkOwnerPassword,
  createSessionToken,
  verifyPassword,
  SESSION_COOKIE,
  type Role,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  let username = '';
  let password = '';
  try {
    const body = await req.json();
    username = String(body?.username ?? '').trim();
    password = String(body?.password ?? '');
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }

  let userId = '';
  let role: Role = 'STAFF';
  let authed = false;

  if (username) {
    // ล็อกอินด้วยบัญชีผู้ใช้ (พนักงาน/เจ้าของที่สร้างไว้)
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (user && user.active && (await verifyPassword(password, user.passwordHash, user.salt))) {
        userId = user.id;
        role = user.role as Role;
        authed = true;
      }
    } catch {
      // DB ล่ม — ตกไปเช็ก owner ด้านล่างไม่ได้ (ต้องมี username) → ถือว่าไม่ผ่าน
    }
  } else {
    // เว้นว่าง = เข้าด้วยรหัสเจ้าของจาก env
    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { ok: false, error: 'ยังไม่ได้ตั้งค่า ADMIN_PASSWORD ในระบบ' },
        { status: 500 },
      );
    }
    if (checkOwnerPassword(password)) {
      userId = 'owner';
      role = 'OWNER';
      authed = true;
    }
  }

  if (!authed) {
    return NextResponse.json({ ok: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  const { value, maxAge } = await createSessionToken(userId, role);
  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return res;
}
