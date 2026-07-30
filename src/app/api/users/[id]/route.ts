import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOwner } from '@/lib/session';
import { hashPassword, type Role } from '@/lib/auth';

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isOwner())) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  const { id } = await ctx.params;
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if ('name' in body) data.name = String(body.name || '');
  if ('role' in body) data.role = (String(body.role) === 'OWNER' ? 'OWNER' : 'STAFF') as Role;
  if ('active' in body) data.active = body.active === true || body.active === 'true';
  if ('username' in body && String(body.username).trim()) data.username = String(body.username).trim();
  if ('password' in body && String(body.password).length >= 4) {
    const { hash, salt } = await hashPassword(String(body.password));
    data.passwordHash = hash;
    data.salt = salt;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, name: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, item: user });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'update failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isOwner())) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'delete failed' }, { status: 500 });
  }
}
