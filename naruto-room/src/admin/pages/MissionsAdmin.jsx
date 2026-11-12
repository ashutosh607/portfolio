import EditorDialog from '../EditorDialog';
import { useSearchParams } from 'react-router-dom';
import AssetInput from '../AssetInput';
import RecordFields from '../RecordFields';
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Check,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Trophy,
  Calendar,
  Layers,
} from 'lucide-react';

function isDocumentUrl(url = '') {
  return (
    /\.pdf(?:$|[?#])/i.test(url) ||
    /\/upload\/documents\//i.test(url) ||
    /\/raw\/upload\//i.test(url) ||
    /drive\.google\.com\/file\//i.test(url)
  );
}

function EvidenceList({ items = [], kind = 'asset', onUpdateItem, onRemove }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!items.length) return null;

  const copyUrl = async (url, index) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 1800);
    } catch {
      /* Clipboard API unavailable */
    }
  };

  return (
    <div className="cms-evidence-list">
      {items.map((url, i) => (
        <div key={i} className="cms-evidence-item">
          {isDocumentUrl(url) ? (
            <span className="cms-pdf-pill">PDF</span>
          ) : (
            <img className="cms-thumb" src={url} alt="" />
          )}
          <input
            type="text"
            value={url}
            aria-label={`${kind} ${i + 1} URL`}
            onChange={(e) => onUpdateItem(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
          <button type="button" onClick={() => copyUrl(url, i)}>
            {copiedIndex === i ? 'Copied' : 'Copy'}
          </button>
          <a href={url} target="_blank" rel="noreferrer">
            Open ↗
          </a>
          <button type="button" onClick={() => onRemove(i)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

export default function MissionsAdmin() {
  const [params, setParams] = useSearchParams();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'freelance',
    category: 'Client mission',
    organization: '',
    role: '',
    status: 'Completed',
    liveUrl: '',
    thumbnail: '',
    startDate: '',
    endDate: '',
    availableFrom: '',
    challenges: '',
    screenshots: [],
    certificates: [],
    events: [],
    description: '',
    techText: '',
    requirementsText: '',
    responsibilitiesText: '',
    featuresText: '',
    deployment: '',
    order: 0,
    visible: true,
  });

  const loadMissions = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/missions?all=true');
      setMissions(res.data || []);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const openAddModal = () => {
    setEditingMission(null);
    setFormData({
      title: '',
      slug: '',
      type: 'freelance',
      category: 'Client mission',
      organization: '',
      role: '',
      status: 'Completed',
      liveUrl: '',
      thumbnail: '',
      startDate: '',
      endDate: '',
      availableFrom: '',
      challenges: '',
      screenshots: [],
      certificates: [],
      events: [],
      description: '',
      techText: 'React, Node.js, Express, MongoDB, Tailwind CSS',
      requirementsText: '',
      responsibilitiesText: '',
      featuresText: '',
      deployment: '',
      order: missions.length + 1,
      visible: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMission(m);
    setFormData({
      events: m.events || [],
      certificates: m.certificates || [],
      screenshots: m.caseStudy?.screenshots || [],
      challenges: (m.caseStudy?.challenges || []).join('\n'),
      startDate: m.startDate,
      endDate: m.endDate,
      availableFrom: m.availableFrom,
      title: m.title || '',
      slug: m.slug || '',
      type: m.type || 'freelance',
      category: m.category || 'Missions',
      organization: m.organization || '',
      role: m.role || '',
      status: m.status || 'Completed',
      liveUrl: m.liveUrl || '',
      thumbnail: m.thumbnail || '',
      description: m.description || '',
      techText: (m.technologies || []).join(', '),
      requirementsText: (m.caseStudy?.requirements || []).join('\n'),
      responsibilitiesText: (m.caseStudy?.responsibilities || []).join('\n'),
      featuresText: (m.caseStudy?.features || []).join('\n'),
      deployment: m.caseStudy?.deployment || '',
      order: m.order ?? 0,
      visible: m.visible ?? true,
    });
    setModalOpen(true);
  };

  useEffect(() => {
    if (loading) return;
    if (params.has('new')) {
      openAddModal();
      setParams({}, { replace: true });
    }
    const row = missions.find((m) => m.slug === params.get('edit'));
    if (row) {
      openEditModal(row);
      setParams({}, { replace: true });
    }
  }, [params, loading && !missions.length]);
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        type: formData.type,
        category: formData.category,
        organization: formData.organization,
        role: formData.role,
        status: formData.status,
        liveUrl: formData.liveUrl,
        thumbnail: formData.thumbnail,
        description: formData.description,
        technologies: formData.techText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        availableFrom: formData.availableFrom || null,
        events: (formData.events || []).map((ev, order) => ({
          ...ev,
          order,
          technologies: (ev.technologies || []).map((t) => String(t || '').trim()).filter(Boolean),
          certificates: (ev.certificates || []).map((u) => String(u || '').trim()).filter(Boolean),
        })),
        certificates: (formData.certificates || []).map((u) => String(u || '').trim()).filter(Boolean),
        caseStudy: {
          challenges: (formData.challenges || '').split('\n').filter(Boolean),
          screenshots: (formData.screenshots || []).map((u) => String(u || '').trim()).filter(Boolean),
          requirements: formData.requirementsText
            .split('\n')
            .map((r) => r.trim())
            .filter(Boolean),
          responsibilities: formData.responsibilitiesText
            .split('\n')
            .map((r) => r.trim())
            .filter(Boolean),
          features: formData.featuresText
            .split('\n')
            .map((f) => f.trim())
            .filter(Boolean),
          deployment: formData.deployment,
        },
        order: Number(formData.order) || 0,
        visible: formData.visible,
      };

      if (!Object.values(payload.caseStudy).some((v) => v?.length)) payload.caseStudy = null;
      if (editingMission) {
        await apiRequest(`/missions/${editingMission.slug}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMessage({ text: `Mission "${formData.title}" updated successfully!`, type: 'success' });
      } else {
        await apiRequest('/missions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage({ text: `New mission "${formData.title}" created!`, type: 'success' });
      }

      setModalOpen(false);
      loadMissions();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug, title) => {
    if (!window.confirm(`Are you sure you want to delete mission "${title}"?`)) return;

    try {
      await apiRequest(`/missions/${slug}`, { method: 'DELETE' });
      setMessage({ text: `Mission "${title}" deleted.`, type: 'success' });
      loadMissions();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const toggleVisibility = async (m) => {
    try {
      await apiRequest(`/missions/${m.slug}`, {
        method: 'PUT',
        body: JSON.stringify({ visible: !m.visible }),
      });
      loadMissions();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const filteredMissions =
    activeFilter === 'all' ? missions : missions.filter((m) => m.type === activeFilter);

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Missions & Experience Dossiers</h1>
          <p className="page-subtitle">
            Manage your freelance client work, hackathon competitions, and internship experience for the 3D
            Mission Board & 2D Missions scroll.
          </p>
        </div>
        <div className="page-header-actions">
          <button onClick={openAddModal} className="admin-primary-btn">
            <Plus size={16} />
            <span>Add New Mission</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`admin-alert ${message.type}`}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="admin-tabs-bar">
        <button
          className={`tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Experience ({missions.length})
        </button>
        <button
          className={`tab-btn ${activeFilter === 'freelance' ? 'active' : ''}`}
          onClick={() => setActiveFilter('freelance')}
        >
          Freelance & Client ({missions.filter((m) => m.type === 'freelance').length})
        </button>
        <button
          className={`tab-btn ${activeFilter === 'hackathon' ? 'active' : ''}`}
          onClick={() => setActiveFilter('hackathon')}
        >
          Hackathons ({missions.filter((m) => m.type === 'hackathon').length})
        </button>
        <button
          className={`tab-btn ${activeFilter === 'internship' ? 'active' : ''}`}
          onClick={() => setActiveFilter('internship')}
        >
          Internships ({missions.filter((m) => m.type === 'internship').length})
        </button>
      </div>

      {/* Missions Table */}
      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">Loading Missions from Atlas...</div>
        ) : filteredMissions.length === 0 ? (
          <div className="empty-inbox">
            <p>No missions found in this category.</p>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Order</th>
                  <th>Mission & Organization</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Technologies</th>
                  <th>Visibility</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMissions.map((m) => (
                  <tr key={m.slug || m._id}>
                    <td>
                      <span className="order-badge">#{m.order}</span>
                    </td>
                    <td>
                      <div className="table-project-cell">
                        <div
                          className="table-project-color-bar"
                          style={{
                            backgroundColor:
                              m.type === 'freelance'
                                ? '#e68a2e'
                                : m.type === 'hackathon'
                                  ? '#3b82f6'
                                  : '#10b981',
                          }}
                        />
                        <div>
                          <strong>{m.title}</strong>
                          <span className="table-subtext">
                            {m.organization ? `${m.organization} • ` : ''}
                            {m.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`mission-type-pill ${m.type}`}>
                        {m.type === 'freelance'
                          ? 'Client Work'
                          : m.type === 'hackathon'
                            ? 'Hackathon'
                            : 'Internship'}
                      </span>
                    </td>
                    <td>
                      <span className="mission-status-tag">{m.status || 'Active'}</span>
                    </td>
                    <td>
                      <div className="tag-chips-preview">
                        {(m.technologies || []).slice(0, 3).map((t, i) => (
                          <span key={i} className="mini-chip">
                            {t}
                          </span>
                        ))}
                        {(m.technologies || []).length > 3 && (
                          <span className="mini-chip-more">+{(m.technologies || []).length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleVisibility(m)}
                        className={`visibility-toggle-btn ${m.visible ? 'visible' : 'hidden'}`}
                        title={m.visible ? 'Published' : 'Hidden'}
                      >
                        {m.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span>{m.visible ? 'Published' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions">
                        {m.liveUrl && (
                          <a
                            href={m.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-btn edit"
                            title="Visit Live URL"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(m)}
                          className="icon-btn edit"
                          title="Edit Mission"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.slug, m.title)}
                          className="icon-btn delete"
                          title="Delete Mission"
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

      {/* Add / Edit Mission Modal */}
      {modalOpen && (
        <EditorDialog
          title="Mission editor"
          onClose={() => {
            if (!saving) setModalOpen(false);
          }}
        >
          <div className="admin-modal-dialog large">
            <div className="admin-modal-header">
              <h2>{editingMission ? `Edit: ${editingMission.title}` : 'Add New Mission'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="close-modal-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="missionsadmin-mission-title">Mission Title *</label>
                  <input
                    id="missionsadmin-mission-title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Freelance Full-Stack Developer"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="missionsadmin-slug-url-identifier">Slug (URL identifier) *</label>
                  <input
                    id="missionsadmin-slug-url-identifier"
                    type="text"
                    required
                    disabled={!!editingMission}
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. ds-photography"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="missionsadmin-mission-type">Mission Type *</label>
                  <select
                    id="missionsadmin-mission-type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="admin-select"
                  >
                    <option value="freelance">Freelance Client Work</option>
                    <option value="hackathon">Hackathon / Competition</option>
                    <option value="internship">Internship</option>
                    <option value="leadership">Leadership & POR</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="missionsadmin-category-label">Category Label</label>
                  <input
                    id="missionsadmin-category-label"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Client mission or Hackathons"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="missionsadmin-organization-client">Organization / Client</label>
                  <input
                    id="missionsadmin-organization-client"
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. DS Photography & Films"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="missionsadmin-status-tag">Status Tag</label>
                  <input
                    id="missionsadmin-status-tag"
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    placeholder="e.g. Completed, Active, Finalist"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="missionsadmin-live-url-client-site-or-repository">
                    Live URL (Client site or repository)
                  </label>
                  <input
                    id="missionsadmin-live-url-client-site-or-repository"
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="missionsadmin-thumbnail-path-or-cloudinary-url">
                    Thumbnail Path or Cloudinary URL
                  </label>
                  <input
                    id="missionsadmin-thumbnail-path-or-cloudinary-url"
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="/missions/thumb.webp or Cloudinary URL"
                  />
                  <AssetInput
                    label="Upload or paste thumbnail"
                    onUpload={(url) => setFormData((f) => ({ ...f, thumbnail: url }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="missionsadmin-mission-summary-description">Mission Summary Description</label>
                <textarea
                  id="missionsadmin-mission-summary-description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of the work completed or event achievements."
                />
              </div>

              <div className="form-group">
                <label htmlFor="missionsadmin-technologies-used-comma-separated">
                  Technologies Used (Comma-separated)
                </label>
                <input
                  id="missionsadmin-technologies-used-comma-separated"
                  type="text"
                  value={formData.techText}
                  onChange={(e) => setFormData({ ...formData, techText: e.target.value })}
                  placeholder="React.js, Node.js, Express.js, MongoDB, Tailwind CSS, Cloudinary"
                />
              </div>

              {/* Case Study Section (if freelance or internship) */}
              {formData.type !== 'hackathon' && (
                <div className="case-study-admin-box">
                  <h4 className="box-title">Client Case Study Breakdown</h4>

                  <div className="form-group">
                    <label htmlFor="missionsadmin-client-requirements-one-per-line">
                      Client Requirements (One per line)
                    </label>
                    <textarea
                      id="missionsadmin-client-requirements-one-per-line"
                      rows={2}
                      value={formData.requirementsText}
                      onChange={(e) => setFormData({ ...formData, requirementsText: e.target.value })}
                      placeholder="Requirement 1&#10;Requirement 2"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="missionsadmin-engineering-responsibilities-one-per-line">
                      Engineering Responsibilities (One per line)
                    </label>
                    <textarea
                      id="missionsadmin-engineering-responsibilities-one-per-line"
                      rows={2}
                      value={formData.responsibilitiesText}
                      onChange={(e) => setFormData({ ...formData, responsibilitiesText: e.target.value })}
                      placeholder="Responsibility 1&#10;Responsibility 2"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="missionsadmin-built-features-one-per-line">
                      Built Features (One per line)
                    </label>
                    <textarea
                      id="missionsadmin-built-features-one-per-line"
                      rows={2}
                      value={formData.featuresText}
                      onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                      placeholder="Feature 1&#10;Feature 2"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="missionsadmin-deployment-details">Deployment Details</label>
                    <input
                      id="missionsadmin-deployment-details"
                      type="text"
                      value={formData.deployment}
                      onChange={(e) => setFormData({ ...formData, deployment: e.target.value })}
                      placeholder="e.g. Deployed to Vercel with Cloudflare SSL and SEO optimization."
                    />
                  </div>
                </div>
              )}

              <div className="form-group" style={{ maxWidth: '140px' }}>
                <label htmlFor="missionsadmin-display-order">Display Order</label>
                <input
                  id="missionsadmin-display-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                />
              </div>

              <fieldset>
                <legend>Dates and evidence</legend>
                <label>
                  Role
                  <input
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </label>
                <div className="cms-row">
                  {['startDate', 'endDate', 'availableFrom'].map((k) => (
                    <label key={k}>
                      {k}
                      <input
                        type="date"
                        value={formData[k] || ''}
                        onChange={(e) => setFormData({ ...formData, [k]: e.target.value })}
                      />
                    </label>
                  ))}
                </div>
                <label>
                  Challenges
                  <textarea
                    value={formData.challenges || ''}
                    onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                  />
                </label>
                {[
                  ['screenshots', 'Add to screenshots (upload, Ctrl+V, or URL)', false, false],
                  ['certificates', 'Add to certificates (PDF or image, Ctrl+V, or URL)', true, true],
                ].map(([k, label, isDoc, allowBoth]) => (
                  <div key={k} className="cms-evidence-block">
                    <AssetInput
                      label={label}
                      document={isDoc}
                      acceptBoth={allowBoth}
                      onUpload={(url) => setFormData((f) => ({ ...f, [k]: [...(f[k] || []), url] }))}
                    />
                    <EvidenceList
                      items={formData[k] || []}
                      kind={k === 'screenshots' ? 'screenshot' : 'certificate'}
                      onUpdateItem={(idx, nextUrl) =>
                        setFormData((f) => ({
                          ...f,
                          [k]: (f[k] || []).map((val, n) => (n === idx ? nextUrl : val)),
                        }))
                      }
                      onRemove={(idx) =>
                        setFormData((f) => ({
                          ...f,
                          [k]: (f[k] || []).filter((_, n) => n !== idx),
                        }))
                      }
                    />
                  </div>
                ))}
              </fieldset>
              {formData.type === 'hackathon' && (
                <RecordFields
                  label="Hackathon events"
                  fields={['title', 'organiser', 'date', 'duration', 'team', 'project', 'achievement']}
                  rows={formData.events || []}
                  onChange={(events) =>
                    setFormData((f) => ({
                      ...f,
                      events: events.map((ev, order) => ({ ...ev, order })),
                    }))
                  }
                >
                  {(ev, update) => (
                    <>
                      <label>
                        Technologies
                        <input
                          value={(ev.technologies || []).join(',')}
                          onChange={(e) => update({ technologies: e.target.value.split(',') })}
                        />
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={ev.visible !== false}
                          onChange={(e) => update({ visible: e.target.checked })}
                        />{' '}
                        Show event
                      </label>
                      <EvidenceList
                        items={ev.certificates || []}
                        kind="event certificate"
                        onUpdateItem={(idx, nextUrl) =>
                          setFormData((f) => ({
                            ...f,
                            events: (f.events || []).map((row) =>
                              row.id === ev.id
                                ? {
                                    ...row,
                                    certificates: (row.certificates || []).map((val, n) =>
                                      n === idx ? nextUrl : val
                                    ),
                                  }
                                : row
                            ),
                          }))
                        }
                        onRemove={(idx) =>
                          setFormData((f) => ({
                            ...f,
                            events: (f.events || []).map((row) =>
                              row.id === ev.id
                                ? {
                                    ...row,
                                    certificates: (row.certificates || []).filter((_, n) => n !== idx),
                                  }
                                : row
                            ),
                          }))
                        }
                      />
                      <AssetInput
                        label="Add event certificate (PDF or image, Ctrl+V, or URL)"
                        document
                        acceptBoth
                        onUpload={(url) =>
                          setFormData((f) => ({
                            ...f,
                            events: (f.events || []).map((row) =>
                              row.id === ev.id
                                ? { ...row, certificates: [...(row.certificates || []), url] }
                                : row
                            ),
                          }))
                        }
                      />
                    </>
                  )}
                </RecordFields>
              )}
              {message.type === 'error' && <p role="alert">{message.text}</p>}
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="admin-secondary-btn">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="admin-primary-btn">
                  {saving ? 'Saving...' : editingMission ? 'Update Mission' : 'Create Mission'}
                </button>
              </div>
            </form>
          </div>
        </EditorDialog>
      )}
    </div>
  );
}
