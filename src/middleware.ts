import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

// ป้องกันทุกหน้า /admin (ยกเว้นหน้า login) — ถ้าไม่ล็อกอินเด้งไป /admin/login
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  if (isLoginPage) {
    // ถ้าล็อกอินอยู่แล้วเข้าหน้า login ให้ส่งไปหน้า dashboard
    if (authed) return NextResponse.redirect(new URL('/admin', req.url));
    return NextResponse.next();
  }

  if (!authed) {
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
