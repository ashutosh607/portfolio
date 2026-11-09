import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { apiBase, published } from '../../data/published';
import './GithubContributions.css';

gsap.registerPlugin(ScrollTrigger);

const LEVEL_COLORS = {
  0: '#242825',
  1: '#0e4429',
  2: '#006d32',
  3: '#26a641',
  4: '#39d353',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function GithubContributions({
  username: propUsername,
  title: propTitle,
  subtitle: propSubtitle,
  description: propDescription,
  profileUrl: propProfileUrl,
  embedded = false,
}) {
  const cmsConfig = published?.profile?.githubCalendar;
  const username = propUsername || cmsConfig?.username || 'ashutosh607';
  const title = propTitle || cmsConfig?.title || 'My Coding Journey';
  const subtitle = propSubtitle || cmsConfig?.subtitle || 'DEVELOPER ACTIVITY';
  const description = propDescription || cmsConfig?.description || 'A year of building, learning and shipping code.';
  const profileUrl = propProfileUrl || cmsConfig?.profileUrl || `https://github.com/${encodeURIComponent(username)}`;
  const isEnabled = cmsConfig?.enabled !== false;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, text: '', date: '' });

  const containerRef = useRef(null);
  const scrollWrapperRef = useRef(null);
  const headerRef = useRef(null);
  const cardRef = useRef(null);

  // 1. Fetch live contributions via backend proxy with 4-hr cache and fallback
  const fetchContributions = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);

      const targetUser = username || 'ashutosh607';
      const baseUrl = apiBase || '/api';
      const apiEndpoint = `${baseUrl}/github/contributions?username=${encodeURIComponent(targetUser)}`;

      // Attempt backend proxy first
      let res;
      try {
        res = await fetch(apiEndpoint, { signal: AbortSignal.timeout(9000) });
      } catch (proxyErr) {
        // Fallback: If backend is unreachable, try direct community API in dev
        console.warn('Backend proxy unreachable, falling back to direct community endpoint:', proxyErr);
        res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(targetUser)}?y=last`,
          { signal: AbortSignal.timeout(9000) }
        );
      }

      if (!res.ok) {
        throw new Error(`Failed to load GitHub activity (Status ${res.status})`);
      }

      const json = await res.json();
      const contributions = json.contributions || [];
      const total =
        json.total ??
        json.totalContributions ??
        contributions.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);

      setData({
        username: targetUser,
        total,
        contributions,
        stale: json.stale || false,
        cachedAt: json.cachedAt,
        source: json.source || 'live',
      });
    } catch (err) {
      console.error('GithubContributions error:', err);
      setError(err.message || 'Unable to connect to GitHub. Please check back shortly.');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  // 2. Format contributions into weeks columns (7 rows per column)
  const { weeks, monthLabels } = useMemo(() => {
    if (!data?.contributions?.length) {
      return { weeks: [], monthLabels: [] };
    }

    const days = data.contributions;
    const weekCols = [];
    let currentWeek = [];
    const labels = [];
    let lastLabeledCol = -4;

    days.forEach((day, index) => {
      const [y, m, d] = day.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday

      // Pad the very first week with nulls if it doesn't start on Sunday
      if (weekCols.length === 0 && currentWeek.length === 0 && dayOfWeek > 0) {
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push(null);
        }
      }

      currentWeek.push(day);

      // Check for month label placement
      if (d <= 7 && dateObj.getDate() <= 7) {
        const colIdx = weekCols.length;
        if (colIdx - lastLabeledCol >= 3) {
          labels.push({
            month: MONTH_NAMES[m - 1],
            colIndex: colIdx,
          });
          lastLabeledCol = colIdx;
        }
      }

      if (currentWeek.length === 7) {
        weekCols.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weekCols.push(currentWeek);
    }

    return { weeks: weekCols, monthLabels: labels };
  }, [data]);

  // 3. Auto-scroll on mobile to show the most recent weeks initially
  useEffect(() => {
    if (!loading && scrollWrapperRef.current) {
      const el = scrollWrapperRef.current;
      // Scroll to the far right (most recent contributions)
      requestAnimationFrame(() => {
        el.scrollLeft = el.scrollWidth - el.clientWidth;
      });
    }
  }, [loading, weeks.length]);

  // 4. GSAP ScrollTrigger Entrance Animation
  useEffect(() => {
    if (loading || !cardRef.current || !containerRef.current) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return undefined;

    const ctx = gsap.context(() => {
      const scroller = containerRef.current.closest('.portfolio-2d-wrapper') || undefined;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          scroller,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }
      )
        .fromTo(
          cardRef.current,
          { opacity: 0, y: 28, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' },
          '-=0.35'
        );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // 5. Tooltip interaction handlers (Desktop hover, mobile tap, keyboard focus)
  const handleCellInteraction = (day, event) => {
    if (!day) return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const countText =
      day.count === 0
        ? 'No contributions'
        : `${day.count} contribution${day.count === 1 ? '' : 's'}`;

    setActiveCell(day.date);
    setTooltipPos({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      visible: true,
      text: countText,
      date: formatDate(day.date),
    });
  };

  const handleCellLeave = () => {
    setTooltipPos((prev) => ({ ...prev, visible: false }));
    setActiveCell(null);
  };

  const effectiveProfileUrl =
    profileUrl || `https://github.com/${encodeURIComponent(username || 'ashutosh607')}`;

  if (!isEnabled) return null;

  return (
    <section
      ref={containerRef}
      className={`gh-section-wrapper ${embedded ? 'is-embedded' : ''}`}
      aria-labelledby="gh-calendar-heading"
    >
      {/* Dynamic Accessible Tooltip */}
      {tooltipPos.visible && (
        <div
          className="gh-tooltip"
          role="tooltip"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <span className="gh-tooltip-count">{tooltipPos.text}</span>
          <span className="gh-tooltip-date">{tooltipPos.date}</span>
          <div className="gh-tooltip-arrow" aria-hidden="true" />
        </div>
      )}

      {/* Section Header */}
      <div ref={headerRef} className="gh-header">
        <div className="gh-eyebrow">
          <svg
            className="gh-icon-mark"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="gh-eyebrow-text">{subtitle}</span>
          <span className="gh-eyebrow-rule" aria-hidden="true" />
        </div>

        <div className="gh-title-row">
          <h2 id="gh-calendar-heading" className="gh-main-title">
            {title}
          </h2>
          {data && !loading && (
            <div className="gh-badge-pill" title="Verified GitHub contributions">
              <span className="gh-badge-dot" aria-hidden="true" />
              <span className="gh-badge-total">{data.total.toLocaleString()}</span>
              <span className="gh-badge-label">contributions in last year</span>
            </div>
          )}
        </div>

        <p className="gh-description">{description}</p>
      </div>

      {/* Main Surface Card */}
      <div ref={cardRef} className="gh-card">
        {/* Loading Skeleton */}
        {loading && (
          <div className="gh-skeleton-wrap" aria-busy="true" aria-label="Loading contribution activity">
            <div className="gh-skeleton-header">
              <div className="gh-skeleton-bar gh-skeleton-title" />
              <div className="gh-skeleton-bar gh-skeleton-stat" />
            </div>
            <div className="gh-skeleton-grid" />
            <div className="gh-skeleton-footer">
              <div className="gh-skeleton-bar gh-skeleton-link" />
              <div className="gh-skeleton-bar gh-skeleton-legend" />
            </div>
          </div>
        )}

        {/* Error State with Retry Button */}
        {!loading && error && (
          <div className="gh-error-state" role="alert">
            <svg
              className="gh-error-icon"
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="gh-error-message">{error}</p>
            <button
              type="button"
              className="gh-retry-btn"
              onClick={() => fetchContributions(true)}
            >
              <span>↻</span> Retry Connection
            </button>
          </div>
        )}

        {/* Live Contribution Calendar Grid */}
        {!loading && !error && data && (
          <>
            <div
              ref={scrollWrapperRef}
              className="gh-scroll-container"
              tabIndex={0}
              aria-label="Scrollable contribution calendar"
            >
              <div className="gh-calendar-canvas">
                {/* Month Labels Row */}
                <div className="gh-months-row" aria-hidden="true">
                  <div className="gh-month-spacer" />
                  <div className="gh-months-track">
                    {monthLabels.map((m, idx) => (
                      <span
                        key={idx}
                        className="gh-month-label"
                        style={{ left: `${m.colIndex * 15}px` }}
                      >
                        {m.month}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Grid Body: Weekday labels on left + 52-53 Columns */}
                <div className="gh-grid-body">
                  {/* Weekday Labels (Mon, Wed, Fri) */}
                  <div className="gh-weekdays-col" aria-hidden="true">
                    {WEEKDAYS.map((day, idx) => (
                      <span key={idx} className="gh-weekday-label">
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Calendar Columns */}
                  <div
                    className="gh-matrix"
                    role="grid"
                    aria-label={`GitHub contribution calendar for ${username}`}
                  >
                    {weeks.map((week, wIdx) => (
                      <div key={wIdx} className="gh-week-col" role="row">
                        {week.map((day, dIdx) => {
                          if (!day) {
                            return (
                              <div
                                key={dIdx}
                                className="gh-day-cell is-empty"
                                aria-hidden="true"
                              />
                            );
                          }

                          const isHovered = activeCell === day.date;
                          const cellLabel = `${day.count === 0 ? 'No' : day.count} contribution${
                            day.count === 1 ? '' : 's'
                          } on ${formatDate(day.date)}`;

                          return (
                            <button
                              key={day.date}
                              type="button"
                              role="gridcell"
                              tabIndex={0}
                              className={`gh-day-cell level-${day.level} ${
                                isHovered ? 'is-active' : ''
                              }`}
                              style={{
                                backgroundColor: LEVEL_COLORS[day.level],
                              }}
                              aria-label={cellLabel}
                              onMouseEnter={(e) => handleCellInteraction(day, e)}
                              onMouseLeave={handleCellLeave}
                              onFocus={(e) => handleCellInteraction(day, e)}
                              onBlur={handleCellLeave}
                              onClick={(e) => handleCellInteraction(day, e)}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls / Legend & Action Link */}
            <div className="gh-card-footer">
              <a
                href={effectiveProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gh-profile-btn"
                title={`Open @${username} on GitHub`}
              >
                <span>View GitHub Profile</span>
                <span className="gh-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>

              {/* 5-Level Contribution Legend */}
              <div className="gh-legend" aria-label="Contribution intensity legend">
                <span className="gh-legend-text">Less</span>
                <div className="gh-legend-cells" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className={`gh-legend-cell level-${level}`}
                      style={{ backgroundColor: LEVEL_COLORS[level] }}
                    />
                  ))}
                </div>
                <span className="gh-legend-text">More</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
