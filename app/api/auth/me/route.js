// api/auth/me/route.js
export const dynamic = 'force-dynamic'; // Prevent caching for this route

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose'; // Ganti jsonwebtoken dengan jose
import { getUserById } from '@/lib/db';

// Secret key untuk JWT - gunakan .env di aplikasi nyata
const JWT_SECRET = process.env.JWT_SECRET || 'ai-peter-secret-key-change-this';
// Siapkan secret key dalam format yang diperlukan jose
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

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
    
    // Verify token dengan jose
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(
        token, 
        getSecretKey(),
        {
          algorithms: ['HS256']
        }
      );
      payload = verifiedPayload;
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
    
    // Periksa apakah token hampir kedaluwarsa
    const needsRefresh = payload.exp && Date.now() >= (payload.exp * 1000 - 15 * 60 * 1000);
    
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
      ...(needsRefresh ? { 
        token: await refreshToken(user)
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
 * @returns {Promise<string>} New JWT token
 */
async function refreshToken(user) {
  return new SignJWT({ 
    id: user.id, 
    email: user.email,
    name: user.name 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());
}
