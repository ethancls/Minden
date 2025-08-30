import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n/config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});

function extractLocale(pathname: string): { locale: string; rest: string } {
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const locale = (locales as readonly string[]).includes(maybeLocale as any)
    ? maybeLocale!
    : defaultLocale;
  const rest = (segments.slice((locales as readonly string[]).includes(maybeLocale as any) ? 1 : 0).join('/'));
  return { locale, rest: '/' + rest };
}

export default async function middleware(req: NextRequest) {
  // First, run i18n middleware to ensure locale handling
  const i18nRes = intlMiddleware(req);

  const { pathname, origin } = req.nextUrl;
  const { locale, rest } = extractLocale(pathname);

  // Define auth routes and protected routes (URL after locale)
  const isAuthRoute = rest.startsWith('/auth');
  const isProtectedRoute = ['/dashboard', '/alerts', '/machines', '/settings', '/tenants', '/admin']
    .some((p) => rest.startsWith(p));

  // Read NextAuth JWT token (strategy: 'jwt')
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If authenticated and on auth pages → redirect to app
  if (token && isAuthRoute) {
    const url = new URL(`/${locale}/machines`, origin);
    return NextResponse.redirect(url);
  }

  // If not authenticated and on protected pages → redirect to sign-in with callback (absolute to NEXTAUTH_URL)
  if (!token && isProtectedRoute) {
    const base = (process.env.NEXTAUTH_URL || origin).replace(/\/$/, '');
    const signin = new URL(`${base}/${locale}/auth/signin`);
    const callback = `${base}${req.nextUrl.pathname}${req.nextUrl.search}`;
    signin.searchParams.set('callbackUrl', callback);
    return NextResponse.redirect(signin);
  }

  // Otherwise, continue
  return i18nRes;
}

export const config = {
  // Skip static files and API routes
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
