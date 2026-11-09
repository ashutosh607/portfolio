import { sectionEntrance } from '../utils/sectionEntrance';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import './AboutModal.css';

const INTEREST_ITEMS = [
  {
    id: 'football',
    label: 'Football',
    detail: 'Always up for a good match.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <polygon points="12 7.5 15.2 9.8 14 13.6 10 13.6 8.8 9.8" />
        <line x1="12" y1="3" x2="12" y2="7.5" />
        <line x1="15.2" y1="9.8" x2="20.4" y2="8.8" />
        <line x1="14" y1="13.6" x2="17.5" y2="18.8" />
        <line x1="10" y1="13.6" x2="6.5" y2="18.8" />
        <line x1="8.8" y1="9.8" x2="3.6" y2="8.8" />
      </svg>
    ),
  },
  {
    id: 'anime',
    label: 'Anime',
    detail: 'Naruto will always be a favorite.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <polygon points="10 9.5 15.5 12 10 14.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'foodie',
    label: 'Foodie',
    detail: 'Trying new food spots. KFC is a favorite.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15.5 5.5a4.5 4.5 0 0 1 3 7.8c-1.2 1.1-2.7 1.4-4 2.7l-3.2 3.2a1.8 1.8 0 0 1-2.5-2.5l3.2-3.2c1.3-1.3 1.6-2.8 2.7-4a4.5 4.5 0 0 1 .8-4z" />
        <circle cx="6.2" cy="17.8" r="1.4" />
        <circle cx="4.8" cy="15.2" r="1.4" />
      </svg>
    ),
  },
  {
    id: 'coding',
    label: 'Coding',
    detail: 'Turning random ideas into working projects.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="8 8 4 12 8 16" />
        <polyline points="16 8 20 12 16 16" />
        <line x1="13.5" y1="6" x2="10.5" y2="18" />
      </svg>
    ),
  },
  {
    id: 'creating',
    label: 'Always Creating',
    detail: 'I enjoy staying productive and working on new ideas.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 3 5 14 12 14 11 21 19 10 12 10 13 3" />
      </svg>
    ),
  },
];

const SNAPSHOT_ITEMS = [
  {
    id: 'education',
    label: 'Education',
    primary: 'B.Tech in Artificial Intelligence & Machine Learning',
    secondary: 'Dwarkadas J. Sanghvi College of Engineering (DJSCE)',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 10L12 5 2 10l10 5 10-5z" />
        <path d="M6 12.5v4.5c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
      </svg>
    ),
  },
  {
    id: 'development',
    label: 'Development',
    primary: 'Full-Stack Web Development',
    secondary: 'React.js, Node.js, Express.js, MongoDB',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="8 8 4 12 8 16" />
        <polyline points="16 8 20 12 16 16" />
        <line x1="13.5" y1="6" x2="10.5" y2="18" />
      </svg>
    ),
  },
  {
    id: 'exploration',
    label: 'Exploration',
    primary: 'Artificial Intelligence & Machine Learning',
    secondary: null,
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 3 2 8 12 13 22 8 12 3" />
        <polyline points="2 12.5 12 17.5 22 12.5" />
        <polyline points="2 17 12 22 22 17" />
      </svg>
    ),
  },
  {
    id: 'goal',
    label: 'Goal',
    primary: 'Build useful, creative digital products while continuously improving my skills.',
    secondary: null,
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

const DRIVE_VALUES = [
  {
    id: 'build',
    title: 'Build',
    description: 'Turn ideas into useful products.',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 3 5 14 12 14 11 21 19 10 12 10 13 3" />
      </svg>
    ),
  },
  {
    id: 'learn',
    title: 'Learn',
    description: 'Explore, experiment, and keep improving.',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H11v16H4.5A2.5 2.5 0 0 0 2 21.5v-16z" />
        <path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H13v16h6.5a2.5 2.5 0 0 1 2.5 2.5v-16z" />
      </svg>
    ),
  },
  {
    id: 'grow',
    title: 'Grow',
    description: 'Become a better developer, creator, and person.',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
];

export default function AboutModal({ embedded = false, isOpen, onClose, onOpenResume, onOpenContact }) {
  const overlayRef = useRef(null);
  const bgRef = useRef(null);
  const closeBtnRef = useRef(null);
  const photoFrameRef = useRef(null);
  const photoImgRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const introRef = useRef(null);
  const snapshotRef = useRef(null);
  const interestsRef = useRef(null);
  const drivesRef = useRef(null);
  const footerRef = useRef(null);
  const timelineRef = useRef(null);
  const isClosingRef = useRef(false);

  const [activeInterestId, setActiveInterestId] = useState(null);

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const triggerClose = useCallback(
    (afterCloseCallback) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;

      if (prefersReducedMotion() || !overlayRef.current) {
        isClosingRef.current = false;
        if (afterCloseCallback) afterCloseCallback();
        else onClose?.();
        return;
      }

      timelineRef.current?.kill();
      const tl = gsap.timeline({
        onComplete: () => {
          isClosingRef.current = false;
          if (afterCloseCallback) afterCloseCallback();
          else onClose?.();
        },
      });
      timelineRef.current = tl;

      tl.to(
        [
          photoFrameRef.current,
          eyebrowRef.current,
          headingRef.current,
          subtitleRef.current,
          introRef.current,
          snapshotRef.current,
          interestsRef.current,
          drivesRef.current,
          footerRef.current,
        ].filter(Boolean),
        {
          opacity: 0,
          y: 10,
          duration: 0.24,
          ease: 'power2.in',
          overwrite: 'auto',
        },
        0
      ).to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.inOut',
        },
        0.06
      );
    },
    [onClose]
  );

  // Coordinated GSAP opening timeline
  useEffect(() => {
    if (!isOpen) return;
    isClosingRef.current = false;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (!embedded) document.body.style.overflow = 'hidden';

    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(overlayRef.current, { opacity: 1 });
        gsap.set(photoFrameRef.current, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 });
        gsap.set(photoImgRef.current, { scale: 1 });
        return;
      }

      const snapshotItems = snapshotRef.current
        ? snapshotRef.current.querySelectorAll('.about-snapshot-item')
        : [];
      const interestTiles = interestsRef.current
        ? interestsRef.current.querySelectorAll('.about-interest-tile')
        : [];
      const driveItems = drivesRef.current
        ? drivesRef.current.querySelectorAll('.about-drive-item')
        : [];
      const introParagraphs = introRef.current
        ? introRef.current.querySelectorAll('p')
        : [];

      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(bgRef.current, { opacity: 0, scale: 1.03 });
      gsap.set(photoFrameRef.current, {
        clipPath: 'inset(100% 0% 0% 0%)',
        opacity: 1,
      });
      gsap.set(photoImgRef.current, { scale: 1.04 });
      gsap.set([eyebrowRef.current, headingRef.current, subtitleRef.current], {
        opacity: 0,
        y: 18,
      });
      gsap.set(introParagraphs, { opacity: 0, y: 14 });
      gsap.set(snapshotItems, { opacity: 0, x: 14 });
      gsap.set(interestTiles, { opacity: 0, y: 14 });
      gsap.set(driveItems, { opacity: 0, y: 12 });
      gsap.set(footerRef.current, { opacity: 0, y: 12 });

      const tl = sectionEntrance(overlayRef.current, embedded);
      timelineRef.current = tl;

      // 1. Background fades in smoothly
      tl.to(overlayRef.current, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0)
        .to(bgRef.current, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 0.05)
        // 2. Photo reveals from bottom to top using vertical clip-path mask (~800ms)
        .to(
          photoFrameRef.current,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.82,
            ease: 'power3.inOut',
          },
          0.12
        )
        .to(
          photoImgRef.current,
          {
            scale: 1,
            duration: 0.85,
            ease: 'power2.out',
          },
          0.12
        )
        // 3. Heading & subtitle reveal with subtle staggered typography
        .to(
          [eyebrowRef.current, headingRef.current, subtitleRef.current],
          {
            opacity: 1,
            y: 0,
            duration: 0.52,
            stagger: 0.08,
          },
          0.26
        )
        // 4. Introduction fades upward
        .to(
          introParagraphs,
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.07,
          },
          0.42
        )
        // 5. Professional highlights appear sequentially
        .to(
          snapshotItems,
          {
            opacity: 1,
            x: 0,
            duration: 0.44,
            stagger: 0.06,
          },
          0.48
        )
        // 6. Interest tiles & What Drives Me stagger into position
        .to(
          interestTiles,
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.05,
          },
          0.62
        )
        .to(
          driveItems,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.06,
          },
          0.68
        )
        // 7. Bottom actions fade in
        .to(
          footerRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
          },
          0.78
        );
    }, overlayRef);

    const focusTimer = requestAnimationFrame(() => {
      if (!embedded) closeBtnRef.current?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(focusTimer);
      timelineRef.current?.kill();
      ctx.revert();
      if (!embedded) {
        document.body.style.overflow = previousOverflow;
        previousFocus?.focus?.({ preventScroll: true });
      }
    };
  }, [isOpen, embedded]);

  // ESC key to close and Focus Trap for accessibility
  useEffect(() => {
    if (!isOpen || embedded) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        triggerClose();
        return;
      }
      if (event.key === 'Tab' && overlayRef.current) {
        const focusable = [
          ...overlayRef.current.querySelectorAll(
            'button:not(:disabled), a[href], [tabindex="0"]'
          ),
        ].filter((el) => el.getClientRects().length > 0);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, embedded, triggerClose]);

  if (!isOpen) return null;

  const handleInterestToggle = (id) => {
    setActiveInterestId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      ref={overlayRef}
      className="about-editorial-overlay"
      role={embedded ? "region" : "dialog"}
      aria-modal={embedded ? undefined : true}
      aria-labelledby="about-main-heading"
    >
      {/* Full-Viewport Dark Japanese Landscape Background */}
      <div ref={bgRef} className="about-background" aria-hidden="true" />
      <div className="about-background-scrim" aria-hidden="true" />

      {/* Minimal Top-Right Close Button (No Top Navigation Bar) */}
      <button
        ref={closeBtnRef}
        type="button"
        className="about-minimal-close-btn"
        onClick={() => triggerClose()}
        aria-label="Close About Me and return to Hidden Leaf Village"
        title="Close (ESC)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>

      {/* Main Scrollable Viewport Container */}
      <div className="about-editorial-scroll-container">
        <div className="about-editorial-shell">
          {/* Upper 3-Column Editorial Grid */}
          <div className="about-editorial-grid">
            {/* ================= LEFT COLUMN: PERSONAL PORTRAIT PHOTO ================= */}
            <aside className="about-col-photo" aria-label="Portrait of Ashutosh">
              <div className="about-photo-stage">
                {/* Thin Muted Red Offset Border */}
                <div className="about-photo-offset-frame" aria-hidden="true" />

                {/* Subtle Vertical Katakana Nameplate */}
                <div className="about-photo-katakana-tag" aria-hidden="true">
                  <span>ア</span>
                  <span>シ</span>
                  <span>ュ</span>
                  <span>ト</span>
                  <span>シ</span>
                  <span>ュ</span>
                </div>

                {/* Actual Personal Portrait Image */}
                <div ref={photoFrameRef} className="about-photo-mask">
                  <img
                    ref={photoImgRef}
                    src="/about/ashutosh-photo.jpg"
                    alt="Ashutosh"
                    className="about-portrait-image"
                    draggable={false}
                  />
                </div>
              </div>
            </aside>

            {/* ================= CENTER COLUMN: ABOUT ME & INTERESTS ================= */}
            <main className="about-col-center">
              <div ref={eyebrowRef} className="about-eyebrow-row">
                <span className="about-eyebrow-text">ABOUT ME</span>
                <span className="about-eyebrow-line" aria-hidden="true" />
              </div>

              <h1 ref={headingRef} id="about-main-heading" className="about-hero-heading">
                Hi, I&rsquo;m{' '}
                <span className="about-name-accent">
                  Ashutosh.
                  <svg
                    className="about-heading-brush"
                    viewBox="0 0 210 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8.5C54 3.2 135 2.4 207 6.8"
                      stroke="#A63C38"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p ref={subtitleRef} className="about-hero-subtitle">
                Developer <span className="about-dot">•</span> Creator{' '}
                <span className="about-dot">•</span> Anime Enthusiast{' '}
                <span className="about-dot">•</span> Football Fan
              </p>

              <div ref={introRef} className="about-intro-prose">
                <p>
                  I&rsquo;m Ashutosh, a developer who enjoys turning ideas into{' '}
                  <span className="prose-highlight">interactive, meaningful experiences</span>.
                </p>
                <p>
                  I love building things, experimenting with new technologies, and solving problems
                  creatively. Whether it&rsquo;s developing a{' '}
                  <span className="prose-highlight">full-stack application</span> or exploring{' '}
                  <span className="prose-highlight">AI and machine learning</span>, I&rsquo;m always
                  curious about what I can create next.
                </p>
                <p>
                  Outside the screen, I&rsquo;m usually watching anime, playing football, or
                  discovering somewhere new to eat. I enjoy staying busy, learning new things, and
                  making the most of whatever I&rsquo;m working on.
                </p>
              </div>

              {/* MY INTERESTS — 5 COMPACT INTERACTIVE TILES */}
              <section
                ref={interestsRef}
                className="about-interests-section"
                aria-labelledby="about-interests-heading"
              >
                <div className="about-sub-header">
                  <h2 id="about-interests-heading" className="about-sub-title">
                    My Interests
                  </h2>
                  <span className="about-sub-rule" aria-hidden="true" />
                </div>

                <div className="about-interests-row" role="list">
                  {INTEREST_ITEMS.map((item) => {
                    const isActive = activeInterestId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="listitem"
                        className={`about-interest-tile ${isActive ? 'is-active' : ''}`}
                        onClick={() => handleInterestToggle(item.id)}
                        aria-expanded={isActive}
                      >
                        <span className="interest-tile-icon">{item.icon}</span>
                        <span className="interest-tile-label">{item.label}</span>
                        <span className="interest-tile-detail">{item.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </main>

            {/* ================= RIGHT COLUMN: PROFESSIONAL SNAPSHOT & WHAT DRIVES ME ================= */}
            <aside className="about-col-right" aria-label="Professional Snapshot and Values">
              <div ref={snapshotRef} className="about-snapshot-list">
                {SNAPSHOT_ITEMS.map((item) => (
                  <div key={item.id} className="about-snapshot-item">
                    <span className="snapshot-item-icon">{item.icon}</span>
                    <div className="snapshot-item-body">
                      <span className="snapshot-item-kicker">{item.label}</span>
                      <p className="snapshot-item-primary">{item.primary}</p>
                      {item.secondary && (
                        <p className="snapshot-item-secondary">{item.secondary}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* WHAT DRIVES ME — 3 CORE VALUES */}
              <section
                ref={drivesRef}
                className="about-drives-section"
                aria-labelledby="about-drives-heading"
              >
                <div className="about-sub-header">
                  <h2 id="about-drives-heading" className="about-sub-title">
                    What Drives Me
                  </h2>
                  <span className="about-sub-rule" aria-hidden="true" />
                </div>

                <div className="about-drives-list">
                  {DRIVE_VALUES.map((val) => (
                    <div key={val.id} className="about-drive-item">
                      <span className="drive-item-icon">{val.icon}</span>
                      <div className="drive-item-copy">
                        <h3 className="drive-item-title">{val.title}</h3>
                        <p className="drive-item-desc">{val.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>

          {/* ================= BOTTOM BAR: QUOTE & ACTIONS ================= */}
          <footer ref={footerRef} className="about-bottom-bar">
            <blockquote className="about-pull-quote">
              <span className="quote-mark" aria-hidden="true">
                &ldquo;
              </span>
              <p>
                Beyond code, you&rsquo;ll probably find me watching anime, playing football, trying
                new food spots, or planning my next creative project.&rdquo;
              </p>
            </blockquote>

            <div className="about-bottom-actions">
              <button
                type="button"
                className="about-btn-resume"
                onClick={embedded ? onOpenResume : () => triggerClose(() => onOpenResume?.())}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="13" x2="16" y2="13" />
                  <line x1="8" y1="17" x2="13" y2="17" />
                </svg>
                <span>View Resume</span>
              </button>

              {onOpenContact && (
                <button
                  type="button"
                  className="about-btn-contact"
                  onClick={embedded ? onOpenContact : () => triggerClose(() => onOpenContact?.())}
                  title="Open Hokage Monument Contact page"
                >
                  <span>Get in Touch</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="13 6 19 12 13 18" />
                  </svg>
                </button>
              )}

              <button
                type="button"
                className="about-btn-return"
                onClick={() => triggerClose()}
              >
                <span>Return to Village</span>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

