import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import './InteractionHUD.css';

const InteractionHUD = React.memo(function InteractionHUD({
  nearbyTargets = [],
  selectedUid = null,
  onSelectTarget,
  onActivateTarget,
  isBlocked = false,
}) {
  const highlightRef = useRef(null);
  const listRef = useRef(null);

  // If blocked (e.g. dialogue or modal active) or no targets nearby, immediately render nothing!
  const activeTargets = isBlocked ? [] : nearbyTargets;

  // Resolve currently selected index
  const selectedIndex = useMemo(() => {
    if (activeTargets.length === 0) return 0;
    const idx = activeTargets.findIndex((t) => t.uid === selectedUid);
    return idx >= 0 ? idx : 0;
  }, [activeTargets, selectedUid]);

  const selectedTarget = activeTargets[selectedIndex] || activeTargets[0] || null;

  // Smooth GSAP highlight bar slide when switching targets in the multi-interaction dock
  useEffect(() => {
    if (activeTargets.length <= 1 || !highlightRef.current || !listRef.current) return;
    const rows = listRef.current.querySelectorAll('.rpg-dock-row');
    const activeRow = rows[selectedIndex];
    if (!activeRow) return;

    const topOffset = activeRow.offsetTop;
    const rowHeight = activeRow.offsetHeight;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
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
  }, [selectedIndex, activeTargets.length]);

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

  // NEVER render if no targets are active!
  if (activeTargets.length === 0) {
    return null;
  }

  return (
    <div className="rpg-interaction-layer" aria-live="polite">
      {activeTargets.length === 1 && selectedTarget && (
        <button
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

      {activeTargets.length > 1 && (
        <aside
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

            {activeTargets.map((item, idx) => {
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
