import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Scroll, Pencil, Check, X, AlertCircle } from 'lucide-react';

export default function SkillsAdmin() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    title: '',
    japaneseTitle: '',
    summary: '',
    techText: '',
    order: 0,
  });

  const loadSkills = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/skills?all=true');
      setSkills(res.data || []);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const openEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      title: skill.title || '',
      japaneseTitle: skill.japaneseTitle || '',
      summary: skill.summary || '',
      techText: (skill.technologies || []).join(', '),
      order: skill.order ?? 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        title: formData.title,
        japaneseTitle: formData.japaneseTitle,
        summary: formData.summary,
        technologies: formData.techText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        order: Number(formData.order) || 0,
      };

      await apiRequest(`/skills/${editingSkill.slug}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setMessage({ text: `Updated "${formData.title}" skill scroll!`, type: 'success' });
      setModalOpen(false);
      loadSkills();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Technical Skills & Jutsu Scrolls</h1>
          <p className="page-subtitle">Manage skill categories, Japanese scroll titles, and technologies active in Training Grounds.</p>
        </div>
      </div>

      {message.text && (
        <div className={`admin-alert ${message.type}`}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading Jutsu Skill Scrolls...</div>
      ) : (
        <div className="skills-admin-grid">
          {skills.map((skill) => (
            <div key={skill.slug || skill._id} className="skill-admin-card">
              <div className="skill-card-top">
                <div className="skill-titles">
                  <span className="skill-order-pill">Scroll 0{skill.order}</span>
                  <h3>{skill.title}</h3>
                  <span className="kanji-subtitle">{skill.japaneseTitle}</span>
                </div>
                <button onClick={() => openEdit(skill)} className="icon-btn edit">
                  <Pencil size={15} />
                </button>
              </div>

              <p className="skill-summary-text">{skill.summary}</p>

              <div className="skill-tech-chips">
                {(skill.technologies || []).map((tech, i) => (
                  <span key={i} className="tech-badge">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Skill Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-dialog">
            <div className="admin-modal-header">
              <h2>Edit Skill Scroll: {editingSkill?.title}</h2>
              <button onClick={() => setModalOpen(false)} className="close-modal-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Category Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Japanese Scroll Title (Kanji)</label>
                  <input
                    type="text"
                    value={formData.japaneseTitle}
                    onChange={(e) => setFormData({ ...formData, japaneseTitle: e.target.value })}
                    placeholder="e.g. 風遁・フロントエンド"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Summary Description</label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Summary of this technical scroll..."
                />
              </div>

              <div className="form-group">
                <label>Technologies & Frameworks (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.techText}
                  onChange={(e) => setFormData({ ...formData, techText: e.target.value })}
                  placeholder="React 19, Three.js, GSAP, Tailwind CSS"
                />
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
                  {saving ? 'Saving...' : 'Update Scroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

