import { certificatesFor, isDocumentUrl, missionPreviewMedia } from '../../data/missionRepository';
import React, { useRef, useState } from 'react';

export function ProjectLink({ mission }) {
  return <a href={mission.liveUrl} target="_blank" rel="noopener noreferrer">View Project ↗</a>;
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
  const sections = study && [
    ['Project overview', mission.description], ['Client requirements', study.requirements],
    ['My responsibilities', study.responsibilities], ['Technology stack', mission.technologies],
    ['Features developed', study.features], ['Challenges and solutions', study.challenges],
    ['Deployment and SEO', study.deployment],
  ];
  return <section className="ms-detail"><small>{study ? 'Case study' : 'Certificate gallery'}</small>
    <h2>{mission.organization || mission.title}</h2>
    {sections?.filter(([,value]) => value?.length).map(([label,value]) => <section key={label}><h3>{label}</h3>
      {Array.isArray(value) ? <ul>{value.map(item => <li key={item}>{item}</li>)}</ul> : <p>{value}</p>}</section>)}
    {study?.screenshots?.map(image => <img key={image.url} src={image.url} alt={image.title} loading="lazy"/>)}
    {mission.liveUrl && <div className="ms-actions"><ProjectLink mission={mission}/></div>}
    {<>{!study && <p>{mission.description}</p>}{(mission.events || []).map(event => <section key={event.id}>
      <h3>{event.title || 'Hackathon record'}</h3><dl>{Object.entries({
        Organiser: event.organiser, Date: event.date, Duration: event.duration, Team: event.team,
        Project: event.project, Technologies: event.technologies.join(', '), Achievement: event.achievement,
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
