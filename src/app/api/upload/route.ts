import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/session';
import { getSupabaseAdmin, getBucketName, ensureBucket } from '@/lib/supabase';

export const runtime = 'nodejs';

// สร้างชื่อไฟล์แบบไม่ชนกัน โดยไม่ใช้ Math.random ที่อาจถูกจำกัด
let counter = 0;
function uniqueName(ext: string): string {
  counter = (counter + 1) % 100000;
  return `${Date.now().toString(36)}-${counter.toString(36)}.${ext}`;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'ยังไม่ได้ตั้งค่า Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' },
      { status: 500 },
    );
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get('file');
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad form data' }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ ok: false, error: 'ไม่พบไฟล์รูป' }, { status: 400 });
  }

  // จำกัดชนิดไฟล์ (เฉพาะรูป) และขนาด (กัน DoS / ไฟล์อันตราย)
  const ALLOWED_TYPES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const safeType = (file.type || '').toLowerCase();
  if (!ALLOWED_TYPES[safeType]) {
    return NextResponse.json({ ok: false, error: 'อนุญาตเฉพาะไฟล์รูป (jpg/png/webp/gif)' }, { status: 400 });
  }
  const MAX_BYTES = 8 * 1024 * 1024; // 8MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'ไฟล์ใหญ่เกิน 8MB' }, { status: 400 });
  }

  const bucket = getBucketName();
  try {
    await ensureBucket(supabase, bucket);
  } catch {
    // ถ้าสร้าง bucket ไม่ได้ ให้ลองอัปโหลดต่อ (อาจมี bucket อยู่แล้ว)
  }

  const ext = ALLOWED_TYPES[safeType];
  const path = `${new Date().getFullYear()}/${uniqueName(ext)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: safeType,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
