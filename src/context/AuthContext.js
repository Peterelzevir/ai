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
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success) {
          setUser(data.user);
        } else {
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal login');
      }
      
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mendaftar');
      }
      
      // Login otomatis setelah pendaftaran berhasil
      const loginResult = await login(userData.email, userData.password);
      
      if (!loginResult.success) {
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
