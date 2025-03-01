export const dynamic = 'force-dynamic';

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
