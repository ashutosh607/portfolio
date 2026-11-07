import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function DialogueNameplate({ speakerProfile, nameplateRef }) {
  const textGroupRef = useRef(null);
  const prevSpeakerIdRef = useRef(speakerProfile?.id);

  // Smooth speaker nameplate update when speaker switches
  useEffect(() => {
    if (prevSpeakerIdRef.current !== speakerProfile?.id) {
      prevSpeakerIdRef.current = speakerProfile?.id;
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (!prefersReducedMotion && textGroupRef.current) {
        gsap.fromTo(
          textGroupRef.current,
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.26,
            ease: 'power2.out',
            overwrite: 'auto',
          }
        );
      }
    }
  }, [speakerProfile?.id]);

  return (
    <div className="dlg-nameplate-row" ref={nameplateRef}>
      <div className="dlg-nameplate-banner" ref={textGroupRef}>
        {/* Small Konoha Spiral Icon */}
        <svg
          viewBox="0 0 100 100"
          className="dlg-nameplate-leaf-svg"
          aria-hidden="true"
        >
          <path
            d="M 50 50 m 0 -5 a 5 5 0 1 1 -5 5 a 12 12 0 1 1 12 12 a 20 20 0 1 1 -20 -20 a 28 28 0 1 1 28 28 l 12 -5"
            fill="none"
            stroke="currentColor"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
        </svg>

        <span className="dlg-speaker-name">
          {speakerProfile?.displayName?.toUpperCase()}
        </span>

        {speakerProfile?.japaneseName && (
          <span className="dlg-speaker-japanese">
            {speakerProfile.japaneseName}
          </span>
        )}

        {speakerProfile?.isPlayer && (
          <span className="dlg-speaker-you-pill">YOU</span>
        )}
      </div>
    </div>
  );
}

