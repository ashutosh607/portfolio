import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceTimeline2D({
  missions = [],
  activeTab = 'all',
  scroller = '.portfolio-2d-wrapper',
  onInspectMission,
}) {
  const containerRef = useRef(null);
  const lineProgressRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scrollTarget = document.querySelector(scroller) || window;

    const ctx = gsap.context(() => {
      // 1. Vertical spine line draws downward smoothly as user scrolls
      if (lineProgressRef.current) {
        gsap.fromTo(
          lineProgressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              scroller: scrollTarget,
              start: 'top 80%',
              end: 'bottom 85%',
              scrub: 0.4,
            },
          }
        );
      }

      // 2. Individual timeline entries: milestone node + alternating card
      const entries = container.querySelectorAll('.p2d-timeline-entry');
      entries.forEach((entry, idx) => {
        const isEven = idx % 2 === 0;
        const node = entry.querySelector('.p2d-timeline-node');
        const card = entry.querySelector('.p2d-timeline-card-inner');
        const dateTag = entry.querySelector('.p2d-timeline-date-tag');

        if (prefersReducedMotion) {
          gsap.set([node, card, dateTag], { opacity: 1, x: 0, scale: 1 });
          return;
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: entry,
            scroller: scrollTarget,
            start: 'top 85%',
            once: true,
          },
        });

        // Node scales in first
        if (node) {
          tl.fromTo(
            node,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.7)' }
          );
        }

        // Date pill appears slightly before card
        if (dateTag) {
          tl.fromTo(
            dateTag,
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
            '-=0.2'
          );
        }

        // Card enters from alternating horizontal direction (±45px)
        if (card) {
          tl.fromTo(
            card,
            {
              opacity: 0,
              x: isEven ? -45 : 45,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.75,
              ease: 'power2.out',
            },
            '-=0.25'
          );
        }
      });
    }, container);

    return () => ctx.revert();
  }, [missions, activeTab, scroller]);

  return (
    <div ref={containerRef} className="p2d-timeline-wrap">
      {/* Central / Left Drawing Spine */}
      <div className="p2d-timeline-spine-track" aria-hidden="true">
        <div ref={lineProgressRef} className="p2d-timeline-spine-progress" />
      </div>

      <div className="p2d-timeline-list">
        {missions.map((mission, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={mission.id}
              className={`p2d-timeline-entry ${isEven ? 'is-left' : 'is-right'}`}
            >
              {/* Timeline Center Node */}
              <div className="p2d-timeline-node" aria-hidden="true">
                <span className="p2d-node-dot" />
              </div>

              {/* Timeline Card */}
              <div className="p2d-timeline-card-inner">
                {/* Date / Status Tag */}
                <div className="p2d-timeline-date-row">
                  <span className="p2d-timeline-date-tag">
                    {mission.date || mission.status || 'Mission Active'}
                  </span>
                  <span className="p2d-timeline-category-tag">{mission.category}</span>
                </div>

                <div className="p2d-timeline-card-body">
                  {mission.thumbnail && (
                    <div className="p2d-timeline-thumb-wrap">
                      <img
                        src={mission.thumbnail}
                        alt={mission.title}
                        className="p2d-timeline-thumb"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p2d-timeline-content">
                    <h3 className="p2d-timeline-title">{mission.title}</h3>
                    {mission.organization && (
                      <div className="p2d-timeline-org">{mission.organization}</div>
                    )}
                    <p className="p2d-timeline-desc">{mission.description}</p>

                    {mission.technologies?.length > 0 && (
                      <div className="p2d-project-tech-list">
                        {mission.technologies.map((tech) => (
                          <span key={tech} className="p2d-project-tech-pill">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="p2d-timeline-actions">
                      {mission.liveUrl && (
                        <a
                          href={mission.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p2d-btn-primary"
                        >
                          🌐 Live Site <span className="btn-arrow" aria-hidden="true">↗</span>
                        </a>
                      )}
                      <button
                        type="button"
                        className="p2d-btn-secondary"
                        onClick={() => onInspectMission?.(mission.id)}
                      >
                        📜 Inspect Dossier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

