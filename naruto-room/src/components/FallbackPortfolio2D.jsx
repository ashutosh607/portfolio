import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EntryGate from './EntryGate';
import RamenBookModal from './RamenBookModal';
import AboutModal from './AboutModal';
import SkillsModal from './skills/SkillsModal';
import MissionScroll from './mission-scroll/MissionScroll';
import ContactModal from './ContactModal';
import ResumeViewerModal from './ResumeViewerModal';

// Modular 2D Motion System Components (React Bits, GSAP & Animista inspired)
import useVillagePageMotion from './portfolio2d/useVillagePageMotion';
import StickyNavbar2D from './portfolio2d/StickyNavbar2D';

import './skills/SkillsModal.css';
import './FallbackPortfolio2D.css';
import './portfolio2d/Portfolio2DAnimations.css';
import './portfolio2d/VillagePage.css';

gsap.registerPlugin(ScrollTrigger);


const NAV_SECTIONS = [
  { id: 'intro', num: '01', label: 'Intro' },
  { id: 'projects', num: '02', label: 'Projects' },
  { id: 'about', num: '03', label: 'About' },
  { id: 'skills', num: '04', label: 'Skills' },
  { id: 'missions', num: '05', label: 'Missions' },
  { id: 'contact', num: '06', label: 'Contact' },
];

export default function FallbackPortfolio2D({ onSwitchTo3D, webglError }) {
  const rootRef = useRef(null);
  const [activeSection, setActiveSection] = useState('intro');
  // Interactive Full-Screen Modal Overlays accessible inside 2D Mode
  const [openOverlay, setOpenOverlay] = useState(null);
  const [bookRequest, setBookRequest] = useState({ id: null, revision: 0 });

  useVillagePageMotion(rootRef);

  // Scroll spy to highlight current section in the sticky navbar
  useEffect(() => {
    const wrapper = rootRef.current.closest('.portfolio-2d-wrapper');
    const sections = Array.from(rootRef.current.querySelectorAll('.p2d-section[id]'));
    const handleScroll = () => {
      const range = wrapper.scrollHeight - wrapper.clientHeight;
      rootRef.current.style.setProperty('--reading-progress', range > 0 ? wrapper.scrollTop / range : 0);
      const marker = wrapper.getBoundingClientRect().top + Math.min(wrapper.clientHeight * .34, 220);
      const visible = sections.filter(section => section.getBoundingClientRect().top <= marker).at(-1);
      if (visible) setActiveSection(visible.id.slice(4));
    };
    const observer = new ResizeObserver(() => { ScrollTrigger.refresh(); handleScroll(); });
    observer.observe(rootRef.current);
    wrapper.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => { observer.disconnect(); wrapper.removeEventListener('scroll', handleScroll); };
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const normalized = sectionId === 'achievements' ? 'missions' : sectionId;
    setActiveSection(normalized);
    const el = document.getElementById(`p2d-${normalized}`);
    if (el) {
      el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }
  }, []);

  const handleInspectProjectFromSkills = useCallback((project) => {
    if (!project) return;
    setBookRequest(previous => ({ id: project.id, revision: previous.revision + 1 }));
    scrollToSection('projects');
  }, [scrollToSection]);

  return (
    <div ref={rootRef} className="p2d-root">
      <div className="p2d-ambient-bg" aria-hidden="true"><div className="p2d-village-landscape"/></div>

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
        <section id="p2d-projects" className="p2d-section p2d-book-section" aria-label="Location 02 · Ichiraku Ramen">
          <RamenBookModal key={bookRequest.revision} isOpen embedded
            initialProjectId={bookRequest.id} onVillage={onSwitchTo3D}/>
        </section>
        <section id="p2d-about" className="p2d-section p2d-village-scene">
          <AboutModal embedded isOpen onOpenResume={() => setOpenOverlay('resume')} onOpenContact={() => scrollToSection('contact')}/>
        </section>
        <section id="p2d-skills" className="p2d-section p2d-village-scene">
          <SkillsModal embedded isOpen onInspectProject={handleInspectProjectFromSkills}/>
        </section>
        <section id="p2d-missions" className="p2d-section" aria-label="Location 05 · Mission Board">
          <MissionScroll embedded onContact={() => scrollToSection('contact')}/>
        </section>
        <section id="p2d-contact" className="p2d-section p2d-village-scene">
          <ContactModal embedded isOpen onOpenResume={() => setOpenOverlay('resume')}/>
        </section>

        <footer className="p2d-footer">
          <p>
            Crafted by <strong>Ashutosh Kadam</strong> • Konoha Shinobi Portfolio (2D &amp;
            3D Interactive Edition)
          </p>
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
