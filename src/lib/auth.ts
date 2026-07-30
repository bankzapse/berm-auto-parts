// ระบบ session: cookie เซ็นด้วย HMAC-SHA256 (AUTH_SECRET)
// payload = "<userId>:<role>:<expiry>" — ใช้ Web Crypto ได้ทั้ง Edge และ Node
export const SESSION_COOKIE = 'bb_admin';
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 วัน

export type Role = 'OWNER' | 'STAFF';
export interface Session {
  userId: string;
  role: Role;
}

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  // fail closed — ห้าม fallback เป็นค่าคงที่ (จะทำให้ปลอม session ได้)
  if (!s || s.length < 16) {
    throw new Error('AUTH_SECRET is required (อย่างน้อย 16 ตัวอักษร) — ตั้งค่าใน .env / Vercel');
  }
  return s;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const b = Buffer.from(new Uint8Array(bytes)).toString('base64');
  return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

// สร้าง token สำหรับผู้ใช้
export async function createSessionToken(userId: string, role: Role): Promise<{ value: string; maxAge: number }> {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const payload = `${userId}:${role}:${expiry}`;
  const sig = await hmac(payload);
  return { value: `${payload}.${sig}`, maxAge: SESSION_TTL_SEC };
}

// ตรวจ token → คืน session หรือ null
export async function parseSessionToken(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const idx = token.lastIndexOf('.');
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = await hmac(payload);
  if (!timingSafeEqual(sig, expected)) return null;
  const parts = payload.split(':');
  if (parts.length < 3) return null;
  const [userId, role, expStr] = parts;
  const exp = Number(expStr);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return null;
  if (role !== 'OWNER' && role !== 'STAFF') return null;
  return { userId, role };
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  return (await parseSessionToken(token)) !== null;
}

// ---- รหัสผ่านเจ้าของแบบ bootstrap จาก env ----
export function checkOwnerPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  return timingSafeEqual(input, expected);
}

// ---- แฮชรหัสผ่านผู้ใช้ (PBKDF2-SHA256) ----
export async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100000, hash: 'SHA-256' },
    key,
    256,
  );
  return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(salt) };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const { hash: computed } = await hashPassword(password, salt);
  return timingSafeEqual(computed, hash);
}
