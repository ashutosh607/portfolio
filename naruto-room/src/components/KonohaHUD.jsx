import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { KONOHA_LOCATIONS } from '../config/locations';

// Minimal line-art SVG icons for the 6 destinations
const LOCATION_SVGS = {
  'main-street': (
    <svg viewBox="0 0 24 24" className="dest-line-svg" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12m-2 0a2 2 0 1 0 4 0a4.5 4.5 0 1 0 -9 0a7 7 0 1 0 14 0a9.5 9.5 0 1 0 -19 0" />
      <path d="M19 18l3 -1.5" />
    </svg>
  ),
  'ichiraku-ramen': (
    <svg viewBox="0 0 24 24" className="dest-line-svg" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16a1 1 0 0 1 1 1v.5a7.5 7.5 0 0 1 -15 0v-.5a1 1 0 0 1 1 -1z" />
      <path d="M8 20h8" />
      <path d="M7 5l11 3" />
      <path d="M7 8l11 -2" />
      <path d="M9 12v-3" />
      <path d="M13 12v-3" />
    </svg>
  ),
  'hokage-office': (
    <svg viewBox="0 0 24 24" className="dest-line-svg" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l9 -6l9 6" />
      <path d="M5 10v9h14v-9" />
      <path d="M9 19v-5h6v5" />
      <path d="M2 19h20" />
    </svg>
  ),
  'training-grounds': (
    <svg viewBox="0 0 24 24" className="dest-line-svg" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6 -6" />
      <path d="M16 16l4 4" />
      <path d="M9.5 17.5L21 6V3h-3L6.5 14.5" />
      <path d="M11 19l-6 -6" />
      <path d="M8 16l-4 4" />
    </svg>
  ),
  'mission-board': (
    <svg viewBox="0 0 24 24" className="dest-line-svg" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M9 4v-1.5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v1.5" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
    </svg>
  ),
  'hokage-monument': (
    <svg viewBox="0 0 24 24" className="dest-line-svg" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20l5.5 -12l4 6l3.5 -8l5 14z" />
      <path d="M2 20h20" />
    </svg>
  ),
};

const TOP_NAV_ITEMS = [
  { number: '01', label: 'Intro', modalKey: 'intro', locId: 'main-street' },
  { number: '02', label: 'Projects', modalKey: 'projects', locId: 'ichiraku-ramen' },
  { number: '03', label: 'About', modalKey: 'about', locId: 'hokage-office' },
  { number: '04', label: 'Skills', modalKey: 'skills', locId: 'training-grounds' },
  { number: '05', label: 'Missions', modalKey: 'achievements', locId: 'mission-board' },
  { number: '06', label: 'Contact', modalKey: 'contact', locId: 'hokage-monument' },
];

const KonohaHUD = React.memo(function KonohaHUD({
  activeKeys = {},
  chakra = 100,
  currentPosition = [-16.31, -0.07, -6.8],
  onResetPosition,
  nearbyCharacterInfo = null,
  nearbyLocation = null,
  onStartDialogue,
  onOpenModal,
  activeModal = null,
  onFastTravel,
  isDialogueActive = false,
  isLiteMode = false,
  onToggleLiteMode,
  onSwitchTo2D,
  touchInputRef,
}) {
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visitedIds, setVisitedIds] = useState(() => new Set(['main-street']));
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isCoordsExpanded, setIsCoordsExpanded] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 768 : false
  );
  const [isSprintToggled, setIsSprintToggled] = useState(false);

  // Mobile virtual 8-way directional thumbpad state
  const dpadRef = useRef(null);
  const dpadPointerId = useRef(null);
  const [dpadActive, setDpadActive] = useState({ forward: false, backward: false, left: false, right: false });
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });

  const isKeyPressed = (code) => Boolean(activeKeys[code]);

  // Compute distances to all 6 destinations & track nearest
  const { locationsWithDist, nearestLocation, minDistance } = useMemo(() => {
    let nearest = null;
    let minD = Infinity;
    const list = KONOHA_LOCATIONS.map((loc) => {
      const dx = currentPosition[0] - loc.position[0];
      const dz = currentPosition[2] - loc.position[2];
      const dist = Math.hypot(dx, dz);
      if (dist < minD) {
        minD = dist;
        nearest = loc;
      }
      return { ...loc, distance: Math.round(dist) };
    });
    return { locationsWithDist: list, nearestLocation: nearest, minDistance: minD };
  }, [currentPosition]);

  // Mark location as visited when player gets within 8.5m, and auto-dismiss intro card after walking away from spawn
  useEffect(() => {
    if (nearestLocation && minDistance <= 8.5) {
      setVisitedIds((prev) => {
        if (prev.has(nearestLocation.id)) return prev;
        const next = new Set(prev);
        next.add(nearestLocation.id);
        return next;
      });
    }

    const distFromSpawn = Math.hypot(currentPosition[0] - -16.31, currentPosition[2] - -6.8);
    if (distFromSpawn > 5.0 && showWelcomeCard) {
      setShowWelcomeCard(false);
    }
  }, [nearestLocation, minDistance, currentPosition, showWelcomeCard]);

  // Keyboard shortcuts: 'H' toggles controls panel, 'Escape' closes open HUD drawers/popovers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.code === 'KeyH' && !isDialogueActive && !activeModal) {
        e.preventDefault();
        setIsControlsOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        if (isDestinationsOpen) setIsDestinationsOpen(false);
        if (isControlsOpen) setIsControlsOpen(false);
        if (isMenuOpen) setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogueActive, activeModal, isDestinationsOpen, isControlsOpen, isMenuOpen]);

  const setTouchKey = useCallback(
    (key, val) => {
      if (touchInputRef?.current) {
        touchInputRef.current[key] = val;
      }
    },
    [touchInputRef]
  );

  const updateDpadFromCoords = useCallback(
    (clientX, clientY, rect) => {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = rect.width / 2;

      if (dist < 12) {
        // Deadzone
        setTouchKey('forward', false);
        setTouchKey('backward', false);
        setTouchKey('left', false);
        setTouchKey('right', false);
        setDpadActive({ forward: false, backward: false, left: false, right: false });
        setKnobOffset({ x: 0, y: 0 });
        return;
      }

      // Smoothly clamp visual knob
      const clampedDist = Math.min(dist, maxRadius * 0.65);
      const angle = Math.atan2(dy, dx);
      setKnobOffset({
        x: Math.cos(angle) * clampedDist,
        y: Math.sin(angle) * clampedDist,
      });

      const deg = (angle * 180) / Math.PI; // -180 to 180
      const forward = deg < -20 && deg > -160;
      const backward = deg > 20 && deg < 160;
      const left = Math.abs(deg) > 110;
      const right = Math.abs(deg) < 70;

      setTouchKey('forward', forward);
      setTouchKey('backward', backward);
      setTouchKey('left', left);
      setTouchKey('right', right);
      setDpadActive({ forward, backward, left, right });
    },
    [setTouchKey]
  );

  const handleDpadPointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      dpadPointerId.current = e.pointerId;
      if (dpadRef.current) {
        updateDpadFromCoords(e.clientX, e.clientY, dpadRef.current.getBoundingClientRect());
      }
    },
    [updateDpadFromCoords]
  );

  const handleDpadPointerMove = useCallback(
    (e) => {
      if (dpadPointerId.current !== e.pointerId) return;
      e.stopPropagation();
      if (dpadRef.current) {
        updateDpadFromCoords(e.clientX, e.clientY, dpadRef.current.getBoundingClientRect());
      }
    },
    [updateDpadFromCoords]
  );

  const handleDpadPointerEnd = useCallback(
    (e) => {
      if (dpadPointerId.current !== e.pointerId && dpadPointerId.current !== null) return;
      e.stopPropagation();
      dpadPointerId.current = null;
      setTouchKey('forward', false);
      setTouchKey('backward', false);
      setTouchKey('left', false);
      setTouchKey('right', false);
      setDpadActive({ forward: false, backward: false, left: false, right: false });
      setKnobOffset({ x: 0, y: 0 });
    },
    [setTouchKey]
  );

  const handleOpenDestination = useCallback(
    (loc) => {
      setVisitedIds((prev) => {
        const next = new Set(prev);
        next.add(loc.id);
        return next;
      });
      setIsDestinationsOpen(false);
      setIsMenuOpen(false);
      onOpenModal?.(loc.modalKey);
    },
    [onOpenModal]
  );

  const handleTeleportTo = useCallback(
    (loc) => {
      setVisitedIds((prev) => {
        const next = new Set(prev);
        next.add(loc.id);
        return next;
      });
      setShowWelcomeCard(false);
      setIsDestinationsOpen(false);
      setIsMenuOpen(false);
      onFastTravel?.(loc.position);
    },
    [onFastTravel]
  );

  // Determine which top-nav item is active (active modal takes precedence, otherwise nearest location within 9m)
  const activeNavModalKey =
    activeModal || (nearestLocation && minDistance <= 9 ? nearestLocation.modalKey : 'intro');

  const progressPercent = Math.round((visitedIds.size / KONOHA_LOCATIONS.length) * 100);

  return (
    <div className="konoha-hud">
      {/* ================= 1. COMPACT TOP NAVIGATION BAR ================= */}
      <header className="shinobi-top-nav">
        {/* Left: Brand Identity */}
        <div className="shinobi-brand-left">
          <button
            type="button"
            className="shinobi-brand-btn"
            onClick={() => {
              onResetPosition?.();
              setShowWelcomeCard(true);
            }}
            title="Return to Konoha Main Street"
          >
            <svg viewBox="0 0 100 100" className="shinobi-crest-svg" aria-hidden="true">
              <path
                d="M 50 50 m 0 -5 a 5 5 0 1 1 -5 5 a 12 12 0 1 1 12 12 a 20 20 0 1 1 -20 -20 a 28 28 0 1 1 28 28 l 12 -5"
                fill="none"
                stroke="currentColor"
                strokeWidth="6.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="shinobi-brand-text">
              <span className="brand-name">ASHUTOSH</span>
              <span className="brand-sub">SHINOBI PORTFOLIO</span>
            </div>
          </button>
          <span className="brand-vertical-divider" aria-hidden="true" />
        </div>

        {/* Center: 6 Section Navigation Links (Desktop) */}
        <nav className="shinobi-center-links" aria-label="Portfolio Sections">
          {TOP_NAV_ITEMS.map((item, idx) => {
            const isActive = activeNavModalKey === item.modalKey;
            return (
              <React.Fragment key={item.modalKey}>
                <button
                  type="button"
                  className={`shinobi-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenModal?.(item.modalKey);
                  }}
                >
                  <span className="nav-item-num">{item.number}</span>
                  <span className="nav-item-label">{item.label}</span>
                  {isActive && <span className="nav-vermilion-indicator" aria-hidden="true" />}
                </button>
                {idx < TOP_NAV_ITEMS.length - 1 && (
                  <span className="nav-diamond-sep" aria-hidden="true">
                    •
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Right: Destinations Trigger & Compact Menu Pill */}
        <div className="shinobi-nav-right">
          <button
            type="button"
            className={`shinobi-dest-trigger ${isDestinationsOpen ? 'is-open' : ''}`}
            onClick={() => {
              setIsDestinationsOpen((prev) => !prev);
              setIsMenuOpen(false);
            }}
            title="Toggle Village Destinations Drawer"
          >
            <svg viewBox="0 0 24 24" className="trigger-compass-svg" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <polygon points="10,10 16,8 14,14 8,16" fill="currentColor" stroke="none" />
            </svg>
            <span className="dest-trigger-label">Destinations</span>
            <span className="dest-trigger-count">{visitedIds.size}/6</span>
          </button>

          {/* Mobile Top Destinations Shortcut Button */}
          <button
            type="button"
            className="shinobi-dest-trigger mobile-dest-top-pill"
            onClick={() => {
              setIsDestinationsOpen((prev) => !prev);
              setIsMenuOpen(false);
            }}
            title="Toggle Village Destinations Drawer"
          >
            <span className="dest-compass-mini" aria-hidden="true">🧭</span>
            <span className="dest-trigger-count">{visitedIds.size}/6</span>
          </button>

          <button
            type="button"
            className={`shinobi-menu-pill ${isMenuOpen ? 'is-open' : ''}`}
            onClick={() => {
              setIsMenuOpen((prev) => !prev);
              setIsDestinationsOpen(false);
            }}
            aria-expanded={isMenuOpen}
            title="Portfolio Menu & Settings"
          >
            <svg viewBox="0 0 24 24" className="menu-bars-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {isMenuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </>
              )}
            </svg>
            <span>Menu</span>
          </button>
        </div>
      </header>

      {/* Live Interactive Coordinates Display (Right Side) */}
      <div className={`shinobi-coords-widget ${isCoordsExpanded ? 'is-expanded' : 'is-collapsed'}`}>
        <div
          className="coords-toggle-header"
          onClick={() => setIsCoordsExpanded((prev) => !prev)}
          role="button"
          tabIndex={0}
          title="Toggle coordinates panel"
        >
          <span className="coords-icon-tag" aria-hidden="true">📍</span>
          <span className="coords-title-text">
            {isCoordsExpanded
              ? 'COORDINATES'
              : `[${currentPosition ? currentPosition[0].toFixed(1) : '0'}, ${currentPosition ? currentPosition[2].toFixed(1) : '0'}]`}
          </span>
          <span className="coords-chevron" aria-hidden="true">{isCoordsExpanded ? '▲' : '▼'}</span>
        </div>

        {isCoordsExpanded && (
          <div className="coords-details-body">
            <div className="coords-coord-row">
              <span>X:</span> <strong>{currentPosition ? currentPosition[0].toFixed(2) : '0.00'}</strong>
            </div>
            <div className="coords-coord-row">
              <span>Y:</span> <strong>{currentPosition ? currentPosition[1].toFixed(2) : '0.00'}</strong>
            </div>
            <div className="coords-coord-row">
              <span>Z:</span> <strong>{currentPosition ? currentPosition[2].toFixed(2) : '0.00'}</strong>
            </div>
            <button
              type="button"
              className="coords-copy-pill"
              onClick={(e) => {
                e.stopPropagation();
                const txt = `[${currentPosition[0].toFixed(2)}, ${currentPosition[1].toFixed(2)}, ${currentPosition[2].toFixed(2)}]`;
                navigator.clipboard?.writeText(txt);
                setCopiedCoords(true);
                setTimeout(() => setCopiedCoords(false), 1500);
              }}
            >
              {copiedCoords ? '✓ Copied Point' : 'Copy Point'}
            </button>
          </div>
        )}
      </div>

      {/* ================= 2. COMPACT MENU / SETTINGS DRAWER ================= */}
      {isMenuOpen && (
        <>
          <div
            className="shinobi-drawer-backdrop"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="shinobi-settings-popover" role="dialog" aria-label="Portfolio Menu & Settings">
            <div className="popover-section-header">
              <span>PORTFOLIO SECTIONS</span>
              <button
                type="button"
                className="drawer-close-icon-btn"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="popover-nav-grid">
              {TOP_NAV_ITEMS.map((item) => (
                <button
                  key={item.modalKey}
                  type="button"
                  className={`popover-nav-btn ${activeNavModalKey === item.modalKey ? 'active' : ''}`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenModal?.(item.modalKey);
                  }}
                >
                  <span className="popover-num">{item.number}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="popover-divider" />

            <div className="popover-section-header">
              <span>WORLD & EXPERIENCE SETTINGS</span>
            </div>

            <div className="popover-actions-list">
              <button
                type="button"
                className="popover-action-row"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenModal?.('resume');
                }}
              >
                <span>📄 View Printable Resume</span>
                <span className="popover-action-tag">PDF</span>
              </button>

              <button
                type="button"
                className="popover-action-row"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDestinationsOpen(true);
                }}
              >
                <span>🧭 Village Destinations Map</span>
                <span className="popover-action-tag">{visitedIds.size}/6</span>
              </button>

              <button
                type="button"
                className="popover-action-row"
                onClick={() => {
                  setShowWelcomeCard((prev) => !prev);
                  setIsMenuOpen(false);
                }}
              >
                <span>🍃 {showWelcomeCard ? 'Hide Introduction Card' : 'Show Introduction Card'}</span>
                <span className="popover-action-tag">Intro</span>
              </button>

              {onToggleLiteMode && (
                <button
                  type="button"
                  className="popover-action-row"
                  onClick={() => {
                    onToggleLiteMode();
                  }}
                >
                  <span>⚡ Graphics Quality</span>
                  <span className="popover-action-tag">{isLiteMode ? 'Max FPS' : 'Balanced'}</span>
                </button>
              )}

              <button
                type="button"
                className="popover-action-row"
                onClick={() => {
                  onResetPosition?.();
                  setIsMenuOpen(false);
                }}
              >
                <span>📍 Respawn at Main Street</span>
                <span className="popover-action-tag">Reset</span>
              </button>

              {onSwitchTo2D && (
                <button
                  type="button"
                  className="popover-action-row"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSwitchTo2D();
                  }}
                >
                  <span>📋 Switch to 2D Classic Portfolio</span>
                  <span className="popover-action-tag">2D</span>
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      {/* ================= 3. REFINED INTRODUCTION PANEL (LEFT) ================= */}
      {showWelcomeCard && !isDialogueActive && !activeModal && (
        <section className="shinobi-welcome-panel" aria-label="Introduction">
          {/* Decorative Watermark Kanji & Cloud Line Art */}
          <div className="welcome-watermark-kanji" aria-hidden="true">
            <span>木</span>
            <span>ノ</span>
            <span>葉</span>
          </div>

          <div className="welcome-location-header">
            <span className="welcome-pin-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
            </span>
            <div className="welcome-location-meta">
              <span className="welcome-loc-eyebrow">CURRENT LOCATION</span>
              <strong className="welcome-loc-title">
                {nearestLocation ? nearestLocation.name.toUpperCase() : 'KONOHA MAIN STREET'}
              </strong>
            </div>
            <button
              type="button"
              className="welcome-dismiss-btn"
              onClick={() => setShowWelcomeCard(false)}
              title="Minimize introduction panel"
              aria-label="Minimize introduction panel"
            >
              ✕
            </button>
          </div>

          <h1 className="welcome-serif-heading">Hello, I'm Ashutosh.</h1>
          <p className="welcome-serif-quote">
            "A shinobi of code, building things worth discovering."
          </p>

          <div className="welcome-roles-line">
            <span>AI/ML Developer</span>
            <span className="role-pipe" aria-hidden="true">|</span>
            <span>Full-Stack Developer</span>
            <span className="role-pipe" aria-hidden="true">|</span>
            <span>Problem Solver</span>
          </div>

          <div className="welcome-actions-row">
            <button
              type="button"
              className="welcome-btn-vermilion"
              onClick={() => setShowWelcomeCard(false)}
            >
              <svg viewBox="0 0 100 100" className="btn-leaf-svg" aria-hidden="true">
                <path
                  d="M 50 50 m 0 -5 a 5 5 0 1 1 -5 5 a 12 12 0 1 1 12 12 a 20 20 0 1 1 -20 -20 a 28 28 0 1 1 28 28 l 12 -5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
              <span>Explore My World</span>
            </button>

            <button
              type="button"
              className="welcome-btn-outline"
              onClick={() => {
                setShowWelcomeCard(false);
                onOpenModal?.('projects');
              }}
            >
              <span>View My Projects</span>
              <span className="btn-arrow-right" aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      )}

      {/* ================= 4. SLIDE-OUT DESTINATIONS DRAWER (RIGHT / MOBILE BOTTOM SHEET) ================= */}
      {isDestinationsOpen && (
        <>
          <div
            className="shinobi-drawer-backdrop"
            onClick={() => setIsDestinationsOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="shinobi-destinations-drawer"
            role="dialog"
            aria-label="Village Destinations"
          >
            <div className="destinations-drawer-header">
              <div className="drawer-title-row">
                <div className="drawer-title-left">
                  <span className="drawer-compass-badge" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9" />
                      <polygon points="10,10 16,8 14,14 8,16" fill="currentColor" stroke="none" />
                    </svg>
                  </span>
                  <h2 className="drawer-title-text">DESTINATIONS</h2>
                </div>
                <button
                  type="button"
                  className="drawer-close-icon-btn"
                  onClick={() => setIsDestinationsOpen(false)}
                  title="Close Destinations (ESC)"
                  aria-label="Close Destinations"
                >
                  ✕
                </button>
              </div>

              <div className="drawer-progress-meta">
                <span>
                  {visitedIds.size}/{KONOHA_LOCATIONS.length} DESTINATIONS EXPLORED
                </span>
              </div>
              <div className="drawer-progress-track">
                <div
                  className="drawer-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="destinations-drawer-list">
              {locationsWithDist.map((loc) => {
                const isCurrent = nearestLocation?.id === loc.id && loc.distance <= 8;
                const isVisited = visitedIds.has(loc.id);

                return (
                  <div
                    key={loc.id}
                    className={`destination-drawer-item ${isCurrent ? 'is-current' : ''}`}
                  >
                    <div
                      className="dest-thumb-box"
                      onClick={() => handleTeleportTo(loc)}
                      role="button"
                      tabIndex={0}
                      title={`Teleport to ${loc.name}`}
                    >
                      <span className="dest-thumb-num">{loc.number}</span>
                    </div>

                    <div
                      className="dest-line-icon-wrap"
                      onClick={() => handleOpenDestination(loc)}
                      role="button"
                      tabIndex={0}
                    >
                      {LOCATION_SVGS[loc.id] || LOCATION_SVGS['main-street']}
                    </div>

                    <div
                      className="dest-item-text"
                      onClick={() => handleOpenDestination(loc)}
                      role="button"
                      tabIndex={0}
                    >
                      <strong className="dest-item-title">{loc.name}</strong>
                      <span className="dest-item-status">
                        {isCurrent ? (
                          <>
                            <span className="status-gold-dot">●</span> Current Location
                          </>
                        ) : isVisited ? (
                          <>Visited ✓ • {loc.distance}m</>
                        ) : (
                          <>Unvisited • {loc.distance}m</>
                        )}
                      </span>
                    </div>

                    <div className="dest-item-actions">
                      <button
                        type="button"
                        className="dest-pill-btn go"
                        onClick={() => handleTeleportTo(loc)}
                        title={`Teleport to ${loc.name}`}
                      >
                        Go
                      </button>
                      <button
                        type="button"
                        className="dest-pill-btn open"
                        onClick={() => handleOpenDestination(loc)}
                        title={`Open ${loc.role}`}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </>
      )}

      {/* ================= 5. CONTEXTUAL INTERACTION PROMPT (ONLY WHEN NEARBY) ================= */}
      {!isDialogueActive &&
        !activeModal &&
        (nearbyCharacterInfo?.character || nearbyLocation) && (
          <div
            className="shinobi-context-prompt"
            onClick={() => {
              if (nearbyCharacterInfo?.character) {
                onStartDialogue?.(nearbyCharacterInfo.character);
              } else if (nearbyLocation) {
                handleOpenDestination(nearbyLocation);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="context-key-cap">E</span>
            <span className="context-prompt-label">
              {nearbyCharacterInfo?.character
                ? `Talk to ${nearbyCharacterInfo.character.name}`
                : `Explore ${nearbyLocation.name}`}
            </span>
          </div>
        )}

      {/* ================= 6. FLOATING CONTROLS GUIDE (TOGGLED BY 'H' OR BUTTON) ================= */}
      {isControlsOpen && !isDialogueActive && (
        <aside className="shinobi-controls-popover" role="dialog" aria-label="Controls Guide">
          <div className="controls-popover-header">
            <span>SHINOBI CONTROLS</span>
            <button
              type="button"
              className="drawer-close-icon-btn"
              onClick={() => setIsControlsOpen(false)}
              aria-label="Hide controls"
            >
              ✕
            </button>
          </div>

          {/* Touchscreen Mobile Gestures Guide */}
          <div className="mobile-controls-guide">
            <div className="ctrl-guide-row">
              <span className="ctrl-icon-badge">🕹️</span>
              <div>
                <strong>Thumbpad (Bottom-Left)</strong>
                <p>Drag thumb or tap arrows to run in 8 directions</p>
              </div>
            </div>
            <div className="ctrl-guide-row">
              <span className="ctrl-icon-badge">👆</span>
              <div>
                <strong>Swipe Screen Anywhere</strong>
                <p>Rotate camera smoothly 360° to look around</p>
              </div>
            </div>
            <div className="ctrl-guide-row">
              <span className="ctrl-icon-badge">⚡</span>
              <div>
                <strong>Sprint Button</strong>
                <p>Tap to toggle continuous sprint, or hold down</p>
              </div>
            </div>
            <div className="ctrl-guide-row">
              <span className="ctrl-icon-badge">🥷</span>
              <div>
                <strong>Jump Button</strong>
                <p>Leap over steps, terrain, and obstacles</p>
              </div>
            </div>
            <div className="ctrl-guide-row">
              <span className="ctrl-icon-badge">💬</span>
              <div>
                <strong>Talk / Explore Button</strong>
                <p>Lights up automatically when near villagers or boards</p>
              </div>
            </div>
            <div className="ctrl-guide-row">
              <span className="ctrl-icon-badge">🤏</span>
              <div>
                <strong>Two-Finger Pinch</strong>
                <p>Pinch in / out anywhere on screen to zoom camera</p>
              </div>
            </div>
          </div>

          {/* Desktop Keyboard List */}
          <ul className="controls-popover-list desktop-only-controls">
            <li>
              <kbd>WASD / Arrows</kbd>
              <span>Move Character</span>
            </li>
            <li>
              <kbd>SHIFT</kbd>
              <span>Chakra Sprint</span>
            </li>
            <li>
              <kbd>SPACE</kbd>
              <span>Jump</span>
            </li>
            <li>
              <kbd>Mouse Drag</kbd>
              <span>Rotate Camera</span>
            </li>
            <li>
              <kbd>E</kbd>
              <span>Interact with People & Places</span>
            </li>
            <li>
              <kbd>H</kbd>
              <span>Toggle Controls Panel</span>
            </li>
          </ul>
        </aside>
      )}

      {/* ================= 7. MINIMAL BOTTOM HUD BAR ================= */}
      <footer className="shinobi-bottom-bar">
        {/* Bottom-Left: Keyboard Hint Pill on Desktop + Ergonomic 8-Way Thumbpad on Mobile */}
        <div className="shinobi-bottom-left">
          <div className="shinobi-hint-pill">
            <span className="hint-compass-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <polygon points="10,10 16,8 14,14 8,16" fill="currentColor" stroke="none" />
              </svg>
            </span>

            <div className="hint-group">
              <div className="mini-keycaps">
                <span className={`mini-key ${isKeyPressed('KeyW') || isKeyPressed('ArrowUp') ? 'pressed' : ''}`}>W</span>
                <span className={`mini-key ${isKeyPressed('KeyA') || isKeyPressed('ArrowLeft') ? 'pressed' : ''}`}>A</span>
                <span className={`mini-key ${isKeyPressed('KeyS') || isKeyPressed('ArrowDown') ? 'pressed' : ''}`}>S</span>
                <span className={`mini-key ${isKeyPressed('KeyD') || isKeyPressed('ArrowRight') ? 'pressed' : ''}`}>D</span>
              </div>
              <span className="hint-label">Move</span>
            </div>

            <span className="hint-sep" aria-hidden="true">|</span>

            <div className="hint-group">
              <span className={`mini-key wide ${isKeyPressed('ShiftLeft') || isKeyPressed('ShiftRight') ? 'pressed' : ''}`}>
                SHIFT
              </span>
              <span className="hint-label">Sprint</span>
            </div>

            <span className="hint-sep" aria-hidden="true">|</span>

            <div className="hint-group">
              <span className={`mini-key wide ${isKeyPressed('Space') ? 'pressed' : ''}`}>
                SPACE
              </span>
              <span className="hint-label">Jump</span>
            </div>

            {/* Subtle inline chakra bar only visible when sprinting/jumping */}
            {chakra < 99 && (
              <div className="inline-chakra-track" title={`Chakra: ${Math.round(chakra)}%`}>
                <div
                  className="inline-chakra-fill"
                  style={{ width: `${Math.max(0, Math.min(100, chakra))}%` }}
                />
              </div>
            )}
          </div>

          {/* Mobile Ergonomic 8-Way Touch D-Pad / Thumbpad */}
          <div
            ref={dpadRef}
            className="shinobi-mobile-touchpad"
            onPointerDown={handleDpadPointerDown}
            onPointerMove={handleDpadPointerMove}
            onPointerUp={handleDpadPointerEnd}
            onPointerCancel={handleDpadPointerEnd}
            aria-label="Movement Thumbpad"
          >
            <div className="touch-dpad-disc">
              {/* Dynamic Center Knob indicator that slides with thumb */}
              <div
                className="touch-knob"
                style={{
                  transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
                }}
              />

              <div className="touch-dpad-cross">
                <button
                  type="button"
                  className={`touch-btn btn-up ${dpadActive.forward ? 'is-active' : ''}`}
                  aria-label="Move Forward"
                >
                  ▲
                </button>
                <div className="touch-row">
                  <button
                    type="button"
                    className={`touch-btn btn-left ${dpadActive.left ? 'is-active' : ''}`}
                    aria-label="Move Left"
                  >
                    ◀
                  </button>
                  <div className="touch-center-hub" />
                  <button
                    type="button"
                    className={`touch-btn btn-right ${dpadActive.right ? 'is-active' : ''}`}
                    aria-label="Move Right"
                  >
                    ▶
                  </button>
                </div>
                <button
                  type="button"
                  className={`touch-btn btn-down ${dpadActive.backward ? 'is-active' : ''}`}
                  aria-label="Move Backward"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-Right: Desktop Shortcuts OR Mobile Right-Hand Action Pad */}
        <div className="shinobi-bottom-right">
          {/* Mobile Right Action Pad: Talk/Explore, Sprint, Jump */}
          <div className="shinobi-mobile-actionpad">
            {/* Contextual Action Button (Talk / Explore) */}
            {(nearbyCharacterInfo?.character || nearbyLocation) && (
              <button
                type="button"
                className="mobile-interact-btn pulse-glow"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  if (nearbyCharacterInfo?.character) {
                    onStartDialogue?.(nearbyCharacterInfo.character);
                  } else if (nearbyLocation) {
                    handleOpenDestination(nearbyLocation);
                  }
                }}
                aria-label="Interact"
              >
                <span className="action-btn-icon">
                  {nearbyCharacterInfo?.character ? '💬' : '📜'}
                </span>
                <span className="action-btn-text">
                  {nearbyCharacterInfo?.character
                    ? `Talk to ${nearbyCharacterInfo.character.name.split(' ')[0]}`
                    : `Explore ${nearbyLocation.shortName || nearbyLocation.name}`}
                </span>
              </button>
            )}

            <div className="mobile-action-buttons-row">
              {/* Sprint Button (Hold or Tap to toggle) */}
              <button
                type="button"
                className={`mobile-action-circle sprint-btn ${isSprintToggled || isKeyPressed('ShiftLeft') ? 'is-active' : ''}`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {}
                  setTouchKey('sprint', true);
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  if (!isSprintToggled) {
                    setTouchKey('sprint', false);
                  }
                }}
                onPointerCancel={(e) => {
                  e.stopPropagation();
                  if (!isSprintToggled) {
                    setTouchKey('sprint', false);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSprintToggled((prev) => {
                    const next = !prev;
                    setTouchKey('sprint', next);
                    return next;
                  });
                }}
                title="Sprint (Hold or Tap to Toggle)"
                aria-label="Sprint"
              >
                <span className="action-glyph">⚡</span>
                <span className="action-label">SPRINT</span>
              </button>

              {/* Jump Button */}
              <button
                type="button"
                className="mobile-action-circle jump-btn"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {}
                  setTouchKey('jump', true);
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  setTouchKey('jump', false);
                }}
                onPointerCancel={(e) => {
                  e.stopPropagation();
                  setTouchKey('jump', false);
                }}
                title="Jump"
                aria-label="Jump"
              >
                <span className="action-glyph">🥷</span>
                <span className="action-label">JUMP</span>
              </button>
            </div>
          </div>

          {/* Desktop Only Buttons */}
          <button
            type="button"
            className="shinobi-show-controls-pill desktop-dest-shortcut"
            onClick={() => {
              setIsDestinationsOpen((prev) => !prev);
              setIsControlsOpen(false);
            }}
          >
            <span className="controls-pill-icon" aria-hidden="true">🧭</span>
            <span>Destinations ({visitedIds.size}/6)</span>
          </button>

          <button
            type="button"
            className={`shinobi-show-controls-pill ${isControlsOpen ? 'is-open' : ''}`}
            onClick={() => setIsControlsOpen((prev) => !prev)}
            title="Toggle Controls Guide (H)"
          >
            <span className="controls-pill-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="6" width="18" height="12" rx="2" />
                <path d="M7 10h2M11 10h2M15 10h2M7 14h10" />
              </svg>
            </span>
            <span className="desktop-controls-label">{isControlsOpen ? 'Hide Controls' : 'Show Controls'}</span>
            <span className="mobile-controls-label">{isControlsOpen ? 'Close' : 'Guide'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
});

export default KonohaHUD;
