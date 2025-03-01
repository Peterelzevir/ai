// middleware.js
import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// Rute yang memerlukan autentikasi
const protectedRoutes = ['/chat'];

// Secret key untuk JWT - gunakan .env di aplikasi nyata
const JWT_SECRET = process.env.JWT_SECRET || 'ai-peter-secret-key-change-this';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Cek apakah rute saat ini memerlukan autentikasi
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Jika bukan rute yang dilindungi, lanjutkan tanpa cek
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Ambil token dari cookie
  const authToken = request.cookies.get('auth-token')?.value;

  // Jika tidak ada token, redirect ke halaman login
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verifikasi token
    verify(authToken, JWT_SECRET);
    
    // Token valid, lanjutkan
    return NextResponse.next();
  } catch (error) {
    // Token tidak valid, redirect ke halaman login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Konfigurasi untuk middleware
export const config = {
  matcher: ['/chat/:path*'] // Terapkan middleware ke semua rute /chat dan sub-rutesnya
};
