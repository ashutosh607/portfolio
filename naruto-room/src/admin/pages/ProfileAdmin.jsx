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

  const [githubForm, setGithubForm] = useState({
    username: 'ashutosh607',
    title: 'My Coding Journey',
    subtitle: 'DEVELOPER ACTIVITY',
    description: 'A year of building, learning and shipping code.',
    profileUrl: 'https://github.com/ashutosh607',
    enabled: true,
  });
  const [refreshingGithub, setRefreshingGithub] = useState(false);
  const [githubRefreshMsg, setGithubRefreshMsg] = useState('');

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

      const gh = data.githubCalendar || {};
      setGithubForm({
        username: gh.username || 'ashutosh607',
        title: gh.title || 'My Coding Journey',
        subtitle: gh.subtitle || 'DEVELOPER ACTIVITY',
        description: gh.description || 'A year of building, learning and shipping code.',
        profileUrl: gh.profileUrl || 'https://github.com/ashutosh607',
        enabled: gh.enabled !== false,
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
        githubCalendar: {
          ...githubForm,
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

  const handleRefreshGithubCache = async () => {
    try {
      setRefreshingGithub(true);
      setGithubRefreshMsg('');
      const res = await apiRequest('/github/refresh', {
        method: 'POST',
        body: JSON.stringify({ username: githubForm.username }),
      });
      setGithubRefreshMsg(`✓ Cache refreshed! ${res.total || 0} real contributions loaded for @${githubForm.username}`);
    } catch (err) {
      setGithubRefreshMsg(`Error refreshing: ${err.message}`);
    } finally {
      setRefreshingGithub(false);
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
          {Object.entries({snapshotItems:['label','title','desc'],interestItems:['icon','label','sub'],driveValues:['num','title','desc'],animeList:['title','tags','imageUrl']}).map(([field,keys])=>{
            const rows=profile?.about?.[field] || [];
            const setRows=next=>setProfile(p=>({...p,about:{...p.about,[field]:next}}));
            return <fieldset key={field}><legend>{{snapshotItems:'Education & highlights',interestItems:'Interests',driveValues:'Career goals',animeList:'Top anime posters (shown in About → My Top 3 Anime)'}[field]}</legend>
              {rows.map((row,i)=><div className="cms-row" key={i}>{keys.map(k=><label key={k}>{k}<input value={row[k] || ''} onChange={e=>setRows(rows.map((r,n)=>n===i?{...r,[k]:e.target.value}:r))}/></label>)}
              {keys.includes('imageUrl') && <AssetInput label="Upload poster" onUpload={url=>setRows(rows.map((r,n)=>n===i?{...r,imageUrl:url}:r))}/>}
              <button type="button" onClick={()=>setRows(rows.filter((_,n)=>n!==i))}>Remove</button></div>)}
              <button type="button" onClick={()=>setRows([...rows,{}])}>Add item</button></fieldset>;
          })}
          <fieldset><legend>About headline</legend>
            <label>headline<input value={profile?.about?.headline || ''} placeholder="The shinobi behind the code." onChange={e=>setProfile(p=>({...p,about:{...p.about,headline:e.target.value}}))}/></label>
          </fieldset>
          <fieldset><legend>Football (About section)</legend>
            {['title','position','description','imageUrl'].map(k=><label key={k}>{k}<input value={profile?.about?.football?.[k] || ''} onChange={e=>setProfile(p=>({...p,about:{...p.about,football:{...p.about?.football,[k]:e.target.value}}}))}/></label>)}
            <AssetInput label="Upload football image" onUpload={url=>setProfile(p=>({...p,about:{...p.about,football:{...p.about?.football,imageUrl:url}}}))}/>
          </fieldset>

          {/* GitHub Live Contribution Calendar Configuration */}
          <fieldset style={{ borderColor: 'rgba(255, 90, 31, 0.4)' }}>
            <legend style={{ color: '#FF5A1F', fontWeight: 600 }}>GitHub Activity Calendar (Live 12-Month Grid)</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={githubForm.enabled}
                  onChange={(e) => setGithubForm({ ...githubForm, enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#FF5A1F' }}
                />
                <span style={{ fontWeight: 600, color: '#F3E6D3' }}>Show GitHub Contribution Calendar on Portfolio</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <label>
                  GitHub Username
                  <input
                    type="text"
                    required
                    value={githubForm.username}
                    placeholder="e.g. ashutosh607"
                    onChange={(e) => setGithubForm({ ...githubForm, username: e.target.value })}
                  />
                  <small style={{ color: '#888', display: 'block', marginTop: '4px' }}>
                    Real contributions are pulled from this account and cached for 4 hours.
                  </small>
                </label>

                <label>
                  Section Title
                  <input
                    type="text"
                    value={githubForm.title}
                    placeholder="My Coding Journey"
                    onChange={(e) => setGithubForm({ ...githubForm, title: e.target.value })}
                  />
                </label>

                <label>
                  Eyebrow Label
                  <input
                    type="text"
                    value={githubForm.subtitle}
                    placeholder="DEVELOPER ACTIVITY"
                    onChange={(e) => setGithubForm({ ...githubForm, subtitle: e.target.value })}
                  />
                </label>

                <label>
                  Profile Link
                  <input
                    type="url"
                    value={githubForm.profileUrl}
                    placeholder="https://github.com/ashutosh607"
                    onChange={(e) => setGithubForm({ ...githubForm, profileUrl: e.target.value })}
                  />
                </label>
              </div>

              <label>
                Description
                <textarea
                  rows={2}
                  value={githubForm.description}
                  placeholder="A year of building, learning and shipping code."
                  onChange={(e) => setGithubForm({ ...githubForm, description: e.target.value })}
                />
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                <button
                  type="button"
                  disabled={refreshingGithub}
                  onClick={handleRefreshGithubCache}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#1D1917',
                    border: '1px solid #FF5A1F',
                    color: '#F3E6D3',
                    cursor: refreshingGithub ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  {refreshingGithub ? 'Refreshing from GitHub...' : '↻ Refresh GitHub Cache Now'}
                </button>
                {githubRefreshMsg && (
                  <span style={{ fontSize: '13px', color: githubRefreshMsg.startsWith('✓') ? '#39d353' : '#fca5a5' }}>
                    {githubRefreshMsg}
                  </span>
                )}
              </div>
            </div>
          </fieldset>
          <div className="form-sticky-footer"><button type="submit" value="draft" disabled={saving} className="admin-secondary-btn">Save draft</button><button type="submit" disabled={saving} className="admin-primary-btn">Publish profile</button></div>
          </form>
      )}
    </div>
  );
}

