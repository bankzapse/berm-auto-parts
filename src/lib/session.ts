import { cookies } from 'next/headers';
import { SESSION_COOKIE, parseSessionToken, type Session } from './auth';

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return parseSessionToken(token);
}

export async function isAuthed(): Promise<boolean> {
  return (await getSession()) !== null;
}

export async function isOwner(): Promise<boolean> {
  const s = await getSession();
  return s?.role === 'OWNER';
}
