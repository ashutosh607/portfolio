import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { getSkillCategories } from '../../data/skillsData';
import SkillNavigation from './SkillNavigation';
import SkillDetails from './SkillDetails';
import './SkillsModal.css';

/**
 * Location 04 — Training Grounds
 * Cinematic Technical Skills & Jutsu Scrolls Modal
 */
export default function SkillsModal({
  isOpen = true,
  onClose,
  onInspectProject,
  onFastTravel,
}) {
  const [categories] = useState(() => getSkillCategories());
  const [activeCategoryId, setActiveCategoryId] = useState('frontend');
  const [isClosing, setIsClosing] = useState(false);

  const overlayRef = useRef(null);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const detailsRef = useRef(null);

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) || categories[0];

  // GSAP Smooth Closing Handler
  const handleRequestClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);

    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 0.985,
        duration: 0.28,
        ease: 'power2.inOut',
        onComplete: () => {
          onClose?.();
        },
      });
    } else {
      onClose?.();
    }
  }, [isClosing, onClose]);

  // Keyboard Escape Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        handleRequestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRequestClose]);

  // GSAP Entrance Timeline (Sequence: BG fade -> Header rise -> Nav stagger -> Details reveal)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.45 }
      )
        .fromTo(
          headerRef.current?.children,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          '-=0.2'
        )
        .fromTo(
          '.skill-nav-btn',
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.45, stagger: 0.04 },
          '-=0.3'
        )
        .fromTo(
          detailsRef.current,
          { opacity: 0, y: 16, scale: 0.99 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5 },
          '-=0.35'
        );
    }, overlayRef);

    return () => ctx.revert();
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="skills-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Technical Skills and Jutsu Scrolls"
    >
      {/* 1. Atmospheric Training Room Dojo Background */}
      <div
        className="skills-env-bg"
        style={{
          backgroundImage:
            'image-set(url("/images/training-room-bg.webp") type("image/webp"), url("/images/training-room-bg.jpg") type("image/jpeg"))',
        }}
        aria-hidden="true"
      />

      {/* 2. Soft Environmental Vignette */}
      <div className="skills-env-vignette" aria-hidden="true" />

      {/* 3. Main Stage Content */}
      <div className="skills-modal-stage">
        {/* Top Header Bar */}
        <header className="skills-top-bar" ref={headerRef}>
          <div className="skills-header-meta">
            <div className="skills-loc-badge">
              <svg
                viewBox="0 0 100 100"
                className="skills-shuriken-svg"
                aria-hidden="true"
              >
                <polygon
                  points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38"
                  fill="#A92F32"
                />
                <circle cx="50" cy="50" r="10" fill="#120D10" />
              </svg>
              <span>LOCATION 04 · TRAINING GROUNDS</span>
            </div>

            <h2 className="skills-main-title">
              Technical Skills &amp; Jutsu Scrolls
              {/* Subtle curved red brush underline */}
              <svg
                viewBox="0 0 200 12"
                className="title-brush-stroke"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M 5 6 Q 100 12 195 4"
                  stroke="#A92F32"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </svg>
            </h2>

            <p className="skills-subtitle">
              A collection of technologies, tools, and skills I&rsquo;ve trained with &mdash; across development, AI and more.
            </p>
          </div>

          {/* Minimalist Close Button */}
          <button
            type="button"
            className="skills-close-btn"
            onClick={handleRequestClose}
            title="Return to Konoha Hidden Leaf Village (Esc)"
            aria-label="Close skills modal"
          >
            <svg
              viewBox="0 0 24 24"
              className="skills-close-svg"
              fill="none"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Two-Column Workbench Layout */}
        <main className="skills-workbench-grid">
          {/* Left Column: 7 Categories Navigation */}
          <div ref={navRef}>
            <SkillNavigation
              categories={categories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
            />
          </div>

          {/* Right Column: Skill Category Details */}
          <div ref={detailsRef}>
            <SkillDetails
              category={activeCategory}
              onInspectProject={onInspectProject}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

