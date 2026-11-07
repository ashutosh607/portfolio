import React from 'react';
import { TechIcon } from './SkillIcons';

/**
 * Reusable Technology Badge
 */
export default function TechnologyBadge({ technology }) {
  const { name, iconKey } = technology;

  return (
    <div className="tech-badge-item" title={name}>
      <span className="tech-badge-icon-wrap" aria-hidden="true">
        <TechIcon name={iconKey} />
      </span>
      <span className="tech-badge-name">{name}</span>
    </div>
  );
}

