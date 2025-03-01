// /app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/db';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';

// Secret key untuk JWT - gunakan .env di aplikasi nyata
const JWT_SECRET = process.env.JWT_SECRET || 'ai-peter-secret-key-change-this';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Validasi data
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }
    
    // Verifikasi kredensial
    const user = await verifyCredentials(email, password);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }
    
    // Buat JWT token
    const token = sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token berlaku 7 hari
    );
    
    // Set token ke cookie
    const cookieStore = cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    });
    
    // Berhasil, kembalikan respon sukses
    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}
