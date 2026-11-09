import AssetInput from '../AssetInput';
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Mail, Globe, Link2, Trash2, Check, AlertCircle, Save, FileText } from 'lucide-react';

export default function ContactAdmin() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [form, setForm] = useState({
    email: '',
    githubUrl: '',
    linkedinUrl: '',
    location: '',
    availabilityText: '',
    isAvailable: true,
    resumePdfUrl: '',
  });

  const loadContact = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/contact?includeMessages=true');
      const data = res.data || {};
      setContact(data);

      setForm({
        description: data.description || '',
        email: data.email || '',
        githubUrl: data.githubUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        location: data.location || '',
        availabilityText: data.availabilityText || 'Available for Opportunities',
        isAvailable: data.isAvailable ?? true,
        resumePdfUrl: data.resume?.activePdfUrl || '/Ashutosh_Kadam_Resume.pdf',
      });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
      if(location.hash==='#resume')requestAnimationFrame(()=>document.getElementById('resume')?.scrollIntoView());
    }
  };

  useEffect(() => {
    loadContact();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        description: form.description,
        email: form.email,
        githubUrl: form.githubUrl,
        linkedinUrl: form.linkedinUrl,
        location: form.location,
        availabilityText: form.availabilityText,
        isAvailable: form.isAvailable,
        resume: {
          ...contact?.resume,
          activePdfUrl: form.resumePdfUrl,
          updatedAt: new Date(),
        },
      };

      await apiRequest('/contact', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setMessage({ text: 'Contact & Resume settings saved!', type: 'success' });
      loadContact();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this visitor message?')) return;
    try {
      await apiRequest(`/contact/messages/${msgId}`, { method: 'DELETE' });
      setMessage({ text: 'Message deleted.', type: 'success' });
      loadContact();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contact & Visitor Inbox</h1>
          <p className="page-subtitle">Manage Hokage Monument contact directory, availability badge, resume link, and incoming messages.</p>
        </div>
      </div>

      {message.text && (
        <div className={`admin-alert ${message.type}`}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading Contact Info...</div>
      ) : (
        <div className="contact-admin-grid">
          {/* Contact & Availability Settings */}
          <form onSubmit={handleSave} className="admin-card">
            <div className="card-header">
              <h3>Contact Details & Directory</h3>
            </div>

            <div className="form-group">
              <label>Contact Email</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={16} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>GitHub Profile URL</label>
              <div className="input-with-icon">
                <Globe className="input-icon" size={16} />
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>LinkedIn Profile URL</label>
              <div className="input-with-icon">
                <Link2 className="input-icon" size={16} />
                <input
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contactadmin-current-location">Current Location</label>
              <input id="contactadmin-current-location"
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Availability Badge Status</label>
              <div className="toggle-row">
                <input
                  type="checkbox"
                  id="availToggle"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                />
                <label htmlFor="availToggle">
                  Available for opportunities
                </label>
              </div>
            </div>

            <div className="form-group">
              <label id="resume">Active résumé PDF URL</label>
              <div className="input-with-icon">
                <FileText className="input-icon" size={16} />
                <input
                  type="text"
                  value={form.resumePdfUrl}
                  onChange={(e) => setForm({ ...form, resumePdfUrl: e.target.value })}
                  placeholder="/Ashutosh_Kadam_Resume.pdf or Cloudinary URL"
                />
              </div>
              <span className="field-hint">
                This PDF opens when visitors click "Open Resume" in the Contact Modal or 2D mode.
              </span>
            </div>

            <label className="form-group">Availability label<input value={form.availabilityText} onChange={e=>setForm({...form,availabilityText:e.target.value})}/></label>
            <label className="form-group">Contact description<textarea value={form.description || ''} onChange={e=>setForm({...form,description:e.target.value})}/></label>
            <AssetInput label="Replace active résumé" document onUpload={url=>setForm(f=>({...f,resumePdfUrl:url}))}/>
            {form.resumePdfUrl && <a href={form.resumePdfUrl} target="_blank" rel="noreferrer">Preview résumé ↗</a>}
            <button type="submit" disabled={saving} className="admin-primary-btn mt-4">
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Contact Settings'}</span>
            </button>
          </form>

          {/* Messages Inbox */}
          <div className="admin-card">
            <div className="card-header">
              <div className="card-header-icon-title">
                <Mail size={18} className="text-orange" />
                <h3>Received Inquiries ({contact?.messages?.length || 0})</h3>
              </div>
            </div>

            {(!contact?.messages || contact.messages.length === 0) ? (
              <div className="empty-inbox">
                <p>No inquiry scrolls received yet.</p>
                <span className="sub">Messages sent from the Hokage Monument contact form will appear here.</span>
              </div>
            ) : (
              <div className="messages-list">
                {contact.messages.map((msg) => (
                  <div key={msg._id} className="message-item">
                    <div className="message-item-header">
                      <div>
                        <strong>{msg.name}</strong>
                        <span className="message-email">&lt;{msg.email}&gt;</span>
                      </div>
                      <div className="message-actions">
                        <span className="message-date">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="icon-btn delete"
                          title="Delete Message"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="message-subject">
                      <strong>Subject:</strong> {msg.subject}
                    </div>
                    <p className="message-body">{msg.message}</p><button className="admin-secondary-btn" onClick={async()=>{
                      try {await apiRequest('/contact/messages/'+msg._id,{method:'PATCH',body:JSON.stringify({read:!msg.read})});await loadContact()}
                      catch(e){setMessage({type:'error',text:e.message})}
                    }}>Mark {msg.read?'unread':'read'}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
