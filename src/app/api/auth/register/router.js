import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';

export async function POST(request) {
  try {
    // Cek apakah ada body dalam request
    const contentLength = request.headers.get('content-length');
    if (!contentLength || parseInt(contentLength) === 0) {
      console.error('Request body is empty');
      return NextResponse.json(
        { success: false, message: 'Permintaan tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Parse request body dengan error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request JSON:', parseError);
      return NextResponse.json(
        { success: false, message: 'Format permintaan tidak valid' },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Semua kolom harus diisi' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah ada
    let existingUser;
    try {
      existingUser = await getUserByEmail(email);
    } catch (checkError) {
      console.error('Check user error:', checkError);
      return NextResponse.json(
        { success: false, message: 'Gagal memeriksa data pengguna' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Buat user baru
    let user;
    try {
      user = await createUser({ name, email, password });
    } catch (createError) {
      console.error('Create user error:', createError);
      return NextResponse.json(
        { success: false, message: 'Gagal membuat pengguna baru' },
        { status: 500 }
      );
    }

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: 'Gagal membuat pengguna' },
        { status: 500 }
      );
    }

    // Buat token sederhana
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

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
      { success: false, message: 'Terjadi kesalahan saat mendaftar' },
      { status: 500 }
    );
  }
}
