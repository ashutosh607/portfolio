import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

/**
 * MagneticButton — React Bits inspired subtle magnetic interaction
 * Gently pulls towards the cursor when hovered, providing tactile feedback
 * without obstructing clicks or creating exaggerated cursor tracking.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 0.22,
  radius = 65,
  as: Component = 'button',
  onClick,
  ...props
}) {
  const btnRef = useRef(null);
  const boundsRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (!btnRef.current) return;
    boundsRef.current = btnRef.current.getBoundingClientRect();
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!btnRef.current) return;
      if (!boundsRef.current) {
        boundsRef.current = btnRef.current.getBoundingClientRect();
      }

      const rect = boundsRef.current;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      // Clamp movement to subtle ±6px max
      const clampedX = Math.max(-6, Math.min(6, deltaX));
      const clampedY = Math.max(-6, Math.min(6, deltaY));

      gsap.to(btnRef.current, {
        x: clampedX,
        y: clampedY,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    if (!btnRef.current) return;
    boundsRef.current = null;
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: 'elastic.out(1, 0.45)',
      overwrite: 'auto',
    });
  }, []);

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return undefined;

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(el);
    };
  }, [handleMouseEnter, handleMouseMove, handleMouseLeave]);

  return (
    <Component
      ref={btnRef}
      className={`p2d-magnetic-btn ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}

