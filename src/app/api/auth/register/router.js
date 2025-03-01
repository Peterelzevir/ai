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
