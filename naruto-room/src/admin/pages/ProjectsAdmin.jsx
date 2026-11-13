import { ProjectDetails } from '../../components/ProjectSpread';
import {resolveArtwork} from '../../data/projectMenu';
import EditorDialog from '../EditorDialog';
import AssetInput from '../AssetInput';
import {useSearchParams} from 'react-router-dom';
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

  const [params,setParams]=useSearchParams();
  const [search,setSearch]=useState('');
  const [category,setCategory]=useState('');
  const [status,setStatus]=useState('');
  const displayStatus=p=>p.visible?p.status:'hidden';
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
      status:'draft', screenshots:[],
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
      order: projects.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      status:proj.status, screenshots:proj.screenshots || [],
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

  useEffect(()=>{
    if(loading) return;
    if(params.has('new')) {openAddModal();setParams({}, {replace:true});}
    const project=projects.find(p=>p.slug===params.get('edit'));
    if(project) {openEditModal(project);setParams({}, {replace:true});}
  },[params,loading && projects.length===0]);
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        ...formData,
        screenshots:(formData.screenshots || []).map(url=>url.trim()).filter(Boolean),
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
        <div className="cms-toolbar"><input aria-label="Search projects" placeholder="Search projects…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select aria-label="Category" value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{[...new Set(projects.map(p=>p.category))].map(c=><option key={c}>{c}</option>)}</select>
        <select aria-label="Status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{['published','draft','archived','hidden'].map(v=><option key={v}>{v}</option>)}</select></div>
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
                {projects.filter(p=>p.title.toLowerCase().includes(search.toLowerCase()) && (!category || p.category===category) && (!status || displayStatus(p)===status)).map((proj) => (
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
                          {proj.frontPagePhoto && <img className="cms-thumb" src={resolveArtwork(proj.frontPagePhoto)} alt=""/>}<strong>{proj.title}</strong>
                          <span className="table-subtext">{proj.updatedAt && new Date(proj.updatedAt).toLocaleDateString()}</span>
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
                        <span>{displayStatus(proj)}</span>
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
        <EditorDialog title="Project editor" onClose={()=>{if(!saving)setModalOpen(false)}}>
          <div className="admin-modal-dialog large">
            <div className="admin-modal-header">
              <h2>{editingProject ? `Edit: ${editingProject.title}` : 'Add New Ramen Project'}</h2>
              <button onClick={() => setModalOpen(false)} className="close-modal-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body">
              <h3>General</h3><div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="projectsadmin-project-title">Project Title *</label>
                  <input id="projectsadmin-project-title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. TravelFlow AI"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectsadmin-slug-url-identifier">Slug (URL identifier) *</label>
                  <input id="projectsadmin-slug-url-identifier"
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
                  <label htmlFor="projectsadmin-ramen-dish-name-theme">Ramen Dish Name (Theme) *</label>
                  <input id="projectsadmin-ramen-dish-name-theme"
                    type="text"
                    required
                    value={formData.dishName}
                    onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
                    placeholder="e.g. Narutomaki AI Ramen"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectsadmin-category">Category *</label>
                  <input id="projectsadmin-category"
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
                  <label htmlFor="projectsadmin-order-in-menu-1-2-3">Order in Menu (1, 2, 3...)</label>
                  <input id="projectsadmin-order-in-menu-1-2-3"
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
                  <label htmlFor="projectsadmin-front-page-photo-left-menu-page">Front Page Photo (Left Menu Page)</label>
                  <input id="projectsadmin-front-page-photo-left-menu-page"
                    type="text"
                    value={formData.frontPagePhoto}
                    onChange={(e) => setFormData({ ...formData, frontPagePhoto: e.target.value })}
                    placeholder="/ichiraku/projects/image.webp or upload below"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectsadmin-project-photo-right-detail-page">Project Photo (Right Detail Page) *</label>
                  <input id="projectsadmin-project-photo-right-detail-page"
                    type="text"
                    required
                    value={formData.projectPhoto}
                    onChange={(e) => setFormData({ ...formData, projectPhoto: e.target.value })}
                    placeholder="/ichiraku/projects/image.webp or upload below"
                  />
                </div>
              </div>

              <div className="form-group">
                <h3>Content</h3><label htmlFor="projectsadmin-short-description-ramen-menu-summary">Short Description (Ramen Menu Summary) *</label>
                <textarea id="projectsadmin-short-description-ramen-menu-summary"
                  rows={2}
                  required
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="One or two concise sentences summarizing the project."
                />
              </div>

              <div className="form-group">
                <label htmlFor="projectsadmin-problem-solved">Problem Solved</label>
                <textarea id="projectsadmin-problem-solved"
                  rows={2}
                  value={formData.problemSolved}
                  onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
                  placeholder="The real-world bottleneck or problem this solves."
                />
              </div>

              <div className="form-group">
                <label htmlFor="projectsadmin-key-features-one-bullet-per-line">Key Features (One bullet per line)</label>
                <textarea id="projectsadmin-key-features-one-bullet-per-line"
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div className="form-group">
                <h3>Technologies</h3><label htmlFor="projectsadmin-tech-stack-comma-separated">Tech Stack (Comma-separated)</label>
                <input id="projectsadmin-tech-stack-comma-separated"
                  type="text"
                  value={formData.techStackText}
                  onChange={(e) => setFormData({ ...formData, techStackText: e.target.value })}
                  placeholder="React, TypeScript, Node.js, Express, MongoDB"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <h3>Links</h3><label htmlFor="projectsadmin-github-repository-url">GitHub Repository URL</label>
                  <input id="projectsadmin-github-repository-url"
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectsadmin-live-website-demo-url">Live Website / Demo URL</label>
                  <input id="projectsadmin-live-website-demo-url"
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <fieldset><legend>Media</legend>{[['projectPhoto','Main image'],['frontPagePhoto','Thumbnail'],['screenshots','Add screenshot']].map(([key,label])=><AssetInput key={key} label={label} onUpload={url=>setFormData(f=>({...f,[key]:key==='screenshots'?[...(f.screenshots || []),url]:url}))}/>)}
              <label>Screenshot URLs, one per line<textarea value={(formData.screenshots || []).join('\n')} onChange={e=>setFormData({...formData,screenshots:e.target.value.split('\n')})}/></label></fieldset>
              <label>Publishing status<select value={formData.status || 'draft'} onChange={e=>setFormData({...formData,status:e.target.value})}>{['draft','published','archived'].map(v=><option key={v}>{v}</option>)}</select></label>
              {formData.liveUrl && formData.liveUrl===formData.githubUrl && <p className="field-hint">The live and repository URLs match. Enter the deployed website URL for this project.</p>}
              <details className="cms-preview">
                <summary>Preview project details</summary>
                <div className="cms-book-preview">
                  <ProjectDetails project={{
                    ...formData,
                    id: formData.slug,
                    title: formData.title || 'Untitled project',
                    description: formData.shortDesc,
                    screenshots: [...new Set([formData.projectPhoto, ...formData.screenshots].map(url => url.trim()).filter(Boolean).map(resolveArtwork))],
                    technologies: formData.techStackText.split(',').map(t => t.trim()).filter(Boolean),
                    features: formData.featuresText.split('\n').map(f => f.trim()).filter(Boolean),
                  }} />
                </div>
              </details>
              {message.type==='error' && <p role="alert">{message.text}</p>}
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
        </EditorDialog>
      )}
    </div>
  );
}
