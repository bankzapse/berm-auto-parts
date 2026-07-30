import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/session';

type FieldType = 'string' | 'stringOrNull' | 'number' | 'boolean' | 'floatOrNull';

export interface CrudConfig {
  model: string; // ชื่อ delegate ใน prisma เช่น 'product'
  fields: Record<string, FieldType>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  include?: Record<string, unknown>;
}

function coerce(value: unknown, type: FieldType): unknown {
  switch (type) {
    case 'number': {
      const n = Number(value);
      return Number.isNaN(n) ? 0 : n;
    }
    case 'floatOrNull': {
      if (value === '' || value === null || value === undefined) return null;
      const n = Number(value);
      return Number.isNaN(n) ? null : n;
    }
    case 'boolean':
      return value === true || value === 'true' || value === 1 || value === '1';
    case 'stringOrNull': {
      const s = value === null || value === undefined ? '' : String(value);
      return s === '' ? null : s;
    }
    default:
      return value === null || value === undefined ? '' : String(value);
  }
}

function pick(body: Record<string, unknown>, fields: CrudConfig['fields'], partial: boolean) {
  const data: Record<string, unknown> = {};
  for (const [key, type] of Object.entries(fields)) {
    if (partial && !(key in body)) continue;
    data[key] = coerce(body[key], type);
  }
  return data;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function delegate(model: string): any {
  return (prisma as any)[model];
}

export function makeCollectionHandlers(cfg: CrudConfig) {
  async function GET() {
    try {
      const items = await delegate(cfg.model).findMany({
        orderBy: cfg.orderBy ?? { createdAt: 'desc' },
        ...(cfg.include ? { include: cfg.include } : {}),
      });
      return NextResponse.json({ ok: true, items });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: e instanceof Error ? e.message : 'error', items: [] },
        { status: 500 },
      );
    }
  }

  async function POST(req: NextRequest) {
    if (!(await isAuthed())) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
    }
    const data = pick(body, cfg.fields, false);
    try {
      const item = await delegate(cfg.model).create({ data });
      return NextResponse.json({ ok: true, item });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: e instanceof Error ? e.message : 'create failed' },
        { status: 500 },
      );
    }
  }

  return { GET, POST };
}

export function makeItemHandlers(cfg: CrudConfig) {
  async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    if (!(await isAuthed())) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    const { id } = await ctx.params;
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
    }
    const data = pick(body, cfg.fields, true);
    try {
      const item = await delegate(cfg.model).update({ where: { id }, data });
      return NextResponse.json({ ok: true, item });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: e instanceof Error ? e.message : 'update failed' },
        { status: 500 },
      );
    }
  }

  async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    if (!(await isAuthed())) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    const { id } = await ctx.params;
    try {
      await delegate(cfg.model).delete({ where: { id } });
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: e instanceof Error ? e.message : 'delete failed' },
        { status: 500 },
      );
    }
  }

  return { PUT, DELETE };
}
