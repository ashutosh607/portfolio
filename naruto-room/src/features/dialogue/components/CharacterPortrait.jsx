import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

// Clan & Character Insignia Emblems for fallback portrait medallions & nameplate badges
export const CHARACTER_EMBLEMS = {
  sasuke: (
    <svg viewBox="0 0 100 100" className="dlg-clan-emblem-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#181216" stroke="#B83A35" strokeWidth="3" />
      <path d="M 50 18 A 28 28 0 0 1 78 46 L 22 46 A 28 28 0 0 1 50 18 Z" fill="#B83A35" />
      <path d="M 22 46 A 28 28 0 0 0 78 46 L 78 52 A 28 28 0 0 1 22 52 Z" fill="#F5E9DD" />
      <rect x="46" y="52" width="8" height="24" fill="#F5E9DD" rx="3" />
    </svg>
  ),
  sakura: (
    <svg viewBox="0 0 100 100" className="dlg-clan-emblem-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#241219" stroke="#D45D79" strokeWidth="3" />
      <circle cx="50" cy="50" r="22" fill="none" stroke="#F5E9DD" strokeWidth="5.5" />
      <polygon points="50,14 57,26 50,38 43,26" fill="#D45D79" />
    </svg>
  ),
  tsunade: (
    <svg viewBox="0 0 100 100" className="dlg-clan-emblem-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#1A1315" stroke="#D4A979" strokeWidth="3" />
      <text x="50" y="65" textAnchor="middle" fill="#D4A979" fontSize="42" fontWeight="700" fontFamily="serif">
        賭
      </text>
    </svg>
  ),
  jiraiya: (
    <svg viewBox="0 0 100 100" className="dlg-clan-emblem-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#221214" stroke="#B83A35" strokeWidth="3" />
      <text x="50" y="65" textAnchor="middle" fill="#F5E9DD" fontSize="42" fontWeight="700" fontFamily="serif">
        油
      </text>
    </svg>
  ),
  orochimaru: (
    <svg viewBox="0 0 100 100" className="dlg-clan-emblem-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#191220" stroke="#9B59B6" strokeWidth="3" />
      <path d="M 50 26 Q 66 26 64 42 Q 62 52 50 50 Q 56 40 50 26 Z" fill="#C8B6A9" />
      <path d="M 34 58 Q 34 72 48 70 Q 58 64 50 50 Q 42 58 34 58 Z" fill="#C8B6A9" />
      <path d="M 66 58 Q 56 72 42 66 Q 42 54 50 50 Q 58 54 66 58 Z" fill="#C8B6A9" />
    </svg>
  ),
  kakashi: (
    <svg viewBox="0 0 100 100" className="dlg-clan-emblem-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#1E1315" stroke="#B83A35" strokeWidth="3" />
      <circle cx="50" cy="50" r="12" fill="#B83A35" />
      <path d="M 50 14 C 50 36 34 45 18 50 C 36 55 45 72 50 86 C 50 64 66 55 82 50 C 64 45 55 28 50 14 Z" fill="#F5E9DD" opacity="0.85" />
    </svg>
  ),
  hinata: (
    <svg viewBox="0 0 100 100" className="dlg-clan-emblem-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#1C1422" stroke="#C8B6A9" strokeWidth="3" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="#F5E9DD" strokeWidth="3" />
      <circle cx="50" cy="50" r="9" fill="#D4A979" />
    </svg>
  ),
  ashutosh: (
    <svg viewBox="0 0 100 100" className="dlg-clan-emblem-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#221316" stroke="#D4A979" strokeWidth="3" />
      <path
        d="M 50 50 m 0 -5 a 5 5 0 1 1 -5 5 a 12 12 0 1 1 12 12 a 20 20 0 1 1 -20 -20 a 28 28 0 1 1 28 28 l 10 -4"
        fill="none"
        stroke="#F5E9DD"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export default function CharacterPortrait({ speakerProfile, portraitRef }) {
  const [imageError, setImageError] = useState(false);
  const innerWrapRef = useRef(null);
  const prevSpeakerIdRef = useRef(speakerProfile?.id);

  // Reset image error state when speaker changes
  useEffect(() => {
    setImageError(false);
  }, [speakerProfile?.id, speakerProfile?.portrait]);

  // Smooth speaker-switch transition (250-350ms) without re-animating the entire overlay
  useEffect(() => {
    if (prevSpeakerIdRef.current !== speakerProfile?.id) {
      prevSpeakerIdRef.current = speakerProfile?.id;
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (!prefersReducedMotion && innerWrapRef.current) {
        gsap.fromTo(
          innerWrapRef.current,
          { opacity: 0, scale: 0.94, y: 8 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          }
        );
      }
    }
  }, [speakerProfile?.id]);

  const hasValidPortraitImage = Boolean(speakerProfile?.portrait && !imageError);
  const emblem =
    CHARACTER_EMBLEMS[speakerProfile?.emblemKey] || CHARACTER_EMBLEMS.ashutosh;

  return (
    <div className="dlg-portrait-stage" ref={portraitRef}>
      {/* Restrained Organic Ink-Brush Frame SVG */}
      <svg
        viewBox="0 0 200 200"
        className="dlg-ink-brush-ring"
        fill="none"
        aria-hidden="true"
      >
        {/* Outer organic brush arc */}
        <path
          d="M 100 10 C 152 10, 190 48, 190 100 C 190 152, 150 188, 98 190 C 46 192, 10 152, 12 98 C 14 52, 48 14, 94 11"
          stroke="#7D2428"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Subtle secondary crimson brush accent */}
        <path
          d="M 24 142 C 44 176, 88 194, 134 184 C 168 176, 188 144, 192 108"
          stroke="#B83A35"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.75"
        />
        {/* Delicate warm gold inner arc */}
        <path
          d="M 38 34 C 66 14, 112 12, 146 28"
          stroke="#D4A979"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {/* Portrait Inner Medallion */}
      <div className="dlg-portrait-medallion" ref={innerWrapRef}>
        {hasValidPortraitImage ? (
          <img
            src={speakerProfile.portrait}
            alt={speakerProfile.displayName}
            className="dlg-portrait-img"
            onError={() => setImageError(true)}
            draggable={false}
          />
        ) : (
          <div className="dlg-portrait-fallback" aria-label={speakerProfile?.displayName}>
            <div className="dlg-fallback-emblem">{emblem}</div>
            <span className="dlg-fallback-kanji">
              {speakerProfile?.japaneseName?.slice(0, 3) || '木ノ葉'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

