import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

// ป้องกันทุกหน้า /admin (ยกเว้นหน้า login) — ถ้าไม่ล็อกอินเด้งไป /admin/login
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  // ส่ง pathname ให้ layout ตรวจต่อ (ใช้กับการเช็ก session ที่ระดับ layout)
  const withPath = () => {
    const h = new Headers(req.headers);
    h.set('x-pathname', pathname);
    return NextResponse.next({ request: { headers: h } });
  };

  if (isLoginPage) {
    // ถ้าล็อกอินอยู่แล้วเข้าหน้า login ให้ส่งไปหน้า dashboard
    if (authed) return NextResponse.redirect(new URL('/admin', req.url));
    return withPath();
  }

  if (!authed) {
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return withPath();
}

export const config = {
  matcher: ['/admin/:path*'],
};
