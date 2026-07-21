import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getExpectedOrigin(request: NextRequest) {
  const configuredUrl = process.env.APP_URL;
  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      // Environment validation reports malformed APP_URL values at startup.
    }
  }

  return request.nextUrl.origin;
}

function isSameOriginAdminMutation(request: NextRequest) {
  if (!mutatingMethods.has(request.method.toUpperCase())) return true;

  // Passenger terminates TLS before forwarding the request to Next.js, so
  // request.nextUrl.origin can be an internal HTTP address in production.
  const expectedOrigin = getExpectedOrigin(request);
  const origin = request.headers.get('origin');
  if (origin) return origin === expectedOrigin;

  const referer = request.headers.get('referer');
  if (!referer) return false;

  try {
    return new URL(referer).origin === expectedOrigin;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/admin') && !isSameOriginAdminMutation(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('zeo_admin_session');

    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
