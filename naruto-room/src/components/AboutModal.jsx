import { published } from '../data/published';
import React, { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import './AboutModal.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ----------------------------------------------------------------------------
   Fallback content (used only when the CMS has not published a value)
   ---------------------------------------------------------------------------- */
const FACT_ICONS = [
  <svg key="edu" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 10L12 5 2 10l10 5 10-5z" />
    <path d="M6 12.5v4.5c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
  </svg>,
  <svg key="code" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="8 8 4 12 8 16" />
    <polyline points="16 8 20 12 16 16" />
    <line x1="13.5" y1="6" x2="10.5" y2="18" />
  </svg>,
  <svg key="pin" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>,
  <svg key="goal" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>,
];

const FALLBACK_FACTS = [
  { label: 'Education', title: 'B.Tech (AIML), DJSCE, Mumbai', desc: 'Sep 2025 – May 2029  |  CGPA: 9.57' },
  { label: 'Focus', title: 'Full-Stack Development, Web, AI/ML, 3D Web', desc: '' },
  { label: 'Based in', title: 'Mumbai, India', desc: '' },
  { label: 'Current goal', title: 'Build impactful products and gain industry experience.', desc: '' },
];

const FALLBACK_BIO = [
  'I’m Ashutosh Kadam, a B.Tech (AIML) student at DJSCE, Mumbai, who builds full-stack applications and interactive digital experiences.',
  'I love turning ideas into working products — blending clean engineering, modern web technologies, and a curiosity for AI/ML and 3D on the web.',
];

const FALLBACK_ANIME = [
  { title: 'Naruto', tags: 'Perseverance • Growth • Never Give Up', imageUrl: '/about/anime-naruto.jpg' },
  { title: 'One Piece', tags: 'Freedom • Friendship • Big Dreams', imageUrl: '/about/anime-onepiece.jpg' },
  { title: 'Attack on Titan', tags: 'Sacrifice • Perspective • Humanity', imageUrl: '/about/anime-aot.jpg' },
];

const FALLBACK_FOOTBALL = {
  title: 'Football',
  description: 'More than a sport — it’s where I learn discipline, teamwork, and quick decision-making.',
  position: 'Centre Midfielder',
  imageUrl: '/about/football.jpg',
};

function LeafMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 17c3.5-1 6-3.5 7-7 1 2 1 4.5-.5 6.5C9 18.5 6 18.5 4 17z" />
      <path d="M12.5 9.5c1.6-1.4 4.2-1.8 6.5-.8-1 2.6-3.4 4.1-6 4" />
      <circle cx="13.6" cy="13.6" r="2.2" />
      <path d="M13.6 11.4c1.6 0 2.9 1.2 2.9 2.7" />
    </svg>
  );
}

export default function AboutModal({ embedded = false, isOpen, onClose, onOpenResume, onOpenContact }) {
  const about = published?.profile?.about;
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);
  const isClosingRef = useRef(false);

  const facts = about?.snapshotItems?.length ? about.snapshotItems : FALLBACK_FACTS;
  const bio = about?.bioParagraphs?.length ? about.bioParagraphs : FALLBACK_BIO;
  const anime = (about?.animeList?.filter((a) => a?.title)?.length ? about.animeList.filter((a) => a?.title) : FALLBACK_ANIME).slice(0, 3);
  const football = { ...FALLBACK_FOOTBALL, ...Object.fromEntries(Object.entries(about?.football || {}).filter(([, v]) => v)) };
  const headline = about?.headline || 'The shinobi behind the code.';
  const badge = about?.badge ? `02 — ${about.badge.split('•').pop().trim()}` : '02 — Personal Dossier';

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const triggerClose = useCallback(
    (afterCloseCallback) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      const finish = () => {
        isClosingRef.current = false;
        if (afterCloseCallback) afterCloseCallback();
        else onClose?.();
      };
      if (prefersReducedMotion() || !overlayRef.current) return finish();
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.32, ease: 'power2.inOut', onComplete: finish });
    },
    [onClose]
  );

  /* --------------------------------------------------------------------------
     Modal behaviour (3D village only): body scroll lock + focus restore
     -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen || embedded) return undefined;
    isClosingRef.current = false;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = requestAnimationFrame(() => closeBtnRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(focusTimer);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, [isOpen, embedded]);

  /* --------------------------------------------------------------------------
     Cinematic choreography
     One hero timeline (ABOUT rises → portrait descends → brush → copy → facts),
     light scrubbed parallax afterwards, and once-only reveals for Anime/Football.
     -------------------------------------------------------------------------- */
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const root = overlayRef.current;
    if (!root) return undefined;
    const scroller = embedded
      ? root.closest('.portfolio-2d-wrapper')
      : root.querySelector('.about-editorial-scroll-container');
    const q = gsap.utils.selector(root);
    const hero = root.querySelector('.ab-hero');
    const mm = gsap.matchMedia(root);

    mm.add(
      {
        desktop: '(min-width: 761px) and (prefers-reduced-motion: no-preference)',
        mobile: '(max-width: 760px) and (prefers-reduced-motion: no-preference)',
      },
      (ctx) => {
        const { desktop } = ctx.conditions;
        let cancelled = false;
        let splits = [];
        const st = (trigger, start = 'top 80%') => ({ trigger, scroller, start, toggleActions: 'play none none none' });

        // ---- Initial (pre-reveal) states, set before first paint -------------
        const textBlocks = q('.ab-headline, .ab-copy p');
        gsap.set(q('.ab-word'), { yPercent: 112 });
        gsap.set(q('.ab-portrait'), { yPercent: desktop ? -120 : -70, scale: 1.05, autoAlpha: 0 });
        gsap.set(q('.ab-portrait-frame, .ab-katakana'), { autoAlpha: 0 });
        gsap.set(q('.ab-brush'), { clipPath: 'inset(0% 100% 0% 0%)' });
        gsap.set(q('.ab-eyebrow, .ab-headline-brush'), { autoAlpha: 0, y: 14 });
        gsap.set(textBlocks, { autoAlpha: 0 });
        gsap.set(q('.ab-fact'), { autoAlpha: 0, y: 22 });
        gsap.set(q('.ab-divider-line'), { scaleX: 0 });
        gsap.set(q('.ab-divider-mark'), { autoAlpha: 0, scale: 0.6 });
        if (!embedded) gsap.set(root, { opacity: 0 });

        // ---- Hero timeline (built once fonts are ready so lines split correctly)
        const buildHero = () => {
          if (cancelled) return;
          ctx.add(() => {
            splits = Array.from(textBlocks, (el) =>
              SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ab-line' })
            );
            gsap.set(textBlocks, { autoAlpha: 1 });
            const headLines = splits[0]?.lines || [];
            const copyLines = splits.slice(1).flatMap((s) => s.lines);

            const tl = gsap.timeline({
              paused: true,
              defaults: { ease: 'power3.out' },
              onComplete: () => {
                // Restore the original, selectable DOM once everything has settled.
                splits.forEach((s) => s.revert());
                splits = [];
              },
            });

            if (!embedded) tl.to(root, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0);

            tl.addLabel('word', embedded ? 0 : 0.1)
              // PHASE 1 — giant ABOUT rises through its mask, with a soft settle
              .to(q('.ab-word'), { yPercent: -2.5, duration: 1.15, ease: 'expo.out' }, 'word')
              .to(q('.ab-word'), { yPercent: 0, duration: 0.5, ease: 'sine.inOut' }, 'word+=1.05')
              // PHASE 2 — portrait descends from above, in front of the type
              .addLabel('photo', 'word+=0.3')
              .to(q('.ab-portrait'), { yPercent: 0, scale: 1, duration: 1.4, ease: 'power3.out' }, 'photo')
              .to(q('.ab-portrait'), { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 'photo')
              .fromTo(
                q('.ab-portrait-frame'),
                { autoAlpha: 0, x: -8, y: 8 },
                { autoAlpha: 0.75, x: 0, y: 0, duration: 0.7, ease: 'power2.out' },
                'photo+=0.95'
              )
              .to(q('.ab-katakana'), { autoAlpha: 1, duration: 0.5 }, 'photo+=1.05')
              // PHASE 3 — red brushstroke sweeps left → right
              .addLabel('brush', 'word+=1.2')
              .to(q('.ab-brush'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.65, ease: 'power2.inOut' }, 'brush')
              .to(q('.ab-divider-line'), { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, 'brush+=0.1')
              .to(q('.ab-divider-mark'), { autoAlpha: 1, scale: 1, duration: 0.5 }, 'brush+=0.35')
              // PHASE 4 — editorial copy, line by line
              .addLabel('copy', 'word+=1.3')
              .to(q('.ab-eyebrow'), { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 'copy')
              .fromTo(headLines, { yPercent: 105 }, { yPercent: 0, duration: 0.8, stagger: 0.12 }, 'copy+=0.05')
              .to(q('.ab-headline-brush'), { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 'copy+=0.45')
              .fromTo(
                copyLines,
                { autoAlpha: 0, y: 22 },
                { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power2.out' },
                'copy+=0.25'
              )
              // Right column facts follow with a short stagger
              .to(q('.ab-fact'), { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.13, ease: 'power2.out' }, 'word+=1.6');

            if (embedded) {
              ScrollTrigger.create({ trigger: hero, scroller, start: 'top 72%', once: true, onEnter: () => tl.play() });
            } else {
              tl.play();
            }
          });
        };
        const fontsReady = document.fonts?.ready ?? Promise.resolve();
        fontsReady.then(buildHero, buildHero);

        // ---- Scroll-driven parallax as the hero leaves -----------------------
        const scrub = { trigger: hero, scroller, start: 'top top', end: 'bottom top', scrub: 0.6 };
        gsap.to(q('.ab-word-layer'), { yPercent: desktop ? 22 : 10, ease: 'none', scrollTrigger: scrub });
        gsap.to(q('.ab-photo-col'), { y: desktop ? -46 : -18, ease: 'none', scrollTrigger: { ...scrub } });
        if (!embedded) gsap.to(q('.about-background'), { yPercent: 5, ease: 'none', scrollTrigger: { ...scrub } });

        // ---- My Top 3 Anime ---------------------------------------------------
        const animeSection = root.querySelector('.ab-anime');
        const cards = q('.ab-anime-card');
        gsap.set(q('.ab-anime-title'), { yPercent: 110 });
        gsap.set(q('.ab-anime-rule'), { scaleX: 0 });
        gsap.set(q('.ab-anime-kicker'), { autoAlpha: 0, y: 10 });
        gsap.set(cards, { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.set(q('.ab-anime-media'), { scale: 1.08 });
        gsap.set(q('.ab-anime-caption > *'), { autoAlpha: 0, yPercent: 60 });

        const head = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: st(animeSection, 'top 80%') });
        head
          .to(q('.ab-anime-title'), { yPercent: 0, duration: 0.85 })
          .to(q('.ab-anime-rule'), { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, '<0.15')
          .to(q('.ab-anime-kicker'), { autoAlpha: 1, y: 0, duration: 0.6 }, '<0.25');

        const revealCard = (card, tl, at) => {
          tl.to(card, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85 }, at)
            .to(card.querySelector('.ab-anime-media'), { scale: 1, duration: 1.1 }, '<')
            .to(card.querySelectorAll('.ab-anime-caption > *'), { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: 0.08 }, '<0.35');
        };
        if (desktop) {
          // Left → right as one choreographed row
          const row = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: st(root.querySelector('.ab-anime-grid'), 'top 82%') });
          cards.forEach((card, i) => revealCard(card, row, i * 0.15));
        } else {
          // On mobile, the 3 cards sit side-by-side in one compact row — reveal together with a tight stagger
          const row = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: st(root.querySelector('.ab-anime-grid'), 'top 85%') });
          cards.forEach((card, i) => revealCard(card, row, i * 0.12));
        }

        // ---- Football -----------------------------------------------------------
        const fb = root.querySelector('.ab-football');
        gsap.set(q('.ab-fb-media'), { clipPath: 'inset(0% 100% 0% 0%)' });
        gsap.set(q('.ab-fb-media img'), { scale: 1.12 });
        gsap.set(q('.ab-fb-title'), { yPercent: 110 });
        gsap.set(q('.ab-fb-pitch .pitch-line'), { strokeDashoffset: 1 });
        gsap.set(q('.ab-fb-role'), { autoAlpha: 0, scale: 0.92 });
        gsap.set(q('.ab-fb-text, .ab-fb-icon'), { autoAlpha: 0, y: 18 });
        gsap
          .timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: st(fb, desktop ? 'top 80%' : 'top 86%') })
          .to(q('.ab-fb-media'), { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.05, ease: 'power3.inOut' }, 0)
          .to(q('.ab-fb-media img'), { scale: 1, duration: 1.4 }, 0)
          .to(q('.ab-fb-icon'), { autoAlpha: 1, y: 0, duration: 0.5 }, 0.2)
          .to(q('.ab-fb-title'), { yPercent: 0, duration: 0.9 }, 0.25)
          .to(q('.ab-fb-pitch .pitch-line'), { strokeDashoffset: 0, duration: 1.3, stagger: 0.12, ease: 'power2.inOut' }, 0.35)
          .to(q('.ab-fb-role'), { autoAlpha: 1, scale: 1, duration: 0.65 }, 0.75)
          .to(q('.ab-fb-text'), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 0.9);

        // ---- Closing actions ---------------------------------------------------------
        gsap.from(q('.about-bottom-bar'), { autoAlpha: 0, y: 16, duration: 0.6, ease: 'power2.out', scrollTrigger: st(q('.about-bottom-bar')[0], 'top 92%') });

        return () => {
          cancelled = true;
          splits.forEach((s) => s.revert());
        };
      }
    );

    // Recalculate trigger positions once artwork has decoded.
    let raf = 0;
    const refresh = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const pending = Array.from(root.querySelectorAll('img')).filter((img) => !img.complete);
    pending.forEach((img) => img.addEventListener('load', refresh, { once: true }));

    return () => {
      cancelAnimationFrame(raf);
      pending.forEach((img) => img.removeEventListener('load', refresh));
      mm.revert();
    };
  }, [isOpen, embedded]);

  // ESC key to close and focus trap (3D modal only)
  useEffect(() => {
    if (!isOpen || embedded) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        triggerClose();
        return;
      }
      if (event.key === 'Tab' && overlayRef.current) {
        const focusable = [
          ...overlayRef.current.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]'),
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
      className="about-editorial-overlay"
      role={embedded ? 'region' : 'dialog'}
      aria-modal={embedded ? undefined : true}
      aria-labelledby="about-main-heading"
    >
      <div className="about-background" aria-hidden="true" />
      <div className="about-background-scrim" aria-hidden="true" />

      {!embedded && (
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
      )}

      <div className="about-editorial-scroll-container">
        <div className="about-editorial-shell">
          {/* ================= HERO — ABOUT × PORTRAIT ================= */}
          <section className="ab-hero" aria-labelledby="about-main-heading">
            <div className="ab-hero-grid">
              <div className="ab-head">
                <p className="ab-eyebrow">
                  <span>{badge}</span>
                  <span className="ab-eyebrow-rule" aria-hidden="true" />
                </p>
                <h1 id="about-main-heading" className="ab-headline">{headline}</h1>
                <svg className="ab-headline-brush" viewBox="0 0 160 10" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 7C40 3 104 2 158 5" stroke="#A63C38" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </div>

              <div className="ab-copy">
                {bio.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="ab-photo-col">
                <figure className="ab-portrait-stage">
                  <div className="ab-portrait-frame" aria-hidden="true" />
                  <div className="ab-katakana" aria-hidden="true">
                    {'アシュトシュ'.split('').map((c, i) => (
                      <span key={i}>{c}</span>
                    ))}
                  </div>
                  <div className="ab-portrait">
                    <img
                      src={about?.photoUrl || '/about/ashutosh-photo.jpg'}
                      alt={`Portrait of ${about?.title || 'Ashutosh Kadam'}`}
                      draggable={false}
                      decoding="async"
                    />
                  </div>
                </figure>
              </div>

              <ul className="ab-facts" aria-label="Personal details">
                {facts.map((f, i) => (
                  <li key={f._id || i} className="ab-fact">
                    <span className="ab-fact-icon">{FACT_ICONS[i % FACT_ICONS.length]}</span>
                    <div>
                      <span className="ab-fact-label">{f.label}</span>
                      <p className="ab-fact-title">{f.title}</p>
                      {f.desc && <p className="ab-fact-desc">{f.desc}</p>}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="ab-word-layer" aria-hidden="true">
                <div className="ab-word-mask">
                  <span className="ab-word">ABOUT</span>
                </div>
                <svg className="ab-brush" viewBox="0 0 420 34" preserveAspectRatio="none">
                  <path
                    d="M6 22C70 12 160 8 250 10c58 1 118 5 164 3-40 6-108 10-176 11-80 1-156 2-232-2z"
                    fill="#A63C38"
                    opacity="0.9"
                  />
                  <path d="M40 26c90-5 190-7 300-4" stroke="#7d2a27" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
                </svg>
              </div>

              <div className="ab-divider" aria-hidden="true">
                <span className="ab-divider-line" />
                <LeafMark className="ab-divider-mark" />
                <span className="ab-divider-line is-right" />
              </div>
            </div>
          </section>

          {/* ================= MY TOP 3 ANIME ================= */}
          <section className="ab-anime" aria-labelledby="ab-anime-heading">
            <header className="ab-section-head">
              <svg className="ab-shuriken" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="1.8" fill="currentColor" />
              </svg>
              <span className="ab-mask">
                <h2 id="ab-anime-heading" className="ab-anime-title">My Top 3 Anime</h2>
              </span>
              <span className="ab-anime-rule" aria-hidden="true" />
              <span className="ab-anime-kicker">The series that shaped my mindset</span>
            </header>

            <div className="ab-anime-grid">
              {anime.map((a, i) => (
                <article key={a._id || i} className="ab-anime-card">
                  <div className="ab-anime-media">
                    <img src={a.imageUrl || FALLBACK_ANIME[i]?.imageUrl} alt={`${a.title} poster`} loading="lazy" decoding="async" />
                  </div>
                  <div className="ab-anime-caption">
                    <h3 className="ab-anime-title-heading">
                      <span className="ab-anime-title-full">{a.title}</span>
                      <span className="ab-anime-title-short">
                        {a.title === 'Attack on Titan' ? 'AOT' : a.title}
                      </span>
                    </h3>
                    {a.tags && <p className="ab-anime-tags">{a.tags}</p>}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ================= FOOTBALL ================= */}
          <section className="ab-football" aria-labelledby="ab-football-heading">
            <div className="ab-fb-media">
              <img src={football.imageUrl} alt="Football resting on a floodlit pitch" loading="lazy" decoding="async" />
            </div>
            <svg className="ab-fb-pitch" viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
              <path className="pitch-line" pathLength="1" d="M300 0V160" />
              <circle className="pitch-line" pathLength="1" cx="300" cy="80" r="46" />
              <path className="pitch-line" pathLength="1" d="M600 30H520V130H600" />
              <path className="pitch-line" pathLength="1" d="M0 30H80V130H0" />
            </svg>
            <div className="ab-fb-body">
              <svg className="ab-fb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <polygon points="12 7.5 15.2 9.8 14 13.6 10 13.6 8.8 9.8" />
                <line x1="12" y1="3" x2="12" y2="7.5" />
                <line x1="15.2" y1="9.8" x2="20.4" y2="8.8" />
                <line x1="14" y1="13.6" x2="17.5" y2="18.8" />
                <line x1="10" y1="13.6" x2="6.5" y2="18.8" />
                <line x1="8.8" y1="9.8" x2="3.6" y2="8.8" />
              </svg>
              <div className="ab-fb-copy">
                <span className="ab-mask">
                  <h2 id="ab-football-heading" className="ab-fb-title">{football.title}</h2>
                </span>
                <p className="ab-fb-text">{football.description}</p>
              </div>
            </div>
            <div className="ab-fb-role-wrap">
              <span className="ab-fb-text ab-fb-role-kicker">Playing role</span>
              <p className="ab-fb-role">
                <svg viewBox="0 0 24 16" width="22" height="15" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                  <rect x="1" y="1" width="22" height="14" rx="1" />
                  <line x1="12" y1="1" x2="12" y2="15" />
                  <circle cx="12" cy="8" r="2.6" />
                  <path d="M1 5h3v6H1M23 5h-3v6h3" />
                </svg>
                <span>{football.position}</span>
              </p>
            </div>
          </section>

          {/* ================= CLOSING ACTIONS ================= */}
          <footer className="about-bottom-bar">
            <blockquote className="about-pull-quote">
              <span className="quote-mark" aria-hidden="true">&ldquo;</span>
              <p>
                Beyond code, you&rsquo;ll probably find me watching anime, playing football, trying new food spots,
                or planning my next creative project.&rdquo;
              </p>
            </blockquote>

            <div className="about-bottom-actions">
              <button
                type="button"
                className="about-btn-resume"
                onClick={embedded ? onOpenResume : () => triggerClose(() => onOpenResume?.())}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="13 6 19 12 13 18" />
                  </svg>
                </button>
              )}

              {!embedded && (
                <button type="button" className="about-btn-return" onClick={() => triggerClose()}>
                  <span>Return to Village</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="13 6 19 12 13 18" />
                  </svg>
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
