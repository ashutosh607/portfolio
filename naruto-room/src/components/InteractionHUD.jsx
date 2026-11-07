import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import './InteractionHUD.css';

const InteractionHUD = React.memo(function InteractionHUD({
  nearbyTargets = [],
  selectedUid = null,
  onSelectTarget,
  onActivateTarget,
  isBlocked = false,
}) {
  const pillRef = useRef(null);
  const dockRef = useRef(null);
  const highlightRef = useRef(null);
  const listRef = useRef(null);

  // Keep a displayed copy so exit fade-out animation can complete cleanly
  const [renderedTargets, setRenderedTargets] = useState([]);
  const [renderedMode, setRenderedMode] = useState('none'); // 'none' | 'single' | 'multiple'
  const fadeTimelineRef = useRef(null);

  const activeTargets = isBlocked ? [] : nearbyTargets;
  const targetMode =
    activeTargets.length === 0
      ? 'none'
      : activeTargets.length === 1
      ? 'single'
      : 'multiple';

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sync rendered targets and run restrained 150-200ms GSAP transitions between states
  useEffect(() => {
    fadeTimelineRef.current?.kill();

    if (targetMode === 'none') {
      if (renderedMode === 'none') return;

      const activeEl = renderedMode === 'single' ? pillRef.current : dockRef.current;
      if (!activeEl || prefersReducedMotion()) {
        setRenderedMode('none');
        setRenderedTargets([]);
        return;
      }

      fadeTimelineRef.current = gsap.to(activeEl, {
        opacity: 0,
        y: 5,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
          setRenderedMode('none');
          setRenderedTargets([]);
        },
      });
      return;
    }

    // Entering range or switching between single <-> multiple
    setRenderedTargets(activeTargets);
    setRenderedMode(targetMode);
  }, [targetMode, activeTargets, renderedMode]);

  // Animate entrance when renderedMode becomes 'single' or 'multiple'
  useEffect(() => {
    if (renderedMode === 'none') return;
    const el = renderedMode === 'single' ? pillRef.current : dockRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }
    );
  }, [renderedMode]);

  // Resolve currently selected index
  const selectedIndex = useMemo(() => {
    if (renderedTargets.length === 0) return 0;
    const idx = renderedTargets.findIndex((t) => t.uid === selectedUid);
    return idx >= 0 ? idx : 0;
  }, [renderedTargets, selectedUid]);

  const selectedTarget = renderedTargets[selectedIndex] || renderedTargets[0] || null;

  // Smooth GSAP highlight bar slide when switching targets in the multi-interaction dock
  useEffect(() => {
    if (renderedMode !== 'multiple' || !highlightRef.current || !listRef.current) return;
    const rows = listRef.current.querySelectorAll('.rpg-dock-row');
    const activeRow = rows[selectedIndex];
    if (!activeRow) return;

    const topOffset = activeRow.offsetTop;
    const rowHeight = activeRow.offsetHeight;

    if (prefersReducedMotion()) {
      gsap.set(highlightRef.current, { y: topOffset, height: rowHeight });
    } else {
      gsap.to(highlightRef.current, {
        y: topOffset,
        height: rowHeight,
        duration: 0.16,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  }, [renderedMode, selectedIndex, renderedTargets.length]);

  const handleTrigger = useCallback(
    (target) => {
      if (!target || isBlocked) return;
      onSelectTarget?.(target.uid);
      onActivateTarget?.(target);
    },
    [isBlocked, onSelectTarget, onActivateTarget]
  );

  // Keyboard controls: E (interact), ArrowUp/ArrowDown (cycle dock), 1-9 (direct select)
  useEffect(() => {
    if (isBlocked || activeTargets.length === 0) return;

    const handleKeyDown = (e) => {
      // Ignore repeated keydown events from holding a key
      if (e.repeat) return;

      // Ignore if typing inside an input/textarea
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'KeyE') {
        e.preventDefault();
        e.stopPropagation();
        const current =
          activeTargets.find((t) => t.uid === selectedUid) || activeTargets[0];
        if (current) {
          onActivateTarget?.(current);
        }
        return;
      }

      if (activeTargets.length > 1) {
        if (e.code === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          const curIdx = Math.max(
            0,
            activeTargets.findIndex((t) => t.uid === selectedUid)
          );
          const nextIdx = (curIdx - 1 + activeTargets.length) % activeTargets.length;
          onSelectTarget?.(activeTargets[nextIdx].uid);
          return;
        }

        if (e.code === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          const curIdx = Math.max(
            0,
            activeTargets.findIndex((t) => t.uid === selectedUid)
          );
          const nextIdx = (curIdx + 1) % activeTargets.length;
          onSelectTarget?.(activeTargets[nextIdx].uid);
          return;
        }

        // Number keys 1-9 directly select the corresponding nearby target
        let digit = -1;
        if (e.code.startsWith('Digit')) {
          digit = parseInt(e.code.replace('Digit', ''), 10);
        } else if (e.code.startsWith('Numpad')) {
          digit = parseInt(e.code.replace('Numpad', ''), 10);
        }

        if (digit >= 1 && digit <= activeTargets.length) {
          e.preventDefault();
          e.stopPropagation();
          const chosen = activeTargets[digit - 1];
          if (chosen) {
            onSelectTarget?.(chosen.uid);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isBlocked, activeTargets, selectedUid, onSelectTarget, onActivateTarget]);

  if (renderedMode === 'none' || renderedTargets.length === 0) {
    return null;
  }

  return (
    <div className="rpg-interaction-layer" aria-live="polite">
      {renderedMode === 'single' && selectedTarget && (
        <button
          ref={pillRef}
          type="button"
          className="rpg-single-pill"
          onClick={() => handleTrigger(selectedTarget)}
          title={`${selectedTarget.singlePrompt} (Press E)`}
        >
          <span className="rpg-key-badge" aria-hidden="true">
            E
          </span>
          <span className="rpg-single-label">{selectedTarget.singlePrompt}</span>
        </button>
      )}

      {renderedMode === 'multiple' && (
        <aside
          ref={dockRef}
          className="rpg-nearby-dock"
          aria-label="Nearby Interactions"
        >
          <div className="rpg-dock-header">
            <span className="rpg-dock-title">NEARBY</span>
            <span className="rpg-dock-hint">
              <kbd>E</kbd> Interact
            </span>
          </div>

          <div ref={listRef} className="rpg-dock-list" role="listbox">
            <div ref={highlightRef} className="rpg-dock-highlight" aria-hidden="true" />

            {renderedTargets.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.uid}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`rpg-dock-row ${isSelected ? 'is-selected' : ''}`}
                  onMouseEnter={() => onSelectTarget?.(item.uid)}
                  onClick={() => handleTrigger(item)}
                >
                  <span className="rpg-row-left">
                    <span className="rpg-row-num">{idx + 1}</span>
                    <span className="rpg-row-name">{item.shortLabel}</span>
                  </span>
                  <span className="rpg-row-action-tag">
                    {item.type === 'npc' ? 'Talk' : 'Open'}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
});

export default InteractionHUD;

