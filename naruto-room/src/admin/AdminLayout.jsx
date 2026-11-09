import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  PanelsTopLeft,
  Folder,
  Flag,
  Layers,
  User,
  Mail,
  Images,
  MessagesSquare,
  Settings,
  PanelLeft,
  ExternalLink,
  LogOut,
  Flame,
  X,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';

const groups = [
  ['Workspace', [['', 'Overview', PanelsTopLeft]]],
  [
    'Content',
    [
      ['projects', 'Projects', Folder],
      ['missions', 'Missions & experience', Flag],
      ['skills', 'Skills', Layers],
      ['profile', 'About & education', User],
      ['contact', 'Contact & inbox', Mail],
    ],
  ],
  ['Assets', [['media', 'Media library', Images]]],
  [
    'Configuration',
    [
      ['dialogues', 'NPC dialogues', MessagesSquare],
      ['settings', 'Account settings', Settings],
    ],
  ],
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const [compact, setCompact] = useState(false),
    [drawer, setDrawer] = useState(false),
    [error, setError] = useState('');
  const { pathname } = useLocation();
  useEffect(() => {
    setDrawer(false);
  }, [pathname]);
  useEffect(() => {
    const escape = (e) => {
      if (e.key === 'Escape') setDrawer(false);
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);
  useEffect(() => {
    const media = matchMedia('(max-width: 768px)');
    const closeDrawer = (e) => {
      if (!e.matches) setDrawer(false);
    };
    media.addEventListener('change', closeDrawer);
    return () => media.removeEventListener('change', closeDrawer);
  }, []);
  useEffect(() => {
    if (!drawer) return;
    const previous = document.activeElement;
    document.querySelector('.drawer-close')?.focus();
    return () => previous?.focus();
  }, [drawer]);
  const current = groups
    .flatMap((g) => g[1])
    .find(([path]) => pathname.replace(/\/$/, '') === '/admin' + (path ? '/' + path : ''));
  return (
    <div className={'admin-shell ' + (compact ? 'compact ' : '') + (drawer ? 'drawer-open' : '')}>
      {drawer && (
        <button aria-label="Dismiss navigation" className="cms-scrim" onClick={() => setDrawer(false)} />
      )}
      <aside className="admin-sidebar" id="workspace-navigation" aria-label="Workspace navigation">
        <div className="sidebar-brand">
          <Flame size={21} />
          <strong>Shinobi CMS</strong>
          <button className="drawer-close" onClick={() => setDrawer(false)} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>
        <nav className="admin-nav">
          {groups.map(([group, links]) => (
            <section key={group}>
              <div className="nav-section-title">{group}</div>
              {links.map(([path, label, Icon]) => (
                <NavLink
                  title={label}
                  aria-label={label}
                  key={path}
                  end
                  to={'/admin' + (path ? '/' + path : '')}
                  className={({ isActive }) => 'admin-nav-item ' + (isActive ? 'active' : '')}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </section>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-avatar">{admin.name?.slice(0, 1)}</div>
          <div className="admin-details">
            <strong>{admin.name}</strong>
            <small>Administrator</small>
          </div>
          <NavLink to="/admin/settings" title="Account settings" aria-label="Account settings">
            <Settings size={15} />
          </NavLink>
          <button
            className="logout-btn"
            title="Sign out"
            onClick={() => logout().catch((e) => setError(e.message))}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div className="admin-main" inert={drawer || undefined}>
        <header className="admin-topbar">
          <div className="cms-breadcrumb">
            <button
              aria-controls="workspace-navigation"
              aria-expanded={drawer || (!compact && !matchMedia('(max-width: 768px)').matches)}
              aria-label="Toggle navigation"
              onClick={() =>
                matchMedia('(max-width: 768px)').matches ? setDrawer(!drawer) : setCompact(!compact)
              }
            >
              <PanelLeft size={17} />
            </button>
            Workspace <span>/</span> <strong>{current?.[1]}</strong>
          </div>
          <a className="view-site-btn" href="/" target="_blank" rel="noreferrer">
            View portfolio <ExternalLink size={13} />
          </a>
        </header>
        <main className="admin-content-area">
          {error && <p role="alert">{error}</p>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
