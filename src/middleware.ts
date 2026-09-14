import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define routes that require authentication
  const isAdminRoute = pathname.startsWith('/admin');
  const isTournamentManageRoute = pathname.startsWith('/tournaments') && !pathname.endsWith('/ceremony');
  const isMatchRoute = pathname.startsWith('/match');
  const isPlayersRoute = pathname.startsWith('/players');

  if (isAdminRoute || isTournamentManageRoute || isMatchRoute || isPlayersRoute) {
    const session = request.cookies.get('admin_session');
    
    // If there is no session cookie, redirect to /login
    if (!session || session.value !== 'authenticated') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  // We match everything and filter inside the function for easier exclusion logic
  matcher: [
    '/admin/:path*',
    '/tournaments/:path*',
    '/match/:path*',
    '/players/:path*'
  ],
};
