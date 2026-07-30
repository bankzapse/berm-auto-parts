import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOwner } from '@/lib/session';
import { hashPassword, type Role } from '@/lib/auth';

export async function GET() {
  if (!(await isOwner())) {
    return NextResponse.json({ ok: false, error: 'forbidden', items: [] }, { status: 403 });
  }
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, username: true, name: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, items: users });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'error', items: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isOwner())) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const name = String(body.name || '');
  const role = (String(body.role || 'STAFF') as Role) === 'OWNER' ? 'OWNER' : 'STAFF';
  if (!username || password.length < 4) {
    return NextResponse.json({ ok: false, error: 'ต้องมีชื่อผู้ใช้ และรหัสผ่านอย่างน้อย 4 ตัว' }, { status: 400 });
  }
  try {
    const { hash, salt } = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, passwordHash: hash, salt, name, role, active: true },
      select: { id: true, username: true, name: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, item: user });
  } catch (e) {
    const msg = e instanceof Error && e.message.includes('Unique') ? 'ชื่อผู้ใช้นี้มีอยู่แล้ว' : 'สร้างผู้ใช้ไม่สำเร็จ';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
