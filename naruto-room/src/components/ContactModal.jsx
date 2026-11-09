import { apiBase } from '../data/published';
import { published } from '../data/published';
import { sectionEntrance } from '../utils/sectionEntrance';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import './ContactModal.css';





export default function ContactModal({
  isOpen,
  embedded = false,
  onClose,
  onOpenResume,
  onTeleportToMonument,
}) {
  const [delivery,setDelivery]=useState('');
  const [sending,setSending]=useState(false);
  async function sendMessage(event){
    event.preventDefault();const form=event.currentTarget;
    setSending(true);setDelivery('');
    try{
      const res=await fetch(apiBase+'/contact/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});
      const body=await res.json();
      if(!res.ok || !body.success)throw new Error(body.message || 'Message delivery failed.');
      form.reset();setDelivery('Message delivered.');
    }catch(err){setDelivery(err.message)}finally{setSending(false)}
  }
  const info = published?.contact;
  const CONTACT_EMAIL = info?.email ?? 'ashutoshkadam607@gmail.com';
  const GITHUB_URL = info?.githubUrl ?? 'https://github.com/ashutosh607';
  const LINKEDIN_URL = info?.linkedinUrl ?? 'https://www.linkedin.com/in/Ashutosh-kadam';
  const overlayRef = useRef(null);
  const bgRef = useRef(null);
  const closeBtnRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const descRef = useRef(null);
  const gridRef = useRef(null);
  const footerRef = useRef(null);
  const timelineRef = useRef(null);
  const isClosingRef = useRef(false);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const copyTimerRef = useRef(null);

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleCopyEmail = useCallback(async () => {
    try { await navigator.clipboard.writeText(CONTACT_EMAIL); } catch { return; }
    setCopiedEmail(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopiedEmail(false);
    }, 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

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
      const cards = gridRef.current
        ? [...gridRef.current.querySelectorAll('.contact-directory-item')]
        : [];

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
          eyebrowRef.current,
          headingRef.current,
          subtitleRef.current,
          descRef.current,
          ...cards,
          footerRef.current,
        ].filter(Boolean),
        {
          opacity: 0,
          y: 10,
          duration: 0.22,
          ease: 'power2.in',
          overwrite: 'auto',
        },
        0
      ).to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.28,
          ease: 'power2.inOut',
        },
        0.06
      );
    },
    [onClose]
  );

  // Opening GSAP timeline (~1.15s total) + subtle pointer parallax on background
  useEffect(() => {
    if (!isOpen) return;
    isClosingRef.current = false;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (!embedded) document.body.style.overflow = 'hidden';

    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const cards = gridRef.current
        ? gridRef.current.querySelectorAll('.contact-directory-item')
        : [];

      if (reduced) {
        gsap.set(overlayRef.current, { opacity: 1 });
        gsap.set(bgRef.current, { opacity: 1, scale: 1 });
        return;
      }

      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(bgRef.current, { opacity: 0, scale: 1.03, x: 0, y: 0 });
      gsap.set([eyebrowRef.current, headingRef.current], { opacity: 0, y: 18 });
      gsap.set([subtitleRef.current, descRef.current], { opacity: 0, y: 14 });
      gsap.set(cards, { opacity: 0, y: 16 });
      gsap.set(footerRef.current, { opacity: 0, y: 12 });

      const tl = sectionEntrance(overlayRef.current, embedded);
      timelineRef.current = tl;

      // 1. Dark overlay & background artwork reveal gently
      tl.to(overlayRef.current, { opacity: 1, duration: 0.32, ease: 'power2.out' }, 0)
        .to(bgRef.current, { opacity: 1, scale: 1.015, duration: 0.88, ease: 'power2.out' }, 0.04)
        // 2. Eyebrow & Main Heading slide upward and fade in
        .to(
          [eyebrowRef.current, headingRef.current],
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
          },
          0.16
        )
        // 3. Subtitle & Supporting Paragraph appear
        .to(
          [subtitleRef.current, descRef.current],
          {
            opacity: 1,
            y: 0,
            duration: 0.46,
            stagger: 0.07,
          },
          0.32
        )
        // 4. Four contact options reveal with a small stagger
        .to(
          cards,
          {
            opacity: 1,
            y: 0,
            duration: 0.44,
            stagger: 0.06,
          },
          0.46
        )
        // 5. Footer actions fade in
        .to(
          footerRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
          },
          0.66
        );
    }, overlayRef);

    // Subtle pointer parallax on the background artwork (desktop only, respects reduced motion)
    let handlePointerMove = null;
    if (!embedded && !reduced && bgRef.current) {
      const xTo = gsap.quickTo(bgRef.current, 'x', { duration: 0.7, ease: 'power2.out' });
      const yTo = gsap.quickTo(bgRef.current, 'y', { duration: 0.7, ease: 'power2.out' });
      handlePointerMove = (e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * -10;
        const ny = (e.clientY / window.innerHeight - 0.5) * -7;
        xTo(nx);
        yTo(ny);
      };
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }

    const focusTimer = requestAnimationFrame(() => {
      if (!embedded) closeBtnRef.current?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(focusTimer);
      if (handlePointerMove) {
        window.removeEventListener('pointermove', handlePointerMove);
      }
      timelineRef.current?.kill();
      ctx.revert();
      if (!embedded) {
        document.body.style.overflow = previousOverflow;
        previousFocus?.focus?.({ preventScroll: true });
      }
    };
  }, [isOpen, embedded]);

  // ESC to close & Focus Trap
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

  return (
    <div
      ref={overlayRef}
      className="contact-monument-overlay"
      role={embedded ? "region" : "dialog"}
      aria-modal={embedded ? undefined : true}
      aria-labelledby="contact-main-heading"
    >
      {/* Full-Viewport Hokage Monument Background Artwork */}
      <div ref={bgRef} className="contact-background" aria-hidden="true" />
      <div className="contact-background-scrim" aria-hidden="true" />

      {/* Minimal Top-Right Close Button */}
      <button
        ref={closeBtnRef}
        type="button"
        className="contact-minimal-close-btn"
        onClick={() => triggerClose()}
        aria-label="Close Contact and return to Hidden Leaf Village"
        title="Close (ESC)"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>

      {/* Main Scrollable Viewport Container */}
      <div className="contact-scroll-container">
        <div className="contact-editorial-shell">
          {/* ================= TOP EDITORIAL INTRODUCTION ================= */}
          <header className="contact-hero-header">
            <div ref={eyebrowRef} className="contact-eyebrow-row">
              <span className="contact-eyebrow-dot" aria-hidden="true" />
              <span className="contact-eyebrow-text">LOCATION 06 / HOKAGE MONUMENT</span>
            </div>

            <h1 ref={headingRef} id="contact-main-heading" className="contact-hero-heading">
              Let&rsquo;s{' '}
              <span className="contact-heading-accent">
                Connect.
                <svg
                  className="contact-heading-brush"
                  viewBox="0 0 220 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8.5C58 3.2 142 2.5 217 6.8"
                    stroke="#A83D36"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p ref={subtitleRef} className="contact-hero-subtitle">
              {info ? (info.isAvailable ? info.availabilityText : 'Currently unavailable') : 'Every great mission starts with a conversation.'}
            </p>

            <p ref={descRef} className="contact-hero-description">
              {info?.description || <>I&rsquo;m always interested in meaningful opportunities, interesting projects, and new
              collaborations. Whether it&rsquo;s a software development role, an AI/ML project, or
              simply discussing an idea, feel free to reach out.</>}
            </p>
          </header>

          {/* ================= 4 CONTACT OPTIONS — TWO-COLUMN DIRECTORY ================= */}
          <main
            ref={gridRef}
            className="contact-directory-grid"
            aria-label="Contact Options"
          >
            {/* 1. EMAIL */}
            <article className="contact-directory-item is-primary-channel">
              <div className="contact-item-top">
                <span className="contact-item-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <polyline points="3 7 12 13 21 7" />
                  </svg>
                </span>
                <div className="contact-item-copy">
                  <h2 className="contact-item-title">Email</h2>
                  <p className="contact-item-desc">
                    For opportunities, collaborations, and conversations.
                  </p>
                </div>
              </div>

              <div className="contact-item-actions">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="contact-action-pill is-accent"
                >
                  <span>Send Email</span>
                  <span className="action-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>

                <button
                  type="button"
                  className={`contact-action-pill is-ghost ${copiedEmail ? 'is-copied' : ''}`}
                  onClick={handleCopyEmail}
                  aria-live="polite"
                >
                  {copiedEmail ? (
                    <>
                      <span>✓ Email Copied</span>
                    </>
                  ) : (
                    <>
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            </article>

            {/* 2. GITHUB */}
            <article className="contact-directory-item">
              <div className="contact-item-top">
                <span className="contact-item-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
                  </svg>
                </span>
                <div className="contact-item-copy">
                  <h2 className="contact-item-title">GitHub</h2>
                  <p className="contact-item-desc">
                    Explore my projects, experiments, and code.
                  </p>
                </div>
              </div>

              <div className="contact-item-actions">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-action-pill"
                >
                  <span>View GitHub</span>
                  <span className="action-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </article>

            {/* 3. LINKEDIN */}
            <article className="contact-directory-item">
              <div className="contact-item-top">
                <span className="contact-item-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </span>
                <div className="contact-item-copy">
                  <h2 className="contact-item-title">LinkedIn</h2>
                  <p className="contact-item-desc">
                    Connect professionally and follow my work.
                  </p>
                </div>
              </div>

              <div className="contact-item-actions">
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-action-pill"
                >
                  <span>Connect on LinkedIn</span>
                  <span className="action-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </article>

            {/* 4. RESUME */}
            <article className="contact-directory-item">
              <div className="contact-item-top">
                <span className="contact-item-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="13" y2="17" />
                  </svg>
                </span>
                <div className="contact-item-copy">
                  <h2 className="contact-item-title">Resume</h2>
                  <p className="contact-item-desc">
                    Explore my experience, skills, and selected work.
                  </p>
                </div>
              </div>

              <div className="contact-item-actions">
                <button
                  type="button"
                  className="contact-action-pill"
                  onClick={embedded ? onOpenResume : () => triggerClose(() => onOpenResume?.())}
                >
                  <span>View Resume</span>
                  <span className="action-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            </article>
          </main>

          {info && <details className="contact-inquiry"><summary>Send a message</summary><form onSubmit={sendMessage}>
            <label>Name<input name="name" required maxLength={100}/></label><label>Email<input type="email" name="email" required maxLength={200}/></label>
            <label>Message<textarea required name="message" maxLength={5000}/></label><button className="contact-action-pill" disabled={sending}>{sending?'Sending…':'Send message'}</button><span role="status">{delivery}</span>
          </form></details>}
          {/* ================= FOOTER BAR & VILLAGE ACTIONS ================= */}
          <footer ref={footerRef} className="contact-bottom-bar">
            <div className="contact-plaza-note">
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="#A83D36"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{info?.location || 'Stand before the Hokage Monument Plaza in Konoha.'}</span>
            </div>

            <div className="contact-footer-actions">
              {onTeleportToMonument && (
                <button
                  type="button"
                  className="contact-btn-teleport"
                  onClick={() => triggerClose(() => onTeleportToMonument())}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  <span>Teleport to Hokage Monument</span>
                </button>
              )}

              <button
                type="button"
                className="contact-btn-return"
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

