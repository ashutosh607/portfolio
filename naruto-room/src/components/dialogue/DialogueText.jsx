import React, { useEffect, useRef } from 'react';

/**
 * High-performance zero-rerender Typewriter Dialogue Text component.
 * Uses dual visible/ghost spans so word-wrapping and line height remain 100% locked
 * without layout shift, and mutates DOM textContent directly for 60fps smoothness.
 */
export default function DialogueText({
  text = '',
  isTyping,
  onTypingComplete,
  textContainerRef,
}) {
  const visibleSpanRef = useRef(null);
  const ghostSpanRef = useRef(null);
  const cursorRef = useRef(null);
  const timerRef = useRef(null);
  const onCompleteRef = useRef(onTypingComplete);

  useEffect(() => {
    if (textContainerRef.current) textContainerRef.current.scrollTop = 0;
  }, [text, textContainerRef]);

  useEffect(() => {
    onCompleteRef.current = onTypingComplete;
  }, [onTypingComplete]);

  useEffect(() => {
    clearTimeout(timerRef.current);

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!isTyping || prefersReducedMotion) {
      if (visibleSpanRef.current) visibleSpanRef.current.textContent = text;
      if (ghostSpanRef.current) ghostSpanRef.current.textContent = '';
      if (cursorRef.current) cursorRef.current.style.display = 'none';
      if (isTyping && prefersReducedMotion) {
        onCompleteRef.current?.();
      }
      return;
    }

    // Initialize typewriter
    let idx = 0;
    if (visibleSpanRef.current) visibleSpanRef.current.textContent = '';
    if (ghostSpanRef.current) ghostSpanRef.current.textContent = text;
    if (cursorRef.current) cursorRef.current.style.display = 'inline-block';

    const step = () => {
      if (idx < text.length) {
        idx += 1;
        const ch = text[idx - 1];
        if (visibleSpanRef.current) {
          visibleSpanRef.current.textContent = text.slice(0, idx);
        }
        if (ghostSpanRef.current) {
          ghostSpanRef.current.textContent = text.slice(idx);
        }

        // Natural spoken cadence delays on punctuation
        let delay = 26;
        if (ch === '.' || ch === '!' || ch === '?') {
          delay = 145;
        } else if (ch === ',' || ch === ';' || ch === ':' || ch === '—') {
          delay = 80;
        }

        timerRef.current = setTimeout(step, delay);
      } else {
        if (cursorRef.current) cursorRef.current.style.display = 'none';
        onCompleteRef.current?.();
      }
    };

    timerRef.current = setTimeout(step, 35);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [text, isTyping]);

  return (
    <div className="dlg-text-stage" ref={textContainerRef}>
      <p className="dlg-speech-paragraph" aria-live="polite">
        <span ref={visibleSpanRef} className="dlg-visible-text">
          {!isTyping ? text : ''}
        </span>
        <span
          ref={cursorRef}
          className="dlg-typewriter-caret"
          aria-hidden="true"
          style={{ display: isTyping ? 'inline-block' : 'none' }}
        />
        <span
          ref={ghostSpanRef}
          className="dlg-ghost-text"
          aria-hidden="true"
        />
      </p>
    </div>
  );
}

