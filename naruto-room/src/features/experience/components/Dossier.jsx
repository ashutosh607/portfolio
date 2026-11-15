import { certificatesFor, isDocumentUrl, missionPreviewMedia } from '../data/missionRepository';
import React, { useRef, useState } from 'react';

export function ProjectLink({ mission }) {
  return <a href={mission.liveUrl} target="_blank" rel="noopener noreferrer">View Project ↗</a>;
}

export function GitHubLink({ mission }) {
  return (
    <a className="ms-github-link" href={mission.githubUrl} target="_blank" rel="noopener noreferrer">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
      <span>GitHub</span>
    </a>
  );
}

export function MissionCard({ mission, onDetail, onContact }) {
  const { title, organization, category, description, status, technologies, availableFrom } = mission;
  const { imageUrl, documentUrl } = missionPreviewMedia(mission);
  const hasPlate = Boolean(imageUrl || documentUrl);
  const hasDetail = Boolean(
    mission.caseStudy || mission.type === 'hackathon' || certificatesFor(mission).length > 0,
  );
  const plateContent = imageUrl ? (
    <img src={imageUrl} alt={(organization || title) + ' preview'} loading="lazy" />
  ) : documentUrl ? (
    <span className="ms-plate-pdf">
      <strong>PDF</strong>
      <span>Certificate attached</span>
      <small>Click to view ↗</small>
    </span>
  ) : null;

  return <article className="ms-card">
    <div className="ms-cardline"><small>{category}</small><span className="ms-status">{status}</span></div>
    <div className={hasPlate ? 'ms-illustrated' : undefined}>
      <div>
        <h2>{title}{organization && <span> — {organization}</span>}</h2>
        {availableFrom && <strong className="ms-date">Available from {new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(availableFrom))}.</strong>}
        <p>{description}</p>
        {(mission.role || mission.startDate || mission.endDate) && <p>{[mission.role,[mission.startDate,mission.endDate].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')}</p>}
        {technologies.length > 0 && <div className="ms-tags">{technologies.map(t => <span key={t}>{t}</span>)}</div>}
        <div className="ms-actions">
          {mission.liveUrl && <ProjectLink mission={mission}/>}
          {mission.githubUrl && <GitHubLink mission={mission}/>}
          {mission.caseStudy && <button onClick={onDetail}>View Case Study →</button>}
          {(mission.type === 'hackathon' || (!mission.caseStudy && certificatesFor(mission).length>0)) && <button onClick={onDetail}>View Certificates →</button>}
          {availableFrom && <button onClick={onContact}>Get in Touch →</button>}
        </div>
      </div>
      {hasPlate && (mission.liveUrl ? (
        <a className="ms-plate" href={mission.liveUrl} target="_blank" rel="noopener noreferrer">
          {plateContent}
        </a>
      ) : hasDetail ? (
        <button type="button" className="ms-plate ms-plate-btn" onClick={onDetail} aria-label={`Inspect ${title}`}>
          {plateContent}
        </button>
      ) : (
        <a className="ms-plate" href={documentUrl || imageUrl} target="_blank" rel="noopener noreferrer">
          {plateContent}
        </a>
      ))}
    </div>
  </article>;
}

export function MissionDetail({ mission, onPreview }) {
  const study = mission.caseStudy;
  const certificates = certificatesFor(mission);
  const sections = [
    ['Role', mission.role], ['Contribution', study?.responsibilities],
    ['Outcome', (mission.events || []).filter(e => e.achievement).map(e => [e.title, e.achievement].filter(Boolean).join(' — '))],
    ...(study ? [
    ['Project overview', mission.description], ['Client requirements', study.requirements],
    ['Technology stack', mission.technologies],
    ['Features developed', study.features], ['Challenges and solutions', study.challenges],
    ['Deployment and SEO', study.deployment],
    ] : []),
  ];
  return <section className="ms-detail"><small>{study ? 'Case study' : 'Certificate gallery'}</small>
    <h2>{mission.organization || mission.title}</h2>
    {sections?.filter(([,value]) => value?.length).map(([label,value]) => <section key={label}><h3>{label}</h3>
      {Array.isArray(value) ? <ul>{value.map(item => <li key={item}>{item}</li>)}</ul> : <p>{value}</p>}</section>)}
    {study?.screenshots?.map(image => <img key={image.url} src={image.url} alt={image.title} loading="lazy"/>)}
    {(mission.liveUrl || mission.githubUrl) && (
      <div className="ms-actions">
        {mission.liveUrl && <ProjectLink mission={mission}/>}
        {mission.githubUrl && <GitHubLink mission={mission}/>}
      </div>
    )}
    {<>{!study && <p>{mission.description}</p>}{(mission.events || []).map(event => <section key={event.id}>
      <h3>{event.title || 'Hackathon record'}</h3><dl>{Object.entries({
        Organiser: event.organiser, Date: event.date, Duration: event.duration, Team: event.team,
        Project: event.project, Technologies: event.technologies.join(', '),
      }).filter(([,v]) => v).map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    </section>)}
    {certificates.length ? certificates.map((item,i) => <button className="ms-thumb" key={item.url} onClick={() => onPreview(i)}>
      {isDocumentUrl(item.url) ? <span>View PDF certificate</span> : <img loading="lazy" src={item.url} alt={item.title || 'Participation certificate'}/>}</button>) :
      !study && <p className="ms-empty">Participation certificates haven’t been added yet.</p>}</>}
  </section>;
}

export function CertificateViewer({ items, index, onChange, onClose }) {
  const [zoom, setZoom] = useState(1);
  const frame = useRef(null);
  const item = items[index];
  return <section className="ms-viewer" ref={frame} aria-label="Certificate preview">
    <div className="ms-actions"><button onClick={onClose}>Close preview</button>
      <button onClick={() => setZoom(zoom === 1 ? 2 : 1)}>{zoom === 1 ? 'Zoom in' : 'Zoom out'}</button>
      {document.fullscreenEnabled && <button onClick={() => (document.fullscreenElement ? document.exitFullscreen() : frame.current.requestFullscreen()).catch(() => {})}>Full screen</button>}
    </div><div className="ms-image">{isDocumentUrl(item.url) ? <a href={item.url} target="_blank" rel="noreferrer">Open PDF certificate ↗</a> : <img style={{width: zoom * 100 + '%'}} src={item.url} alt={item.title || 'Participation certificate'}/>}</div>
    <div className="ms-actions"><button disabled={!index} onClick={() => onChange(index - 1)}>Previous</button>
    <span>{index + 1} / {items.length}</span><button disabled={index === items.length - 1} onClick={() => onChange(index + 1)}>Next</button></div>
  </section>;
}
