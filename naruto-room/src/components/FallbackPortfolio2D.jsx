import MissionScroll from './mission-scroll/MissionScroll';
import React, { useEffect, useState } from 'react';
import {
  KONOHA_LOCATIONS,
  PORTFOLIO_PROJECTS,
  SKILL_SCROLLS,
} from '../config/locations';

export default function FallbackPortfolio2D({ onSwitchTo3D, webglError = null }) {
  const [activeSection, setActiveSection] = useState('all');
  const [boardOpen, setBoardOpen] = useState(() => Boolean(history.state?.missionScroll));
  useEffect(() => {
    const restoreMissionBoard = event => { if (event.state?.missionScroll) setBoardOpen(true); };
    window.addEventListener('popstate', restoreMissionBoard);
    return () => window.removeEventListener('popstate', restoreMissionBoard);
  }, []);
  const [selectedDish, setSelectedDish] = useState(null);

  return (
    <div className="fallback-2d-viewport">
      {boardOpen && <MissionScroll onClose={() => setBoardOpen(false)} onContact={() => {
        setBoardOpen(false);
        setActiveSection('hokage-monument');
      }}/>}
      {/* Top Sticky Navigation */}
      <header className="fallback-2d-header">
        <div className="fallback-brand">
          <img
            src="/logo-mark-transparent.png"
            alt="Ashutosh Shinobi Logo"
            className="fallback-brand-logo-img"
            draggable={false}
          />
          <div>
            <h1>ASHUTOSH • KONOHA PORTFOLIO</h1>
            <p>AI/ML Developer | Full-Stack Developer | Problem Solver</p>
          </div>
        </div>

        <nav className="fallback-nav-pills">
          <button
            className={activeSection === 'all' ? 'active' : ''}
            onClick={() => setActiveSection('all')}
          >
            All 6 Destinations
          </button>
          {KONOHA_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              className={activeSection === loc.id ? 'active' : ''}
              onClick={() => loc.id === 'mission-board' ? setBoardOpen(true) : setActiveSection(loc.id)}
            >
              {loc.number} {loc.shortName}
            </button>
          ))}
        </nav>

        {onSwitchTo3D && !webglError && (
          <button className="ninja-hud-button" onClick={onSwitchTo3D}>
            🎮 Enter 3D Village
          </button>
        )}
      </header>

      <main className="fallback-2d-main">
        {webglError && (
          <div className="fallback-notice-banner">
            ⚠️ 3D WebGL mode is unavailable on this browser/device ({webglError}). Showing the
            complete 2D Konoha Portfolio.
          </div>
        )}

        {/* 01 MAIN STREET — INTRODUCTION */}
        {(activeSection === 'all' || activeSection === 'main-street') && (
          <section className="fallback-section-card">
            <div className="fallback-sec-tag">01 • KONOHA MAIN STREET — INTRODUCTION</div>
            <h2>Hello, I'm Ashutosh.</h2>
            <p className="fallback-lead">
              "A shinobi of code, building things worth discovering."
            </p>
            <p>
              AI/ML Developer, Full-Stack Developer, and Problem Solver building intelligent
              applications across computer vision, NLP, and interactive web engineering.
            </p>
          </section>
        )}

        {/* 02 ICHIRAKU RAMEN — PROJECTS */}
        {(activeSection === 'all' || activeSection === 'ichiraku-ramen') && (
          <section className="fallback-section-card">
            <div className="fallback-sec-tag">02 • ICHIRAKU RAMEN — FEATURED PROJECTS</div>
            <h2>Signature Engineering Dishes</h2>
            <div className="projects-grid">
              {PORTFOLIO_PROJECTS.map((proj) => (
                <article
                  key={proj.id}
                  className="portfolio-project-card clickable-card"
                  onClick={() => setSelectedDish(proj)}
                >
                  <div className="dish-header-strip">
                    <span className="dish-bowl-tag">🍜 {proj.dishName}</span>
                    <span className="card-top-tag">{proj.category}</span>
                  </div>
                  <h3 className="project-title">{proj.title}</h3>
                  <p className="project-desc">{proj.shortDesc}</p>
                  <p className="project-desc">
                    <strong>Problem Solved:</strong> {proj.problemSolved}
                  </p>
                  <div className="tech-stack-pills">
                    {proj.techStack.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className="card-footer-links">
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="code-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      GitHub Repository ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 03 HOKAGE'S OFFICE — ABOUT ME */}
        {(activeSection === 'all' || activeSection === 'hokage-office') && (
          <section className="fallback-section-card">
            <div className="fallback-sec-tag">03 • HOKAGE'S OFFICE — ABOUT ME</div>
            <h2>Developer Background & Journey</h2>
            <div className="about-grid-sections">
              <div className="resume-block">
                <h4 className="block-title">EDUCATION & BACKGROUND</h4>
                <p className="block-text">
                  Bachelor of Technology in Computer Science & Engineering, specializing in AI/ML,
                  Computer Vision, and Full-Stack Web Development.
                </p>
              </div>
              <div className="resume-block">
                <h4 className="block-title">AI/ML & FULL-STACK JOURNEY</h4>
                <p className="block-text">
                  Experienced in building computer vision pipelines (Racket Sports Intelligence,
                  WasteWise), real-time fraud detection shields (CallKavach), and AI itinerary
                  engines (TravelFlow AI).
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 04 TRAINING GROUNDS — SKILLS */}
        {(activeSection === 'all' || activeSection === 'training-grounds') && (
          <section className="fallback-section-card">
            <div className="fallback-sec-tag">04 • TRAINING GROUNDS — TECHNICAL SKILLS</div>
            <h2>Seven Skill Scrolls</h2>
            <div className="skills-category-group">
              {SKILL_SCROLLS.map((scroll) => (
                <div key={scroll.id} className="skill-cat-card">
                  <h4 className="cat-title">
                    {scroll.icon} {scroll.title}
                  </h4>
                  <p className="block-text" style={{ marginBottom: '8px' }}>
                    {scroll.summary}
                  </p>
                  <div className="skills-badge-list">
                    {scroll.technologies.map((t) => (
                      <span key={t} className="skill-badge primary">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 05 MISSION BOARD — EXPERIENCE */}
        {(activeSection === 'all' || activeSection === 'mission-board') && (
          <section className="fallback-section-card">
            <div className="fallback-sec-tag">05 • MISSION BOARD — EXPERIENCE & HACKATHONS</div>
            <h2>Experience &amp; Mission Dossiers</h2>
            <button className="ninja-hud-button" onClick={() => setBoardOpen(true)}>Open Mission Board</button>
          </section>
        )}

        {/* 06 HOKAGE MONUMENT — CONTACT */}
        {(activeSection === 'all' || activeSection === 'hokage-monument') && (
          <section className="fallback-section-card">
            <div className="fallback-sec-tag">06 • HOKAGE MONUMENT — CONTACT</div>
            <h2>"Every great mission starts with a conversation."</h2>
            <p className="fallback-lead">"Let's build our next mission."</p>
            <div className="intro-cta-row">
              <a
                href="mailto:ashutosh.shinobi.dev@gmail.com"
                className="intro-primary-btn link-btn"
              >
                ✉️ Email Me
              </a>
              <a
                href="https://github.com/ashutosh"
                target="_blank"
                rel="noopener noreferrer"
                className="intro-secondary-btn link-btn"
              >
                💻 GitHub ↗
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="intro-secondary-btn link-btn"
              >
                🔗 LinkedIn ↗
              </a>
              <button className="intro-tertiary-btn" onClick={() => window.print()}>
                📄 Print / Save Resume
              </button>
            </div>
          </section>
        )}
      </main>

      {selectedDish && (
        <div className="portfolio-modal-overlay" onClick={() => setSelectedDish(null)}>
          <div className="portfolio-modal-scroll" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-modal-header">
              <div>
                <span className="modal-category-tag">🍜 {selectedDish.dishName}</span>
                <h2 className="modal-main-title">{selectedDish.title}</h2>
              </div>
              <button className="modal-close-button" onClick={() => setSelectedDish(null)}>
                ✕ Close
              </button>
            </div>
            <div className="portfolio-modal-body">
              <p className="block-text">{selectedDish.shortDesc}</p>
              <h4 className="block-title" style={{ marginTop: '14px' }}>
                PROBLEM SOLVED
              </h4>
              <p className="block-text">{selectedDish.problemSolved}</p>
              <h4 className="block-title" style={{ marginTop: '14px' }}>
                KEY FEATURES
              </h4>
              <ul className="competency-list">
                {selectedDish.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

