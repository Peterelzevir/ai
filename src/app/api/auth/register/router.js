// /app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;
    
    // Validasi data
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Semua kolom harus diisi' },
        { status: 400 }
      );
    }
    
    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid' },
        { status: 400 }
      );
    }
    
    // Validasi password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }
    
    // Cek apakah email sudah terdaftar
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }
    
    // Buat user baru
    const user = await createUser({ name, email, password });
    
    // Berhasil, kembalikan respon sukses
    return NextResponse.json(
      { 
        success: true, 
        message: 'Pendaftaran berhasil',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan saat mendaftar' },
      { status: 500 }
    );
  }
}

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

// /app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Hapus cookie auth-token
    const cookieStore = cookies();
    cookieStore.delete('auth-token');
    
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    );
  }
}

// /app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { getUserByEmail } from '@/lib/db';

// Secret key untuk JWT - gunakan .env di aplikasi nyata
const JWT_SECRET = process.env.JWT_SECRET || 'ai-peter-secret-key-change-this';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }
    
    // Verifikasi token
    const payload = verify(token, JWT_SECRET);
    
    // Dapatkan info user terbaru dari database
    const user = await getUserByEmail(payload.email);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Kembalikan info user
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Sesi tidak valid' },
      { status: 401 }
    );
  }
}
