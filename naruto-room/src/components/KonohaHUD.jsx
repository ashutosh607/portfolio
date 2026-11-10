import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { KONOHA_LOCATIONS } from '../config/locations';

import { LOCATION_SVGS } from './locationIcons';

const TOP_NAV_ITEMS = [
  { number: '01', label: 'Home', modalKey: 'intro', locId: 'main-street' },
  { number: '02', label: 'About', modalKey: 'about', locId: 'hokage-office' },
  { number: '03', label: 'Projects', modalKey: 'projects', locId: 'ichiraku-ramen' },
  { number: '04', label: 'Experience', modalKey: 'achievements', locId: 'mission-board' },
  { number: '05', label: 'Skills', modalKey: 'skills', locId: 'training-grounds' },
  { number: '06', label: 'Contact', modalKey: 'contact', locId: 'hokage-monument' },
];

const KonohaHUD = React.memo(function KonohaHUD({
  activeKeys = {},
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
  isNightMode = true,
  onToggleNightMode,
  onSwitchTo2D,
  touchInputRef,
}) {
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(() => {
    try {
      return localStorage.getItem('konoha-3d-navbar') !== 'hidden';
    } catch {
      return true;
    }
  });

  function toggleNav() {
    const visible = !isNavVisible;
    setIsNavVisible(visible);
    setIsMenuOpen(false);
    try {
      localStorage.setItem('konoha-3d-navbar', visible ? 'visible' : 'hidden');
    } catch {
      // The toggle still works when browser storage is unavailable.
    }
  }

  const [visitedIds, setVisitedIds] = useState(() => new Set(['main-street']));
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

  // Mark location as visited when player gets within 8.5m
  useEffect(() => {
    if (nearestLocation && minDistance <= 8.5) {
      setVisitedIds((prev) => {
        if (prev.has(nearestLocation.id)) return prev;
        const next = new Set(prev);
        next.add(nearestLocation.id);
        return next;
      });
    }
  }, [nearestLocation, minDistance]);

  // Keyboard shortcuts: 'H' toggles controls panel, 'N' toggles Day/Night mode, 'Escape' closes open HUD drawers/popovers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (e.code === 'KeyH' && !isDialogueActive && !activeModal) {
        e.preventDefault();
        setIsControlsOpen((prev) => !prev);
      } else if (e.code === 'KeyN' && !isDialogueActive && !activeModal && onToggleNightMode) {
        e.preventDefault();
        onToggleNightMode();
      } else if (e.code === 'Escape') {
        if (isDestinationsOpen) setIsDestinationsOpen(false);
        if (isControlsOpen) setIsControlsOpen(false);
        if (isMenuOpen) setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogueActive, activeModal, isDestinationsOpen, isControlsOpen, isMenuOpen, onToggleNightMode]);

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

  // Clear mobile D-pad & sprint toggle whenever dialogue or modal is active
  useEffect(() => {
    if (isDialogueActive) {
      dpadPointerId.current = null;
      setDpadActive({ forward: false, backward: false, left: false, right: false });
      setKnobOffset({ x: 0, y: 0 });
      setIsSprintToggled(false);
    }
  }, [isDialogueActive]);

  const handleSelectNavSection = useCallback(
    (item) => {
      const matchedLoc = KONOHA_LOCATIONS.find(
        (loc) => loc.id === item.locId || loc.modalKey === item.modalKey
      );
      if (matchedLoc) {
        setVisitedIds((prev) => {
          if (prev.has(matchedLoc.id)) return prev;
          const next = new Set(prev);
          next.add(matchedLoc.id);
          return next;
        });
        onFastTravel?.(matchedLoc.position);
      }
      setIsDestinationsOpen(false);
      setIsMenuOpen(false);
      onOpenModal?.(item.modalKey);
    },
    [onFastTravel, onOpenModal]
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
      onFastTravel?.(loc.position);
      onOpenModal?.(loc.modalKey);
    },
    [onFastTravel, onOpenModal]
  );

  const handleTeleportTo = useCallback(
    (loc) => {
      setVisitedIds((prev) => {
        const next = new Set(prev);
        next.add(loc.id);
        return next;
      });
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
    <div className="konoha-hud" data-panel-open={isMenuOpen || isControlsOpen || isDestinationsOpen}>
      {/* ================= 1. COMPACT TOP NAVIGATION BAR ================= */}
      <div className="shinobi-nav-shell">
      <header id="village-top-nav" className="shinobi-top-nav" hidden={!isNavVisible}>
        {/* Left: Brand Identity */}
        <div className="shinobi-brand-left">
          <button
            type="button"
            className="shinobi-brand-btn"
            onClick={() => {
              onResetPosition?.();
            }}
            title="Return to Konoha Main Street • Ashutosh Shinobi Portfolio"
          >
            <img
              src="/logo-mark-transparent.png"
              alt="Ashutosh Shinobi Logo"
              className="shinobi-brand-logo-img"
              draggable={false}
            />
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
                  onClick={() => handleSelectNavSection(item)}
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

        {/* Right: Day/Night Toggle, Destinations Trigger & Compact Menu Pill */}
        <div className="shinobi-nav-right">
          {onToggleNightMode && (
            <button
              type="button"
              className={`shinobi-theme-toggle ${isNightMode ? 'is-night' : 'is-day'}`}
              onClick={onToggleNightMode}
              title={
                isNightMode
                  ? 'Switch to Daylight Village (Press N)'
                  : 'Switch to Japanese Night Mode (Press N)'
              }
              aria-label={isNightMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            >
              {isNightMode ? (
                <svg
                  viewBox="0 0 24 24"
                  className="theme-toggle-svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="theme-toggle-svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
              <span className="theme-toggle-label">{isNightMode ? 'Night' : 'Day'}</span>
              <span className="theme-toggle-kanji" aria-hidden="true">
                {isNightMode ? '夜' : '昼'}
              </span>
            </button>
          )}

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
            aria-label="Village destinations"
            aria-expanded={isDestinationsOpen}
            title="Village destinations"
          >
            <span className="dest-compass-mini" aria-hidden="true">🧭</span>
            <span className="dest-trigger-count">{visitedIds.size}/6</span>
          </button>

          {onSwitchTo2D && (
            <button
              type="button"
              className="shinobi-menu-pill shinobi-2d-pill"
              onClick={onSwitchTo2D}
              title="Switch to 2D Classic Portfolio"
              aria-label="Switch to 2D Classic Portfolio"
            >
              <svg
                viewBox="0 0 24 24"
                className="menu-2d-svg"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              <span className="pill-2d-full-text">2D Portfolio</span>
              <span className="pill-2d-short-text">2D</span>
            </button>
          )}

          {/* Mobile Portfolio Sections & Settings Menu Button */}
          <button
            type="button"
            className={`shinobi-mobile-menu-trigger ${isMenuOpen ? 'is-open' : ''}`}
            onClick={() => {
              setIsMenuOpen((prev) => !prev);
              setIsDestinationsOpen(false);
            }}
            aria-expanded={isMenuOpen}
            aria-controls="village-settings"
            aria-label={isMenuOpen ? 'Close village menu' : 'Open village menu'}
            title="Portfolio Sections & Settings"
          >
            <span className="mobile-menu-bars" aria-hidden="true">
              {isMenuOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </header>
      <button
        type="button"
        className="shinobi-nav-visibility"
        aria-controls="village-top-nav"
        aria-expanded={isNavVisible}
        onClick={toggleNav}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d={isNavVisible ? 'M3 10l5-5 5 5' : 'M3 6l5 5 5-5'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isNavVisible ? 'Hide navbar' : 'Show navbar'}
      </button>
      </div>

      {/* ================= 2. COMPACT MENU / SETTINGS DRAWER ================= */}
      {isMenuOpen && (
        <>
          <div
            className="shinobi-drawer-backdrop"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="shinobi-settings-popover" id="village-settings" role="dialog" aria-label="Portfolio Menu & Settings">
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
                  onClick={() => handleSelectNavSection(item)}
                >
                  <span className="popover-num">{item.number}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="popover-divider" />

            <div className="popover-section-header">
              <span>VILLAGE SETTINGS</span>
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
                <span>View résumé</span>
                <span className="popover-action-tag">PDF</span>
              </button>

              <button type="button" className="popover-action-row" onClick={() => {
                setIsMenuOpen(false);
                setIsControlsOpen(true);
              }}>
                Controls guide
              </button>
              <button type="button" className="popover-action-row" onClick={toggleNav}>
                Hide navbar
              </button>

              {onToggleNightMode && (
                <button
                  type="button"
                  className="popover-action-row"
                  onClick={() => {
                    onToggleNightMode();
                  }}
                >
                  <span>Time of day</span>
                  <span className="popover-action-tag">
                    {isNightMode ? 'Night • 夜' : 'Day • 昼'}
                  </span>
                </button>
              )}

              {onToggleLiteMode && (
                <button
                  type="button"
                  className="popover-action-row"
                  onClick={() => {
                    onToggleLiteMode();
                  }}
                >
                  <span>Graphics quality</span>
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
                <span>Return to Main Street</span>
                <span className="popover-action-tag">Reset</span>
              </button>


            </div>
          </aside>
        </>
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
              <span>Sprint</span>
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
      <footer className={`shinobi-bottom-bar ${isDialogueActive ? 'is-hud-obscured' : ''}`}>
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
          {/* Mobile Right Action Pad: Sprint & Jump */}
          <div className="shinobi-mobile-actionpad">
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
