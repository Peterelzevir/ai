'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Buat context autentikasi
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cek status login saat aplikasi dimuat
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        console.log('Checking authentication status...');
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          console.log('Auth check returned non-OK status:', response.status);
          setUser(null);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log('User authenticated:', data.user);
          setUser(data.user);
        } else {
          console.log('User not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Fungsi login
  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      // Check for non-JSON responses
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal login');
        } else {
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          throw new Error(`Server error (${response.status}): Gagal login`);
        }
      }
      
      const data = await response.json();
      console.log('Login successful');
      
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Terjadi kesalahan saat login' 
      };
    }
  };

  // Fungsi register
  const register = async (userData) => {
    try {
      console.log('Registering user with data:', { ...userData, password: '***' });
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log('Register response status:', response.status);
      
      // Handle non-OK responses more carefully
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          // If it's JSON, parse it normally
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal mendaftar');
        } else {
          // If it's not JSON (like HTML error page), get the text
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText.substring(0, 200)); // Log just the start
          throw new Error(`Server error (${response.status}): Gagal mendaftar`);
        }
      }
      
      // Safe to parse JSON for successful responses
      const data = await response.json();
      console.log('Registration successful, attempting auto-login');
      
      // Login otomatis setelah pendaftaran berhasil
      const loginResult = await login(userData.email, userData.password);
      
      if (!loginResult.success) {
        console.warn('Auto-login failed after registration');
        throw new Error('Pendaftaran berhasil tetapi gagal login otomatis');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Terjadi kesalahan saat mendaftar' 
      };
    }
  };

  // Fungsi logout
  const logout = async () => {
    try {
      console.log('Logging out user');
      
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setUser(null);
      router.push('/');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  // Fungsi cek apakah user terautentikasi
  const isAuthenticated = () => {
    return !!user;
  };

  // Fungsi untuk memproteksi route
  const requireAuth = (callback) => {
    if (!isAuthenticated()) {
      console.log('Authentication required, redirecting to login');
      router.push('/login');
      return false;
    }
    if (callback) callback();
    return true;
  };

  // Value untuk context
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    requireAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook untuk menggunakan auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
