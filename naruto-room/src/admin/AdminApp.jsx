import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import ProjectsAdmin from './pages/ProjectsAdmin';
import SkillsAdmin from './pages/SkillsAdmin';
import ProfileAdmin from './pages/ProfileAdmin';
import ContactAdmin from './pages/ContactAdmin';
import MediaAdmin from './pages/MediaAdmin';
import './Admin.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="admin-login-wrapper">
        <div style={{ color: '#e68a2e', fontSize: '14px', fontFamily: 'sans-serif' }}>
          Verifying Shinobi Credentials...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        
        <Route
          path=""
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<ProjectsAdmin />} />
          <Route path="skills" element={<SkillsAdmin />} />
          <Route path="profile" element={<ProfileAdmin />} />
          <Route path="contact" element={<ContactAdmin />} />
          <Route path="media" element={<MediaAdmin />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}

