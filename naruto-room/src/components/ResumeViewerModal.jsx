import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './ResumeViewerModal.css';

export default function ResumeViewerModal({ isOpen, onClose, onBack, originName = 'About' }) {
  const overlayRef = useRef(null);
  const shellRef = useRef(null);
  const closeBtnRef = useRef(null);
  const timelineRef = useRef(null);
  const isClosingRef = useRef(false);

  const pdfUrl = '/Ashutosh_Kadam_Resume.pdf';

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleClose = (afterCallback) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    if (prefersReducedMotion() || !overlayRef.current) {
      isClosingRef.current = false;
      if (afterCallback) afterCallback();
      else onClose?.();
      return;
    }

    timelineRef.current?.kill();
    const tl = gsap.timeline({
      onComplete: () => {
        isClosingRef.current = false;
        if (afterCallback) afterCallback();
        else onClose?.();
      },
    });
    timelineRef.current = tl;

    tl.to(shellRef.current, {
      opacity: 0,
      scale: 0.98,
      y: 12,
      duration: 0.22,
      ease: 'power2.in',
    }).to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.26,
        ease: 'power2.inOut',
      },
      0.04
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    isClosingRef.current = false;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (!prefersReducedMotion()) {
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(shellRef.current, { opacity: 0, scale: 0.97, y: 16 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timelineRef.current = tl;

      tl.to(overlayRef.current, { opacity: 1, duration: 0.3 }, 0).to(
        shellRef.current,
        { opacity: 1, scale: 1, y: 0, duration: 0.42 },
        0.06
      );
    }

    const timer = requestAnimationFrame(() => {
      closeBtnRef.current?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(timer);
      timelineRef.current?.kill();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="resume-viewer-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-viewer-title"
    >
      <div className="resume-viewer-backdrop" onClick={() => handleClose()} />

      <div ref={shellRef} className="resume-viewer-shell">
        {/* Top Header Bar */}
        <header className="resume-viewer-header">
          <div className="resume-viewer-title-group">
            {onBack && (
              <button
                type="button"
                className="resume-viewer-back-btn"
                onClick={() => handleClose(onBack)}
              >
                ← Back to {originName}
              </button>
            )}
            <div>
              <h2 id="resume-viewer-title" className="resume-viewer-heading">
                Ashutosh Kadam • Resume
              </h2>
              <span className="resume-viewer-sub">
                B.Tech AIML @ DJSCE • Full-Stack &amp; AI/ML Developer
              </span>
            </div>
          </div>

          <div className="resume-viewer-actions">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="resume-viewer-action-btn secondary"
              title="Open raw PDF in new browser tab"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>Open in New Tab</span>
            </a>

            <a
              href={pdfUrl}
              download="Ashutosh_Kadam_Resume.pdf"
              className="resume-viewer-action-btn primary"
              title="Download PDF"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download PDF</span>
            </a>

            <button
              ref={closeBtnRef}
              type="button"
              className="resume-viewer-close-btn"
              onClick={() => handleClose()}
              aria-label="Close Resume"
              title="Close (ESC)"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Embedded PDF Document Body */}
        <div className="resume-viewer-body">
          <object
            data={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            type="application/pdf"
            className="resume-pdf-object"
            title="Ashutosh Kadam Resume"
          >
            {/* Fallback iframe / direct reader if object is blocked */}
            <iframe
              src={`${pdfUrl}#toolbar=1`}
              className="resume-pdf-iframe"
              title="Ashutosh Kadam Resume Viewer"
            >
              <div className="resume-fallback-notice">
                <p>Your browser could not preview the PDF inline.</p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-viewer-action-btn primary"
                >
                  Click here to view or download the resume PDF ↗
                </a>
              </div>
            </iframe>
          </object>
        </div>
      </div>
    </div>
  );
}

