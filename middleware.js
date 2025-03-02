// middleware.js
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// Secret key untuk JWT - gunakan .env di aplikasi nyata
const JWT_SECRET = process.env.JWT_SECRET || 'ai-peter-secret-key-change-this';

// Rute yang memerlukan autentikasi
const PROTECTED_ROUTES = ['/chat', '/profile', '/settings', '/api/chat'];
// Rute publik yang tidak perlu redirect (login, register, dll)
const PUBLIC_AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

/**
 * Extract and verify JWT token from various sources
 * @param {Request} request - Next.js request object
 * @returns {Object|null} The decoded token payload or null if invalid
 */
function getTokenPayload(request) {
  let token = null;
  
  // 1. Check for cookie token first (primary auth method)
  const authCookie = request.cookies.get('auth-token')?.value;
  if (authCookie) {
    token = authCookie;
  } 
  
  // 2. Check Authorization header as fallback (for API clients)
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  // If no token found, return null
  if (!token) {
    return null;
  }
  
  // Verify token
  try {
    const payload = verify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // If not a protected route, allow without verification
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Get token payload
  const tokenPayload = getTokenPayload(request);
  
  // If token is valid, allow the request
  if (tokenPayload) {
    // Optional: Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('X-User-ID', tokenPayload.id);
    response.headers.set('X-User-Email', tokenPayload.email);
    return response;
  }
  
  // If API route, return 401 Unauthorized
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // For non-API routes, redirect to login
  const url = new URL('/login', request.url);
  
  // Add the original URL as a parameter to redirect back after login
  url.searchParams.set('from', pathname);
  
  return NextResponse.redirect(url);
}

// Configuration: which routes to run the middleware on
export const config = {
  matcher: [
    // Match all routes that need protection
    '/chat/:path*',
    '/profile/:path*', 
    '/settings/:path*',
    '/api/chat/:path*',
    
    // Exclude static files and api routes that don't need protection
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
