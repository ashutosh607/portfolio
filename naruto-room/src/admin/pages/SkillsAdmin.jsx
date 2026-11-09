import {useSearchParams} from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Scroll, Pencil, Check, X, AlertCircle } from 'lucide-react';

export default function SkillsAdmin() {
  const [params]=useSearchParams();
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
      slug:skill.slug || '',icon:skill.icon || 'code', related:(skill.relatedProjects || []).join(', '),visible:skill.visible ?? true,
      title: skill.title || '',
      japaneseTitle: skill.japaneseTitle || '',
      summary: skill.summary || '',
      techText: (skill.technologies || []).join(', '),
      order: skill.order ?? 0,
    });
    setModalOpen(true);
  };

  useEffect(()=>{const row=skills.find(s=>s.slug===params.get('edit'));if(row)openEdit(row);else if(skills[0])openEdit(skills[0])},[params,loading && !skills.length]);
  async function drop(source,target){
    const next=skills.filter(s=>s.slug!==source),item=skills.find(s=>s.slug===source);
    if(!item || source===target)return;
    next.splice(skills.findIndex(s=>s.slug===target),0,item);
    try{await apiRequest('/skills/reorder',{method:'POST',body:JSON.stringify({items:next.map((s,order)=>({slug:s.slug,order}))})});await loadSkills()}catch(e){setMessage({type:'error',text:e.message})}
  }
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        slug:formData.slug,icon:formData.icon,relatedProjects:formData.related.split(',').map(x=>x.trim()).filter(Boolean),visible:formData.visible,
        title: formData.title,
        japaneseTitle: formData.japaneseTitle,
        summary: formData.summary,
        technologies: formData.techText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        order: Number(formData.order) || 0,
      };

      await apiRequest(editingSkill.slug?`/skills/${editingSkill.slug}`:'/skills', {
        method: editingSkill.slug?'PUT':'POST',
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

      <button className="admin-primary-btn" onClick={()=>openEdit({order:skills.length+1})}>Add category</button>
      {message.text && (
        <div className={`admin-alert ${message.type}`}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? <p>Loading categories…</p> : <div className="cms-skill-split"><nav className="admin-card" aria-label="Skill categories">
        {skills.map(skill=><button className="cms-action" key={skill.slug} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',skill.slug)}
          onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();drop(e.dataTransfer.getData('text/plain'),skill.slug)}}
          aria-pressed={modalOpen && editingSkill?.slug===skill.slug} onClick={()=>openEdit(skill)}>{skill.title}</button>)}</nav>
        {modalOpen ? <section className="admin-card">
            <div className="admin-modal-header">
              <h2>{editingSkill?.slug?'Edit category':'New category'}</h2>
              <button onClick={() => setModalOpen(false)} className="close-modal-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="skillsadmin-category-title">Category Title *</label>
                  <input id="skillsadmin-category-title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skillsadmin-japanese-scroll-title-kanji">Japanese Scroll Title (Kanji)</label>
                  <input id="skillsadmin-japanese-scroll-title-kanji"
                    type="text"
                    value={formData.japaneseTitle}
                    onChange={(e) => setFormData({ ...formData, japaneseTitle: e.target.value })}
                    placeholder="e.g. 風遁・フロントエンド"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="skillsadmin-summary-description">Summary Description</label>
                <textarea id="skillsadmin-summary-description"
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Summary of this technical scroll..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="skillsadmin-technologies-frameworks-comma-separated">Technologies & Frameworks (Comma-separated)</label>
                <input id="skillsadmin-technologies-frameworks-comma-separated"
                  type="text"
                  value={formData.techText}
                  onChange={(e) => setFormData({ ...formData, techText: e.target.value })}
                  placeholder="React 19, Three.js, GSAP, Tailwind CSS"
                />
              </div>

              <div className="cms-row">{['slug','icon','related'].map(key=><label key={key}>{key==='related'?'Related project slugs':key}<input required={key==='slug'} disabled={key==='slug' && !!editingSkill.slug} value={formData[key]} onChange={e=>setFormData({...formData,[key]:e.target.value})}/></label>)}</div>
              <label><input type="checkbox" checked={formData.visible} onChange={e=>setFormData({...formData,visible:e.target.checked})}/> Published</label>
              {editingSkill.slug && <button type="button" onClick={async()=>{if(!confirm('Delete this category?'))return;try{await apiRequest('/skills/'+editingSkill.slug,{method:'DELETE'});setModalOpen(false);loadSkills()}catch(e){setMessage({type:'error',text:e.message})}}}>Delete category</button>}
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
                  {saving ? 'Saving...' : 'Update Scroll'}
                </button>
              </div>
            </form>
          </section> : <p>Select a category to edit its technologies and projects.</p>}
        </div>}
    </div>
  );
}

