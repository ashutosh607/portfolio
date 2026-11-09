import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('shinobi_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest('/auth/me')
      .then((res) => {
        if (res.success && res.user) {
          setAdmin(res.user);
        } else {
          localStorage.removeItem('shinobi_admin_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('shinobi_admin_token');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.token) {
        localStorage.setItem('shinobi_admin_token', res.token);
        setAdmin(res.user);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const logout = () => {
    apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
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

