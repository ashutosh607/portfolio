import React, { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * AnimatedHeading — Cinematic Word-by-Word Reveal Component
 * Inspired by React Bits Animated Content & GSAP SplitText.
 * Pre-renders all words in their exact layout positions to avoid shifts.
 * Rises from y: 18px with blur: 5px -> 0px, staggered by word.
 */
export default function AnimatedHeading({
  children,
  className = '',
  as: Component = 'h2',
  scroller = '.portfolio-2d-wrapper',
  stagger = 0.09,
  duration = 0.7,
  delay = 0,
  triggerStart = 'top 88%',
  ...props
}) {
  const headingRef = useRef(null);

  // Parse text or JSX children into word tokens
  const words = useMemo(() => {
    if (typeof children === 'string') {
      return children.split(' ').filter(Boolean);
    }
    // If array of strings or nodes, stringify or pass through
    return String(children).split(' ').filter(Boolean);
  }, [children]);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(el.querySelectorAll('.p2d-anim-word'), {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      });
      return undefined;
    }

    const wordEls = el.querySelectorAll('.p2d-anim-word');
    const scrollTarget = document.querySelector(scroller) || window;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordEls,
        {
          opacity: 0,
          y: 18,
          filter: 'blur(5px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration,
          stagger,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            scroller: scrollTarget,
            start: triggerStart,
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [duration, stagger, delay, scroller, triggerStart]);

  return (
    <Component ref={headingRef} className={`p2d-animated-heading ${className}`} {...props}>
      {words.map((word, idx) => (
        <span key={idx} className="p2d-anim-word" data-word-idx={idx}>
          {word}
          {idx < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Component>
  );
}

