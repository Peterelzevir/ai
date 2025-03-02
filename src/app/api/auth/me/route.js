// api/auth/me/route.js
export const dynamic = 'force-dynamic'; // Prevent caching for this route

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { getUserById } from '@/lib/db';

// Secret key untuk JWT - gunakan .env di aplikasi nyata
const JWT_SECRET = process.env.JWT_SECRET || 'ai-peter-secret-key-change-this';

/**
 * Extract token from various sources
 * @param {Request} request - Next.js request object
 * @returns {string|null} The token or null if not found
 */
function getAuthToken(request) {
  // 1. Try to get token from cookie first
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('auth-token')?.value;
  
  if (tokenCookie) {
    return tokenCookie;
  }
  
  // 2. Try to get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

export async function GET(request) {
  try {
    // Get token from either cookie or header
    const token = getAuthToken(request);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Tidak terautentikasi' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="api"'
          }
        }
      );
    }
    
    // Verify token
    let payload;
    try {
      payload = verify(token, JWT_SECRET);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError.message);
      return NextResponse.json(
        { success: false, message: 'Token tidak valid' },
        { status: 401 }
      );
    }
    
    // Get user data from database
    const user = await getUserById(payload.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Return user data (success)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        // You can include additional non-sensitive user data here
      },
      // Optionally return a refreshed token if it's about to expire
      ...(payload.exp && Date.now() >= (payload.exp * 1000 - 15 * 60 * 1000) ? { 
        token: refreshToken(user)
      } : {})
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat verifikasi' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to refresh token
 * @param {Object} user - User data
 * @returns {string} New JWT token
 */
function refreshToken(user) {
  const { sign } = require('jsonwebtoken');
  
  return sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
