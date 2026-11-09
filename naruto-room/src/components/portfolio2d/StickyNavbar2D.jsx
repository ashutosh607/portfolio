import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

export default function StickyNavbar2D({
  navSections,
  activeSection,
  onNavigate,
  onOpenResume,
  onSwitchTo3D,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navbarRef = useRef(null);
  const brandRef = useRef(null);
  const linksContainerRef = useRef(null);
  const activeIndicatorRef = useRef(null);
  const navItemRefs = useRef({});

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const button=navbarRef.current.querySelector('.p2d-mobile-menu-btn');
    const controls=navbarRef.current.querySelectorAll('.p2d-mobile-drawer button');
    controls[0]?.focus({preventScroll:true});
    const keydown=e=>{
      if(e.key==='Escape') setMobileMenuOpen(false);
      if(e.key==='Tab' && e.shiftKey && document.activeElement===controls[0]){
        e.preventDefault();controls[controls.length-1]?.focus();
      } else if(e.key==='Tab' && !e.shiftKey && document.activeElement===controls[controls.length-1]){
        e.preventDefault();controls[0]?.focus();
      }
    };
    const media=matchMedia('(min-width: 901px)');
    const resize=()=>{if(media.matches)setMobileMenuOpen(false)};
    window.addEventListener('keydown',keydown);media.addEventListener('change',resize);
    return ()=>{window.removeEventListener('keydown',keydown);media.removeEventListener('change',resize);button?.focus({preventScroll:true})};
  },[mobileMenuOpen]);

  // 1. Initial Entrance Animations on mount
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return undefined;

    const ctx = gsap.context(() => {
      // Navbar descends gently
      gsap.fromTo(
        navbarRef.current,
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }
      );

      // Logo glides in from left
      if (brandRef.current) {
        gsap.fromTo(
          brandRef.current,
          { x: -16, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, delay: 0.1, ease: 'power3.out' }
        );
      }

      // Nav link items staggered entrance
      if (linksContainerRef.current) {
        const linkBtns = linksContainerRef.current.querySelectorAll('.p2d-nav-item');
        gsap.fromTo(
          linkBtns,
          { y: -10, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.04,
            delay: 0.18,
            ease: 'power2.out',
          }
        );
      }
    }, navbarRef);

    return () => ctx.revert();
  }, []);

  // 2. Track scroll to shrink height and increase opacity after 60px
  useEffect(() => {
    const handleScroll = (e) => {
      const target = e?.target && e.target !== document ? e.target : window;
      const currentY = target === window ? window.scrollY : target.scrollTop;
      const shouldBeScrolled = currentY > 60;
      setIsScrolled((prev) => (prev !== shouldBeScrolled ? shouldBeScrolled : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const wrapper = document.querySelector('.portfolio-2d-wrapper');
    wrapper?.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      wrapper?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 3. Sliding active navigation indicator
  const updateIndicator = useCallback(
    (instant = false) => {
      const activeEl = navItemRefs.current[activeSection];
      const indicator = activeIndicatorRef.current;
      if (!activeEl || !indicator || !linksContainerRef.current) return;

      const containerRect = linksContainerRef.current.getBoundingClientRect();
      const itemRect = activeEl.getBoundingClientRect();
      if (!itemRect.width) return;

      const targetX = itemRect.left - containerRect.left;
      const targetWidth = itemRect.width;

      if (instant) {
        gsap.set(indicator, { x: targetX, width: targetWidth, opacity: 1 });
      } else {
        gsap.to(indicator, {
          x: targetX,
          width: targetWidth,
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    },
    [activeSection]
  );

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, isScrolled]);

  useEffect(() => {
    const handleResize = () => updateIndicator(true);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicator]);

  const handleNavClick = useCallback(
    (id) => {
      onNavigate(id);
      setMobileMenuOpen(false);
    },
    [onNavigate]
  );

  return (
    <header
      ref={navbarRef}
      className={`p2d-navbar ${isScrolled ? 'is-scrolled' : ''}`}
      role="banner"
    >
      {/* Brand logo & title */}
      <button
        ref={brandRef}
        type="button"
        className="p2d-brand"
        onClick={() => handleNavClick('intro')}
        title="Scroll to top"
      >
        <img
          src="/logo-mark-transparent.png"
          alt="Ashutosh shinobi emblem"
          className="p2d-brand-logo"
        />
        <div className="p2d-brand-text">
          <span className="p2d-brand-name">ASHUTOSH</span>
          <span className="p2d-brand-sub">SHINOBI PORTFOLIO • 2D EDITION</span>
        </div>
      </button>

      {/* Desktop Navigation Links with Sliding Active Pill */}
      <nav
        ref={linksContainerRef}
        className="p2d-nav-links"
        aria-label="2D Portfolio Sections"
      >
        <span ref={activeIndicatorRef} className="p2d-nav-sliding-pill" aria-hidden="true" />
        {navSections.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              ref={(el) => (navItemRefs.current[item.id] = el)}
              type="button"
              className={`p2d-nav-item ${isActive ? 'is-active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="p2d-nav-item-num">{item.num}</span>
              <span className="p2d-nav-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Actions: Resume Pill & 3D World Button */}
      <div className="p2d-nav-actions">
        {onOpenResume && (
          <button
            type="button"
            className="p2d-resume-pill"
            onClick={onOpenResume}
            title="Preview Resume PDF"
          >
            <span>📄</span> Resume
          </button>
        )}

        {onSwitchTo3D && (
          <button
            type="button"
            className="p2d-switch-3d-btn"
            onClick={onSwitchTo3D}
            title="Return to 3D Interactive Konoha Village"
          >
            <span className="p2d-switch-icon" aria-hidden="true">🏯</span>
            <span className="p2d-switch-text-full">3D World</span>
            <span className="p2d-switch-text-short">3D</span>
          </button>
        )}

        {/* Mobile menu toggle hamburger */}
        <button
          type="button"
          className={`p2d-mobile-menu-btn ${mobileMenuOpen ? 'is-open' : ''}`}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-controls={mobileMenuOpen ? "portfolio-mobile-drawer" : undefined}
          aria-expanded={mobileMenuOpen}
        >
          <span className="p2d-hamburger-bar" />
          <span className="p2d-hamburger-bar" />
          <span className="p2d-hamburger-bar" />
        </button>
      </div>

      {/* Compact Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="p2d-mobile-drawer-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="p2d-mobile-drawer" role="dialog" aria-modal="true" aria-label="Portfolio navigation" id="portfolio-mobile-drawer">
            <div className="p2d-mobile-drawer-inner">
              {navSections.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-current={activeSection===item.id ? "location" : undefined}
                  className={`p2d-mobile-nav-item ${activeSection === item.id ? 'is-active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="p2d-nav-item-left">
                    <span className="p2d-nav-item-num">{item.num}</span>
                    <span className="p2d-nav-item-label">{item.label}</span>
                  </span>
                  <span className="p2d-drawer-arrow" aria-hidden="true">→</span>
                </button>
              ))}
              <div className="p2d-mobile-drawer-actions">
                {onOpenResume && (
                  <button
                    type="button"
                    className="p2d-btn-secondary"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenResume();
                    }}
                  >
                    📄 View Resume
                  </button>
                )}
                {onSwitchTo3D && (
                  <button
                    type="button"
                    className="p2d-btn-primary"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSwitchTo3D();
                    }}
                  >
                    🏯 Enter 3D Village
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

