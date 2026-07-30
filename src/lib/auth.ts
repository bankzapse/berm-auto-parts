// ระบบ session อย่างง่าย: cookie ที่เซ็นด้วย HMAC-SHA256 (AUTH_SECRET)
// ใช้ Web Crypto (crypto.subtle) ทำงานได้ทั้งใน Edge middleware และ Node route
export const SESSION_COOKIE = 'bb_admin';
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 วัน

function getSecret(): string {
  return process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';
}

function toBase64Url(bytes: ArrayBuffer): string {
  const b = Buffer.from(new Uint8Array(bytes)).toString('base64');
  return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return toBase64Url(sig);
}

// สร้าง token: "<expiry>.<signature>"
export async function createSessionToken(): Promise<{ value: string; maxAge: number }> {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const payload = `admin:${expiry}`;
  const sig = await hmac(payload);
  return { value: `${payload}.${sig}`, maxAge: SESSION_TTL_SEC };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const idx = token.lastIndexOf('.');
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = await hmac(payload);
  if (!timingSafeEqual(sig, expected)) return false;
  const [, expStr] = payload.split(':');
  const exp = Number(expStr);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
  return true;
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  return timingSafeEqual(input, expected);
}
