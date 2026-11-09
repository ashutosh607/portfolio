import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { CategoryIcon } from './SkillIcons';
import TechnologyBadge from './TechnologyBadge';
import RelatedProjectCard from './RelatedProjectCard';
import { getProjectById } from '../../data/skillsData';

/**
 * Main Content Panel for the Active Skill Category
 */
export default function SkillDetails({
  category,
  onInspectProject,
}) {
  const panelRef = useRef(null);
  const isFirstRender = useRef(true);

  // Smooth category transition (8-12px vertical translate + fade)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current.children,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.out',
        }
      );
    }
  }, [category.id]);

  const relatedProjects = (category.relatedProjectIds || [])
    .map((id) => getProjectById(id))
    .filter(Boolean);

  return (
    <div className="skill-details-panel" role="tabpanel">
      <div className="skill-details-inner" ref={panelRef}>
        {/* Panel Top Header Bar */}
        <div className="details-header-row">
          <div className="details-title-meta">
            <span className="details-japanese-label">{category.japaneseLabel}</span>
            <h3 className="details-main-heading">
              <span className="heading-icon-inline" aria-hidden="true">
                <CategoryIcon name={category.iconKey} />
              </span>
              <span>{category.title}</span>
            </h3>
          </div>

          <div className="details-jutsu-badge" aria-label="Jutsu Scroll Designation">
            <span>JUTSU SCROLL</span>
          </div>
        </div>

        {/* Short Summary Description */}
        <p className="details-description-text">{category.description}</p>

        {/* Section 1: Technologies & Tools */}
        <div className="details-section-block">
          <div className="details-section-header">
            <svg viewBox="0 0 24 24" className="section-header-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span className="section-header-label">TECHNOLOGIES &amp; TOOLS</span>
          </div>

          <div className="tech-badges-grid">
            {category.technologies.map((tech) => (
              <TechnologyBadge key={tech.id} technology={tech} />
            ))}
          </div>
        </div>

        {/* Section 2: Related Projects */}
        {relatedProjects.length > 0 && <div className="details-section-block related-projects-block">
          <div className="details-section-header">
            <svg viewBox="0 0 24 24" className="section-header-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span className="section-header-label">Related projects</span>
          </div>

          <div className="related-projects-grid">
            {relatedProjects.map((project) => (
              <RelatedProjectCard
                key={project.id}
                project={project}
                onInspect={onInspectProject}
              />
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
}

