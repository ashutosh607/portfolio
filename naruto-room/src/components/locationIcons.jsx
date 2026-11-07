import React from 'react';

// Minimal line-art SVG icons for the 6 destinations
export const LOCATION_SVGS = {
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
