import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import './CinematicWelcomeIntro.css';

const WELCOME_SENTENCES = [
  'Welcome to the Hidden Leaf Village.',
  'Every corner holds a part of my story.',
  'Explore the village. Discover my journey.',
  'Find the gate. Your adventure begins there.',
];

export default function CinematicWelcomeIntro({
  isSceneLoaded = false,
  isVisitorMoving = false,
  onComplete,
}) {
  const [isComplete, setIsComplete] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const containerRef = useRef(null);
  const sentenceRefs = useRef([]);
  const timelineRef = useRef(null);
  const isCancelledRef = useRef(false);

  // Split each sentence into pre-rendered word tokens
  const parsedSentences = useMemo(
    () =>
      WELCOME_SENTENCES.map((sentence) => ({
        raw: sentence,
        words: sentence.split(' '),
      })),
    []
  );

  // Main cinematic word-by-word animation timeline
  useEffect(() => {
    // Only start once 3D scene loading is fully completed and not already finished/cancelled
    if (!isSceneLoaded || isComplete || hasStarted || isCancelledRef.current) {
      return undefined;
    }
    setHasStarted(true);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        onComplete: () => {
          setIsComplete(true);
          onComplete?.();
        },
      });
      timelineRef.current = masterTl;

      parsedSentences.forEach((_, sIdx) => {
        const sentenceEl = sentenceRefs.current[sIdx];
        if (!sentenceEl) return;
        const wordEls = sentenceEl.querySelectorAll('.cinematic-welcome-word');
        const isFinalSentence = sIdx === parsedSentences.length - 1;

        // 1. Activate sentence in the CSS Grid slot
        masterTl.add(() => {
          setActiveSentenceIndex(sIdx);
          gsap.set(sentenceEl, { opacity: 1, visibility: 'visible' });
        });

        if (prefersReducedMotion) {
          // Instant word reveal for reduced motion preference
          masterTl.set(wordEls, { opacity: 1, y: 0, filter: 'blur(0px)' });
          masterTl.fromTo(
            sentenceEl,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out' }
          );
          masterTl.to({}, { duration: isFinalSentence ? 2.0 : 1.5 });
          masterTl.to(sentenceEl, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.inOut',
          });
          masterTl.add(() => {
            gsap.set(sentenceEl, { visibility: 'hidden' });
          });
          if (!isFinalSentence) {
            masterTl.to({}, { duration: 0.15 });
          }
        } else {
          // 2. Initially set each word to opacity 0, translateY(12px), and blur(6px)
          masterTl.set(wordEls, {
            opacity: 0,
            y: 12,
            filter: 'blur(6px)',
          });

          // 3. Reveal words sequentially using GSAP stagger ~0.14s
          // 4. Each word animates to opacity 1, translateY(0), and blur(0)
          // 5. Duration 0.62s with ease power2.out
          // 6. Natural overlap created by stagger 0.14s with duration 0.62s
          masterTl.to(wordEls, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.62,
            stagger: 0.14,
            ease: 'power2.out',
          });

          // 7. After the final word is revealed, hold the complete sentence for 1.5s
          // (For the final sentence, hold for approximately 2.0s before fading out)
          const holdDuration = isFinalSentence ? 2.0 : 1.5;
          masterTl.to({}, { duration: holdDuration });

          // 8. Fade out the complete sentence over 0.5 seconds
          masterTl.to(sentenceEl, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.inOut',
          });

          // Hide sentence after fade out
          masterTl.add(() => {
            gsap.set(sentenceEl, { visibility: 'hidden' });
          });

          // 9. Start the next sentence after a brief 0.15-second pause
          if (!isFinalSentence) {
            masterTl.to({}, { duration: 0.15 });
          }
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [isSceneLoaded, isComplete, onComplete, parsedSentences]);

  // Cancel immediately if visitor starts moving AFTER intro has started
  useEffect(() => {
    if (hasStarted && isVisitorMoving && !isComplete && !isCancelledRef.current) {
      isCancelledRef.current = true;
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: () => {
            setIsComplete(true);
            onComplete?.();
          },
        });
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    }
  }, [hasStarted, isVisitorMoving, isComplete, onComplete]);

  // Return clean uninterrupted screen after animation completes or cancels
  if (isComplete) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="cinematic-welcome-overlay"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="cinematic-welcome-slot">
        {parsedSentences.map((sentenceObj, sIdx) => (
          <p
            key={sIdx}
            ref={(el) => {
              sentenceRefs.current[sIdx] = el;
            }}
            className={`cinematic-welcome-sentence ${activeSentenceIndex === sIdx ? 'is-active' : ''}`}
            aria-hidden={activeSentenceIndex !== sIdx}
          >
            {sentenceObj.words.map((word, wIdx) => (
              <span
                key={wIdx}
                className="cinematic-welcome-word"
                data-sentence={sIdx}
                data-word={wIdx}
              >
                {word}
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}

