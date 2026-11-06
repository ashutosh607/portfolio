import React, { useEffect, useState } from 'react';
import RamenBookModal from './RamenBookModal';
import AboutModal from './AboutModal';
import ContactModal from './ContactModal';
import {
  KONOHA_LOCATIONS,
  PORTFOLIO_PROJECTS,
  SKILL_SCROLLS,
  MISSION_DOSSIERS,
} from '../config/locations';

const PortfolioModals = React.memo(function PortfolioModals({
  activeModal,
  onClose,
  onOpenModal,
  onFastTravel,
}) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeScrollId, setActiveScrollId] = useState('frontend');
  const [resumeOrigin, setResumeOrigin] = useState('about');

  // Reset sub-selection when modal changes
  useEffect(() => {
    setSelectedProject(null);
    if (activeModal === 'about' || activeModal === 'contact') {
      setResumeOrigin(activeModal);
    }
  }, [activeModal]);

  // ESC key to close modal or exit sub-view (RamenBookModal, AboutModal & ContactModal handle ESC with their own GSAP exit animations)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === 'Escape' &&
        activeModal &&
        activeModal !== 'projects' &&
        activeModal !== 'about' &&
        activeModal !== 'contact'
      ) {
        if (selectedProject) {
          setSelectedProject(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, selectedProject, onClose]);

  if (!activeModal) return null;

  const travelToDestination = (locId) => {
    const loc = KONOHA_LOCATIONS.find((l) => l.id === locId);
    if (loc && onFastTravel) {
      onFastTravel(loc.position);
      onClose();
    }
  };

  // Custom Interactive Japanese Ramen Book for Ichiraku Projects Menu
  if (activeModal === 'projects') {
    return (
      <RamenBookModal
        isOpen={true}
        onClose={onClose}
        onFastTravel={onFastTravel}
        initialProjectId={selectedProject?.id}
      />
    );
  }

  // Full-Screen Dark Editorial About Me Experience (Hokage's Office)
  if (activeModal === 'about') {
    return (
      <AboutModal
        isOpen={true}
        onClose={onClose}
        onOpenResume={() => {
          setResumeOrigin('about');
          onOpenModal?.('resume');
        }}
      />
    );
  }

  // Full-Screen Dark Editorial Hokage Monument Contact Experience (Location 06)
  if (activeModal === 'contact') {
    return (
      <ContactModal
        isOpen={true}
        onClose={onClose}
        onOpenResume={() => {
          setResumeOrigin('contact');
          onOpenModal?.('resume');
        }}
        onTeleportToMonument={
          onFastTravel ? () => travelToDestination('hokage-monument') : null
        }
      />
    );
  }

  const handleInspectProjectById = (projectId) => {
    const found = PORTFOLIO_PROJECTS.find((p) => p.id === projectId);
    if (found) {
      onOpenModal?.('projects');
      setTimeout(() => setSelectedProject(found), 10);
    } else {
      onOpenModal?.('projects');
    }
  };

  return (
    <div className="portfolio-modal-overlay" onClick={onClose}>
      <div
        className="portfolio-modal-scroll"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Scroll Ornament Header */}
        <div className="scroll-roller scroll-top">
          <div className="roller-rod" />
          <div className="roller-knob knob-left" />
          <div className="roller-knob knob-right" />
        </div>

        {/* Modal Header */}
        <div className="portfolio-modal-header">
          <div className="modal-title-group">
            <span className="modal-category-tag">
              {activeModal === 'intro' && '🍃 LOCATION 01 • MAIN ENTRY GATE'}
              {activeModal === 'projects' && '🍜 LOCATION 02 • ICHIRAKU RAMEN MENU'}
              {activeModal === 'about' && "📜 LOCATION 03 • HOKAGE'S OFFICE ARCHIVE"}
              {activeModal === 'skills' && '⚔️ LOCATION 04 • TRAINING GROUNDS SCROLLS'}
              {activeModal === 'achievements' && '🏆 LOCATION 05 • KONOHA MISSION BOARD'}
              {activeModal === 'contact' && '⛰️ LOCATION 06 • HOKAGE MONUMENT'}
              {activeModal === 'resume' && '🎖️ SHINOBI CREDENTIALS & RESUME'}
            </span>
            <h2 className="modal-main-title">
              {activeModal === 'intro' && "Hello, I'm Ashutosh."}
              {activeModal === 'projects' &&
                (selectedProject
                  ? `${selectedProject.title} — Dish Details`
                  : 'Ichiraku Ramen • Featured Projects Menu')}
              {activeModal === 'about' && 'About Ashutosh • Developer Story & Goals'}
              {activeModal === 'skills' && 'Technical Skills & Jutsu Scrolls'}
              {activeModal === 'achievements' && 'Shinobi Experience & Mission Dossiers'}
              {activeModal === 'contact' && 'Every Great Mission Starts With a Conversation'}
              {activeModal === 'resume' && 'Credentials & Professional Resume'}
            </h2>
          </div>

          <div className="modal-header-actions">
            {selectedProject && (
              <button
                className="modal-back-button"
                onClick={() => setSelectedProject(null)}
              >
                ← Back to Menu
              </button>
            )}
            {activeModal === 'resume' && (
              <button
                className="modal-back-button"
                onClick={() => onOpenModal?.(resumeOrigin || 'about')}
              >
                ← Back to {resumeOrigin === 'contact' ? 'Contact' : 'About'}
              </button>
            )}
            <button className="modal-close-button" onClick={onClose} title="Close">
              ✕ Close
            </button>
          </div>
        </div>

        {/* Modal Scroll Content Body */}
        <div className="portfolio-modal-body">
          {/* ================= 01. INTRO / WELCOME MODAL (MAIN STREET) ================= */}
          {activeModal === 'intro' && (
            <div className="modal-section-content">
              <div className="intro-hero-banner">
                <div className="intro-badge-row">
                  <span className="shinobi-role-pill">AI/ML Developer</span>
                  <span className="shinobi-role-pill">Full-Stack Developer</span>
                  <span className="shinobi-role-pill">Problem Solver</span>
                </div>
                <h3 className="intro-quote-headline">
                  "A shinobi of code, building things worth discovering."
                </h3>
                <p className="intro-lead-text">
                  Welcome to my interactive 3D Hidden Leaf Village portfolio. Walk down the streets
                  of Konoha, talk to iconic shinobi, or travel directly to any of the{' '}
                  <strong>6 village destinations</strong> below to explore my engineering work, AI/ML
                  systems, skills, and mission history.
                </p>

                <div className="intro-cta-row">
                  <button className="intro-primary-btn" onClick={onClose}>
                    🍃 Explore My World
                  </button>
                  <button
                    className="intro-secondary-btn"
                    onClick={() => onOpenModal?.('projects')}
                  >
                    🍜 View My Projects
                  </button>
                  <button
                    className="intro-tertiary-btn"
                    onClick={() => onOpenModal?.('contact')}
                  >
                    ⛰️ Contact Me
                  </button>
                </div>
              </div>

              <h4 className="destinations-grid-heading">
                🗺️ SIX VILLAGE DESTINATIONS — CLICK TO VISIT OR EXPLORE
              </h4>
              <div className="intro-destinations-grid">
                {KONOHA_LOCATIONS.map((loc) => (
                  <div key={loc.id} className="intro-dest-card">
                    <div className="dest-card-top">
                      <span className="dest-num-badge" style={{ backgroundColor: loc.color }}>
                        {loc.number}
                      </span>
                      <span className="dest-icon">{loc.icon}</span>
                      <div>
                        <strong className="dest-title">{loc.name}</strong>
                        <span className="dest-role">{loc.role}</span>
                      </div>
                    </div>
                    <p className="dest-desc">{loc.description}</p>
                    <div className="dest-card-actions">
                      <button
                        className="dest-action-open"
                        onClick={() => {
                          if (loc.id === 'main-street') {
                            onClose();
                          } else {
                            onOpenModal?.(loc.modalKey);
                          }
                        }}
                      >
                        Open Section
                      </button>
                      {onFastTravel && (
                        <button
                          className="dest-action-travel"
                          onClick={() => {
                            onFastTravel(loc.position);
                            onClose();
                          }}
                        >
                          Teleport Here →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 02. PROJECTS MODAL (ICHIRAKU RAMEN) ================= */}
          {activeModal === 'projects' && !selectedProject && (
            <div className="modal-section-content">
              <p className="section-intro">
                "Welcome to Ichiraku Ramen! Every project on the menu is crafted to solve a real-world
                problem. Click any dish to inspect its architecture, features, and links."
              </p>

              <div className="projects-grid">
                {PORTFOLIO_PROJECTS.map((proj) => (
                  <article
                    key={proj.id}
                    className="portfolio-project-card clickable-card"
                    onClick={() => setSelectedProject(proj)}
                  >
                    <div className="dish-header-strip">
                      <span className="dish-bowl-tag">🍜 {proj.dishName}</span>
                      <span className="card-top-tag">{proj.category}</span>
                    </div>

                    <h3 className="project-title">{proj.title}</h3>
                    <p className="project-desc">{proj.shortDesc}</p>

                    <div className="tech-stack-pills">
                      {proj.techStack.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>

                    <div className="card-footer-links">
                      <button
                        type="button"
                        className="inspect-dish-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(proj);
                        }}
                      >
                        Inspect Dish & Details →
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {onFastTravel && (
                <div className="travel-prompt-banner">
                  <span>Want to visit the physical ramen shop in the village?</span>
                  <button
                    className="fast-travel-button"
                    onClick={() => travelToDestination('ichiraku-ramen')}
                  >
                    🍜 Teleport to Ichiraku Ramen
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= 02B. PROJECT DETAIL VIEW ================= */}
          {activeModal === 'projects' && selectedProject && (
            <div className="modal-section-content project-detail-view">
              <div className="project-detail-banner">
                <div className="detail-banner-top">
                  <span className="dish-bowl-tag">🍜 {selectedProject.dishName}</span>
                  <span className="card-top-tag">{selectedProject.category}</span>
                </div>
                <h3 className="detail-main-heading">{selectedProject.title}</h3>
                <p className="detail-lead-summary">{selectedProject.shortDesc}</p>
              </div>

              <div className="detail-two-col">
                <div className="detail-box">
                  <h4 className="detail-box-title">🎯 PROBLEM SOLVED</h4>
                  <p className="detail-box-text">{selectedProject.problemSolved}</p>
                </div>

                <div className="detail-box">
                  <h4 className="detail-box-title">⚡ KEY FEATURES & ARCHITECTURE</h4>
                  <ul className="detail-feature-list">
                    {selectedProject.features.map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="detail-box">
                <h4 className="detail-box-title">🛠️ TECHNOLOGY STACK</h4>
                <div className="skills-badge-list">
                  {selectedProject.techStack.map((tech) => (
                    <span key={tech} className="skill-badge primary">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="detail-links-bar">
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="intro-primary-btn link-btn"
                >
                  💻 View GitHub Repository ↗
                </a>
                {selectedProject.id === 'konoha-3d-portfolio' ? (
                  <button className="intro-secondary-btn" onClick={onClose}>
                    🍃 Explore Live 3D World
                  </button>
                ) : (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="intro-secondary-btn link-btn"
                  >
                    🚀 Project Overview & Code ↗
                  </a>
                )}
                <button
                  className="intro-tertiary-btn"
                  onClick={() => setSelectedProject(null)}
                >
                  ← Back to All Dishes
                </button>
              </div>
            </div>
          )}

          {/* ================= 04. SKILLS MODAL (TRAINING GROUNDS) ================= */}
          {activeModal === 'skills' && (
            <div className="modal-section-content">
              <p className="section-intro">
                "Select any of the 7 Training Grounds scrolls below to unroll the technologies and
                inspect the projects built with them."
              </p>

              {/* Interactive Scroll Selector Tabs */}
              <div className="scroll-selector-rack">
                {SKILL_SCROLLS.map((scroll) => {
                  const isOpen = activeScrollId === scroll.id;
                  return (
                    <button
                      key={scroll.id}
                      className={`training-scroll-pill ${isOpen ? 'active' : ''}`}
                      onClick={() => setActiveScrollId(scroll.id)}
                    >
                      <span className="scroll-pill-icon">{scroll.icon}</span>
                      <span className="scroll-pill-title">{scroll.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Unfurled Scroll Display */}
              {SKILL_SCROLLS.filter((s) => s.id === activeScrollId).map((scroll) => (
                <div key={scroll.id} className="unfurled-skill-scroll">
                  <div className="unfurled-header">
                    <div>
                      <span className="unfurled-jp">{scroll.japaneseTitle}</span>
                      <h3 className="unfurled-title">
                        {scroll.icon} {scroll.title}
                      </h3>
                    </div>
                    <span className="scroll-seal-tag">JUTSU SCROLL</span>
                  </div>
                  <p className="unfurled-summary">{scroll.summary}</p>

                  <div className="unfurled-subsection">
                    <h4>⚡ TECHNOLOGIES & TOOLS</h4>
                    <div className="skills-badge-list">
                      {scroll.technologies.map((tech) => (
                        <span key={tech} className="skill-badge primary">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="unfurled-subsection">
                    <h4>🍜 RELATED PROJECTS (CLICK TO INSPECT)</h4>
                    <div className="related-projects-row">
                      {scroll.relatedProjects.map((projName) => {
                        const match = PORTFOLIO_PROJECTS.find(
                          (p) => p.title.toLowerCase() === projName.toLowerCase()
                        );
                        return (
                          <button
                            key={projName}
                            className="related-project-chip"
                            onClick={() =>
                              match
                                ? handleInspectProjectById(match.id)
                                : onOpenModal?.('projects')
                            }
                          >
                            <span>🍜 {projName}</span>
                            <span>→</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Complete Overview Grid of All 7 Scrolls */}
              <div className="skills-category-group" style={{ marginTop: '18px' }}>
                {SKILL_SCROLLS.map((scroll) => (
                  <div
                    key={scroll.id}
                    className="skill-cat-card clickable-card"
                    onClick={() => setActiveScrollId(scroll.id)}
                  >
                    <h4 className="cat-title">
                      {scroll.icon} {scroll.title}
                    </h4>
                    <div className="skills-badge-list">
                      {scroll.technologies.map((t) => (
                        <span key={t} className="skill-badge">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {onFastTravel && (
                <div className="travel-prompt-banner">
                  <span>Visit the Training Grounds in Konoha:</span>
                  <button
                    className="fast-travel-button"
                    onClick={() => travelToDestination('training-grounds')}
                  >
                    ⚔️ Teleport to Training Grounds
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= 05. EXPERIENCE / MISSION BOARD MODAL ================= */}
          {activeModal === 'achievements' && (
            <div className="modal-section-content">
              <p className="section-intro">
                "Pinned mission dossiers from hackathons, AI/ML builds, and engineering deployments."
              </p>

              <div className="missions-list">
                {MISSION_DOSSIERS.map((m) => (
                  <div key={m.id} className={`mission-item-card ${m.rankClass}`}>
                    <div className="mission-top-bar">
                      <span className="mission-badge">{m.rank} MISSION</span>
                      <span className="mission-date-pill">{m.date}</span>
                    </div>
                    <h4 className="mission-title">{m.title}</h4>
                    <div className="mission-meta-line">
                      <strong>{m.organization}</strong> • <span>Role: {m.role}</span>
                    </div>
                    <p className="mission-summary">{m.description}</p>
                    <div className="mission-bottom-row">
                      <span className="mission-reward">✓ Outcome: {m.outcome}</span>
                      {m.projectLink && (
                        <button
                          className="inspect-dish-btn"
                          onClick={() => handleInspectProjectById(m.projectLink)}
                        >
                          Inspect Project →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {onFastTravel && (
                <div className="travel-prompt-banner">
                  <span>Visit the Mission Board in Konoha:</span>
                  <button
                    className="fast-travel-button"
                    onClick={() => travelToDestination('mission-board')}
                  >
                    🏆 Teleport to Mission Board
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= RESUME MODAL ================= */}
          {activeModal === 'resume' && (
            <div className="modal-section-content">
              <div className="resume-scroll-card">
                <div className="resume-header-row">
                  <div>
                    <h3 className="resume-name">ASHUTOSH</h3>
                    <span className="resume-headline">
                      AI/ML Developer | Full-Stack Developer | Problem Solver
                    </span>
                  </div>
                  <button
                    className="ninja-hud-button"
                    onClick={() => window.print()}
                    title="Print or Save PDF"
                  >
                    📄 Save / Print Resume PDF
                  </button>
                </div>

                <div className="resume-body-sections">
                  <section className="resume-block">
                    <h4 className="block-title">SUMMARY</h4>
                    <p className="block-text">
                      AI/ML and Full-Stack Developer skilled in Python, PyTorch, OpenCV, React,
                      Node.js, and Three.js / WebGL. Experienced in building intelligent end-to-end
                      applications including TravelFlow AI, CallKavach, WasteWise, Racket Sports
                      Intelligence, and interactive 3D web experiences.
                    </p>
                  </section>

                  <section className="resume-block">
                    <h4 className="block-title">KEY PROJECTS</h4>
                    <ul className="competency-list">
                      <li>
                        <strong>TravelFlow AI:</strong> AI-powered itinerary planning and route
                        orchestration platform using React, Node.js, Python, and LLM APIs.
                      </li>
                      <li>
                        <strong>CallKavach:</strong> Real-time voice phishing and scam call detection
                        shield powered by NLP intent analysis and FastAPI streaming.
                      </li>
                      <li>
                        <strong>Racket Sports Intelligence:</strong> Computer vision player tracking,
                        court mapping, and shot analytics pipeline built with Python, OpenCV, and PyTorch.
                      </li>
                      <li>
                        <strong>WasteWise:</strong> Deep learning waste classification and recycling
                        guidance system for automated sustainability sorting.
                      </li>
                    </ul>
                  </section>

                  <section className="resume-block">
                    <h4 className="block-title">TECHNICAL SKILLS</h4>
                    <ul className="competency-list">
                      <li>
                        <strong>Frontend & 3D:</strong> React, JavaScript, TypeScript, Three.js, React
                        Three Fiber, HTML5, CSS3, Tailwind CSS.
                      </li>
                      <li>
                        <strong>Backend & APIs:</strong> Node.js, Express, FastAPI, REST APIs,
                        WebSockets.
                      </li>
                      <li>
                        <strong>AI & Machine Learning:</strong> Python, PyTorch, OpenCV, Computer
                        Vision, NLP / Transformers, LLM Orchestration.
                      </li>
                      <li>
                        <strong>Databases & Tools:</strong> PostgreSQL, MongoDB, SQLite, Git, Docker,
                        Linux, Vite.
                      </li>
                    </ul>
                  </section>

                  <section className="resume-block">
                    <h4 className="block-title">EDUCATION</h4>
                    <div className="resume-sub-item">
                      <span className="item-title">
                        B.Tech in Artificial Intelligence &amp; Machine Learning
                      </span>
                      <span className="item-desc">
                        Dwarkadas J. Sanghvi College of Engineering (DJSCE)
                      </span>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Return to Village Footer Bar */}
        <div className="portfolio-modal-footer">
          <span className="footer-hint">Press ESC or click Return to Village at any time</span>
          <button className="return-village-btn" onClick={onClose}>
            🍃 Return to Village
          </button>
        </div>

        {/* Scroll Ornament Footer */}
        <div className="scroll-roller scroll-bottom">
          <div className="roller-rod" />
          <div className="roller-knob knob-left" />
          <div className="roller-knob knob-right" />
        </div>
      </div>
    </div>
  );
});

export default PortfolioModals;
