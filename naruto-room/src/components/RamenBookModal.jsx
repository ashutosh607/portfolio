import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PORTFOLIO_PROJECTS } from '../config/locations';
import './RamenBookModal.css';

// The 4 featured signature dishes as specified in the redesign requirements
const FEATURED_PROJECT_IDS = [
  'travelflow-ai',
  'wastewise',
  'callkavach',
  'racket-sports-intelligence',
];

export default function RamenBookModal({ isOpen, onClose, onFastTravel, initialProjectId = null }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isBookOpened, setIsBookOpened] = useState(false);
  const [isDetailChanging, setIsDetailChanging] = useState(false);
  const [mobileTab, setMobileTab] = useState('menu'); // 'menu' | 'detail'
  const prevIndexRef = useRef(0);

  // Filter the 4 projects in exact menu order
  const projects = useMemo(() => {
    return FEATURED_PROJECT_IDS.map((id, idx) => {
      const p = PORTFOLIO_PROJECTS.find((item) => item.id === id);
      return {
        ...p,
        menuIndex: `0${idx + 1}`,
      };
    }).filter(Boolean);
  }, []);

  // Sync initial project selection if requested from another section
  useEffect(() => {
    if (initialProjectId) {
      const idx = projects.findIndex((p) => p.id === initialProjectId);
      if (idx !== -1) {
        setSelectedIndex(idx);
        setMobileTab('detail');
      }
    }
  }, [initialProjectId, projects]);

  const currentProject = projects[selectedIndex] || projects[0];

  // Book opening animation trigger
  useEffect(() => {
    if (isOpen) {
      // Trigger opening animation smoothly after mount
      const timer = setTimeout(() => {
        setIsBookOpened(true);
      }, 80);
      return () => clearTimeout(timer);
    } else {
      setIsBookOpened(false);
      setSelectedIndex(0);
      setMobileTab('menu');
    }
  }, [isOpen]);

  // Handle project selection with smooth paper reveal
  const handleSelectProject = (index) => {
    if (index === selectedIndex) return;
    prevIndexRef.current = selectedIndex;
    setIsDetailChanging(true);
    setTimeout(() => {
      setSelectedIndex(index);
      setIsDetailChanging(false);
      setMobileTab('detail');
    }, 180);
  };

  // Keyboard navigation: ESC to close, Left/Right arrows to flip projects
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (mobileTab === 'detail') {
          setMobileTab('menu');
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, mobileTab, projects.length]);

  if (!isOpen) return null;

  return (
    <div className="ramen-book-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Ichiraku Ramen Projects Menu">
      {/* Ambient Bokeh & Floating Sakura Petals */}
      <div className="ramen-ambient-particles" aria-hidden="true">
        <span className="ambient-bokeh b1" />
        <span className="ambient-bokeh b2" />
        <span className="ambient-bokeh b3" />
        <span className="floating-petal p1" />
        <span className="floating-petal p2" />
        <span className="floating-petal p3" />
        <span className="floating-petal p4" />
        <span className="floating-petal p5" />
      </div>

      {/* Top Floating Bar */}
      <header className="ramen-top-header" onClick={(e) => e.stopPropagation()}>
        <div className="ramen-brand-left">
          <svg viewBox="0 0 24 24" className="ramen-star-svg" aria-hidden="true">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" fill="#d4af37" />
          </svg>
          <span className="ramen-brand-title">Ashutosh • Shinobi Portfolio</span>
          <span className="ramen-brand-sub">一楽ラーメン • Signature Creations</span>
        </div>

        <div className="ramen-header-right">
          <button
            type="button"
            className="ramen-close-btn"
            onClick={onClose}
            title="Close Menu (ESC)"
            aria-label="Close menu"
          >
            <span>Projects Menu</span>
            <span className="close-line-sep">—</span>
            <span className="close-x-icon">✕</span>
          </button>
        </div>
      </header>

      {/* Main Open Book Wrapper */}
      <div
        className={`ramen-book-container ${isBookOpened ? 'is-opened' : 'is-closed'} mobile-view-${mobileTab}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Leather Hardcover Spine & Silk Bookmark Tassel (Left Edge) */}
        <div className="book-hardcover-trim" aria-hidden="true" />
        <div className="book-bookmark-tassel" aria-hidden="true">
          <div className="tassel-cord" />
          <div className="tassel-knot" />
          <div className="tassel-skirt" />
        </div>

        {/* Stacked Paper Page Layers (3D Depth) */}
        <div className="stacked-pages-left" aria-hidden="true" />
        <div className="stacked-pages-right" aria-hidden="true" />
        <div className="stacked-pages-bottom" aria-hidden="true" />

        {/* Closed Cover (Swings open on mount) */}
        <div className="book-front-cover" aria-hidden="true">
          <div className="cover-leather-texture">
            <div className="cover-gold-border">
              <div className="cover-kanji-crest">一楽</div>
              <h2 className="cover-title">ICHIRAKU RAMEN</h2>
              <p className="cover-subtitle">OUR SIGNATURE PROJECTS MENU</p>
              <div className="cover-leaf-emblem">🍃</div>
              <span className="cover-tap-hint">Opening Menu...</span>
            </div>
          </div>
        </div>

        {/* Two-Page Open Book Interior */}
        <main className="book-interior-spread">
          {/* ========================================================
              LEFT PAGE — SIGNATURE DISH MENU
              ======================================================== */}
          <section className="book-page page-left" aria-label="Signature Projects Menu">
            {/* Top Header Badge */}
            <div className="page-section-tag">
              <span className="tag-line" />
              <div className="ramen-bowl-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#a93226" strokeWidth="1.8">
                  <path d="M4 11h16a1 1 0 0 1 1 1v.5a7.5 7.5 0 0 1 -15 0v-.5a1 1 0 0 1 1 -1z" fill="rgba(169, 50, 38, 0.12)" />
                  <path d="M8 18h8" />
                  <path d="M7 5l11 3" />
                  <path d="M7 8l11 -2" />
                </svg>
              </div>
              <span className="tag-text">PROJECT MENU</span>
              <span className="tag-line" />
            </div>

            {/* Page Title & Subtitle */}
            <div className="menu-heading-group">
              <h1 className="menu-main-title">Our Signature Projects</h1>
              <p className="menu-subtitle-lead">A curated selection of our finest creations.</p>
            </div>

            {/* Projects List (4 Signature Dishes) */}
            <div className="menu-dishes-list" role="list">
              {projects.map((proj, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <article
                    key={proj.id}
                    className={`dish-menu-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelectProject(idx)}
                    role="button"
                    tabIndex={0}
                    aria-selected={isSelected}
                  >
                    {/* Thumbnail Preview with Number Badge */}
                    <div className="dish-thumb-frame">
                      <ProjectThumbnailPreview projectId={proj.id} />
                      <span className="dish-num-badge">{proj.menuIndex}</span>
                    </div>

                    {/* Dish & Project Info */}
                    <div className="dish-info-col">
                      <h3 className="dish-project-title">{proj.title}</h3>
                      <p className="dish-ramen-name">{proj.dishName}</p>
                    </div>

                    {/* View Details Action Indicator */}
                    <div className="dish-action-right">
                      <span className="view-details-label">View Details</span>
                      <span className="view-arrow-circle" aria-hidden="true">
                        →
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bottom Pagination & Ink Flourish */}
            <footer className="menu-page-footer">
              <div className="pagination-flourish">
                <span className="flourish-petal left">🌸</span>
                <span className="pagination-text">0{selectedIndex + 1} / 04</span>
                <span className="flourish-petal right">🌸</span>
              </div>
            </footer>

            {/* Japanese Traditional Ink Artworks (Corner Decorations) */}
            <div className="left-corner-sakura" aria-hidden="true">
              <svg viewBox="0 0 160 120" className="sakura-branch-svg">
                <path d="M 160,0 C 130,25 100,20 70,45 C 50,60 30,55 0,70" stroke="#7a523d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 70,45 C 80,70 95,85 110,105" stroke="#7a523d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Sakura Petals */}
                <circle cx="68" cy="42" r="7" fill="#f5b7b1" opacity="0.85" />
                <circle cx="65" cy="45" r="5" fill="#e74c3c" opacity="0.4" />
                <circle cx="108" cy="102" r="6" fill="#f5b7b1" opacity="0.85" />
                <circle cx="92" cy="72" r="5" fill="#fadbd8" opacity="0.9" />
                <circle cx="35" cy="58" r="6" fill="#f5b7b1" opacity="0.85" />
                <circle cx="12" cy="68" r="5" fill="#fadbd8" opacity="0.9" />
              </svg>
            </div>

            <div className="left-bottom-pagoda" aria-hidden="true">
              <svg viewBox="0 0 200 140" className="sumie-pagoda-svg">
                {/* Distant mountain wash */}
                <path d="M 0,140 Q 60,75 140,110 T 200,140 Z" fill="rgba(150, 130, 115, 0.15)" />
                <path d="M 20,140 Q 90,88 170,125 T 200,140 Z" fill="rgba(120, 100, 85, 0.2)" />
                {/* Japanese Pagoda Eaves Silhouette */}
                <path d="M 45,95 L 85,95 L 80,84 L 50,84 Z" fill="rgba(90, 70, 55, 0.45)" />
                <path d="M 40,84 L 90,84 L 83,73 L 47,73 Z" fill="rgba(90, 70, 55, 0.45)" />
                <path d="M 37,73 L 93,73 L 85,62 L 45,62 Z" fill="rgba(90, 70, 55, 0.45)" />
                <path d="M 42,62 L 88,62 L 78,52 L 52,52 Z" fill="rgba(90, 70, 55, 0.45)" />
                <path d="M 48,52 L 82,52 L 68,40 L 62,40 Z" fill="rgba(90, 70, 55, 0.45)" />
                <line x1="65" y1="40" x2="65" y2="28" stroke="rgba(90, 70, 55, 0.55)" strokeWidth="1.5" />
              </svg>
            </div>
          </section>

          {/* Central Book Spine Fold Shadow */}
          <div className="book-center-spine" aria-hidden="true">
            <div className="spine-deep-crease" />
            <div className="spine-highlight-fold" />
          </div>

          {/* ========================================================
              RIGHT PAGE — SELECTED DISH / PROJECT DETAILS
              ======================================================== */}
          <section className={`book-page page-right ${isDetailChanging ? 'is-fading' : ''}`} aria-label="Project Details">
            {/* Mobile Back Button (shown only on mobile when viewing details) */}
            <div className="mobile-back-to-menu-row">
              <button
                type="button"
                className="mobile-back-btn"
                onClick={() => setMobileTab('menu')}
              >
                ← Back to Menu
              </button>
            </div>

            {/* Top Featured Dish Tag */}
            <div className="page-section-tag">
              <span className="tag-line" />
              <div className="ramen-bowl-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#a93226" strokeWidth="1.8">
                  <path d="M4 11h16a1 1 0 0 1 1 1v.5a7.5 7.5 0 0 1 -15 0v-.5a1 1 0 0 1 1 -1z" fill="rgba(169, 50, 38, 0.12)" />
                  <path d="M8 18h8" />
                  <path d="M7 5l11 3" />
                  <path d="M7 8l11 -2" />
                </svg>
              </div>
              <span className="tag-text">FEATURED PROJECT</span>
              <span className="tag-line" />
            </div>

            {/* Main Detail Content Grid */}
            <div className="detail-layout-content">
              {/* Left Column: Typography & Recipe Information */}
              <div className="detail-left-column">
                <div className="detail-titles-block">
                  <h2 className="detail-project-title">{currentProject.title}</h2>
                  <p className="detail-dish-subtitle">{currentProject.dishName}</p>
                  <div className="detail-under-rule" />
                </div>

                <p className="detail-overview-lead">{currentProject.shortDesc}</p>

                {/* Technical Ingredients (Tech Stack) */}
                <div className="technical-ingredients-section">
                  <div className="ingredients-header-row">
                    <span className="ingredients-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#8b261b" strokeWidth="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                    </span>
                    <h4 className="ingredients-title">KEY INGREDIENTS</h4>
                  </div>

                  <div className="ingredients-pills-wrap">
                    {currentProject.techStack.map((ingredient) => (
                      <span key={ingredient} className="ingredient-pill">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="detail-actions-row">
                  <a
                    href={currentProject.liveUrl && currentProject.liveUrl !== '#projects' ? currentProject.liveUrl : currentProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="explore-project-primary-btn"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    <span>Explore Project</span>
                    <span className="btn-arrow-right">→</span>
                  </a>

                  {currentProject.githubUrl && (
                    <a
                      href={currentProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="explore-github-secondary-btn"
                      title="View GitHub Repository"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>Repository</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: High-Res Project Preview & Japanese Background Art */}
              <div className="detail-right-column">
                <div className="laptop-preview-stage">
                  {/* Japanese Atmospheric Background Artworks */}
                  <div className="japan-rising-sun" aria-hidden="true" />
                  <div className="japan-pagoda-backdrop" aria-hidden="true">
                    <svg viewBox="0 0 160 200" className="tower-silhouette-svg">
                      <path d="M 60,190 L 100,190 L 95,170 L 65,170 Z" fill="#9b3922" opacity="0.32" />
                      <path d="M 45,170 L 115,170 L 105,148 L 55,148 Z" fill="#9b3922" opacity="0.4" />
                      <path d="M 40,148 L 120,148 L 108,126 L 52,126 Z" fill="#9b3922" opacity="0.48" />
                      <path d="M 36,126 L 124,126 L 112,104 L 48,104 Z" fill="#9b3922" opacity="0.55" />
                      <path d="M 32,104 L 128,104 L 114,80 L 46,80 Z" fill="#9b3922" opacity="0.62" />
                      <path d="M 38,80 L 122,80 L 95,54 L 65,54 Z" fill="#9b3922" opacity="0.7" />
                      <line x1="80" y1="54" x2="80" y2="28" stroke="#9b3922" strokeWidth="2.5" opacity="0.8" />
                    </svg>
                  </div>
                  <div className="japan-sumie-stroke" aria-hidden="true" />

                  {/* Device Laptop Mockup Screen Frame */}
                  <div className="device-laptop-frame">
                    <div className="laptop-screen-bezel">
                      <div className="laptop-camera-eye" />
                      <div className="laptop-display-viewport">
                        <ProjectLiveScreenMockup project={currentProject} />
                        <div className="display-glass-sheen" />
                      </div>
                    </div>
                    <div className="laptop-keyboard-chassis">
                      <div className="laptop-notch-opener" />
                    </div>
                    <div className="laptop-shadow-caster" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// HIGH-RESOLUTION PROJECT LIVE SCREEN DISPLAY COMPONENT
// ============================================================================
function ProjectLiveScreenMockup({ project }) {
  if (project.id === 'travelflow-ai') {
    return (
      <div className="mockup-ui travel-ui">
        <header className="mockup-nav">
          <span className="mockup-logo">✈ TravelFlow AI</span>
          <nav className="mockup-links">
            <span>Plan</span>
            <span>Explore</span>
            <span>About</span>
            <span className="mockup-badge">Start Planning</span>
          </nav>
        </header>
        <div className="travel-hero-scene">
          <div className="travel-hero-content">
            <h5 className="travel-headline">Wherever you go,<br />we've got you.</h5>
            <p className="travel-subhead">AI-powered travel plans, personalized for your next adventure.</p>
            <div className="travel-search-bar">
              <span className="search-pin">📍 From</span>
              <span className="search-arrow">➔</span>
              <span className="search-pin">Tokyo, Japan</span>
              <span className="search-go-btn">Search</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (project.id === 'wastewise') {
    return (
      <div className="mockup-ui waste-ui">
        <header className="mockup-nav">
          <span className="mockup-logo">♻ WasteWise AI</span>
          <span className="mockup-tag">Live Camera Feed</span>
        </header>
        <div className="waste-grid-scene">
          <div className="waste-camera-view">
            <div className="bounding-box">
              <span className="bbox-label">PET Plastic (Recyclable) 98.4%</span>
            </div>
            <div className="bbox-scanline" />
          </div>
          <div className="waste-metrics-col">
            <div className="metric-pill">
              <span>Recycling Rate</span>
              <strong>94.2%</strong>
            </div>
            <div className="metric-pill">
              <span>CO2 Offset</span>
              <strong>+1,420 kg</strong>
            </div>
            <div className="metric-pill">
              <span>Items Sorted</span>
              <strong>18,520</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (project.id === 'callkavach') {
    return (
      <div className="mockup-ui kavach-ui">
        <header className="mockup-nav">
          <span className="mockup-logo">🛡 CallKavach Shield</span>
          <span className="kavach-status-badge">ACTIVE MONITORING</span>
        </header>
        <div className="kavach-content-scene">
          <div className="fraud-alert-banner">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>SUSPICIOUS CONVERSATION DETECTED</strong>
              <p>Risk Score: 92% (High Urgency Trap + OTP Solicitation)</p>
            </div>
          </div>
          <div className="waveform-box">
            <div className="audio-bars">
              <span style={{ height: '35%' }} />
              <span style={{ height: '75%' }} />
              <span style={{ height: '100%' }} />
              <span style={{ height: '55%' }} />
              <span style={{ height: '80%' }} />
              <span style={{ height: '40%' }} />
              <span style={{ height: '90%' }} />
            </div>
            <span className="waveform-label">Real-time Intent Risk Classifier: Threat Intercepted</span>
          </div>
        </div>
      </div>
    );
  }

  // Racket Sports Intelligence
  return (
    <div className="mockup-ui racket-ui">
      <header className="mockup-nav">
        <span className="mockup-logo">🏸 Racket Sports AI</span>
        <span className="mockup-tag">Match Analytics</span>
      </header>
      <div className="racket-court-scene">
        <div className="court-perspective-grid">
          <div className="court-net" />
          <div className="player-tracker p1">
            <span className="p-tag">P1 (14.2 km/h)</span>
          </div>
          <div className="player-tracker p2">
            <span className="p-tag">P2 (12.8 km/h)</span>
          </div>
          <div className="ball-trajectory-arc" />
        </div>
        <div className="court-overlay-metrics">
          <span>Smash Speed: <strong>194 km/h</strong></span>
          <span>Court Coverage: <strong>89%</strong></span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SMALL PROJECT THUMBNAIL COMPONENT (FOR MENU CARDS)
// ============================================================================
function ProjectThumbnailPreview({ projectId }) {
  if (projectId === 'travelflow-ai') {
    return (
      <div className="thumb-preview travel-thumb">
        <div className="thumb-mini-screen">
          <span className="thumb-icon">✈</span>
          <span className="thumb-bar" />
        </div>
      </div>
    );
  }
  if (projectId === 'wastewise') {
    return (
      <div className="thumb-preview waste-thumb">
        <div className="thumb-mini-screen">
          <span className="thumb-icon">♻</span>
          <span className="thumb-bar" />
        </div>
      </div>
    );
  }
  if (projectId === 'callkavach') {
    return (
      <div className="thumb-preview kavach-thumb">
        <div className="thumb-mini-screen">
          <span className="thumb-icon">🛡</span>
          <span className="thumb-bar" />
        </div>
      </div>
    );
  }
  return (
    <div className="thumb-preview racket-thumb">
      <div className="thumb-mini-screen">
        <span className="thumb-icon">🏸</span>
        <span className="thumb-bar" />
      </div>
    </div>
  );
}
