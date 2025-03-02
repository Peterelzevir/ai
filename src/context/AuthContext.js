'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Authentication context
const AuthContext = createContext(undefined);

// Auth state storage key
const AUTH_TOKEN_KEY = 'auth-token';
const AUTH_USER_KEY = 'auth-user';

/**
 * Authentication Provider Component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Handle API response properly
   */
  const handleApiResponse = async (response) => {
    // Check for non-JSON responses
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      } else {
        const errorText = await response.text();
        console.error('Non-JSON error response:', errorText.substring(0, 200));
        throw new Error(`Server error (${response.status}): Request failed`);
      }
    }
    
    return await response.json();
  };

  /**
   * Save authentication data to local storage
   */
  const saveAuthData = useCallback((userData, authToken) => {
    if (userData) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    }
    
    if (authToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    }
  }, []);

  /**
   * Clear authentication data from local storage
   */
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }, []);

  /**
   * Check authentication status from the API
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to get saved token (as fallback)
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (savedToken) {
        setToken(savedToken);
      }
      
      // Check auth status from the API (uses HTTP-only cookie by default)
      const response = await fetch('/api/auth/me', {
        headers: {
          'Accept': 'application/json',
          ...(savedToken ? { 'Authorization': `Bearer ${savedToken}` } : {})
        }
      });
      
      if (!response.ok) {
        // If not authenticated
        setUser(null);
        setToken(null);
        clearAuthData();
        return false;
      }
      
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        
        // If token was returned (optional in case of JWT-based auth)
        if (data.token) {
          setToken(data.token);
          saveAuthData(data.user, data.token);
        } else {
          // Just save the user data if using cookie-based auth
          saveAuthData(data.user, savedToken);
        }
        return true;
      } else {
        setUser(null);
        setToken(null);
        clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setUser(null);
      setToken(null);
      clearAuthData();
      return false;
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, [clearAuthData, saveAuthData]);

  // Check authentication on component mount and window focus
  useEffect(() => {
    // Initial check
    checkAuthStatus();
    
    // Set up event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === AUTH_TOKEN_KEY || e.key === AUTH_USER_KEY) {
        checkAuthStatus();
      }
    };
    
    // Set up event listener for window focus (to refresh auth state)
    const handleFocus = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAuthStatus]);

  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} remember - Whether to remember the user
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password, remember = false) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await handleApiResponse(response);
      
      if (!data.success) {
        throw new Error(data.message || 'Login gagal');
      }
      
      setUser(data.user);
      
      // Save token if available and remember is enabled
      if (data.token && remember) {
        setToken(data.token);
        saveAuthData(data.user, data.token);
      } else if (remember) {
        // Otherwise just save the user data if using cookie-based auth
        saveAuthData(data.user);
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message);
      return { 
        success: false, 
        error: error.message || 'Terjadi kesalahan saat login' 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register function
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // Remove any sensitive fields from logging
      const logSafeData = { ...userData };
      if (logSafeData.password) logSafeData.password = '***';
      console.log('Registering user with data:', logSafeData);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
      });
      
      const data = await handleApiResponse(response);
      
      if (!data.success) {
        throw new Error(data.message || 'Pendaftaran gagal');
      }
      
      console.log('Registration successful, attempting auto-login');
      
      // Auto login after successful registration
      try {
        const loginResult = await login(userData.email, userData.password, true);
        
        if (!loginResult.success) {
          console.warn('Auto-login failed after registration');
          // This is not a critical error, we can still consider registration successful
        }
      } catch (loginError) {
        console.warn('Auto-login error after registration:', loginError);
        // Continue despite login error, registration was still successful
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(error.message);
      return { 
        success: false, 
        error: error.message || 'Terjadi kesalahan saat mendaftar' 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      setLoading(true);
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      // Clear auth data from state and storage
      setUser(null);
      setToken(null);
      clearAuthData();
      
      // Redirect to home page
      router.push('/');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  /**
   * Get the current authentication token
   */
  const getToken = useCallback(() => {
    return token;
  }, [token]);

  /**
   * Protect a route with authentication
   * @param {Function} callback - Callback to execute if authenticated
   * @param {string} redirectTo - Path to redirect if not authenticated
   */
  const requireAuth = useCallback((callback, redirectTo = '/login') => {
    // Wait for initial auth check to complete
    if (!initialCheckDone) return false;
    
    if (!isAuthenticated()) {
      console.log('Authentication required, redirecting to', redirectTo);
      
      // Store the current path to redirect back after login
      if (pathname) {
        sessionStorage.setItem('authRedirectUrl', pathname);
      }
      
      router.push(redirectTo);
      return false;
    }
    
    if (callback && typeof callback === 'function') {
      callback();
    }
    
    return true;
  }, [isAuthenticated, initialCheckDone, router, pathname]);

  /**
   * Handle post-login redirect
   */
  const handleAuthRedirect = useCallback(() => {
    const redirectUrl = sessionStorage.getItem('authRedirectUrl');
    if (redirectUrl) {
      sessionStorage.removeItem('authRedirectUrl');
      router.push(redirectUrl);
      return true;
    }
    return false;
  }, [router]);

  // Context value
  const value = {
    user,
    token,
    loading,
    authError,
    login,
    register,
    logout,
    isAuthenticated,
    requireAuth,
    checkAuthStatus,
    getToken,
    handleAuthRedirect
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
