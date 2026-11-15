import React from 'react';

function Media({ source, title }) {
  const url = typeof source === 'string' ? source : source?.url;
  return url ? <img src={url} alt={source?.alt || title} decoding="async"/> :
    <span className="dish-monogram" aria-hidden="true">{title.slice(0, 1)}</span>;
}

export function ProjectDetails({ project, onVillage }) {
  const reader = React.useRef(null);
  React.useLayoutEffect(() => {
    if (reader.current) reader.current.scrollTop = 0;
  }, [project.id]);

  const photo = project.thumbnail || project.projectPhoto;
  const liveUrl = project.liveUrl && !project.liveUrl.startsWith('#') ? project.liveUrl : '';
  const targetUrl = liveUrl || project.githubUrl;
  const linkLabel = liveUrl ? 'Open website' : 'Open GitHub';

  return (
    <div ref={reader} className="menu-page-body project-detail" tabIndex={0}
      role="region" aria-label={`Details for ${project.title}`}>
        <h2>{project.title}</h2>
        {project.description && <p>{project.shortDesc || project.description}</p>}
        {photo && (
          <figure className="project-detail-figure">
            {targetUrl ? (
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-photo-link"
                aria-label={`${linkLabel} for ${project.title} (opens in a new tab)`}
              >
                <Media source={photo} title={project.title + ' project screenshot'} />
                <span className="project-photo-action" aria-hidden="true">{linkLabel} ↗</span>
              </a>
            ) : project.villageEntry && onVillage ? (
              <button
                type="button"
                onClick={onVillage}
                className="project-photo-link"
                title={`Explore ${project.title}`}
              >
                <Media source={photo} title={project.title + ' project screenshot'} />
              </button>
            ) : (
              <Media source={photo} title={project.title + ' project screenshot'} />
            )}
          </figure>
        )}
        <div className="book-links">
          {project.villageEntry && onVillage && <button onClick={onVillage}>Explore the village →</button>}
          {liveUrl && <a href={liveUrl} target="_blank" rel="noreferrer">Visit Website ↗</a>}
          {project.githubUrl && <a className="book-source-link" href={project.githubUrl} target="_blank" rel="noreferrer">Source Code ↗</a>}
        </div>
        {project.shortDesc && project.shortDesc !== project.description && <p>{project.description}</p>}
        {project.problemSolved && <p>{project.problemSolved}</p>}
        {!!project.technologies.length && <><h3>Technology stack</h3><div className="book-tech">{project.technologies.map(t => <span key={t}>{t}</span>)}</div></>}
        {!!project.features.length && <><h3>Key features</h3><ul>{project.features.map((f, index) => <li key={index}>{f}</li>)}</ul></>}

    </div>
  );
}

export function PageNavigation({ number, total, onTurn, busy }) {
  return <footer className="page-footer-nav">
    <button disabled={busy || number === 1} onClick={() => onTurn(-1)}>← Previous<span className="desktop-nav-label"> Page</span></button>
    <span>{number} / {total}</span>
    <button disabled={busy || number === total} onClick={() => onTurn(1)}>Next<span className="desktop-nav-label"> Page</span> →</button>
  </footer>;
}

export function ProjectSpread({ projects, selected, onSelect, onBack, onVillage, navigation }) {
  return <>
    <section tabIndex={-1} className="book-page page-left" aria-label="Project selection">
      <small className="menu-kicker">一楽 · Project menu</small>
      <h2>Our Signature Projects</h2>
      <div className="menu-page-body menu-dishes-stack">
        {projects.map(project => <button className="menu-dish-item" key={project.id} aria-pressed={project.id === selected?.id}
          onClick={() => onSelect(project)}>
          <span className="dish-thumbnail-box"><Media source={project.thumbnail} title={project.title}/></span>
          <span className="dish-copy"><strong>{project.title}</strong><em>{project.dishName}</em>
            <span className="mobile-dish-stack">{project.technologies.slice(0,3).join(' · ')}</span>
            <span className="dish-category">{project.category?.split('•')[0].trim()}</span><b>View Details →</b></span>
        </button>)}
        {!projects.length && <p>No projects are currently listed.</p>}
      </div>
      {navigation}
    </section>
    <section className="book-page page-right" aria-label="Selected project details">
      <button className="mobile-back-action-btn" onClick={onBack}>← Project menu</button>
      <small className="menu-kicker">Project details</small>
      {selected && <ProjectDetails project={selected} onVillage={onVillage} />}
      <div className="mobile-reading-nav">{navigation}</div>
    </section>
  </>;
}
