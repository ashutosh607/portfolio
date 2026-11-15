import { MusicButton } from '../../audio/VillageMusicPlayer';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EntryGate from '../../entry/components/EntryGate';
import RamenBookModal from '../../projects/components/RamenBookModal';
import AboutModal from '../../about/AboutModal';
import SkillsModal from '../../skills/components/SkillsModal';
import MissionScroll from '../../experience/components/MissionScroll';
import ContactModal from '../../contact/ContactModal';
import ResumeViewerModal from '../../resume/ResumeViewerModal';

// Modular 2D Motion System Components (React Bits, GSAP & Animista inspired)
import useVillagePageMotion from '../hooks/useVillagePageMotion';
import StickyNavbar2D from './StickyNavbar2D';

import '../../skills/styles/SkillsModal.css';
import '../styles/FallbackPortfolio2D.css';
import '../styles/Portfolio2DAnimations.css';
import '../styles/VillagePage.css';

gsap.registerPlugin(ScrollTrigger);


const NAV_SECTIONS = [
  { id: 'intro', num: '01', label: 'Home' },
  { id: 'about', num: '02', label: 'About' },
  { id: 'projects', num: '03', label: 'Projects' },
  { id: 'missions', num: '04', label: 'Experience' },
  { id: 'skills', num: '05', label: 'Skills' },
  { id: 'contact', num: '06', label: 'Contact' },
];

export default function FallbackPortfolio2D({ onSwitchTo3D, webglError }) {
  const rootRef = useRef(null);
  const [activeSection, setActiveSection] = useState('intro');
  // Interactive Full-Screen Modal Overlays accessible inside 2D Mode
  const [openOverlay, setOpenOverlay] = useState(null);
  const [bookRequest, setBookRequest] = useState({ id: null, revision: 0 });
  const isNavigatingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const scrollRef = useVillagePageMotion(rootRef);

  // Scroll spy to highlight current section in the sticky navbar
  useEffect(() => {
    const wrapper = rootRef.current.closest('.portfolio-2d-wrapper');
    const sections = Array.from(rootRef.current.querySelectorAll('.p2d-section[id]'));

    const updateReadingProgress = () => {
      const range = wrapper.scrollHeight - wrapper.clientHeight;
      rootRef.current.style.setProperty('--reading-progress', range > 0 ? wrapper.scrollTop / range : 0);
    };

    const handleScroll = () => {
      updateReadingProgress();

      // When smooth-scrolling via navbar click, suppress scroll-spy overriding
      if (isNavigatingRef.current) return;

      const marker = wrapper.getBoundingClientRect().top + Math.min(wrapper.clientHeight * 0.34, 220);
      const visible = sections.filter((section) => section.getBoundingClientRect().top <= marker).at(-1);
      if (visible) {
        const id = visible.id.slice(4);
        setActiveSection((prev) => (prev !== id ? id : prev));
      }
    };

    let resizeTimer;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
        handleScroll();
      }, 120);
    });

    observer.observe(rootRef.current);
    wrapper.addEventListener('scroll', handleScroll, { passive: true });

    // Unlock programmatic navigation on user touch/wheel or when scroll stops
    const unlockNav = () => {
      clearTimeout(scrollTimeoutRef.current);
      isNavigatingRef.current = false;
    };

    wrapper.addEventListener('scrollend', unlockNav, { passive: true });
    wrapper.addEventListener('wheel', unlockNav, { passive: true });
    wrapper.addEventListener('touchstart', unlockNav, { passive: true });

    handleScroll();

    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(scrollTimeoutRef.current);
      observer.disconnect();
      wrapper.removeEventListener('scroll', handleScroll);
      wrapper.removeEventListener('scrollend', unlockNav);
      wrapper.removeEventListener('wheel', unlockNav);
      wrapper.removeEventListener('touchstart', unlockNav);
    };
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const normalized = sectionId === 'achievements' ? 'missions' : sectionId;
    setActiveSection(normalized);
    isNavigatingRef.current = true;
    clearTimeout(scrollTimeoutRef.current);

    // Release programmatic navigation lock once smooth scrolling completes
    scrollTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 750);

    const el = document.getElementById(`p2d-${normalized}`);
    if (el) {
      const wrapper = rootRef.current.closest('.portfolio-2d-wrapper');
      const header = rootRef.current.querySelector('.p2d-navbar');
      const headerOffset = header ? header.offsetHeight : 54;

      const targetTop =
        normalized === 'intro'
          ? 0
          : Math.max(
              0,
              wrapper.scrollTop +
                el.getBoundingClientRect().top -
                wrapper.getBoundingClientRect().top -
                headerOffset
            );

      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo(targetTop, { duration: 0.65 });
          return;
        }
        wrapper.scrollTo({
          top: targetTop,
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
      });
    }
  }, [scrollRef]);

  const handleInspectProjectFromSkills = useCallback((project) => {
    if (!project) return;
    setBookRequest(previous => ({ id: project.id, revision: previous.revision + 1 }));
    scrollToSection('projects');
  }, [scrollToSection]);

  return (
    <div ref={rootRef} className="p2d-root">
      <div className="p2d-ambient-bg" aria-hidden="true" />

      {/* Premium Sticky Navigation Bar with Sliding Active Indicator */}
      <StickyNavbar2D
        navSections={NAV_SECTIONS}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onOpenResume={() => setOpenOverlay('resume')}
        onSwitchTo3D={onSwitchTo3D}
      />

      <main className="p2d-main">
        {webglError && (
          <div className="p2d-webgl-banner" role="status">
            <span>
              ⚡ Running in <strong>High-Speed 2D Portfolio Mode</strong> ({webglError}).
            </span>
            {onSwitchTo3D && (
              <button
                type="button"
                className="p2d-btn-secondary"
                onClick={onSwitchTo3D}
              >
                Retry 3D World
              </button>
            )}
          </div>
        )}
        <section id="p2d-intro" className="p2d-section">
          <EntryGate embedded onClose={onSwitchTo3D} onOpenModal={scrollToSection}/>
        </section>
        <section id="p2d-about" className="p2d-section p2d-village-scene">
          <AboutModal embedded isOpen onOpenResume={() => setOpenOverlay('resume')} onOpenContact={() => scrollToSection('contact')}/>
        </section>
        <section id="p2d-projects" className="p2d-section p2d-book-section" aria-label="Location 02 · Ichiraku Ramen">
          <RamenBookModal key={bookRequest.revision} isOpen embedded
            initialProjectId={bookRequest.id} onVillage={onSwitchTo3D}/>
        </section>
        <section id="p2d-missions" className="p2d-section" aria-label="Location 05 · Mission Board">
          <MissionScroll embedded onContact={() => scrollToSection('contact')}/>
        </section>
        <section id="p2d-skills" className="p2d-section p2d-village-scene">
          <SkillsModal embedded isOpen onInspectProject={handleInspectProjectFromSkills}/>
        </section>
        <section id="p2d-contact" className="p2d-section p2d-village-scene">
          <ContactModal embedded isOpen onOpenResume={() => setOpenOverlay('resume')}/>
        </section>

        <footer className="p2d-footer">
          <p>
            Crafted by <strong>Ashutosh Kadam</strong> • Konoha Shinobi Portfolio (2D &amp;
            3D Interactive Edition)
          </p>
          {!openOverlay && <div className="portfolio-footer-music"><MusicButton /></div>}
        </footer>
      </main>

      {/* ============================================================
          INTERACTIVE FULL-SCREEN MODALS ACCESSIBLE IN 2D MODE
          ============================================================ */}

      {openOverlay === 'resume' && (
        <ResumeViewerModal
          isOpen={true}
          onClose={() => setOpenOverlay(null)}
          onBack={() => setOpenOverlay(null)}
        />
      )}
    </div>
  );
}
