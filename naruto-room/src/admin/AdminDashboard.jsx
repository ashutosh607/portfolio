import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight } from 'lucide-react';
import { apiRequest } from './api';

const actions = [
  ['Add project', 'projects?new'],
  ['Add experience', 'missions?new'],
  ['Upload résumé', 'contact#resume'],
  ['Edit about', 'profile'],
  ['Manage skills', 'skills'],
];
export default function AdminDashboard() {
  const [records, setRecords] = useState(null),
    [error, setError] = useState(''),
    [health, setHealth] = useState(null);
  useEffect(() => {
    let active = true;
    apiRequest('/overview')
      .then((r) => {
        if (active) setRecords(r.data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    apiRequest('/system')
      .then((r) => {
        if (active) setHealth(r.data);
      })
      .catch(() => {
        if (active) setHealth({});
      });
    return () => {
      active = false;
    };
  }, []);
  const { counts = [], rows = [] } = records || {};
  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Manage and publish your portfolio content.</p>
        </div>
        <Link className="admin-primary-btn" to="/admin/projects?new">
          <Plus size={14} /> New project
        </Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="stats-grid">
        {['Published projects', 'Skills', 'Missions & experience', 'Unread messages'].map((label, i) => (
          <div className="stat-card" key={label}>
            <span className="stat-label">{label}</span>
            <strong className="stat-value">{records ? counts[i] : '—'}</strong>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="admin-card">
          <div className="card-header">
            <h3>Recent content</h3>
          </div>
          <div className="cms-overflow">
            <table className="admin-table">
              <thead>
                <tr>
                  {['Title', 'Type', 'Status', 'Updated', ''].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.type + r.slug}>
                    <td>{r.title}</td>
                    <td>{r.type}</td>
                    <td>{r.visible ? (r.type === 'Project' ? r.status : 'Published') : 'Hidden'}</td>
                    <td>{new Date(r.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={'/admin/' + r.path + '?edit=' + encodeURIComponent(r.slug)}>Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && (
            <p>{error ? 'Content unavailable' : records ? 'No content yet.' : 'Loading content…'}</p>
          )}
        </section>
        <section className="admin-card">
          <div className="card-header">
            <h3>Quick actions</h3>
          </div>
          {actions.map(([label, to]) => (
            <Link key={to} className="cms-action" to={'/admin/' + to}>
              {label}
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </section>
      </div>
      <section className="cms-health">
        <strong>System status</strong>
        {[
          ['API', 'api'],
          ['Database', 'database'],
          ['Media storage', 'media'],
        ].map(([label, k]) => (
          <span key={k}>
            {label} <b>{health ? health[k] || 'Unverified' : 'Checking…'}</b>
          </span>
        ))}
        {health?.verified && <time>Checked {new Date(health.verified).toLocaleTimeString()}</time>}
      </section>
    </div>
  );
}
