import React from 'react';
import { CategoryIcon } from './SkillIcons';

/**
 * Seven-category navigation component (Desktop vertical stack / Mobile horizontal scroll)
 */
export default function SkillNavigation({
  categories,
  activeCategoryId,
  onSelectCategory,
}) {
  return (
    <nav className="skills-nav-container" aria-label="Skill Categories">
      <div className="skills-nav-list" role="tablist">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`skill-nav-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <div className="nav-btn-content">
                <span className="nav-btn-icon" aria-hidden="true">
                  <CategoryIcon name={cat.iconKey} />
                </span>
                <span className="nav-btn-title">{cat.title}</span>
              </div>
              <span className="nav-btn-arrow" aria-hidden="true">
                →
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

