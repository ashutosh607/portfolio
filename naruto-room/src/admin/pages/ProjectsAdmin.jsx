import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Check,
  X,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    dishName: '',
    category: 'Full-Stack',
    projectPhoto: '',
    frontPagePhoto: '',
    shortDesc: '',
    problemSolved: '',
    featuresText: '',
    techStackText: '',
    githubUrl: '',
    liveUrl: '',
    accent: '#e68a2e',
    visible: true,
    order: 0,
  });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/projects?all=true');
      setProjects(res.data || []);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      slug: '',
      dishName: '',
      category: 'Full-Stack',
      projectPhoto: '/ramen-menu/travelflow-project.webp',
      frontPagePhoto: '/ramen-menu/travelflow-menu.webp',
      shortDesc: '',
      problemSolved: '',
      featuresText: '',
      techStackText: 'React, Node.js, Express, MongoDB',
      githubUrl: 'https://github.com/ashutosh607',
      liveUrl: '',
      accent: '#e68a2e',
      visible: true,
      order: projects.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      title: proj.title || '',
      slug: proj.slug || '',
      dishName: proj.dishName || '',
      category: proj.category || 'Full-Stack',
      projectPhoto: proj.projectPhoto || '',
      frontPagePhoto: proj.frontPagePhoto || '',
      shortDesc: proj.shortDesc || '',
      problemSolved: proj.problemSolved || '',
      featuresText: (proj.features || []).join('\n'),
      techStackText: (proj.techStack || []).join(', '),
      githubUrl: proj.githubUrl || '',
      liveUrl: proj.liveUrl || '',
      accent: proj.accent || '#e68a2e',
      visible: proj.visible ?? true,
      order: proj.order ?? 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        ...formData,
        features: formData.featuresText
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        techStack: formData.techStackText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        order: Number(formData.order) || 0,
      };

      if (editingProject) {
        await apiRequest(`/projects/${editingProject.slug}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMessage({ text: 'Project updated successfully!', type: 'success' });
      } else {
        await apiRequest('/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage({ text: 'New project created successfully!', type: 'success' });
      }

      setModalOpen(false);
      loadProjects();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await apiRequest(`/projects/${slug}`, { method: 'DELETE' });
      setMessage({ text: `Project "${title}" deleted.`, type: 'success' });
      loadProjects();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const toggleVisibility = async (proj) => {
    try {
      await apiRequest(`/projects/${proj.slug}`, {
        method: 'PUT',
        body: JSON.stringify({ visible: !proj.visible }),
      });
      loadProjects();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ichiraku Ramen Projects</h1>
          <p className="page-subtitle">Manage projects showcased in the 3D Ramen Menu Book and 2D Projects section.</p>
        </div>
        <div className="page-header-actions">
          <button onClick={openAddModal} className="admin-primary-btn">
            <Plus size={16} />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`admin-alert ${message.type}`}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Projects Table */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">Loading Ramen Book Projects...</div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Order</th>
                  <th>Project</th>
                  <th>Ramen Dish Name</th>
                  <th>Category</th>
                  <th>Tech Stack</th>
                  <th>Visibility</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj.slug || proj._id}>
                    <td>
                      <span className="order-badge">#{proj.order}</span>
                    </td>
                    <td>
                      <div className="table-project-cell">
                        <div
                          className="table-project-color-bar"
                          style={{ backgroundColor: proj.accent || '#e68a2e' }}
                        />
                        <div>
                          <strong>{proj.title}</strong>
                          <span className="table-subtext">{proj.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="ramen-dish-tag">{proj.dishName || '—'}</span>
                    </td>
                    <td>{proj.category}</td>
                    <td>
                      <div className="tag-chips-preview">
                        {(proj.techStack || []).slice(0, 3).map((t, i) => (
                          <span key={i} className="mini-chip">
                            {t}
                          </span>
                        ))}
                        {(proj.techStack || []).length > 3 && (
                          <span className="mini-chip-more">
                            +{(proj.techStack || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleVisibility(proj)}
                        className={`visibility-toggle-btn ${proj.visible ? 'visible' : 'hidden'}`}
                        title={proj.visible ? 'Visible on site' : 'Hidden from site'}
                      >
                        {proj.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                        <span>{proj.visible ? 'Published' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="icon-btn edit"
                          title="Edit Project"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.slug, proj.title)}
                          className="icon-btn delete"
                          title="Delete Project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Project Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-dialog large">
            <div className="admin-modal-header">
              <h2>{editingProject ? `Edit: ${editingProject.title}` : 'Add New Ramen Project'}</h2>
              <button onClick={() => setModalOpen(false)} className="close-modal-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. TravelFlow AI"
                  />
                </div>

                <div className="form-group">
                  <label>Slug (URL identifier) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProject}
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. travelflow-ai"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Ramen Dish Name (Theme) *</label>
                  <input
                    type="text"
                    required
                    value={formData.dishName}
                    onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
                    placeholder="e.g. Narutomaki AI Ramen"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. AI / Full-Stack"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Order in Menu (1, 2, 3...)</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Accent Color (Hex)</label>
                  <div className="color-picker-input">
                    <input
                      type="color"
                      value={formData.accent}
                      onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                    />
                    <input
                      type="text"
                      value={formData.accent}
                      onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Front Page Photo (Left Menu Page)</label>
                  <input
                    type="text"
                    value={formData.frontPagePhoto}
                    onChange={(e) => setFormData({ ...formData, frontPagePhoto: e.target.value })}
                    placeholder="/ramen-menu/your-menu.webp or Cloudinary URL"
                  />
                </div>

                <div className="form-group">
                  <label>Project Photo (Right Detail Page) *</label>
                  <input
                    type="text"
                    required
                    value={formData.projectPhoto}
                    onChange={(e) => setFormData({ ...formData, projectPhoto: e.target.value })}
                    placeholder="/ramen-menu/your-project.webp or Cloudinary URL"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Short Description (Ramen Menu Summary) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="One or two concise sentences summarizing the project."
                />
              </div>

              <div className="form-group">
                <label>Problem Solved</label>
                <textarea
                  rows={2}
                  value={formData.problemSolved}
                  onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
                  placeholder="The real-world bottleneck or problem this solves."
                />
              </div>

              <div className="form-group">
                <label>Key Features (One bullet per line)</label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div className="form-group">
                <label>Tech Stack (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.techStackText}
                  onChange={(e) => setFormData({ ...formData, techStackText: e.target.value })}
                  placeholder="React, TypeScript, Node.js, Express, MongoDB"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>GitHub Repository URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="form-group">
                  <label>Live Website / Demo URL</label>
                  <input
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="admin-secondary-btn"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="admin-primary-btn">
                  {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
