import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Scroll,
  UserCheck,
  Mail,
  Image,
  ExternalLink,
  LogOut,
  Flame,
} from 'lucide-react';

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/projects', label: 'Projects (Ramen Menu)', icon: UtensilsCrossed },
    { to: '/admin/skills', label: 'Skills (Jutsu Scrolls)', icon: Scroll },
    { to: '/admin/profile', label: 'About & Profile', icon: UserCheck },
    { to: '/admin/contact', label: 'Contact & Inbox', icon: Mail },
    { to: '/admin/media', label: 'Media & Uploads', icon: Image },
  ];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo-crest">
              <Flame size={20} className="flame-icon" />
            </div>
            <div className="brand-text">
              <h2>SHINOBI CMS</h2>
              <span className="brand-subtitle">Hidden Leaf Admin</span>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="nav-section-title">CONTENT MANAGEMENT</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="admin-details">
              <span className="admin-name">{admin?.name || 'Ashutosh'}</span>
              <span className="admin-role">Hokage Admin</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <span className="status-indicator">
              <span className="pulse-dot"></span>
              Live Database Connected
            </span>
          </div>

          <div className="topbar-actions">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="view-site-btn"
            >
              <span>View Public Portfolio</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

