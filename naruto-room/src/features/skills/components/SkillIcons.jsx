import React from 'react';

/**
 * High-performance vector SVG icons for categories and technology badges.
 * Render razor-sharp at any device pixel ratio, zero external dependencies.
 */

export function CategoryIcon({ name, className = 'category-svg-icon' }) {
  switch (name) {
    case 'code':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'python':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
          <path d="M11.92 2c-3.1 0-2.9 1.34-2.9 1.34l.01 1.4h2.95v.42H6.1s-2.02.23-2.02 2.97c0 2.73 1.76 2.87 1.76 2.87h1.05v-1.48s-.06-1.76 1.74-1.76h3.01s1.7.03 1.7-1.63V4.28s.24-2.28-1.42-2.28zm-1.65 1.05a.65.65 0 1 1 0 1.3.65.65 0 0 1 0-1.3zM12.08 22c3.1 0 2.9-1.34 2.9-1.34l-.01-1.4h-2.95v-.42h5.88s2.02-.23 2.02-2.97c0-2.73-1.76-2.87-1.76-2.87h-1.05v1.48s.06 1.76-1.74 1.76h-3.01s-1.7-.03-1.7 1.63v3.45s-.24 2.28 1.42 2.28zm1.65-1.05a.65.65 0 1 1 0-1.3.65.65 0 0 1 0 1.3z" />
        </svg>
      );
    case 'brain':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z" />
        </svg>
      );
    case 'database':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'link':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'tools':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export function TechIcon({ name, className = 'tech-svg-icon' }) {
  switch (name) {
    case 'react':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#00d8ff" strokeWidth="1.5" aria-hidden="true">
          <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.8" fill="#00d8ff" />
        </svg>
      );
    case 'javascript':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect width="22" height="22" x="1" y="1" rx="4" fill="#f7df1e" />
          <path d="M7 17.5c1.2.8 2.3.8 2.3-.6v-6.4H7v1.5h1.1v4.8c0 .5-.5.4-.8.3l-.3.4zm5.5-.3c1 .5 2.1.8 3.1.2.9-.6.7-1.6.1-2.1-.8-.6-2.2-.8-2.2-2.1 0-1.1.9-1.8 2.2-1.8.8 0 1.6.3 2.2.6l-.4 1.3c-.5-.3-1.1-.5-1.7-.5-.6 0-1 .3-1 .8 0 .5.6.8 1.4 1.1 1.2.5 1.9 1.1 1.9 2.3 0 1.4-1.1 2.2-2.6 2.2-1 0-2.1-.4-2.8-.9l.8-1.1z" fill="#000" />
        </svg>
      );
    case 'typescript':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect width="22" height="22" x="1" y="1" rx="4" fill="#3178c6" />
          <path d="M5 8h6v2H9v7H7v-7H5V8zm8.5 7.5c.8.4 1.7.6 2.5.2.7-.4.6-1.3.1-1.7-.6-.5-1.8-.7-1.8-1.7 0-.9.7-1.4 1.8-1.4.7 0 1.3.2 1.8.5l-.3 1.1c-.4-.2-.9-.4-1.4-.4-.5 0-.8.2-.8.6 0 .4.5.6 1.1.9 1 .4 1.5.9 1.5 1.9 0 1.1-.9 1.8-2.1 1.8-.8 0-1.7-.3-2.3-.7l.9-1.1z" fill="#fff" />
        </svg>
      );
    case 'threejs':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#f1c40f" />
        </svg>
      );
    case 'r3f':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#22d3ee" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="3" fill="#22d3ee" />
        </svg>
      );
    case 'html5':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M3 2l1.6 18.2L12 22l7.4-1.8L21 2H3z" fill="#e34f26" />
          <path d="M12 3.8v16.4l5.8-1.5 1.4-14.9H12z" fill="#ef652a" />
          <path d="M12 8.4h3.7l-.3 3.6H12v2.4h3.5l-.4 4.3-3.1.8v2.4l5.3-1.4.7-8.5H12V8.4z" fill="#fff" />
        </svg>
      );
    case 'tailwind':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#38bdf8" aria-hidden="true">
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
        </svg>
      );
    case 'nodejs':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#539e43" aria-hidden="true">
          <path d="M12 2l9 5.2v10.4L12 23l-9-5.4V7.2L12 2zm0 2.3L4.8 8.5v7l7.2 4.2 7.2-4.2v-7L12 4.3z" />
        </svg>
      );
    case 'express':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#e6e6e6" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <text x="4" y="16" fill="#e6e6e6" fontSize="11" fontFamily="monospace" fontWeight="bold">ex</text>
        </svg>
      );
    case 'python':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#3776ab" aria-hidden="true">
          <path d="M11.92 2c-3.1 0-2.9 1.34-2.9 1.34l.01 1.4h2.95v.42H6.1s-2.02.23-2.02 2.97c0 2.73 1.76 2.87 1.76 2.87h1.05v-1.48s-.06-1.76 1.74-1.76h3.01s1.7.03 1.7-1.63V4.28s.24-2.28-1.42-2.28zm-1.65 1.05a.65.65 0 1 1 0 1.3.65.65 0 0 1 0-1.3z" fill="#3776ab" />
          <path d="M12.08 22c3.1 0 2.9-1.34 2.9-1.34l-.01-1.4h-2.95v-.42h5.88s2.02-.23 2.02-2.97c0-2.73-1.76-2.87-1.76-2.87h-1.05v1.48s.06 1.76-1.74 1.76h-3.01s-1.7-.03-1.7 1.63v3.45s-.24 2.28 1.42 2.28zm1.65-1.05a.65.65 0 1 1 0-1.3.65.65 0 0 1 0 1.3z" fill="#ffd43b" />
        </svg>
      );
    case 'pytorch':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#ee4c2c" aria-hidden="true">
          <path d="M13.2 2.1a1 1 0 0 0-1.4.2L7.3 8.3a6.5 6.5 0 1 0 9.2 9.2l1.6-1.6a1 1 0 1 0-1.4-1.4l-1.6 1.6a4.5 4.5 0 1 1-6.4-6.4l4.5-6a1 1 0 0 0-.02-1.6zM15 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
        </svg>
      );
    case 'opencv':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="7" r="4" fill="#ee2222" />
          <circle cx="7" cy="16" r="4" fill="#22aa22" />
          <circle cx="17" cy="16" r="4" fill="#2266ee" />
        </svg>
      );
    case 'mongodb':
    case 'mongodbatlas':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#13aa52" aria-hidden="true">
          <path d="M12 1.5s-6 5.5-6 11.5c0 4.5 3.5 7.5 6 9.5 2.5-2 6-5 6-9.5C18 7 12 1.5 12 1.5zm.2 18.3c-.2.2-.4.2-.4 0-.4-2.8-1.8-4.8-1.8-7.8 0-3 1.8-5.5 2-6 .2.5 2 3 2 6 0 3-1.4 5-1.8 7.8z" />
        </svg>
      );
    case 'postgresql':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#336791" aria-hidden="true">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.4 9.2.1-.4.2-.9.2-1.4 0-1.8-.8-3.4-1.8-4.8-.4-.6-.4-1.4 0-2 .6-.9 1.8-1.5 2.9-1.5h.3c.5-.8 1.4-1.3 2.4-1.3 1.2 0 2.2.8 2.5 1.9.9.2 1.6.8 1.9 1.6.5 1.3-.2 2.8-1.5 3.3v.2c0 1.2.5 2.3 1.3 3.1.6-.3 1.3-.5 2-.5 1.7 0 3.2 1 3.9 2.4 1.5-1.9 2.5-4.4 2.5-7.2 0-5.5-4.5-10-10-10z" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );
    case 'vscode':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#007acc" aria-hidden="true">
          <path d="M17.5 2L7 11.5 3 8l-2 1.5v5L3 16l4-3.5L17.5 22 23 19.5V4.5L17.5 2zm0 4.2L9.8 12l7.7 5.8V6.2z" />
        </svg>
      );
    case 'vite':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M20.5 4.5l-8.2 16a.8.8 0 0 1-1.4 0L2.7 4.5a.8.8 0 0 1 .7-1.2h16.4a.8.8 0 0 1 .7 1.2z" fill="#bd34fe" />
          <path d="M13.5 3L8 13.5h4.5L10.5 21 17 9.5h-4.5L13.5 3z" fill="#ffea83" />
        </svg>
      );
    case 'fastapi':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="#05998b" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M13 5L7 13h5l-1 6 6-8h-5l1-6z" fill="#fff" />
        </svg>
      );
    case 'api':
    case 'websocket':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#d5ad83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
  }
}

