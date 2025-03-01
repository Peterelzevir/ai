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
