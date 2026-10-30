import React, { useEffect, useState } from 'react';
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
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Reset sub-selection when modal changes
  useEffect(() => {
    setSelectedProject(null);
  }, [activeModal]);

  // ESC key to close modal or exit sub-view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape' && activeModal) {
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

  const handleInspectProjectById = (projectId) => {
    const found = PORTFOLIO_PROJECTS.find((p) => p.id === projectId);
    if (found) {
      onOpenModal?.('projects');
      setTimeout(() => setSelectedProject(found), 10);
    } else {
      onOpenModal?.('projects');
    }
  };

  const travelToDestination = (locId) => {
    const loc = KONOHA_LOCATIONS.find((l) => l.id === locId);
    if (loc && onFastTravel) {
      onFastTravel(loc.position);
      onClose();
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText('ashutosh.shinobi.dev@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
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
              {activeModal === 'intro' && '🍃 LOCATION 01 • KONOHA MAIN STREET'}
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
                onClick={() => onOpenModal?.('about')}
              >
                ← Back to About
              </button>
            )}
            <button className="modal-close-button" onClick={onClose} title="Close (ESC)">
              ✕ ESC
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

          {/* ================= 03. ABOUT ME MODAL (HOKAGE'S OFFICE) ================= */}
          {activeModal === 'about' && (
            <div className="modal-section-content about-content">
              <div className="about-bio-card">
                <div className="bio-lead-avatar">
                  <span className="avatar-monogram">木</span>
                  <div className="avatar-meta">
                    <h3>Ashutosh</h3>
                    <span className="bio-rank">
                      AI/ML Developer • Full-Stack Developer • Problem Solver
                    </span>
                  </div>
                  <button
                    className="ninja-hud-button"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => onOpenModal?.('resume')}
                  >
                    📄 View Printable Resume
                  </button>
                </div>

                <div className="about-grid-sections">
                  <div className="resume-block">
                    <h4 className="block-title">👋 DEVELOPER INTRODUCTION</h4>
                    <p className="block-text">
                      Hello! I'm <strong>Ashutosh</strong>, a developer focused on building practical
                      AI/ML systems, full-stack web applications, and interactive 3D browser
                      experiences. I enjoy taking complex ideas—from real-time fraud detection to
                      computer vision analytics—and turning them into clean, usable products.
                    </p>
                  </div>

                  <div className="resume-block">
                    <h4 className="block-title">🎓 EDUCATIONAL BACKGROUND</h4>
                    <p className="block-text">
                      <strong>Bachelor of Technology in Computer Science & Engineering</strong> —
                      Building a strong foundation in Data Structures, Algorithms, Machine Learning,
                      Computer Vision, Database Systems, and Full-Stack Software Engineering.
                    </p>
                  </div>

                  <div className="resume-block">
                    <h4 className="block-title">🧠 JOURNEY INTO AI & MACHINE LEARNING</h4>
                    <p className="block-text">
                      My journey into AI started with curiosity about how machines perceive visual and
                      language patterns. That led me to build computer vision pipelines like{' '}
                      <strong>Racket Sports Intelligence</strong> and <strong>WasteWise</strong>, as
                      well as real-time NLP/LLM systems like <strong>CallKavach</strong> and{' '}
                      <strong>TravelFlow AI</strong>.
                    </p>
                  </div>

                  <div className="resume-block">
                    <h4 className="block-title">🌐 WEB & 3D DEVELOPMENT EXPERIENCE</h4>
                    <p className="block-text">
                      Great models need intuitive interfaces. I build responsive full-stack web
                      applications using <strong>React, Node.js, FastAPI, and Python</strong>, and craft
                      performant 3D web worlds using <strong>Three.js and React Three Fiber</strong>.
                    </p>
                  </div>

                  <div className="resume-block">
                    <h4 className="block-title">🚀 FUTURE GOALS & WHAT I WANT TO BUILD NEXT</h4>
                    <p className="block-text">
                      I am excited to build autonomous multimodal AI agents, low-latency edge vision
                      tools, and interactive web applications that bridge advanced machine learning with
                      everyday human workflows.
                    </p>
                  </div>

                  <div className="resume-block">
                    <h4 className="block-title">🍃 PERSONAL INTERESTS</h4>
                    <p className="block-text">
                      Exploring creative 3D graphics & shaders, participating in hackathons, analyzing
                      racket sports strategy, and anime world-building.
                    </p>
                  </div>
                </div>

                {onFastTravel && (
                  <div className="travel-prompt-banner">
                    <span>Visit the Hokage's Administrative Courtyard in the village:</span>
                    <button
                      className="fast-travel-button"
                      onClick={() => travelToDestination('hokage-office')}
                    >
                      📜 Teleport to Hokage's Office
                    </button>
                  </div>
                )}
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

          {/* ================= 06. CONTACT MODAL (HOKAGE MONUMENT) ================= */}
          {activeModal === 'contact' && (
            <div className="modal-section-content">
              <div className="contact-monument-hero">
                <span className="monument-crest">⛰️ 火影岩 • HOKAGE MONUMENT</span>
                <h3 className="contact-main-quote">
                  "Every great mission starts with a conversation."
                </h3>
                <p className="contact-sub-quote">
                  "Let's build our next mission." — Reach out for software engineering roles, AI/ML
                  collaborations, or project inquiries.
                </p>
              </div>

              <div className="contact-cards-grid">
                <div className="contact-channel-card">
                  <span className="channel-icon">✉️</span>
                  <div className="channel-info">
                    <strong>Email Messenger Hawk</strong>
                    <span>Direct inbox for opportunities & collaborations</span>
                  </div>
                  <div className="channel-actions">
                    <a
                      href="mailto:ashutosh.shinobi.dev@gmail.com"
                      className="intro-primary-btn link-btn"
                    >
                      Send Email
                    </a>
                    <button className="intro-tertiary-btn" onClick={handleCopyEmail}>
                      {copiedEmail ? '✓ Copied!' : 'Copy Email'}
                    </button>
                  </div>
                </div>

                <div className="contact-channel-card">
                  <span className="channel-icon">💻</span>
                  <div className="channel-info">
                    <strong>GitHub Repositories</strong>
                    <span>Explore open-source code, AI models & 3D projects</span>
                  </div>
                  <div className="channel-actions">
                    <a
                      href="https://github.com/ashutosh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="intro-secondary-btn link-btn"
                    >
                      Open GitHub ↗
                    </a>
                  </div>
                </div>

                <div className="contact-channel-card">
                  <span className="channel-icon">🔗</span>
                  <div className="channel-info">
                    <strong>LinkedIn Network</strong>
                    <span>Connect professionally and view updates</span>
                  </div>
                  <div className="channel-actions">
                    <a
                      href="https://www.linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="intro-secondary-btn link-btn"
                    >
                      Connect on LinkedIn ↗
                    </a>
                  </div>
                </div>

                <div className="contact-channel-card">
                  <span className="channel-icon">📄</span>
                  <div className="channel-info">
                    <strong>Shinobi Credentials & Resume</strong>
                    <span>View or print full technical resume as PDF</span>
                  </div>
                  <div className="channel-actions">
                    <button
                      className="intro-primary-btn"
                      onClick={() => onOpenModal?.('resume')}
                    >
                      Open / Print Resume
                    </button>
                  </div>
                </div>
              </div>

              {onFastTravel && (
                <div className="travel-prompt-banner">
                  <span>Stand before the Hokage Monument Plaza in Konoha:</span>
                  <button
                    className="fast-travel-button"
                    onClick={() => travelToDestination('hokage-monument')}
                  >
                    ⛰️ Teleport to Hokage Monument
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
                        Bachelor of Technology in Computer Science & Engineering
                      </span>
                      <span className="item-desc">
                        Focus on Artificial Intelligence, Machine Learning, Computer Vision & Full-Stack
                        Systems.
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
