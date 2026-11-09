import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ProjectCard2D — Alternating Directional Card Entrance
 * Cards enter alternating from left (x: -80px) and right (x: +80px)
 * with subtle blur: 5px -> 0px, opacity: 0 -> 1.
 * Hover elevates by 4px, zooms image slightly (1.035), and offsets arrow.
 */
export default function ProjectCard2D({
  project,
  index = 0,
  scroller = '.portfolio-2d-wrapper',
  onInspect,
  onSwitchTo3D,
}) {
  const cardRef = useRef(null);
  const isFromLeft = index % 2 === 0;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, x: 0, filter: 'blur(0px)' });
      return undefined;
    }

    const scrollTarget = document.querySelector(scroller) || window;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          x: isFromLeft ? -80 : 80,
          filter: 'blur(5px)',
        },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          delay: (index % 2) * 0.12, // Coordinated stagger for cards in same visual band
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            scroller: scrollTarget,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [index, isFromLeft, scroller]);

  return (
    <article ref={cardRef} className="p2d-project-card">
      <div className="p2d-project-thumb-wrap">
        {project.thumbnail && (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="p2d-project-thumb"
            loading="lazy"
          />
        )}
        <span className="p2d-project-rank-badge">
          {project.rank || 'S-Rank'} • {project.ramenItem || 'Specialty'}
        </span>
        {project.jpTitle && (
          <span className="p2d-project-jp-badge">{project.jpTitle}</span>
        )}
      </div>

      <div className="p2d-project-body">
        <div className="p2d-project-category">{project.category}</div>
        <h3 className="p2d-project-title">
          <span>{project.title}</span>
          <span className="p2d-project-arrow-icon" aria-hidden="true">↗</span>
        </h3>
        <p className="p2d-project-desc">{project.description}</p>

        {project.features?.length > 0 && (
          <ul className="p2d-project-features">
            {project.features.slice(0, 3).map((feat, idx) => (
              <li key={idx}>{feat}</li>
            ))}
          </ul>
        )}

        <div className="p2d-project-tech-list">
          {(project.technologies || []).map((tech) => (
            <span key={tech} className="p2d-project-tech-pill">
              {tech}
            </span>
          ))}
        </div>

        <div className="p2d-project-actions">
          {project.villageEntry && onSwitchTo3D ? (
            <button
              type="button"
              className="p2d-btn-primary"
              onClick={onSwitchTo3D}
            >
              🏯 Enter 3D Village
            </button>
          ) : (
            project.liveUrl &&
            !project.liveUrl.startsWith('#') && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p2d-btn-primary"
              >
                🌐 Live Demo <span className="btn-arrow" aria-hidden="true">↗</span>
              </a>
            )
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p2d-btn-secondary"
            >
              💻 GitHub <span className="btn-arrow" aria-hidden="true">↗</span>
            </a>
          )}

          <button
            type="button"
            className="p2d-btn-secondary"
            onClick={() => onInspect?.(project.id)}
          >
            📖 View in Menu Book
          </button>
        </div>
      </div>
    </article>
  );
}

