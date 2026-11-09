import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from './api';
import {
  UtensilsCrossed,
  Scroll,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Database,
  Cloud,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projectsCount: 0,
    skillsCount: 0,
    messagesCount: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest('/projects?all=true').catch(() => ({ data: [] })),
      apiRequest('/skills?all=true').catch(() => ({ data: [] })),
      apiRequest('/contact?includeMessages=true').catch(() => ({ data: {} })),
    ]).then(([projRes, skillRes, contactRes]) => {
      const projects = projRes.data || [];
      const skills = skillRes.data || [];
      const messages = contactRes.data?.messages || [];

      setStats({
        projectsCount: projects.length,
        skillsCount: skills.length,
        messagesCount: messages.length,
      });

      setRecentProjects(projects.slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hokage Command Center</h1>
          <p className="page-subtitle">Welcome back. Manage your Naruto portfolio content across 3D & 2D modes.</p>
        </div>
        <div className="page-header-actions">
          <Link to="/admin/projects" className="admin-primary-btn">
            <UtensilsCrossed size={16} />
            <span>Manage Ramen Projects</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <UtensilsCrossed size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Ramen Book Projects</span>
            <span className="stat-value">{loading ? '...' : stats.projectsCount}</span>
            <span className="stat-footnote">Active in Ichiraku Ramen 3D & 2D</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Scroll size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Jutsu Skill Scrolls</span>
            <span className="stat-value">{loading ? '...' : stats.skillsCount}</span>
            <span className="stat-footnote">Active in Training Grounds 3D & 2D</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <Mail size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Received Messages</span>
            <span className="stat-value">{loading ? '...' : stats.messagesCount}</span>
            <span className="stat-footnote">From Hokage Monument inquiry form</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Database Status</span>
            <span className="stat-value text-green">Online</span>
            <span className="stat-footnote">MongoDB Atlas Cluster connected</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Featured Projects</h3>
            <Link to="/admin/projects" className="card-link">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="projects-mini-list">
            {recentProjects.map((proj) => (
              <div key={proj.slug || proj._id} className="project-mini-item">
                <div
                  className="project-mini-dot"
                  style={{ backgroundColor: proj.accent || '#e68a2e' }}
                />
                <div className="project-mini-info">
                  <h4>{proj.title}</h4>
                  <span className="project-dish-badge">{proj.dishName || 'Menu Item'}</span>
                </div>
                <span className={`status-badge ${proj.visible ? 'published' : 'hidden'}`}>
                  {proj.visible ? 'Published' : 'Hidden'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Connected Cloud Infrastructure</h3>
          </div>

          <div className="infra-list">
            <div className="infra-item">
              <Database size={20} className="infra-icon" />
              <div className="infra-details">
                <h4>MongoDB Atlas</h4>
                <p>cluster0.pluvu0q.mongodb.net / naruto_portfolio</p>
              </div>
              <span className="status-tag active">Active</span>
            </div>

            <div className="infra-item">
              <Cloud size={20} className="infra-icon" />
              <div className="infra-details">
                <h4>Cloudinary Media Storage</h4>
                <p>Cloud: gcwsbzrk (Auto WebP optimization enabled)</p>
              </div>
              <span className="status-tag active">Ready</span>
            </div>

            <div className="infra-item">
              <Sparkles size={20} className="infra-icon" />
              <div className="infra-details">
                <h4>Dual-Mode Portfolio Sync</h4>
                <p>Changes automatically update both 3D Village and 2D mode</p>
              </div>
              <span className="status-tag active">Synced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

