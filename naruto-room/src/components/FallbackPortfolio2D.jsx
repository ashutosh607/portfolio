import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { entryDestinations } from '../data/entryDestinations';
import { loadProjectMenu } from '../data/projectMenu';
import { SKILL_CATEGORIES } from '../data/skillsData';
import { missions } from '../data/missions';
import SkillNavigation from './skills/SkillNavigation';
import SkillDetails from './skills/SkillDetails';
import RamenBookModal from './RamenBookModal';
import AboutModal from './AboutModal';
import SkillsModal from './skills/SkillsModal';
import MissionScroll from './mission-scroll/MissionScroll';
import ContactModal from './ContactModal';
import ResumeViewerModal from './ResumeViewerModal';
import './skills/SkillsModal.css';
import './FallbackPortfolio2D.css';

const CONTACT_EMAIL = 'ashutoshkadam607@gmail.com';
const GITHUB_URL = 'https://github.com/ashutosh607';
const LINKEDIN_URL = 'https://www.linkedin.com/in/Ashutosh-kadam';
const RESUME_PDF_URL = '/Ashutosh_Kadam_Resume.pdf';

const NAV_SECTIONS = [
  { id: 'intro', num: '01', label: 'Intro' },
  { id: 'projects', num: '02', label: 'Projects' },
  { id: 'about', num: '03', label: 'About' },
  { id: 'skills', num: '04', label: 'Skills' },
  { id: 'missions', num: '05', label: 'Missions' },
  { id: 'contact', num: '06', label: 'Contact' },
];

const SNAPSHOT_CARDS = [
  {
    label: 'Education',
    primary: 'B.Tech in Artificial Intelligence & Machine Learning',
    secondary: 'Dwarkadas J. Sanghvi College of Engineering (DJSCE)',
  },
  {
    label: 'Development',
    primary: 'Full-Stack Web Development',
    secondary: 'React.js, Node.js, Express.js, MongoDB, Three.js',
  },
  {
    label: 'Exploration',
    primary: 'Artificial Intelligence & Machine Learning',
    secondary: 'Computer Vision, Deep Learning, LLM Integrations',
  },
  {
    label: 'Goal',
    primary: 'Build useful, creative digital products while continuously improving my skills.',
    secondary: null,
  },
];

const INTEREST_CHIPS = [
  { label: 'Football', detail: 'Always up for a good match.' },
  { label: 'Anime', detail: 'Naruto will always be a favorite.' },
  { label: 'Foodie', detail: 'Trying new food spots. KFC is a favorite.' },
  { label: 'Coding', detail: 'Turning random ideas into working projects.' },
  { label: 'Always Creating', detail: 'Staying productive and working on new ideas.' },
];

const DRIVE_PILLARS = [
  { title: 'Build', desc: 'Turn ideas into useful, polished digital products.' },
  { title: 'Learn', desc: 'Explore, experiment, and keep improving every day.' },
  { title: 'Grow', desc: 'Become a better developer, creator, and collaborator.' },
];

const MISSION_TABS = [
  { id: 'all', label: 'All Missions' },
  { id: 'freelance', label: 'Freelance Projects' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'internship', label: 'Internships' },
];

export default function FallbackPortfolio2D({ onSwitchTo3D, webglError }) {
  const rootRef = useRef(null);
  const [activeSection, setActiveSection] = useState('intro');
  const [activeSkillCategoryId, setActiveSkillCategoryId] = useState(
    SKILL_CATEGORIES[0]?.id || 'frontend'
  );
  const [activeMissionTab, setActiveMissionTab] = useState('all');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Interactive Full-Screen Modal Overlays accessible inside 2D Mode
  const [openOverlay, setOpenOverlay] = useState(null); // 'ramen' | 'about' | 'skills' | 'missions' | 'contact' | 'resume' | null
  const [selectedRamenProjectId, setSelectedRamenProjectId] = useState(null);

  const projects = useMemo(() => loadProjectMenu(), []);
  const visibleDestinations = useMemo(
    () => entryDestinations.filter((d) => d.visible).sort((a, b) => a.order - b.order),
    []
  );
  const visibleMissions = useMemo(
    () =>
      missions
        .filter((m) => m.visible !== false)
        .filter((m) => activeMissionTab === 'all' || m.type === activeMissionTab)
        .sort((a, b) => a.order - b.order),
    [activeMissionTab]
  );

  const activeSkillCategory = useMemo(
    () =>
      SKILL_CATEGORIES.find((cat) => cat.id === activeSkillCategoryId) ||
      SKILL_CATEGORIES[0],
    [activeSkillCategoryId]
  );

  // Smooth GSAP entrance animation on mount
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.p2d-navbar', {
        y: -28,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
      });
      gsap.from('.p2d-section', {
        y: 32,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.12,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Scroll spy to highlight current section in the sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 180;
      for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
        const sec = NAV_SECTIONS[i];
        const el = document.getElementById(`p2d-${sec.id}`);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sec.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const normalized = sectionId === 'achievements' ? 'missions' : sectionId;
    setActiveSection(normalized);
    const el = document.getElementById(`p2d-${normalized}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard?.writeText(CONTACT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2400);
  }, []);

  const handleInspectProjectFromSkills = useCallback((project) => {
    if (!project) return;
    setSelectedRamenProjectId(project.id || null);
    setOpenOverlay('ramen');
  }, []);

  return (
    <div ref={rootRef} className="p2d-root">
      <div className="p2d-ambient-bg" aria-hidden="true" />

      {/* Top Sticky Navbar (Matches KonohaHUD) */}
      <header className="p2d-navbar">
        <button
          type="button"
          className="p2d-brand"
          onClick={() => scrollToSection('intro')}
          title="Scroll to top"
        >
          <img
            src="/logo-mark-transparent.png"
            alt="Ashutosh emblem"
            className="p2d-brand-logo"
          />
          <div className="p2d-brand-text">
            <span className="p2d-brand-name">ASHUTOSH</span>
            <span className="p2d-brand-sub">SHINOBI PORTFOLIO • 2D EDITION</span>
          </div>
        </button>

        <nav className="p2d-nav-links" aria-label="2D Portfolio Sections">
          {NAV_SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`p2d-nav-item ${activeSection === item.id ? 'is-active' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              <span>{item.num}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="p2d-nav-actions">
          <button
            type="button"
            className="p2d-resume-pill"
            onClick={() => setOpenOverlay('resume')}
          >
            📄 Resume
          </button>

          {onSwitchTo3D && (
            <button
              type="button"
              className="p2d-switch-3d-btn"
              onClick={onSwitchTo3D}
              title="Return to 3D Interactive Konoha Village"
            >
              🏯 3D Portfolio
            </button>
          )}
        </div>
      </header>

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

        {/* ============================================================
            SECTION 01 — INTRO HERO & SIX VILLAGE DESTINATIONS
            ============================================================ */}
        <section id="p2d-intro" className="p2d-section">
          <div
            className="p2d-section-bg"
            style={{ backgroundImage: "url('/about/about-japanese-bg.jpg')" }}
            aria-hidden="true"
          />
          <div className="p2d-section-overlay" aria-hidden="true" />

          <div className="p2d-section-inner">
            <div className="p2d-hero-grid">
              <div>
                <div className="p2d-eyebrow">
                  <span className="p2d-eyebrow-dot" />
                  LOCATION 01 · MAIN ENTRY GATE
                </div>

                <h1 className="p2d-hero-title">
                  Hello, I’m <em>Ashutosh Kadam</em>.
                </h1>

                <div className="p2d-role-pills">
                  <span className="p2d-role-pill">💻 AI &amp; ML Developer</span>
                  <span className="p2d-role-pill">⚡ Full-Stack Engineer</span>
                  <span className="p2d-role-pill">🎯 Problem Solver</span>
                </div>

                <blockquote className="p2d-hero-quote">
                  “A shinobi of code, building things worth discovering.”
                </blockquote>

                <p className="p2d-hero-desc">
                  Welcome to the complete 2D edition of my Hidden Leaf Village portfolio.
                  Explore my featured full-stack &amp; AI/ML projects, interactive
                  7-category technical skills workbench, real-world freelance mission
                  dossiers, and direct ways to connect.
                </p>

                <div className="p2d-hero-actions">
                  <button
                    type="button"
                    className="p2d-btn-primary"
                    onClick={() => scrollToSection('projects')}
                  >
                    🍜 Explore Featured Projects →
                  </button>
                  <button
                    type="button"
                    className="p2d-btn-secondary"
                    onClick={() => setOpenOverlay('resume')}
                  >
                    📄 View Resume PDF
                  </button>
                  <button
                    type="button"
                    className="p2d-btn-secondary"
                    onClick={() => scrollToSection('contact')}
                  >
                    ✉️ Get in Touch
                  </button>
                  {onSwitchTo3D && (
                    <button
                      type="button"
                      className="p2d-btn-secondary"
                      onClick={onSwitchTo3D}
                    >
                      🏯 Enter 3D Konoha World
                    </button>
                  )}
                </div>
              </div>

              <div className="p2d-hero-portrait-card">
                <div className="p2d-hero-portrait-img-wrap">
                  <img
                    src="/about/ashutosh-photo.jpg"
                    alt="Ashutosh Kadam"
                    className="p2d-hero-portrait-img"
                  />
                </div>
                <div className="p2d-hero-portrait-caption">
                  <div>
                    <strong>Ashutosh Kadam</strong>
                    <span>B.Tech AI &amp; ML · DJSCE Mumbai</span>
                  </div>
                  <span className="p2d-hero-jp-tag">木ノ葉隠れの里</span>
                </div>
              </div>
            </div>

            {/* 6 Village Destinations Directory */}
            <div className="p2d-destinations-grid">
              {visibleDestinations.map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  className="p2d-dest-card"
                  onClick={() => scrollToSection(dest.sectionId)}
                >
                  <img
                    src={dest.image}
                    alt=""
                    className="p2d-dest-card-art"
                    loading="lazy"
                  />
                  <div className="p2d-dest-card-overlay" aria-hidden="true" />
                  <div className="p2d-dest-card-content">
                    <div className="p2d-dest-card-top">
                      <span className="p2d-dest-num">{dest.number}</span>
                      <span className="p2d-dest-sub">{dest.subtitle}</span>
                    </div>
                    <h3 className="p2d-dest-title">{dest.title}</h3>
                    <p className="p2d-dest-desc">{dest.description}</p>
                  </div>
                  <span className="p2d-dest-link">
                    Jump to Section <span aria-hidden="true">→</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 02 — ICHIRAKU RAMEN SHOP (FEATURED PROJECTS)
            ============================================================ */}
        <section id="p2d-projects" className="p2d-section">
          <div
            className="p2d-section-bg"
            style={{ backgroundImage: "url('/entry-gate/ichiraku-ramen.webp')" }}
            aria-hidden="true"
          />
          <div className="p2d-section-overlay" aria-hidden="true" />

          <div className="p2d-section-inner">
            <div className="p2d-section-header-row">
              <div>
                <div className="p2d-eyebrow">
                  <span className="p2d-eyebrow-dot" />
                  LOCATION 02 · ICHIRAKU RAMEN SHOP
                </div>
                <h2 className="p2d-section-title">
                  Featured Projects &amp; <span>Ichiraku Menu</span>
                </h2>
                <p className="p2d-section-subtitle">
                  Full-stack applications, AI-powered platforms, and interactive 3D web
                  experiences built from the ground up.
                </p>
              </div>

              <button
                type="button"
                className="p2d-btn-primary"
                onClick={() => {
                  setSelectedRamenProjectId(null);
                  setOpenOverlay('ramen');
                }}
              >
                📖 Open Interactive Ramen Menu Book
              </button>
            </div>

            <div className="p2d-projects-grid">
              {projects.map((proj) => (
                <article key={proj.id} className="p2d-project-card">
                  <div className="p2d-project-thumb-wrap">
                    {proj.thumbnail && (
                      <img
                        src={proj.thumbnail}
                        alt={proj.title}
                        className="p2d-project-thumb"
                        loading="lazy"
                      />
                    )}
                    <span className="p2d-project-rank-badge">
                      {proj.rank || 'S-Rank'} • {proj.ramenItem || 'Specialty'}
                    </span>
                    {proj.jpTitle && (
                      <span className="p2d-project-jp-badge">{proj.jpTitle}</span>
                    )}
                  </div>

                  <div className="p2d-project-body">
                    <div className="p2d-project-category">{proj.category}</div>
                    <h3 className="p2d-project-title">{proj.title}</h3>
                    <p className="p2d-project-desc">{proj.description}</p>

                    {proj.features?.length > 0 && (
                      <ul className="p2d-project-features">
                        {proj.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx}>{feat}</li>
                        ))}
                      </ul>
                    )}

                    <div className="p2d-project-tech-list">
                      {(proj.technologies || []).map((tech) => (
                        <span key={tech} className="p2d-project-tech-pill">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="p2d-project-actions">
                      {proj.villageEntry && onSwitchTo3D ? (
                        <button
                          type="button"
                          className="p2d-btn-primary"
                          onClick={onSwitchTo3D}
                        >
                          🏯 Enter 3D Village
                        </button>
                      ) : (
                        proj.liveUrl &&
                        !proj.liveUrl.startsWith('#') && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p2d-btn-primary"
                          >
                            🌐 Live Demo ↗
                          </a>
                        )
                      )}

                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p2d-btn-secondary"
                        >
                          💻 GitHub Code ↗
                        </a>
                      )}

                      <button
                        type="button"
                        className="p2d-btn-secondary"
                        onClick={() => {
                          setSelectedRamenProjectId(proj.id);
                          setOpenOverlay('ramen');
                        }}
                      >
                        📖 View in Menu Book
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 03 — HOKAGE'S OFFICE (ABOUT ME)
            ============================================================ */}
        <section id="p2d-about" className="p2d-section">
          <div
            className="p2d-section-bg"
            style={{ backgroundImage: "url('/about/about-japanese-bg.jpg')" }}
            aria-hidden="true"
          />
          <div className="p2d-section-overlay" aria-hidden="true" />

          <div className="p2d-section-inner">
            <div className="p2d-section-header-row">
              <div>
                <div className="p2d-eyebrow">
                  <span className="p2d-eyebrow-dot" />
                  LOCATION 03 · HOKAGE&apos;S OFFICE
                </div>
                <h2 className="p2d-section-title">
                  About <span>Ashutosh Kadam</span>
                </h2>
                <p className="p2d-section-subtitle">
                  Developer, builder, and curious learner — turning creative ideas into
                  meaningful web and AI experiences.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="p2d-btn-secondary"
                  onClick={() => setOpenOverlay('about')}
                >
                  ✨ Open Full-Screen About View
                </button>
                <button
                  type="button"
                  className="p2d-btn-primary"
                  onClick={() => setOpenOverlay('resume')}
                >
                  📄 View Resume
                </button>
              </div>
            </div>

            <div className="p2d-about-layout">
              <div className="p2d-about-photo-card">
                <img
                  src="/about/ashutosh-photo.jpg"
                  alt="Ashutosh Kadam portrait"
                  className="p2d-about-photo-img"
                  loading="lazy"
                />
                <div className="p2d-about-photo-meta">
                  <h3>Ashutosh Kadam</h3>
                  <p>AI &amp; ML Engineering Student · Full-Stack Developer</p>
                  <span className="p2d-about-Location-badge">
                    📍 Mumbai, India · DJSCE
                  </span>
                </div>
              </div>

              <div className="p2d-about-bio">
                <p>
                  I’m <strong>Ashutosh Kadam</strong>, a B.Tech student in{' '}
                  <strong>Artificial Intelligence &amp; Machine Learning</strong> at{' '}
                  <strong>Dwarkadas J. Sanghvi College of Engineering (DJSCE)</strong>.
                  I love building full-stack web applications, interactive 3D experiences,
                  and practical AI systems that solve real problems.
                </p>
                <p>
                  Whether I’m designing an immersive Three.js world, architecting scalable
                  Node.js &amp; Python backends, or training computer vision models, I focus
                  on clean code, thoughtful UX, and shipping products people genuinely enjoy
                  using.
                </p>

                <div className="p2d-about-snapshot-grid">
                  {SNAPSHOT_CARDS.map((item) => (
                    <div key={item.label} className="p2d-snapshot-card">
                      <div className="p2d-snapshot-label">{item.label}</div>
                      <div className="p2d-snapshot-primary">{item.primary}</div>
                      {item.secondary && (
                        <div className="p2d-snapshot-secondary">{item.secondary}</div>
                      )}
                    </div>
                  ))}
                </div>

                <h3 className="p2d-about-subhead">Interests &amp; Beyond Code</h3>
                <div className="p2d-interests-row">
                  {INTEREST_CHIPS.map((chip) => (
                    <div key={chip.label} className="p2d-interest-chip">
                      <strong>{chip.label}:</strong>
                      <span>{chip.detail}</span>
                    </div>
                  ))}
                </div>

                <h3 className="p2d-about-subhead">What Drives Me</h3>
                <div className="p2d-drives-grid">
                  {DRIVE_PILLARS.map((pillar) => (
                    <div key={pillar.title} className="p2d-drive-card">
                      <h4>{pillar.title}</h4>
                      <p>{pillar.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 04 — TRAINING GROUNDS (TECHNICAL SKILLS & JUTSU SCROLLS)
            ============================================================ */}
        <section id="p2d-skills" className="p2d-section">
          <div
            className="p2d-section-bg"
            style={{
              backgroundImage:
                "url('/images/training-room-bg.webp'), url('/images/training-room-bg.jpg')",
              opacity: 0.38,
            }}
            aria-hidden="true"
          />
          <div className="p2d-section-overlay" aria-hidden="true" />

          <div className="p2d-section-inner">
            <div className="p2d-section-header-row">
              <div>
                <div className="p2d-eyebrow">
                  <span className="p2d-eyebrow-dot" />
                  LOCATION 04 · TRAINING GROUNDS
                </div>
                <h2 className="p2d-section-title">
                  Technical Skills &amp; <span>Jutsu Scrolls</span>
                </h2>
                <p className="p2d-section-subtitle">
                  A collection of technologies, tools, and skills I&apos;ve trained with —
                  across development, AI, and more.
                </p>
              </div>

              <button
                type="button"
                className="p2d-btn-secondary"
                onClick={() => setOpenOverlay('skills')}
              >
                🏮 Open Full-Screen Training Room
              </button>
            </div>

            <div className="p2d-skills-workbench">
              <SkillNavigation
                categories={SKILL_CATEGORIES}
                activeId={activeSkillCategory.id}
                onSelect={setActiveSkillCategoryId}
              />
              <SkillDetails
                category={activeSkillCategory}
                onInspectProject={handleInspectProjectFromSkills}
              />
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 05 — KONOHA MISSION BOARD (EXPERIENCE & MISSIONS)
            ============================================================ */}
        <section id="p2d-missions" className="p2d-section">
          <div
            className="p2d-section-bg"
            style={{ backgroundImage: "url('/entry-gate/mission-board.webp')" }}
            aria-hidden="true"
          />
          <div className="p2d-section-overlay" aria-hidden="true" />

          <div className="p2d-section-inner">
            <div className="p2d-section-header-row">
              <div>
                <div className="p2d-eyebrow">
                  <span className="p2d-eyebrow-dot" />
                  LOCATION 05 · KONOHA MISSION BOARD
                </div>
                <h2 className="p2d-section-title">
                  Experience &amp; <span>Mission Dossiers</span>
                </h2>
                <p className="p2d-section-subtitle">
                  A record of my real-world client work, hackathons, and professional
                  experiences.
                </p>
              </div>

              <button
                type="button"
                className="p2d-btn-primary"
                onClick={() => setOpenOverlay('missions')}
              >
                📜 Unroll Interactive Mission Scroll
              </button>
            </div>

            <div className="p2d-mission-tabs" role="tablist">
              {MISSION_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeMissionTab === tab.id}
                  className={`p2d-mission-tab ${
                    activeMissionTab === tab.id ? 'is-active' : ''
                  }`}
                  onClick={() => setActiveMissionTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p2d-missions-grid">
              {visibleMissions.map((mission) => (
                <article key={mission.id} className="p2d-mission-card">
                  {mission.thumbnail && (
                    <img
                      src={mission.thumbnail}
                      alt={mission.title}
                      className="p2d-mission-thumb"
                      loading="lazy"
                    />
                  )}
                  <div className="p2d-mission-body">
                    <div className="p2d-mission-meta">
                      <span className="p2d-mission-category">{mission.category}</span>
                      <span className="p2d-mission-status">{mission.status}</span>
                    </div>

                    <h3 className="p2d-mission-title">{mission.title}</h3>
                    {mission.organization && (
                      <div className="p2d-mission-org">{mission.organization}</div>
                    )}
                    <p className="p2d-mission-desc">{mission.description}</p>

                    {mission.technologies?.length > 0 && (
                      <div className="p2d-project-tech-list">
                        {mission.technologies.map((tech) => (
                          <span key={tech} className="p2d-project-tech-pill">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="p2d-project-actions">
                      {mission.liveUrl && (
                        <a
                          href={mission.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p2d-btn-primary"
                        >
                          🌐 Live Client Site ↗
                        </a>
                      )}
                      <button
                        type="button"
                        className="p2d-btn-secondary"
                        onClick={() => setOpenOverlay('missions')}
                      >
                        📜 Inspect Dossier
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 06 — HOKAGE MONUMENT (GET IN TOUCH / CONTACT)
            ============================================================ */}
        <section id="p2d-contact" className="p2d-section">
          <div
            className="p2d-section-bg"
            style={{
              backgroundImage: "url('/contact/hokage-monument-bg.jpg')",
              opacity: 0.34,
            }}
            aria-hidden="true"
          />
          <div className="p2d-section-overlay" aria-hidden="true" />

          <div className="p2d-section-inner">
            <div className="p2d-section-header-row">
              <div>
                <div className="p2d-eyebrow">
                  <span className="p2d-eyebrow-dot" />
                  LOCATION 06 · HOKAGE MONUMENT
                </div>
                <h2 className="p2d-section-title">
                  Get in <span>Touch</span>
                </h2>
                <p className="p2d-section-subtitle">
                  Open to internships, freelance projects, collaborations, and developer
                  opportunities. Feel free to reach out through any of the channels below.
                </p>
              </div>

              <button
                type="button"
                className="p2d-btn-secondary"
                onClick={() => setOpenOverlay('contact')}
              >
                ⛰️ Open Full-Screen Monument View
              </button>
            </div>

            <div className="p2d-contact-grid">
              {/* Email Card */}
              <div className="p2d-contact-card">
                <div>
                  <div className="p2d-contact-card-label">Direct Email</div>
                  <div className="p2d-contact-card-value">{CONTACT_EMAIL}</div>
                  <p className="p2d-contact-card-note">
                    Best for internships, project inquiries, and collaborations.
                  </p>
                </div>
                <div className="p2d-contact-card-actions">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="p2d-btn-primary">
                    Send Email
                  </a>
                  <button
                    type="button"
                    className="p2d-btn-secondary"
                    onClick={handleCopyEmail}
                  >
                    {copiedEmail ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* GitHub Card */}
              <div className="p2d-contact-card">
                <div>
                  <div className="p2d-contact-card-label">GitHub Profile</div>
                  <div className="p2d-contact-card-value">github.com/ashutosh607</div>
                  <p className="p2d-contact-card-note">
                    Explore my source code, repositories, and open-source work.
                  </p>
                </div>
                <div className="p2d-contact-card-actions">
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p2d-btn-primary"
                  >
                    Open GitHub ↗
                  </a>
                </div>
              </div>

              {/* LinkedIn Card */}
              <div className="p2d-contact-card">
                <div>
                  <div className="p2d-contact-card-label">LinkedIn Network</div>
                  <div className="p2d-contact-card-value">
                    linkedin.com/in/Ashutosh-kadam
                  </div>
                  <p className="p2d-contact-card-note">
                    Connect professionally for roles, updates, and discussions.
                  </p>
                </div>
                <div className="p2d-contact-card-actions">
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p2d-btn-primary"
                  >
                    Connect ↗
                  </a>
                </div>
              </div>

              {/* Resume Card */}
              <div className="p2d-contact-card">
                <div>
                  <div className="p2d-contact-card-label">Official Curriculum Vitae</div>
                  <div className="p2d-contact-card-value">Ashutosh Kadam — Resume</div>
                  <p className="p2d-contact-card-note">
                    View interactive PDF preview or download directly.
                  </p>
                </div>
                <div className="p2d-contact-card-actions">
                  <button
                    type="button"
                    className="p2d-btn-primary"
                    onClick={() => setOpenOverlay('resume')}
                  >
                    Preview PDF
                  </button>
                  <a
                    href={RESUME_PDF_URL}
                    download="Ashutosh_Kadam_Resume.pdf"
                    className="p2d-btn-secondary"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
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
      {openOverlay === 'ramen' && (
        <RamenBookModal
          isOpen={true}
          onClose={() => setOpenOverlay(null)}
          onFastTravel={onSwitchTo3D ? () => onSwitchTo3D() : undefined}
          initialProjectId={selectedRamenProjectId}
        />
      )}

      {openOverlay === 'about' && (
        <AboutModal
          isOpen={true}
          onClose={() => setOpenOverlay(null)}
          onOpenResume={() => setOpenOverlay('resume')}
          onOpenContact={() => setOpenOverlay('contact')}
        />
      )}

      {openOverlay === 'skills' && (
        <SkillsModal
          isOpen={true}
          onClose={() => setOpenOverlay(null)}
          onInspectProject={(proj) => {
            setSelectedRamenProjectId(proj?.id || null);
            setOpenOverlay('ramen');
          }}
        />
      )}

      {openOverlay === 'missions' && (
        <MissionScroll
          onClose={() => setOpenOverlay(null)}
          onContact={() => setOpenOverlay('contact')}
        />
      )}

      {openOverlay === 'contact' && (
        <ContactModal
          isOpen={true}
          onClose={() => setOpenOverlay(null)}
          onOpenResume={() => setOpenOverlay('resume')}
          onTeleportToMonument={onSwitchTo3D ? () => onSwitchTo3D() : null}
        />
      )}

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
