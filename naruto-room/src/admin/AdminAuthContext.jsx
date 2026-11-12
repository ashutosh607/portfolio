import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const end = () => {
      sessionStorage.removeItem('shinobi_admin_token');
      localStorage.removeItem('shinobi_admin_token');
      setAdmin(null);
    };

    window.addEventListener('cms-session-ended', end);

    const hasStoredToken =
      typeof window !== 'undefined' &&
      Boolean(sessionStorage.getItem('shinobi_admin_token') || localStorage.getItem('shinobi_admin_token'));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), hasStoredToken ? 45000 : 3500);

    apiRequest('/auth/me', { signal: controller.signal })
      .then((res) => {
        if (res.success && res.user) {
          setAdmin(res.user);
        } else {
          end();
        }
      })
      .catch(() => {
        end();
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      window.removeEventListener('cms-session-ended', end);
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.token) {
        sessionStorage.setItem('shinobi_admin_token', res.token);
        localStorage.setItem('shinobi_admin_token', res.token);
      }

      if (res.user) {
        setAdmin(res.user);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout errors
    }
    sessionStorage.removeItem('shinobi_admin_token');
    localStorage.removeItem('shinobi_admin_token');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, error, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
