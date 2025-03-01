import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';

export async function POST(request) {
  try {
    // Parse request body dengan error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request:', parseError);
      return NextResponse.json(
        { success: false, message: 'Format permintaan tidak valid' },
        { status: 400 }
      );
    }
    
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
    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email sudah terdaftar' },
          { status: 400 }
        );
      }
    } catch (checkError) {
      console.error('Check user error:', checkError);
      return NextResponse.json(
        { success: false, message: 'Gagal memeriksa data pengguna' },
        { status: 500 }
      );
    }
    
    // Buat user baru dengan error handling terpisah
    let user;
    try {
      user = await createUser({ name, email, password });
    } catch (createError) {
      console.error('Create user error:', createError);
      return NextResponse.json(
        { success: false, message: createError.message || 'Gagal membuat pengguna baru' },
        { status: 500 }
      );
    }
    
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: 'Gagal membuat pengguna' },
        { status: 500 }
      );
    }
    
    // Buat token otentikasi sederhana (seharusnya JWT di produksi)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    
    // Berhasil, kembalikan respon sukses
    return NextResponse.json(
      { 
        success: true, 
        message: 'Pendaftaran berhasil',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
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
