import React, { useState } from 'react';

/**
 * Reusable Related Project Card
 */
export default function RelatedProjectCard({ project, onInspect }) {
  const [failedImage, setFailedImage] = useState(null);
  if (!project) return null;

  const handleClick = (e) => {
    e.preventDefault();
    if (onInspect) {
      onInspect(project);
    } else if (project.liveUrl && project.liveUrl !== '#projects') {
      window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="related-project-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      }}
      title={`Inspect project: ${project.title}`}
    >
      <div className="project-thumb-frame">
        {project.thumbnail && project.thumbnail !== failedImage ? <img
          src={project.thumbnail}
          alt=""
          onError={() => setFailedImage(project.thumbnail)}
          className="project-thumb-image"
          loading="lazy"
          draggable={false}
        /> : <span className="skill-project-initial" aria-hidden="true">{project.title.slice(0, 1)}</span>}
        <div className="project-thumb-vignette" />
      </div>

      <div className="project-card-footer">
        <h4 className="project-card-title">{project.title}</h4>
        <span className="project-card-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
    </div>
  );
}

