import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { flushSync } from 'react-dom';
import { PageTurnSurface } from './PageTurnSurface';
import { loadProjectMenu } from '../data/projectMenu';
import { PageNavigation, ProjectSpread } from './ProjectSpread';
import { ADMIN_PROJECTS_STORAGE_KEY } from '../config/locations';
import './RamenBookModal.css';

const phoneLayout = () => matchMedia('(max-width: 860px)').matches;
const pageCapacity = () => phoneLayout() ? 2 : 3;

export default function RamenBookModal({ isOpen, onClose, onFastTravel, initialProjectId = null, embedded = false, onVillage }) {
  const [perPage,setPerPage] = useState(pageCapacity);
  const [bookState, setBookState] = useState('closed');
  const [currentSpread, setCurrentSpread] = useState(1);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const [busy, setBusy] = useState(false);
  const [turnNotice, setTurnNotice] = useState('');
  const [projects, setProjects] = useState(loadProjectMenu);
  const bookContainerRef = useRef(null);
  const frontCoverRef = useRef(null);
  const interiorSpreadRef = useRef(null);

  const turningLeafRef = useRef(null);
  const dialogRef = useRef(null);
  const timelineRef = useRef(null);
  const surfaceRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const generationRef = useRef(0);
  const touchRef = useRef(null);
  const afterCloseRef = useRef(null);

  useEffect(() => {
    const handleAdminProjectUpdate = event => {
      if (event.type !== 'storage' || !event.key || event.key === ADMIN_PROJECTS_STORAGE_KEY) setProjects(loadProjectMenu());
    };
    window.addEventListener('storage', handleAdminProjectUpdate);
    window.addEventListener('shinobi-projects-updated', handleAdminProjectUpdate);
    return () => {
      window.removeEventListener('storage', handleAdminProjectUpdate);
      window.removeEventListener('shinobi-projects-updated', handleAdminProjectUpdate);
    };
  }, []);

  const readingPosition = useRef(null);
  useLayoutEffect(() => {
    readingPosition.current = { currentSpread, selectedProjectIndex, perPage, count: projects.length };
  }, [currentSpread, selectedProjectIndex, perPage, projects.length]);

  useEffect(() => {
    const media = matchMedia('(max-width:860px)');
    const resize = () => {
      // Finish a moving leaf before mapping its settled project to the new spread.
      if (isTransitioningRef.current) timelineRef.current?.progress(1);
      const position = readingPosition.current;
      const capacity = pageCapacity();
      const special = position.currentSpread > Math.max(1, Math.ceil(position.count / position.perPage));
      setCurrentSpread(special ? Math.max(1, Math.ceil(position.count / capacity)) + 1 :
        Math.floor(position.selectedProjectIndex / capacity) + 1);
      setPerPage(capacity);
    };
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    const book = bookContainerRef.current;
    if (!book || !isOpen) return;
    let width = book.clientWidth;
    let height = book.clientHeight;
    const observer = new ResizeObserver(() => {
      if ((width !== book.clientWidth || height !== book.clientHeight) && surfaceRef.current?.panels.length) {
        timelineRef.current?.progress(1);
      }
      width = book.clientWidth;
      height = book.clientHeight;
    });
    observer.observe(book);
    return () => observer.disconnect();
  }, [isOpen]);
  const menuPages = Math.max(1, Math.ceil(projects.length / perPage));
  const totalSpreads = menuPages + 1;
  const currentProject = projects[selectedProjectIndex];
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileView = phoneLayout;
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

  function prepareInnerCover(container, page) {
    if (!container || !page) return;
    const face = container.querySelector('.cover-inner-face');
    if (!face) return;
    const copy = page.cloneNode(true);
    copy.removeAttribute('tabindex');
    face.replaceChildren(copy);
  }

  useEffect(() => {
    if (!isOpen) return;
    const generation = generationRef;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (!embedded) document.body.style.overflow = 'hidden';
    // Reset the external animation session when the modal is reopened.
    // eslint-disable-next-line react/set-state-in-effect
    setBookState('closed');
    const initialIndex = Math.max(0, projects.findIndex(project => project.id === initialProjectId));
    setCurrentSpread(1 + Math.floor(initialIndex / pageCapacity()));
    setSelectedProjectIndex(initialIndex);
    setIsMobileDetailView(false);
    unlock();

    const container = bookContainerRef.current;
    const cover = frontCoverRef.current;
    if (container && cover) {
      gsap.set(container, {
        xPercent: 0,
        y: 0,
        '--open-progress': 0,
      });
      gsap.set(cover, {
        rotateY: 0,
        z: 0,
        force3D: true,
      });
    }

    const focusFrame = requestAnimationFrame(() => {
      if (frontCoverRef.current && interiorSpreadRef.current) {
        prepareInnerCover(
          frontCoverRef.current,
          interiorSpreadRef.current.querySelector('.is-current .page-left')
        );
      }
      if (!embedded) dialogRef.current?.querySelector('.cover-open-trigger-btn')?.focus({ preventScroll: true });
    });

    return () => {
      generation.current++;
      cancelAnimationFrame(focusFrame);
      timelineRef.current?.kill();
      surfaceRef.current?.dispose();
      surfaceRef.current = null;
      if (!embedded) {
        document.body.style.overflow = previousOverflow;
        previousFocus?.focus?.({ preventScroll: true });
      }
    };
  }, [isOpen, initialProjectId, projects, unlock, embedded]);

  const handleOpenBook = useCallback(() => {
    if (bookState !== 'closed' || !lock()) return;
    const container = bookContainerRef.current;
    const cover = frontCoverRef.current;
    const leftPage = interiorSpreadRef.current?.querySelector('.is-current .page-left');

    if (cover && leftPage && !cover.querySelector('.cover-inner-face .book-page')) {
      prepareInnerCover(cover, leftPage);
    }

    setBookState('opening');
    const isMob = mobileView();
    const isReduced = reducedMotion();
    const duration = isReduced ? 0.01 : isMob ? 0.85 : 1.65;

    timelineRef.current?.kill();
    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        setBookState('open');
        unlock();
        if (!embedded || phoneLayout()) requestAnimationFrame(() => {
          const page = interiorSpreadRef.current?.querySelector('.is-current .page-left');
          (page?.querySelector('.menu-dish-item') || page)?.focus({preventScroll:true});
        });
      },
    });
    timelineRef.current = tl;

    if (isMob) {
      tl.to(
        cover,
        {
          rotateY: -180,
          duration,
          ease: 'power3.inOut',
          force3D: true,
        },
        0
      ).to(
        container,
        {
          '--open-progress': 1,
          duration,
          ease: 'power3.inOut',
        },
        0
      );
    } else {
      // Simultaneous 3D cover swing, container centering, and subtle physical lift arc (no initial delay)
      tl.to(
        cover,
        {
          rotateY: -180,
          duration,
          ease: 'power3.inOut',
          force3D: true,
        },
        0
      )
        .to(
          container,
          {
            xPercent: 0,
            '--open-progress': 1,
            duration,
            ease: 'power3.inOut',
            force3D: true,
          },
          0
        )
        .to(
          container,
          {
            keyframes: [
              { y: isReduced ? 0 : -6, duration: duration * 0.45, ease: 'sine.out' },
              { y: 0, duration: duration * 0.55, ease: 'sine.inOut' },
            ],
          },
          0
        );
    }
  }, [bookState, lock, unlock, embedded]);

  const autoOpened = useRef(false);
  useEffect(() => {
    if (!embedded || autoOpened.current || !isOpen || (phoneLayout() && !initialProjectId)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || autoOpened.current) return;
      autoOpened.current = true;
      observer.disconnect();
      if (!phoneLayout() || initialProjectId) handleOpenBook();
    }, { threshold: 0.35 });
    observer.observe(dialogRef.current);
    return () => observer.disconnect();
  }, [embedded, isOpen, handleOpenBook, initialProjectId]);

  const handleCloseBook = useCallback(() => {
    if (isTransitioningRef.current) return;
    if (bookState === 'closed') {
      if (!embedded) onClose();
      return;
    }
    if (!lock()) return;

    const container = bookContainerRef.current;
    const cover = frontCoverRef.current;
    prepareInnerCover(
      cover,
      interiorSpreadRef.current?.querySelector(`[data-spread="${currentSpread}"] .page-left`)
    );

    setBookState('closing');
    const isMob = mobileView();
    const isReduced = reducedMotion();
    const duration = isReduced ? 0.01 : isMob ? 0.65 : 0.88;

    timelineRef.current?.kill();
    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        unlock();
        setBookState('closed');
        const action = afterCloseRef.current;
        afterCloseRef.current = null;
        if (!embedded) onClose();
        else requestAnimationFrame(()=>cover.querySelector('.cover-open-trigger-btn')?.focus({preventScroll:true}));
        action?.();
      },
    });
    timelineRef.current = tl;

    if (isMob) {
      tl.to(
        cover,
        {
          rotateY: 0,
          duration,
          ease: 'power3.inOut',
          force3D: true,
        },
        0
      ).to(
        container,
        {
          '--open-progress': 0,
          duration,
          ease: 'power3.inOut',
        },
        0
      );
    } else {
      tl.to(
        cover,
        {
          rotateY: 0,
          duration,
          ease: 'power3.inOut',
          force3D: true,
        },
        0
      )
        .to(
          container,
          {
            xPercent: 0,
            '--open-progress': 0,
            duration,
            ease: 'power3.inOut',
            force3D: true,
          },
          0
        )
        .to(
          container,
          {
            keyframes: [
              { y: isReduced ? 0 : -4, duration: duration * 0.45, ease: 'sine.out' },
              { y: 0, duration: duration * 0.55, ease: 'sine.inOut' },
            ],
          },
          0
        );
    }
  }, [bookState, currentSpread, onClose, lock, unlock, embedded]);

  // The resting DOM stays mounted. Only the moving sheet is copied into the mesh.
  const turnMobile = useCallback((direction, page, detail, index) => {
    if (bookState !== 'open' || !lock()) return;
    const root = interiorSpreadRef.current;
    const face = (number, right) => root.querySelector(`[data-spread="${number}"] .page-${right ? 'right' : 'left'}`);
    const departing = face(currentSpread, isMobileDetailView);
    const target = face(page, detail);
    const commit = () => {
      setCurrentSpread(page);
      setSelectedProjectIndex(index);
      setIsMobileDetailView(detail);
    };
    const finish = () => {
      flushSync(() => { commit(); setBookState('open'); unlock(); });
      surfaceRef.current?.dispose();
      turningLeafRef.current.style.visibility = 'hidden';
      const control = detail ? target.querySelector('.mobile-back-action-btn') : target;
      control?.focus({preventScroll:true});
    };
    if (reducedMotion()) { finish(); return; }
    try {
      const surface = surfaceRef.current ??= new PageTurnSurface(turningLeafRef.current);
      // A forward leaf leaves the new page underneath. The inverse lays the new leaf over the old page.
      surface.prepare(direction > 0 ? departing : target, null, true, direction);
      flushSync(() => { if (direction > 0) commit(); setBookState('turning-mobile'); });
      turningLeafRef.current.style.visibility = 'visible';
      const motion = {progress: direction > 0 ? 0 : 1};
      timelineRef.current = gsap.to(motion, {progress:direction > 0 ? 1 : 0, duration:.72, ease:'sine.inOut',
        onUpdate:()=>surface.render(motion.progress), onComplete:finish});
    } catch {
      finish();
    }
  }, [bookState, currentSpread, isMobileDetailView, lock, unlock]);

  const handleSelectProject = useCallback(index => {
    if (phoneLayout()) { turnMobile(1,currentSpread,true,index); return; }
    if (bookState !== 'open' || currentSpread > menuPages || !lock()) return;
    if (index === selectedProjectIndex) {
      setIsMobileDetailView(true);
      requestAnimationFrame(() => { if (mobileView()) interiorSpreadRef.current?.querySelector('.is-current .mobile-back-action-btn')?.focus({ preventScroll: true }); });
      unlock();
      return;
    }
    const node = interiorSpreadRef.current.querySelector('.is-current .project-detail');
    timelineRef.current = gsap.timeline({ onComplete: () => { unlock(); if (mobileView()) interiorSpreadRef.current.querySelector('.is-current .mobile-back-action-btn')?.focus({ preventScroll: true }); } });
    timelineRef.current.to(node, { opacity: 0, filter: 'blur(4px)', y: -8, duration: reducedMotion() ? 0 : 0.17 })
      .call(() => { flushSync(() => { setSelectedProjectIndex(index); setIsMobileDetailView(true); }); node.scrollTop = 0; })
      .set(node, { y: 8 })
      .to(node, { opacity: 1, filter: 'blur(0px)', y: 0, duration: reducedMotion() ? 0.01 : 0.3, ease: 'power2.out' });
  }, [bookState, currentSpread, menuPages, selectedProjectIndex, isMobileDetailView, turnMobile, lock, unlock]);

  const handleTurnSpread = useCallback(direction => {
    const nextSpread = currentSpread + direction;
    if (nextSpread < 1 || nextSpread > totalSpreads) return;
    if (phoneLayout()) { turnMobile(direction,nextSpread,false,Math.max(0, Math.min(projects.length-1,(nextSpread-1)*perPage))); return; }
    if (bookState !== 'open' || !lock()) return;
    const generation = generationRef.current;
    const mobile = mobileView();
    const finish = () => {
      if (generation !== generationRef.current) return;
      // Commit the resting spread before removing its animated surface.
      flushSync(() => {
        setCurrentSpread(nextSpread);
        if (nextSpread <= menuPages) setSelectedProjectIndex((nextSpread - 1) * perPage);
        setIsMobileDetailView(false);
        setBookState('open');
      });
      turningLeafRef.current.style.visibility = 'hidden';
      surfaceRef.current?.dispose();
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
      surfaceRef.current.prepare(direction > 0 ? from : to, direction > 0 ? to : from, mobile, direction);
      if (generation !== generationRef.current) return;
      flushSync(() => setBookState(direction > 0 ? 'turning-forward' : 'turning-backward'));
      turningLeafRef.current.style.visibility = 'visible';
      const motion = { progress: direction > 0 ? 0 : 1 };
      timelineRef.current = gsap.timeline({ onComplete: finish }).to(motion, {
        progress: direction > 0 ? 1 : 0, duration: 1.25, ease: 'sine.inOut',
        onUpdate: () => surfaceRef.current?.render(motion.progress),
      });
    } catch (error) {
      if (generation !== generationRef.current) return;
      // A view torn down during preparation can still settle on its destination.
      console.warn('Book page rendering unavailable:', error.message);
      setTurnNotice('Page animation is unavailable on this device. Reading controls remain available.');
      surfaceRef.current?.dispose();
      surfaceRef.current = null;
      finish();
    }
  }, [bookState, currentSpread, totalSpreads, menuPages, isMobileDetailView, perPage, projects.length, turnMobile, lock, unlock]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = event => {
      if (embedded && !dialogRef.current?.contains(event.target)) return;
      if (!embedded && event.key === 'Tab') {
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
        handleCloseBook();
      } else if (bookState === 'open' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        if (event.target.closest?.('.project-detail') && ['ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const first = (currentSpread - 1) * perPage;
        const count = Math.min(perPage, projects.length - first);
        if (count > 0 && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
          const offset = event.key === 'ArrowUp' ? -1 : 1;
          handleSelectProject(first + (selectedProjectIndex - first + count + offset) % count);
        }
        if (event.key === 'ArrowRight') handleTurnSpread(1);
        if (event.key === 'ArrowLeft') handleTurnSpread(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [embedded, isOpen, bookState, currentSpread, isMobileDetailView, selectedProjectIndex, projects.length, handleCloseBook, handleSelectProject, handleTurnSpread]);

  const handleTouchEnd = event => {
    if (!touchRef.current || !mobileView() || busy) return;
    const end = event.changedTouches[0];
    const dx = end.clientX - touchRef.current.x;
    const dy = end.clientY - touchRef.current.y;
    touchRef.current = null;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) handleTurnSpread(dx < 0 ? 1 : -1);
  };

  function spreadClass(number) {
    const classes = ['book-spread'];
    if (currentSpread === number) classes.push('is-current');
    if ((bookState === 'turning-forward' && number === currentSpread + 1) ||
        (bookState === 'turning-backward' && number === currentSpread - 1)) classes.push('is-target');
    return classes.join(' ');
  }
  const navigation = number => <PageNavigation number={number} total={totalSpreads} onTurn={handleTurnSpread} busy={busy}/>;

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className={embedded ? "ramen-book-overlay ramen-inline" : "ramen-book-overlay"}
      aria-busy={busy}
      onClick={embedded ? undefined : handleCloseBook}
      role={embedded ? "region" : "dialog"}
      aria-modal={embedded ? undefined : true}
      aria-label="Ichiraku Ramen Projects Menu"
    >
      <div className="ichiraku-scene" aria-hidden="true"><div className="ichiraku-atmosphere">
        <i className="counter-steam"/><i className="counter-lantern"/><i className="counter-leaf"/>
      </div></div>

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
            aria-label={embedded ? "Close book" : "Close menu"}
            hidden={embedded && bookState === "closed"}
          >
            <span className="close-label-text">{embedded ? 'Close book' : 'Projects Menu'}</span>
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
        onTouchCancel={() => {touchRef.current=null}}
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
              <div aria-hidden="true" className="cover-landscape"/>
              <div className="corner-accent top-left"/>
              <div className="corner-accent top-right"/>
              <div className="corner-accent bottom-left"/>
              <div className="corner-accent bottom-right"/>

              <div className="cover-badge-top">
                <span className="badge-flourish">―</span>
                <span>木ノ葉隠れの里 · 創業</span>
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
                    <span className="open-arrow">→</span>
                  </button>
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
          {Array.from({ length: menuPages }, (_, index) => {
            const number = index + 1;
            const entries = projects.slice(index * perPage, number * perPage);
            return <div key={number} data-spread={number} className={spreadClass(number)}
              inert={currentSpread !== number} aria-hidden={currentSpread !== number}>
              <ProjectSpread projects={entries} selected={currentSpread === number ? currentProject : entries[0]}
                onSelect={project => handleSelectProject(projects.indexOf(project))}
                onBack={() => turnMobile(-1,currentSpread,false,selectedProjectIndex)} onVillage={embedded ? onVillage : handleCloseBook} navigation={navigation(number)}/>
            </div>;
          })}
          <div data-spread={totalSpreads} className={spreadClass(totalSpreads)} inert={currentSpread !== totalSpreads}
            aria-hidden={currentSpread !== totalSpreads}>
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

                <div className="mobile-back-row"><button type="button" className="mobile-back-action-btn" onClick={() => turnMobile(isMobileDetailView ? -1 : 1,currentSpread,!isMobileDetailView,selectedProjectIndex)}>{isMobileDetailView ? '← Architecture' : 'Read the philosophy →'}</button></div>
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

                {navigation(totalSpreads)}
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

                <div className="mobile-back-row"><button type="button" className="mobile-back-action-btn" onClick={() => turnMobile(isMobileDetailView ? -1 : 1,currentSpread,!isMobileDetailView,selectedProjectIndex)}>{isMobileDetailView ? '← Architecture' : 'Read the philosophy →'}</button></div>
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

                <div className="mobile-reading-nav">{navigation(totalSpreads)}</div>
              </section>
          </div>
        </div>
      </div>
      <span className="book-status"  role="status">{busy ? 'Book transition in progress' : bookState === 'closed' ? 'Book closed' : `Spread ${currentSpread} of ${totalSpreads}. ${currentProject?.title || ''}`}</span>
      {turnNotice && <p className="book-notice" role="status">{turnNotice}</p>}
    </div>
  );
}
