import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { flushSync } from 'react-dom';
import { PageTurnSurface } from './PageTurnSurface';
import { PORTFOLIO_PROJECTS } from '../config/locations';
import './RamenBookModal.css';

// 4 Signature dishes as specified in the redesign requirements
const SIGNATURE_PROJECT_IDS = [
  'travelflow-ai',
  'wastewise',
  'callkavach',
  'racket-sports-intelligence',
];

export default function RamenBookModal({ isOpen, onClose, onFastTravel, initialProjectId = null }) {
  const [bookState, setBookState] = useState('closed');
  const [currentSpread, setCurrentSpread] = useState(1);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const [busy, setBusy] = useState(false);
  const [turnNotice, setTurnNotice] = useState('');
  const bookContainerRef = useRef(null);
  const frontCoverRef = useRef(null);
  const interiorSpreadRef = useRef(null);
  const rightPageContentRef = useRef(null);
  const turningLeafRef = useRef(null);
  const dialogRef = useRef(null);
  const timelineRef = useRef(null);
  const surfaceRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const generationRef = useRef(0);
  const touchRef = useRef(null);
  const afterCloseRef = useRef(null);
  const projects = useMemo(() => SIGNATURE_PROJECT_IDS.map(id => PORTFOLIO_PROJECTS.find(project => project.id === id)).filter(Boolean).map((project, index) => ({ ...project, menuIndex: `0${index + 1}` })), []);
  const currentProject = projects[selectedProjectIndex] || projects[0];
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileView = () => window.matchMedia('(max-width: 860px)').matches;
  const lock = useCallback(() => {
    if (isTransitioningRef.current) return false;
    isTransitioningRef.current = true;
    setBusy(true);
    return true;
  }, []);
  const unlock = useCallback(() => {
    isTransitioningRef.current = false;
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const generation = generationRef;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Reset the external animation session when the modal is reopened.
    // eslint-disable-next-line react/set-state-in-effect
    setBookState('closed');
    setCurrentSpread(1);
    setSelectedProjectIndex(Math.max(0, projects.findIndex(project => project.id === initialProjectId)));
    setIsMobileDetailView(false);
    unlock();
    const focusFrame = requestAnimationFrame(() => dialogRef.current?.querySelector('.cover-open-trigger-btn')?.focus({ preventScroll: true }));
    return () => {
      generation.current++;
      cancelAnimationFrame(focusFrame);
      timelineRef.current?.kill();
      surfaceRef.current?.dispose();
      surfaceRef.current = null;
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, [isOpen, initialProjectId, projects, unlock]);

  function prepareInnerCover(container, page) {
    const face = container.querySelector('.cover-inner-face');
    const copy = page.cloneNode(true);
    copy.removeAttribute('tabindex');
    face.replaceChildren(copy);
  }

  const handleOpenBook = useCallback(() => {
    if (bookState !== 'closed' || !lock()) return;
    setBookState('opening');
    const container = bookContainerRef.current;
    const cover = frontCoverRef.current;
    prepareInnerCover(cover, interiorSpreadRef.current.querySelector('[data-spread="1"] .page-left'));
    timelineRef.current = gsap.timeline({ onComplete: () => {
      setBookState('open');
      unlock();
      requestAnimationFrame(() => interiorSpreadRef.current?.querySelector('.menu-dish-item')?.focus({ preventScroll: true }));
    } });
    const duration = reducedMotion() ? 0.01 : 1.12;
    timelineRef.current.to(container, { '--book-lift': '-5px', duration: reducedMotion() ? 0 : 0.18, ease: 'power2.out' })
      .to(cover, { rotateY: -180, duration, ease: 'power2.inOut' })
      .to(container, { '--book-offset': '0%', duration, ease: 'power2.inOut' }, '<')
      .to(container, { '--open-progress': 1, duration, ease: 'power2.inOut' }, '<')
      .to(container, { '--book-lift': '0px', duration: reducedMotion() ? 0 : 0.18, ease: 'power2.out' });
  }, [bookState, lock, unlock]);

  const handleCloseBook = useCallback(() => {
    if (isTransitioningRef.current) return;
    if (bookState === 'closed') { onClose(); return; }
    if (!lock()) return;
    prepareInnerCover(frontCoverRef.current, interiorSpreadRef.current.querySelector(`[data-spread="${currentSpread}"] .page-left`));
    setBookState('closing');
    const duration = reducedMotion() ? 0.01 : 1.12;
    timelineRef.current = gsap.timeline({ onComplete: () => {
      unlock();
      setBookState('closed');
      const action = afterCloseRef.current;
      afterCloseRef.current = null;
      onClose();
      action?.();
    } });
    timelineRef.current.to(frontCoverRef.current, { rotateY: 0, duration, ease: 'power2.inOut' })
      .to(bookContainerRef.current, { '--book-offset': '-25%', '--open-progress': 0, duration, ease: 'power2.inOut' }, '<');
  }, [bookState, currentSpread, onClose, lock, unlock]);

  const handleSelectProject = useCallback(index => {
    if (bookState !== 'open' || currentSpread !== 1 || !lock()) return;
    if (index === selectedProjectIndex) {
      setIsMobileDetailView(true);
      requestAnimationFrame(() => { if (mobileView()) interiorSpreadRef.current?.querySelector('[data-spread="1"] .mobile-back-action-btn')?.focus({ preventScroll: true }); });
      unlock();
      return;
    }
    const node = rightPageContentRef.current;
    timelineRef.current = gsap.timeline({ onComplete: () => { unlock(); if (mobileView()) interiorSpreadRef.current.querySelector('[data-spread="1"] .mobile-back-action-btn')?.focus({ preventScroll: true }); } });
    timelineRef.current.to(node, { opacity: 0, filter: 'blur(4px)', y: -8, duration: reducedMotion() ? 0 : 0.17 })
      .call(() => { flushSync(() => { setSelectedProjectIndex(index); setIsMobileDetailView(true); }); })
      .set(node, { y: 8 })
      .to(node, { opacity: 1, filter: 'blur(0px)', y: 0, duration: reducedMotion() ? 0.01 : 0.3, ease: 'power2.out' });
  }, [bookState, currentSpread, selectedProjectIndex, lock, unlock]);

  const handleTurnSpread = useCallback(async direction => {
    const nextSpread = currentSpread + direction;
    if (bookState !== 'open' || nextSpread < 1 || nextSpread > 2 || !lock()) return;
    const generation = generationRef.current;
    const mobile = mobileView();
    const finish = () => {
      if (generation !== generationRef.current) return;
      setCurrentSpread(nextSpread);
      setIsMobileDetailView(false);
      setBookState('open');
      turningLeafRef.current.style.visibility = 'hidden';
      unlock();
      requestAnimationFrame(() => {
        const page = dialogRef.current?.querySelector(`[data-spread="${nextSpread}"] .page-left`);
        page?.focus({ preventScroll: true });
      });
    };
    if (reducedMotion()) { finish(); return; }
    try {
      if (!surfaceRef.current) surfaceRef.current = new PageTurnSurface(turningLeafRef.current);
      const root = interiorSpreadRef.current;
      const from = root.querySelector(`[data-spread="${currentSpread}"] .${mobile ? (isMobileDetailView ? 'page-right' : 'page-left') : direction > 0 ? 'page-right' : 'page-left'}`);
      const to = root.querySelector(`[data-spread="${nextSpread}"] .${mobile || direction > 0 ? 'page-left' : 'page-right'}`);
      // Front is always the right-hand face; back UVs are reversed once, not text.
      await surfaceRef.current.prepare(direction > 0 ? from : to, direction > 0 ? to : from, mobile, direction);
      if (generation !== generationRef.current) return;
      flushSync(() => setBookState(direction > 0 ? 'turning-forward' : 'turning-backward'));
      turningLeafRef.current.style.visibility = 'visible';
      const motion = { progress: direction > 0 ? 0 : 1 };
      timelineRef.current = gsap.timeline({ onComplete: finish }).to(motion, {
        progress: direction > 0 ? 1 : 0, duration: 1.15, ease: 'power2.inOut',
        onUpdate: () => surfaceRef.current?.render(motion.progress),
      });
    } catch (error) {
      if (generation !== generationRef.current) return;
      // WebGL loss / unavailable DOM capture: reading still works, with no fake flip.
      console.warn('Book page rendering unavailable:', error.message);
      setTurnNotice('Page animation is unavailable on this device. Reading controls remain available.');
      surfaceRef.current?.dispose();
      surfaceRef.current = null;
      finish();
    }
  }, [bookState, currentSpread, isMobileDetailView, lock, unlock]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = event => {
      if (event.key === 'Tab') {
        const controls = [...dialogRef.current.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')].filter(node => node.getClientRects().length && getComputedStyle(node).visibility === 'visible' && !node.closest('[inert]'));
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) { event.preventDefault(); first?.focus(); }
        return;
      }
      if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isTransitioningRef.current) return;
        if (mobileView() && isMobileDetailView) setIsMobileDetailView(false);
        else handleCloseBook();
      } else if (bookState === 'open' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        if (event.key === 'ArrowUp') handleSelectProject((selectedProjectIndex + projects.length - 1) % projects.length);
        if (event.key === 'ArrowDown') handleSelectProject((selectedProjectIndex + 1) % projects.length);
        if (event.key === 'ArrowRight') handleTurnSpread(1);
        if (event.key === 'ArrowLeft') handleTurnSpread(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, bookState, isMobileDetailView, selectedProjectIndex, projects.length, handleCloseBook, handleSelectProject, handleTurnSpread]);

  const handleTouchEnd = event => {
    if (!touchRef.current || !mobileView() || busy) return;
    const end = event.changedTouches[0];
    const dx = end.clientX - touchRef.current.x;
    const dy = end.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) handleTurnSpread(dx < 0 ? 1 : -1);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="ramen-book-overlay"
      aria-busy={busy}
      onClick={handleCloseBook}
      role="dialog"
      aria-modal="true"
      aria-label="Ichiraku Ramen Projects Menu"
    >
      {/* Ambient Cinema Lighting & Floating Sakura Petals */}
      <div className="ramen-ambient-particles" aria-hidden="true">
        <span className="ambient-bokeh b1" />
        <span className="ambient-bokeh b2" />
        <span className="floating-petal p1" />
        <span className="floating-petal p2" />
        <span className="floating-petal p3" />
        <span className="floating-petal p4" />
      </div>

      {/* Top Floating Minimalist Header (Matches Reference) */}
      <header className="ramen-top-header" onClick={(e) => e.stopPropagation()}>
        <div className="ramen-brand-left">
          <span className="header-sparkle-icon" aria-hidden="true">✦</span>
          <span className="ramen-brand-title">Ashutosh • Creative Technologist</span>
        </div>

        <div className="ramen-header-right">
          <button
            type="button"
            className="ramen-menu-close-trigger"
            onClick={handleCloseBook}
            disabled={busy}
            title="Close Book (ESC)"
            aria-label="Close menu"
          >
            <span className="close-label-text">Projects Menu</span>
            <span className="close-dash-sep">—</span>
            <span className="close-x-glyph">✕</span>
          </button>
        </div>
      </header>

      {/* Main 3D Book Container */}
      <div
        ref={bookContainerRef}
        className={`ramen-book-container state-${bookState} ${isMobileDetailView ? 'mobile-detail-active' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={event => { touchRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
        onTouchEnd={handleTouchEnd}
      >
        {/* Leather Binding Hardcover Trim & Stacked Paper Layers */}
        <div className="hardcover-leather-edge" aria-hidden="true" />
        <div className="stacked-pages-left-edge" aria-hidden="true" />
        <div className="stacked-pages-right-edge" aria-hidden="true" />
        <div className="stacked-pages-bottom-edge" aria-hidden="true" />

        {/* Authentic Silk Bookmark Cord with Hanging Tassel (Draping from Upper Left) */}
        <div className="bookmark-silk-cord" aria-hidden="true">
          <div className="cord-ribbon" />
          <div className="tassel-knot" />
          <div className="tassel-threads" />
        </div>

        {/* ====================================================================
            1. REALISTIC CLOSED HARDCOVER (Front Cover)
            ==================================================================== */}
        <div
          ref={frontCoverRef}
          className="book-front-cover-leaf"
          onClick={bookState === 'closed' ? handleOpenBook : undefined}
          title={bookState === 'closed' ? 'Click to Open Menu' : undefined}
          inert={bookState !== 'closed' ? true : undefined}
          aria-label="Front cover of Ichiraku Ramen Menu. Click to open."
        >
          <div className="cover-inner-face" aria-hidden="true" inert />
          <div className="cover-leather-face">
            <div className="cover-gold-filigree-frame">
              <div className="corner-accent top-left">✦</div>
              <div className="corner-accent top-right">✦</div>
              <div className="corner-accent bottom-left">✦</div>
              <div className="corner-accent bottom-right">✦</div>

              <div className="cover-badge-top">
                <span className="badge-flourish">―</span>
                <span>木ノ葉隠れの里 • 創業</span>
                <span className="badge-flourish">―</span>
              </div>

              {/* Central Japanese Crest */}
              <div className="cover-central-crest">
                <div className="kanji-seal-box">
                  <span className="kanji-seal">一楽</span>
                </div>
                <h1 className="cover-main-heading">ICHIRAKU RAMEN</h1>
                <p className="cover-english-sub">SIGNATURE PROJECTS MENU</p>
                <div className="cover-divider-flourish">
                  <span className="flourish-diamond">◆</span>
                </div>
                <p className="cover-chef-note">
                  "Handcrafted engineering dishes infused with relentless shinobi spirit."
                </p>
              </div>

              {/* Tactile Open Menu Action Button */}
              {(
                <div className="cover-open-action">
                  <button
                    type="button"
                    className="cover-open-trigger-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBook();
                    }}
                  >
                    <span>OPEN MENU</span>
                    <span className="open-btn-kanji">開く</span>
                    <span className="open-arrow">→</span>
                  </button>
                  <span className="cover-hint-text">Click anywhere to open book</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div ref={turningLeafRef} className="book-mesh-surface" aria-hidden="true" />

        {/* ====================================================================
            2. TWO-PAGE OPEN INTERIOR SPREAD
            ==================================================================== */}
        <div ref={interiorSpreadRef} className="book-interior-spread" inert={bookState !== 'open' || busy ? true : undefined}>
          {/* ================= SPREAD 1: SIGNATURE PROJECTS ================= */}
          <div data-spread="1" className={`book-spread ${currentSpread === 1 ? 'is-current' : ''}`} inert={currentSpread !== 1 ? true : undefined} aria-hidden={currentSpread !== 1}>
              {/* LEFT PAGE: PROJECT DISHES MENU */}
              <section tabIndex={-1} className="book-page page-left" aria-label="Our Signature Projects">
                {/* Decorative Sakura Branch Illustration (Top-Right) */}
                <div className="page-decor-sakura-branch" aria-hidden="true">
                  <svg viewBox="0 0 160 120" width="130" height="95" fill="none">
                    <path
                      d="M160 0 C 130 25, 95 35, 60 55 C 45 65, 30 75, 10 82"
                      stroke="#8c6a58"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      opacity="0.55"
                    />
                    <path
                      d="M100 33 C 85 20, 70 12, 50 15"
                      stroke="#8c6a58"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.45"
                    />
                    <path
                      d="M65 52 C 55 45, 40 42, 28 48"
                      stroke="#8c6a58"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                    {/* Blossoms */}
                    <circle cx="50" cy="15" r="7" fill="#fbcfe8" opacity="0.85" />
                    <circle cx="50" cy="15" r="3" fill="#e11d48" opacity="0.6" />
                    <circle cx="95" cy="30" r="8.5" fill="#fce7f3" opacity="0.9" />
                    <circle cx="95" cy="30" r="3.5" fill="#e11d48" opacity="0.65" />
                    <circle cx="68" cy="50" r="6" fill="#fbcfe8" opacity="0.85" />
                    <circle cx="68" cy="50" r="2.5" fill="#be123c" opacity="0.6" />
                    <circle cx="32" cy="46" r="7.5" fill="#fce7f3" opacity="0.88" />
                    <circle cx="32" cy="46" r="3" fill="#e11d48" opacity="0.6" />
                    <circle cx="12" cy="80" r="6.5" fill="#fbcfe8" opacity="0.8" />
                    <circle cx="12" cy="80" r="2.5" fill="#be123c" opacity="0.5" />
                  </svg>
                </div>

                {/* Left Page Top Header Badge */}
                <div className="page-header-row center-header">
                  <span className="section-rule" />
                  <div className="ramen-badge-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#a93226" strokeWidth="1.8">
                      <path d="M4 11h16a1 1 0 0 1 1 1v.5a7.5 7.5 0 0 1 -15 0v-.5a1 1 0 0 1 1 -1z" fill="rgba(169, 50, 38, 0.15)" />
                      <path d="M8 18h8" />
                      <path d="M7 5l11 3" />
                      <path d="M7 8l11 -2" />
                    </svg>
                  </div>
                  <span className="section-badge-text">PROJECT MENU</span>
                  <span className="section-rule" />
                </div>

                <div className="page-title-group">
                  <h2 className="menu-heading-serif">Our Signature Projects</h2>
                  <p className="menu-subhead-italic">A curated selection of my finest creations.</p>
                </div>

                {/* 4 Menu Dish Cards */}
                <div className="menu-dishes-stack" role="group" aria-label="Select a project">
                  {projects.map((proj, idx) => {
                    const isSelected = idx === selectedProjectIndex;
                    return (
                      <button
                        type="button"
                        key={proj.id}
                        className={`menu-dish-item ${isSelected ? 'is-active' : ''}`}
                        onClick={() => handleSelectProject(idx)}
                        disabled={busy}
                        aria-pressed={isSelected}
                      >
                        {/* Real Project Miniature Preview Thumbnail */}
                        <div className="dish-thumbnail-box">
                          <ProjectThumbnailVisual projectId={proj.id} />
                          <span className="dish-index-pill">{proj.menuIndex}</span>
                        </div>

                        {/* Project Info */}
                        <div className="dish-text-block">
                          <h3 className="dish-name-heading">{proj.title}</h3>
                          <p className="dish-flavor-subtitle">{proj.dishName}</p>
                          <p className="dish-category">{proj.techStack.slice(0, 3).join(' · ')}</p>
                        </div>

                        {/* View Details Action Indicator */}
                        <div className="dish-action-col">
                          <span className="view-details-txt">View Details</span>
                          <span className="view-arrow-badge" aria-hidden="true">→</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Left Corner Pagoda Illustration */}
                <div className="page-decor-pagoda-wash" aria-hidden="true">
                  <svg viewBox="0 0 180 90" width="150" height="75" fill="none">
                    {/* Misty mountain hills */}
                    <path
                      d="M0 90 Q 40 45, 90 70 T 180 60 L 180 90 Z"
                      fill="rgba(165, 145, 130, 0.22)"
                    />
                    <path
                      d="M0 90 Q 60 60, 110 75 T 180 70 L 180 90 Z"
                      fill="rgba(140, 120, 105, 0.28)"
                    />
                    {/* Pagoda Silhouette */}
                    <rect x="25" y="38" width="16" height="26" fill="rgba(90, 75, 65, 0.5)" rx="1" />
                    {/* Roof Tier 1 */}
                    <path d="M17 40 L 49 40 L 44 34 L 22 34 Z" fill="rgba(80, 65, 55, 0.65)" />
                    {/* Roof Tier 2 */}
                    <path d="M20 34 L 46 34 L 42 27 L 24 27 Z" fill="rgba(80, 65, 55, 0.7)" />
                    {/* Roof Tier 3 */}
                    <path d="M23 27 L 43 27 L 39 20 L 27 20 Z" fill="rgba(80, 65, 55, 0.75)" />
                    {/* Spire */}
                    <line x1="33" y1="20" x2="33" y2="12" stroke="rgba(80, 65, 55, 0.8)" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Bottom Spread Navigation & Pagination */}
                <footer className="page-footer-nav">
                  <div className="page-nav-controls">
                    <span className="page-control-placeholder" />
                    <span className="page-counter-badge">— 01 / 04 —</span>
                    <button
                      type="button"
                      className="page-turn-btn next-btn"
                      disabled={busy}
                      onClick={() => handleTurnSpread(1)}
                      title="Next Page: Architecture & Philosophy"
                    >
                      <span>Next</span>
                      <span>→</span>
                    </button>
                  </div>
                </footer>
              </section>

              {/* Center Valley Spine Fold Shadow */}
              <div className="book-spine-crease" aria-hidden="true">
                <div className="spine-deep-valley" />
              </div>

              {/* RIGHT PAGE: FEATURED PROJECT (Matches Reference Layout Exactly) */}
              <section className="book-page page-right" aria-label="Selected Project Details">
                {/* Mobile Back Button */}
                <div className="mobile-back-row">
                  <button
                    type="button"
                    className="mobile-back-action-btn"
                    onClick={() => setIsMobileDetailView(false)}
                  >
                    ← Back to Dishes Menu
                  </button>
                </div>

                {/* Right Page Top Header */}
                <div className="page-header-row left-align-header">
                  <div className="ramen-badge-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#a93226" strokeWidth="1.8">
                      <path d="M4 11h16a1 1 0 0 1 1 1v.5a7.5 7.5 0 0 1 -15 0v-.5a1 1 0 0 1 1 -1z" fill="rgba(169, 50, 38, 0.15)" />
                      <path d="M8 18h8" />
                      <path d="M7 5l11 3" />
                      <path d="M7 8l11 -2" />
                    </svg>
                  </div>
                  <span className="section-badge-text">FEATURED PROJECT</span>
                </div>

                {/* GSAP Blur-to-Clear Split Content Wrapper */}
                <div ref={rightPageContentRef} className="featured-project-split-layout">
                  {/* LEFT COLUMN: Editorial Details, Ingredients, & CTA */}
                  <div className="featured-left-col">
                    <div className="detail-header-block">
                      <h2 className="detail-project-title-large">{currentProject.title}</h2>
                      <p className="detail-dish-title-italic">{currentProject.dishName}</p>
                    </div>

                    <p className="detail-editorial-summary">{currentProject.shortDesc}</p>

                    {/* Key Ingredients Section */}
                    <div className="key-ingredients-group">
                      <div className="ingredients-label-row">
                        <svg viewBox="0 0 18 18" width="13" height="13" fill="none" stroke="#221811" strokeWidth="1.8">
                          <path d="M2 5h14M2 9h14M2 13h14" strokeLinecap="round" />
                        </svg>
                        <h4 className="ingredients-heading">KEY INGREDIENTS</h4>
                      </div>

                      <div className="ingredients-badge-flex">
                        {currentProject.techStack.map((tech) => (
                          <span key={tech} className="ingredient-badge">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Call-to-Action Explore Button */}
                    <div className="detail-bottom-buttons-row">
                      <a
                        href={currentProject.liveUrl && currentProject.liveUrl !== '#projects' ? currentProject.liveUrl : currentProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="explore-project-primary-btn"
                      >
                        <span className="btn-icon">↗</span>
                        <span>Explore Project</span>
                        <span className="btn-arrow">→</span>
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
                          <span>GitHub</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Realistic Device Mockup & Japanese Watercolor Scenery */}
                  <div className="featured-right-col">
                    {/* Watercolor Japanese Rising Sun & Pagoda Silhouette */}
                    <div className="japanese-backdrop-scenery" aria-hidden="true">
                      {/* Terracotta Watercolor Rising Sun */}
                      <div className="watercolor-rising-sun" />

                      {/* Pagoda Silhouette with Cherry Blossoms */}
                      <div className="pagoda-silhouette-art">
                        <svg viewBox="0 0 140 180" width="120" height="154" fill="none">
                          {/* Cherry Blossom Branch */}
                          <path
                            d="M140 20 C 110 30, 85 45, 60 70"
                            stroke="#8c6a58"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            opacity="0.6"
                          />
                          <circle cx="78" cy="48" r="6" fill="#fbcfe8" opacity="0.8" />
                          <circle cx="78" cy="48" r="2.5" fill="#e11d48" opacity="0.6" />
                          <circle cx="108" cy="32" r="7" fill="#fce7f3" opacity="0.85" />
                          <circle cx="108" cy="32" r="3" fill="#be123c" opacity="0.6" />

                          {/* Tower Spire */}
                          <line x1="88" y1="50" x2="88" y2="70" stroke="#5d4c42" strokeWidth="2" />
                          {/* Tower Tier 4 */}
                          <path d="M74 74 L 102 74 L 97 68 L 79 68 Z" fill="#5d4c42" />
                          <rect x="80" y="74" width="16" height="14" fill="#6d5a4f" />
                          {/* Tower Tier 3 */}
                          <path d="M68 90 L 108 90 L 103 84 L 73 84 Z" fill="#5d4c42" />
                          <rect x="76" y="90" width="24" height="16" fill="#6d5a4f" />
                          {/* Tower Tier 2 */}
                          <path d="M62 108 L 114 108 L 108 102 L 68 102 Z" fill="#5d4c42" />
                          <rect x="72" y="108" width="32" height="18" fill="#6d5a4f" />
                          {/* Tower Tier 1 */}
                          <path d="M55 128 L 121 128 L 114 122 L 62 122 Z" fill="#5d4c42" />
                          <rect x="68" y="128" width="40" height="24" fill="#6d5a4f" />
                        </svg>
                      </div>

                      {/* Sumi-e Landscape Base & Wash */}
                      <div className="sumie-rock-base" />
                    </div>

                    {/* Realistic Laptop Device Display */}
                    <div className="laptop-device-wrapper">
                      <div className="laptop-display-frame">
                        <div className="laptop-screen-bezel">
                          <div className="laptop-webcam-dot" />
                          <div className="laptop-screen-viewport">
                            <ProjectScreenContent project={currentProject} />
                          </div>
                        </div>
                      </div>
                      <div className="laptop-keyboard-chassis">
                        <div className="laptop-notch" />
                      </div>
                      <div className="laptop-shadow-shelf" />
                    </div>
                  </div>
                </div>

                <footer className="page-footer-nav">
                  <div className="page-nav-controls right-align">
                    <span className="page-number-display">Page 02</span>
                  </div>
                </footer>
              </section>
          </div>

          {/* ================= SPREAD 2: ARCHITECTURE & PHILOSOPHY ================= */}
          <div data-spread="2" className={`book-spread ${currentSpread === 2 ? 'is-current' : ''}`} inert={currentSpread !== 2 ? true : undefined} aria-hidden={currentSpread !== 2}>
              {/* LEFT PAGE: CHEF'S SPECIAL & 3D WORLD */}
              <section tabIndex={-1} className="book-page page-left" aria-label="Chef's Special & Architecture">
                <div className="page-header-row center-header">
                  <span className="section-rule" />
                  <span className="section-badge-text">CHEF'S SPECIAL</span>
                  <span className="section-rule" />
                </div>

                <div className="page-title-group">
                  <h2 className="menu-heading-serif">Konoha 3D World</h2>
                  <p className="menu-subhead-italic">Hokage Grand Bowl • Spatial Engine</p>
                </div>

                <div className="mobile-back-row"><button type="button" className="mobile-back-action-btn" onClick={() => setIsMobileDetailView(!isMobileDetailView)}>{isMobileDetailView ? '← Architecture' : 'Read the philosophy →'}</button></div>
                <div className="spread2-content-body">
                  <p className="spread2-lead">
                    This interactive 3D portfolio is engineered from the ground up to push the boundaries
                    of real-time WebGL in modern browsers.
                  </p>

                  <div className="spread2-specs-card">
                    <h4>ENGINEERING SPECIFICATIONS</h4>
                    <ul>
                      <li><strong>O(1) Spatial Hash Grid:</strong> Ultra-fast ground sampling and wall collision across 1,000+ mesh vertices.</li>
                      <li><strong>Adaptive Watchdog:</strong> Dynamic resolution scaling (DPR) monitoring frame rate with seamless 2D fallback.</li>
                      <li><strong>Proximity & Frustum Culling:</strong> Distance-based character skeletal animation gating to reduce per-frame animation work.</li>
                    </ul>
                  </div>

                  {onFastTravel && (
                    <button
                      type="button"
                      className="spread2-fast-travel-btn"
                      disabled={busy}
                      onClick={() => {
                        if (busy) return;
                        afterCloseRef.current = () => onFastTravel([-24.8, 0.02, -13.2]);
                        handleCloseBook();
                      }}
                    >
                      🍜 Teleport to Ramen Shop in 3D Village
                    </button>
                  )}
                </div>

                <footer className="page-footer-nav">
                  <div className="page-nav-controls">
                    <button
                      type="button"
                      className="page-turn-btn prev-btn"
                      disabled={busy}
                      onClick={() => handleTurnSpread(-1)}
                      title="Previous Page: Signature Projects"
                    >
                      <span>←</span>
                      <span>Prev Page</span>
                    </button>
                    <span className="page-counter-badge">— 03 / 04 —</span>
                  </div>
                </footer>
              </section>

              {/* Center Valley Spine Fold Shadow */}
              <div className="book-spine-crease" aria-hidden="true">
                <div className="spine-deep-valley" />
              </div>

              {/* RIGHT PAGE: ENGINEERING PHILOSOPHY */}
              <section className="book-page page-right" aria-label="Engineering Philosophy">
                <div className="page-header-row center-header">
                  <span className="section-rule" />
                  <span className="section-badge-text">SHINOBI PHILOSOPHY</span>
                  <span className="section-rule" />
                </div>

                <div className="page-title-group">
                  <h2 className="menu-heading-serif">The Way of the Code</h2>
                  <p className="menu-subhead-italic">Principles Behind Every Project</p>
                </div>

                <div className="mobile-back-row"><button type="button" className="mobile-back-action-btn" onClick={() => setIsMobileDetailView(!isMobileDetailView)}>{isMobileDetailView ? '← Architecture' : 'Read the philosophy →'}</button></div>
                <div className="spread2-content-body">
                  <div className="philosophy-pillar">
                    <h4>01 • Relentless Problem Solving</h4>
                    <p>Every project starts from a concrete friction point—whether eliminating hours of travel planning or shielding vulnerable users from financial phone fraud.</p>
                  </div>

                  <div className="philosophy-pillar">
                    <h4>02 • Production-Grade Engineering</h4>
                    <p>Clean system architecture, typed contracts, modular state containers, and defensive performance optimization across edge and cloud.</p>
                  </div>

                  <div className="philosophy-pillar">
                    <h4>03 • Delight in the Craft</h4>
                    <p>Creating software should feel like culinary mastery—balanced textures, purposeful typography, and genuine tactile satisfaction.</p>
                  </div>
                </div>

                <footer className="page-footer-nav">
                  <div className="page-nav-controls right-align">
                    <span className="page-number-display">Page 04</span>
                  </div>
                </footer>
              </section>
          </div>
        </div>
      </div>
      <span className="book-status" role="status">{busy ? 'Book transition in progress' : bookState === 'closed' ? 'Book closed' : `Spread ${currentSpread} of 2. ${currentProject.title} selected.`}</span>
      {turnNotice && <p className="book-notice" role="status">{turnNotice}</p>}
    </div>
  );
}

// ============================================================================
// REALISTIC HIGH-RES PROJECT SCREEN VIEWPORT
// ============================================================================
function ProjectScreenContent({ project }) {
  if (project.image || project.screenshot) return <img src={project.image || project.screenshot} alt={`${project.title} project preview`} style={{ width: '100%', display: 'block' }} />;
  return <div className="project-feature-preview">
    <small>PROJECT CAPABILITIES</small>
    <h3>{project.title}</h3>
    <ul>{project.features.slice(0, 3).map(feature => <li key={feature}>{feature}</li>)}</ul>
  </div>;
}

// ============================================================================
// REAL PROJECT THUMBNAIL VISUALS (FOR THE LEFT MENU CARDS)
// ============================================================================
function ProjectThumbnailVisual({ projectId }) {
  if (projectId === 'travelflow-ai') {
    return (
      <div className="mini-thumb-canvas travel-thumb">
        <div className="mini-laptop-mockup">
          <div className="mini-laptop-screen">
            <div className="mini-travel-scenery" />
            <span className="mini-app-badge">✈ TravelFlow</span>
          </div>
          <div className="mini-laptop-base" />
        </div>
      </div>
    );
  }

  if (projectId === 'wastewise') {
    return (
      <div className="mini-thumb-canvas waste-thumb">
        <div className="mini-tablet-mockup">
          <div className="mini-tablet-screen">
            <div className="mini-waste-feed" />
            <span className="mini-app-badge">♻ WasteWise</span>
          </div>
        </div>
      </div>
    );
  }

  if (projectId === 'callkavach') {
    return (
      <div className="mini-thumb-canvas kavach-thumb">
        <div className="mini-phone-mockup">
          <div className="mini-phone-screen">
            <div className="mini-shield-pulse" />
            <span className="mini-app-badge">🛡 Kavach</span>
          </div>
        </div>
      </div>
    );
  }

  // Racket Sports Intelligence
  return (
    <div className="mini-thumb-canvas racket-thumb">
      <div className="mini-court-mockup">
        <div className="mini-court-screen">
          <div className="mini-court-lines" />
          <span className="mini-app-badge">🏸 RacketAI</span>
        </div>
      </div>
    </div>
  );
}
