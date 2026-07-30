import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

// Supabase client ฝั่งเซิร์ฟเวอร์ (service role) — ใช้เฉพาะใน API route ที่เช็ก auth แล้ว
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (cached) return cached;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || 'uploads';
}

// สร้าง bucket แบบ public ถ้ายังไม่มี (idempotent)
export async function ensureBucket(client: SupabaseClient, bucket: string): Promise<void> {
  const { data } = await client.storage.getBucket(bucket);
  if (!data) {
    await client.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: '10MB',
    });
  }
}
