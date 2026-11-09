import AssetInput from '../AssetInput';
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { UserCheck, Sparkles, Check, AlertCircle, Save } from 'lucide-react';

export default function ProfileAdmin() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [heroForm, setHeroForm] = useState({
    sentence1: '',
    sentence2: '',
    sentence3: '',
    sentence4: '',
    greeting: '',
    roleBadgesText: '',
    quote: '',
    introBio: '',
  });

  const [aboutForm, setAboutForm] = useState({
    badge: '',
    title: '',
    subtitle: '',
    photoUrl: '',
    bioText: '',
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/profile?all=true');
      const data = res.data?.draft || res.data || {};
      setProfile(data);

      const s = data.hero?.welcomeSentences || [];
      setHeroForm({
        sentence1: s[0] || 'Welcome to the Hidden Leaf Village.',
        sentence2: s[1] || 'Every corner holds a part of my story.',
        sentence3: s[2] || 'Explore the village. Discover my journey.',
        sentence4: s[3] || 'Find the gate. Your adventure begins there.',
        greeting: data.hero?.greeting || 'Hello, I’m Ashutosh.',
        roleBadgesText: (data.hero?.roleBadges || []).join(', '),
        quote: data.hero?.quote || 'A shinobi of code, building things worth discovering.',
        introBio: data.hero?.introBio || '',
      });

      setAboutForm({
        badge: data.about?.badge || "HOKAGE'S OFFICE • PERSONAL DOSSIER",
        title: data.about?.title || 'Ashutosh Kadam',
        subtitle: data.about?.subtitle || 'AI & ML Engineering Student • Full-Stack & 3D Web Developer',
        photoUrl: data.about?.photoUrl || '/about/ashutosh-photo.jpg',
        bioText: (data.about?.bioParagraphs || []).join('\n\n'),
      });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        saveDraft:e.nativeEvent.submitter?.value==='draft',
        hero: {
          welcomeSentences: [
            heroForm.sentence1,
            heroForm.sentence2,
            heroForm.sentence3,
            heroForm.sentence4,
          ].filter(Boolean),
          greeting: heroForm.greeting,
          roleBadges: heroForm.roleBadgesText
            .split(',')
            .map((b) => b.trim())
            .filter(Boolean),
          quote: heroForm.quote,
          introBio: heroForm.introBio,
        },
        about: {
          ...profile?.about,
          badge: aboutForm.badge,
          title: aboutForm.title,
          subtitle: aboutForm.subtitle,
          photoUrl: aboutForm.photoUrl,
          bioParagraphs: aboutForm.bioText
            .split('\n\n')
            .map((p) => p.trim())
            .filter(Boolean),
        },
      };

      await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setMessage({ text: payload.saveDraft?'Draft saved.':'Profile published.', type: 'success' });
      loadProfile();
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
          <h1 className="page-title">Profile & Hero Dossier</h1>
          <p className="page-subtitle">Configure 3D sky welcome sentences, entry gate quotes, and Hokage's Office bio.</p>
        </div>
      </div>

      {message.text && (
        <div className={`admin-alert ${message.type}`}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading Profile Dossier...</div>
      ) : (
        <form onSubmit={handleSave} className="profile-admin-layout">
          {/* Section 1: 3D Sky Welcome Intro */}
          <div className="admin-card">
            <div className="card-header">
              <div className="card-header-icon-title">
                <Sparkles size={18} className="text-orange" />
                <h3>3D Sky Welcome Sentences (Cinematic Intro)</h3>
              </div>
            </div>
            <p className="card-hint">
              These 4 sentences appear word-by-word across the night sky when visitors first arrive in Konoha.
            </p>

            <div className="form-group">
              <label htmlFor="profileadmin-sentence-1">Sentence 1</label>
              <input id="profileadmin-sentence-1"
                type="text"
                value={heroForm.sentence1}
                onChange={(e) => setHeroForm({ ...heroForm, sentence1: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profileadmin-sentence-2">Sentence 2</label>
              <input id="profileadmin-sentence-2"
                type="text"
                value={heroForm.sentence2}
                onChange={(e) => setHeroForm({ ...heroForm, sentence2: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profileadmin-sentence-3">Sentence 3</label>
              <input id="profileadmin-sentence-3"
                type="text"
                value={heroForm.sentence3}
                onChange={(e) => setHeroForm({ ...heroForm, sentence3: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profileadmin-sentence-4-final-direction-to-gate">Sentence 4 (Final Direction to Gate)</label>
              <input id="profileadmin-sentence-4-final-direction-to-gate"
                type="text"
                value={heroForm.sentence4}
                onChange={(e) => setHeroForm({ ...heroForm, sentence4: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Hero Entry Gate */}
          <div className="admin-card">
            <div className="card-header">
              <div className="card-header-icon-title">
                <UserCheck size={18} className="text-blue" />
                <h3>Entry Gate & Hero Presentation</h3>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="profileadmin-greeting-title">Greeting Title</label>
                <input id="profileadmin-greeting-title"
                  type="text"
                  value={heroForm.greeting}
                  onChange={(e) => setHeroForm({ ...heroForm, greeting: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profileadmin-role-badges-comma-separated">Role Badges (Comma-separated)</label>
                <input id="profileadmin-role-badges-comma-separated"
                  type="text"
                  value={heroForm.roleBadgesText}
                  onChange={(e) => setHeroForm({ ...heroForm, roleBadgesText: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profileadmin-shinobi-quote">Shinobi Quote</label>
              <input id="profileadmin-shinobi-quote"
                type="text"
                value={heroForm.quote}
                onChange={(e) => setHeroForm({ ...heroForm, quote: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profileadmin-hero-summary-bio">Hero Summary Bio</label>
              <textarea id="profileadmin-hero-summary-bio"
                rows={2}
                value={heroForm.introBio}
                onChange={(e) => setHeroForm({ ...heroForm, introBio: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: About Hokage Office */}
          <div className="admin-card">
            <div className="card-header">
              <h3>Hokage Office (About Modal & 2D About Section)</h3>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="profileadmin-display-name">Display Name</label>
                <input id="profileadmin-display-name"
                  type="text"
                  value={aboutForm.title}
                  onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profileadmin-subtitle-specialization">Subtitle / Specialization</label>
                <input id="profileadmin-subtitle-specialization"
                  type="text"
                  value={aboutForm.subtitle}
                  onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profileadmin-profile-photo-url">Profile Photo URL</label>
              <input id="profileadmin-profile-photo-url"
                type="text"
                value={aboutForm.photoUrl}
                onChange={(e) => setAboutForm({ ...aboutForm, photoUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="profileadmin-about-bio-paragraphs-separate-each-paragraph-with-an-empty-line">About Bio Paragraphs (Separate each paragraph with an empty line)</label>
              <textarea id="profileadmin-about-bio-paragraphs-separate-each-paragraph-with-an-empty-line"
                rows={6}
                value={aboutForm.bioText}
                onChange={(e) => setAboutForm({ ...aboutForm, bioText: e.target.value })}
              />
            </div>
          </div>

        <AssetInput label="Upload portrait" onUpload={url=>setAboutForm(f=>({...f,photoUrl:url}))}/>
          {aboutForm.photoUrl && <img className="cms-portrait" src={aboutForm.photoUrl} alt="Profile preview"/>}
          {Object.entries({snapshotItems:['label','title','desc'],interestItems:['icon','label','sub'],driveValues:['num','title','desc']}).map(([field,keys])=>{
            const rows=profile?.about?.[field] || [];
            const setRows=next=>setProfile(p=>({...p,about:{...p.about,[field]:next}}));
            return <fieldset key={field}><legend>{{snapshotItems:'Education & highlights',interestItems:'Interests',driveValues:'Career goals'}[field]}</legend>
              {rows.map((row,i)=><div className="cms-row" key={i}>{keys.map(k=><label key={k}>{k}<input value={row[k] || ''} onChange={e=>setRows(rows.map((r,n)=>n===i?{...r,[k]:e.target.value}:r))}/></label>)}
              <button type="button" onClick={()=>setRows(rows.filter((_,n)=>n!==i))}>Remove</button></div>)}
              <button type="button" onClick={()=>setRows([...rows,{}])}>Add item</button></fieldset>;
          })}
          <div className="form-sticky-footer"><button type="submit" value="draft" disabled={saving} className="admin-secondary-btn">Save draft</button><button type="submit" disabled={saving} className="admin-primary-btn">Publish profile</button></div>
          </form>
      )}
    </div>
  );
}

