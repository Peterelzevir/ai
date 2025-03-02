import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Hapus cookie auth-token dengan opsi yang sama saat pembuatan
    const cookieStore = cookies();
    cookieStore.delete('auth-token', {
      path: '/', // Pastikan path sama dengan saat set cookie
      // Tambahkan opsi lain yang sama dengan saat cookie dibuat
      // httpOnly: true, secure: process.env.NODE_ENV === 'production', etc.
    });
    
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
