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

  return (
    <div ref={reader} className="menu-page-body project-detail" tabIndex={0}
      role="region" aria-label={`Details for ${project.title}`}>
        <h2>{project.title}</h2><em>{project.dishName}</em>
        <p>{project.description}</p>
        {project.problemSolved && <p>{project.problemSolved}</p>}
        {!!project.technologies.length && <><h3>Technology stack</h3><div className="book-tech">{project.technologies.map(t => <span key={t}>{t}</span>)}</div></>}
        {!!project.features.length && <><h3>Key features</h3><ul>{project.features.map((f, index) => <li key={index}>{f}</li>)}</ul></>}
        {project.projectPhoto && <figure><Media source={project.projectPhoto} title={project.title + ' project screenshot'}/></figure>}
        <div className="book-links">
          {project.villageEntry && onVillage && <button onClick={onVillage}>Explore the village →</button>}
          {project.liveUrl && !project.liveUrl.startsWith('#') && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live website ↗</a>}
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>}
        </div>
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
            <span className="mobile-dish-summary">{project.description}</span><span className="mobile-dish-stack">{project.technologies.slice(0,3).join(' · ')}</span>
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
