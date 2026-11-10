import { ArrowUpRight, ArrowRight, Send, Copy, MapPin, X, FileText, Code2, BriefcaseBusiness } from 'lucide-react';
import { published, apiBase } from '../data/published';
import { sectionEntrance } from '../utils/sectionEntrance';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import './ContactModal.css';





export default function ContactModal({
  isOpen,
  embedded = false,
  onClose,
  onOpenResume,
  onTeleportToMonument,
}) {
  const [delivery, setDelivery] = useState('');
  const [sending, setSending] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    if (!info) {
      const subject = encodeURIComponent('Portfolio inquiry from ' + fields.name);
      const message = encodeURIComponent(fields.message + '\n\n' + fields.name + '\n' + fields.email);
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + message;
      setDelivery('Finish sending in your email app, or use the address alongside this form.');
      return;
    }
    setSending(true);
    setDelivery('');
    try {
      const response = await fetch(apiBase + '/contact/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error();
      form.reset();
      setDelivery('Message delivered. Thank you for reaching out.');
    } catch {
      setDelivery('Your message could not be sent. Try again or email me directly.');
    } finally {
      setSending(false);
    }
  }
  const info = published?.contact;
  const CONTACT_EMAIL = info?.email ?? 'ashutoshkadam607@gmail.com';
  const GITHUB_URL = info?.githubUrl ?? 'https://github.com/ashutosh607';
  const LINKEDIN_URL = info?.linkedinUrl ?? 'https://www.linkedin.com/in/Ashutosh-kadam';
  const overlayRef = useRef(null);
  const bgRef = useRef(null);
  const closeBtnRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const descRef = useRef(null);
  const gridRef = useRef(null);
  const footerRef = useRef(null);
  const timelineRef = useRef(null);
  const isClosingRef = useRef(false);

  const [copyLabel, setCopyLabel] = useState('Copy email');
  const copyTimerRef = useRef(null);

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleCopyEmail = useCallback(async () => {
    try { await navigator.clipboard.writeText(CONTACT_EMAIL); setCopyLabel('Copied'); } catch { setCopyLabel('Select the address to copy'); }

    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopyLabel('Copy email');
    }, 2400);
  }, [CONTACT_EMAIL]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [CONTACT_EMAIL]);

  const triggerClose = useCallback(
    (afterCloseCallback) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;

      if (prefersReducedMotion() || !overlayRef.current) {
        isClosingRef.current = false;
        if (afterCloseCallback) afterCloseCallback();
        else onClose?.();
        return;
      }

      timelineRef.current?.kill();
      const cards = gridRef.current
        ? [...gridRef.current.querySelectorAll('.contact-desk-section')]
        : [];

      const tl = gsap.timeline({
        onComplete: () => {
          isClosingRef.current = false;
          if (afterCloseCallback) afterCloseCallback();
          else onClose?.();
        },
      });
      timelineRef.current = tl;

      tl.to(
        [
          eyebrowRef.current,
          headingRef.current,
          subtitleRef.current,
          descRef.current,
          ...cards,
          footerRef.current,
        ].filter(Boolean),
        {
          opacity: 0,
          y: 10,
          duration: 0.22,
          ease: 'power2.in',
          overwrite: 'auto',
        },
        0
      ).to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.28,
          ease: 'power2.inOut',
        },
        0.06
      );
    },
    [onClose]
  );

  // Opening GSAP timeline (~1.15s total) + subtle pointer parallax on background
  useEffect(() => {
    if (!isOpen) return;
    isClosingRef.current = false;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (!embedded) document.body.style.overflow = 'hidden';

    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const cards = gridRef.current
        ? gridRef.current.querySelectorAll('.contact-desk-section')
        : [];

      if (reduced) {
        gsap.set(overlayRef.current, { opacity: 1 });
        gsap.set(bgRef.current, { opacity: 1, scale: 1 });
        return;
      }

      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(bgRef.current, { opacity: 0, scale: 1.03, x: 0, y: 0 });
      gsap.set([eyebrowRef.current, headingRef.current], { opacity: 0, y: 18 });
      gsap.set([subtitleRef.current, descRef.current].filter(Boolean), { opacity: 0, y: 14 });
      gsap.set(cards, { opacity: 0, y: 16 });
      gsap.set(footerRef.current, { opacity: 0, y: 12 });

      const tl = sectionEntrance(overlayRef.current, embedded);
      timelineRef.current = tl;

      // 1. Dark overlay & background artwork reveal gently
      tl.to(overlayRef.current, { opacity: 1, duration: 0.32, ease: 'power2.out' }, 0)
        .to(bgRef.current, { opacity: 1, scale: 1.015, duration: 0.88, ease: 'power2.out' }, 0.04)
        // 2. Eyebrow & Main Heading slide upward and fade in
        .to(
          [eyebrowRef.current, headingRef.current],
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
          },
          0.16
        )
        // 3. Subtitle & Supporting Paragraph appear
        .to(
          [subtitleRef.current, descRef.current].filter(Boolean),
          {
            opacity: 1,
            y: 0,
            duration: 0.46,
            stagger: 0.07,
          },
          0.32
        )
        // 4. Four contact options reveal with a small stagger
        .to(
          cards,
          {
            opacity: 1,
            y: 0,
            duration: 0.44,
            stagger: 0.06,
          },
          0.46
        )
        // 5. Footer actions fade in
        .to(
          footerRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
          },
          0.66
        );
    }, overlayRef);

    // Subtle pointer parallax on the background artwork (desktop only, respects reduced motion)
    let handlePointerMove = null;
    if (!embedded && !reduced && bgRef.current) {
      const xTo = gsap.quickTo(bgRef.current, 'x', { duration: 0.7, ease: 'power2.out' });
      const yTo = gsap.quickTo(bgRef.current, 'y', { duration: 0.7, ease: 'power2.out' });
      handlePointerMove = (e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * -10;
        const ny = (e.clientY / window.innerHeight - 0.5) * -7;
        xTo(nx);
        yTo(ny);
      };
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }

    const focusTimer = requestAnimationFrame(() => {
      if (!embedded) closeBtnRef.current?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(focusTimer);
      if (handlePointerMove) {
        window.removeEventListener('pointermove', handlePointerMove);
      }
      timelineRef.current?.kill();
      ctx.revert();
      if (!embedded) {
        document.body.style.overflow = previousOverflow;
        previousFocus?.focus?.({ preventScroll: true });
      }
    };
  }, [isOpen, embedded]);

  // ESC to close & Focus Trap
  useEffect(() => {
    if (!isOpen || embedded) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        triggerClose();
        return;
      }
      if (event.key === 'Tab' && overlayRef.current) {
        const focusable = [
          ...overlayRef.current.querySelectorAll(
            'button:not(:disabled), input, textarea, a[href], [tabindex="0"]'
          ),
        ].filter((el) => el.getClientRects().length > 0);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, embedded, triggerClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="contact-monument-overlay"
      role={embedded ? "region" : "dialog"}
      aria-modal={embedded ? undefined : true}
      aria-labelledby="contact-main-heading"
    >
      <div ref={bgRef} className="contact-background" aria-hidden="true" />
      {!embedded && (
        <button ref={closeBtnRef} className="contact-minimal-close-btn" onClick={() => triggerClose()} aria-label="Close contact">
          <X size={20} />
        </button>
      )}
      <div className="contact-scroll-container">
        <div className="contact-editorial-shell">
          <header className="contact-landscape">
            <div className="contact-landscape-copy">
              <p ref={eyebrowRef} className="contact-overline"><MapPin size={14} /> Hokage Monument</p>
              <h2 ref={headingRef} id="contact-main-heading" className="contact-hero-heading">Get in touch<span>.</span></h2>
              <p ref={descRef} className="contact-hero-description">{info?.description || 'Have a role in mind, a project to build, or a question about my work? I’d love to hear from you.'}</p>
              {info && <p ref={subtitleRef} className="contact-availability" data-available={Boolean(info.isAvailable)}>{info.isAvailable ? info.availabilityText || 'Available for opportunities' : 'Currently unavailable'}</p>}
            </div>
          </header>
          <div ref={gridRef} className="contact-desk">
            <section className="contact-desk-section contact-address">
              <h3>Reach me directly</h3>
              <a className="contact-email" href={'mailto:' + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>
              <button className="contact-copy" onClick={handleCopyEmail} aria-live="polite"><Copy size={14} />{copyLabel}</button>
              <div className="contact-links">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"><Code2 />GitHub<ArrowUpRight /></a>
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"><BriefcaseBusiness />LinkedIn<ArrowUpRight /></a>
                <button onClick={embedded ? onOpenResume : () => triggerClose(onOpenResume)}><FileText />View résumé<ArrowRight /></button>
              </div>
            </section>
            <section className="contact-desk-section contact-compose">
              <h3>Write a message</h3>
              <form onSubmit={sendMessage}>
                <label>Your name<input autoComplete="name" name="name" required maxLength={100} /></label>
                <label>Email address<input autoComplete="email" type="email" name="email" required maxLength={200} /></label>
                <label className="contact-full">Message<textarea name="message" rows={3} required maxLength={5000} /></label>
                <div className="contact-submit-row contact-full">
                  <button disabled={sending} className="contact-send">{sending ? 'Sending…' : info ? 'Send message' : 'Open email draft'}<Send size={16} /></button>
                  <span role="status">{delivery}</span>
                </div>
              </form>
            </section>
          </div>
          <footer ref={footerRef} className="contact-foot">
            <span><MapPin size={15}/>{info?.location || 'Hokage Monument Plaza'}</span>
            {!embedded && <div>
              {onTeleportToMonument && <button onClick={() => triggerClose(onTeleportToMonument)}>Teleport to monument</button>}
              <button onClick={() => triggerClose()}>Return to village <ArrowRight size={15}/></button>
            </div>}
          </footer>
        </div>
      </div>
    </div>
  );
}