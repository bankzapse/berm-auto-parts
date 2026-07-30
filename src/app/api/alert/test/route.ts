import { NextRequest, NextResponse } from 'next/server';
import { isOwner } from '@/lib/session';
import { sendWebhook } from '@/lib/notify';

export async function POST(req: NextRequest) {
  if (!(await isOwner())) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  let url = '';
  try {
    const body = await req.json();
    url = String(body?.url || '');
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }
  if (!url) return NextResponse.json({ ok: false, error: 'ยังไม่ได้ใส่ URL แจ้งเตือน' }, { status: 400 });

  const ok = await sendWebhook(url, '🔔 ทดสอบการแจ้งเตือนจากระบบเบิ้มอะไหล่ยนต์ — ใช้งานได้ปกติ');
  if (!ok) return NextResponse.json({ ok: false, error: 'ส่งไม่สำเร็จ — ตรวจสอบ URL' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
