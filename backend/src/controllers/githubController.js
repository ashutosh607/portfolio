import GitHubCache from '../models/GitHubCache.js';
import Profile from '../models/Profile.js';

const CACHE_TTL_HOURS = 4; // Refresh period between 3 and 6 hours
const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000;

/**
 * Fetch raw contribution data from primary community API (jogruber)
 */
async function fetchFromJogruber(username) {
  const url = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': 'ShinobiPortfolio-Calendar/1.0',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Primary API returned status ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data?.contributions)) {
    throw new Error('Invalid contributions payload structure');
  }

  const total =
    data.total?.lastYear ??
    data.contributions.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);

  return {
    totalContributions: total,
    contributions: data.contributions.map((c) => ({
      date: c.date,
      count: Number(c.count) || 0,
      level: Math.min(4, Math.max(0, Number(c.level) || 0)),
    })),
    source: 'jogruber-api',
  };
}

/**
 * Fallback: Fetch directly from GitHub GraphQL API if GITHUB_TOKEN is configured
 */
async function fetchFromGitHubGraphQL(username, token) {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    signal: AbortSignal.timeout(8000),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ShinobiPortfolio-Backend',
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  });

  if (!res.ok) throw new Error(`GitHub GraphQL status ${res.status}`);
  const json = await res.json();
  const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) throw new Error('No contribution calendar in GraphQL response');

  const levelMap = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };

  const days = [];
  for (const week of calendar.weeks || []) {
    for (const d of week.contributionDays || []) {
      days.push({
        date: d.date,
        count: d.contributionCount || 0,
        level: levelMap[d.contributionLevel] ?? 0,
      });
    }
  }

  return {
    totalContributions: calendar.totalContributions || 0,
    contributions: days,
    source: 'github-graphql',
  };
}

/**
 * Fallback: Scrape public GitHub HTML contributions table
 */
async function fetchFromGitHubHTML(username) {
  const url = `https://github.com/users/${encodeURIComponent(username)}/contributions`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/html',
    },
  });

  if (!res.ok) throw new Error(`GitHub HTML status ${res.status}`);
  const html = await res.text();

  const days = [];
  // Match standard table cells: <td ... data-date="2026-02-14" data-level="2" ...>
  const tdRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d+)"/g;
  let match;
  while ((match = tdRegex.exec(html)) !== null) {
    days.push({
      date: match[1],
      level: parseInt(match[2], 10) || 0,
      count: 0, // In HTML, exact count is inside tooltips; level is exact
    });
  }

  // Also try to extract exact counts from tooltip elements if available
  const tooltipRegex = /id="contribution-slice-tooltip-(\d{4}-\d{2}-\d{2})"[^>]*>([^<]+)</g;
  let tMatch;
  const countMap = new Map();
  while ((tMatch = tooltipRegex.exec(html)) !== null) {
    const text = tMatch[2];
    const numMatch = text.match(/(\d+)\s+contribution/);
    if (numMatch) {
      countMap.set(tMatch[1], parseInt(numMatch[1], 10));
    }
  }

  if (days.length === 0) {
    throw new Error('Could not parse any contribution cells from GitHub HTML');
  }

  let total = 0;
  for (const day of days) {
    if (countMap.has(day.date)) {
      day.count = countMap.get(day.date);
    } else if (day.level > 0 && day.count === 0) {
      // Fallback estimate based on level if tooltip was missing
      day.count = day.level * 2;
    }
    total += day.count;
  }

  return {
    totalContributions: total,
    contributions: days,
    source: 'github-html',
  };
}

/**
 * Unified fetch with fallback chain:
 * 1. Primary community API
 * 2. GitHub GraphQL (if token configured)
 * 3. GitHub HTML scrape
 */
async function fetchLiveContributions(username) {
  try {
    return await fetchFromJogruber(username);
  } catch (err1) {
    console.warn(`[GitHub Calendar] Primary API failed: ${err1.message}. Attempting fallbacks...`);

    if (process.env.GITHUB_TOKEN) {
      try {
        return await fetchFromGitHubGraphQL(username, process.env.GITHUB_TOKEN);
      } catch (err2) {
        console.warn(`[GitHub Calendar] GraphQL API failed: ${err2.message}`);
      }
    }

    try {
      return await fetchFromGitHubHTML(username);
    } catch (err3) {
      console.error(`[GitHub Calendar] All fetch strategies failed: ${err3.message}`);
      throw new Error(`Unable to fetch GitHub contributions: ${err1.message}`);
    }
  }
}

/**
 * GET /api/github/contributions
 * Fetches contribution graph with server-side 4-hour caching and stale fallback
 */
export async function getContributions(req, res) {
  try {
    // 1. Resolve target username from query or Profile config
    let username = req.query.username?.trim();
    const forceRefresh = req.query.refresh === 'true';

    if (!username) {
      const profile = await Profile.findOne().lean();
      username = profile?.githubCalendar?.username || 'ashutosh607';
    }

    const cleanUser = username.toLowerCase().trim();
    const now = new Date();

    // 2. Check Cache
    const cached = await GitHubCache.findOne({ username: cleanUser });

    if (!forceRefresh && cached && cached.expiresAt > now && cached.contributions?.length > 0) {
      return res.json({
        success: true,
        source: 'cache',
        stale: false,
        username: cleanUser,
        total: cached.totalContributions,
        contributions: cached.contributions,
        cachedAt: cached.cachedAt,
        expiresAt: cached.expiresAt,
      });
    }

    // 3. Cache expired or missing -> Fetch live data
    try {
      const live = await fetchLiveContributions(cleanUser);
      const expiresAt = new Date(Date.now() + CACHE_TTL_MS);

      const saved = await GitHubCache.findOneAndUpdate(
        { username: cleanUser },
        {
          username: cleanUser,
          totalContributions: live.totalContributions,
          contributions: live.contributions,
          cachedAt: now,
          expiresAt,
          source: live.source,
        },
        { upsert: true, new: true }
      );

      return res.json({
        success: true,
        source: 'live',
        stale: false,
        username: cleanUser,
        total: saved.totalContributions,
        contributions: saved.contributions,
        cachedAt: saved.cachedAt,
        expiresAt: saved.expiresAt,
      });
    } catch (fetchErr) {
      // 4. Stale-while-revalidate fallback: If network failed but we have any cached data
      if (cached && cached.contributions?.length > 0) {
        console.warn(`[GitHub Calendar] Serving stale cache for ${cleanUser}: ${fetchErr.message}`);
        return res.json({
          success: true,
          source: 'cache',
          stale: true,
          warning: 'Live refresh failed; showing latest available cached data.',
          username: cleanUser,
          total: cached.totalContributions,
          contributions: cached.contributions,
          cachedAt: cached.cachedAt,
          expiresAt: cached.expiresAt,
        });
      }

      // 5. Total failure (no cache and network failed)
      return res.status(502).json({
        success: false,
        message: `Could not load GitHub contribution data for "${cleanUser}". ${fetchErr.message}`,
      });
    }
  } catch (error) {
    console.error('getContributions error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while fetching GitHub contributions',
    });
  }
}

/**
 * POST /api/github/refresh
 * Forces immediate cache invalidation and re-fetch (Admin only)
 */
export async function refreshContributions(req, res) {
  try {
    const profile = await Profile.findOne().lean();
    const username = (req.body.username || profile?.githubCalendar?.username || 'ashutosh607').toLowerCase().trim();

    await GitHubCache.deleteOne({ username });
    const live = await fetchLiveContributions(username);
    const now = new Date();
    const expiresAt = new Date(Date.now() + CACHE_TTL_MS);

    const saved = await GitHubCache.create({
      username,
      totalContributions: live.totalContributions,
      contributions: live.contributions,
      cachedAt: now,
      expiresAt,
      source: live.source,
    });

    return res.json({
      success: true,
      message: `Refreshed GitHub contribution data for "${username}".`,
      total: saved.totalContributions,
      count: saved.contributions.length,
      cachedAt: saved.cachedAt,
      expiresAt: saved.expiresAt,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to refresh GitHub contributions',
    });
  }
}

/**
 * GET /api/github/config
 * Retrieves current calendar display settings
 */
export async function getCalendarConfig(req, res) {
  try {
    const profile = await Profile.findOne().select('githubCalendar').lean();
    const config = profile?.githubCalendar || {
      username: 'ashutosh607',
      title: 'My Coding Journey',
      subtitle: 'DEVELOPER ACTIVITY',
      description: 'A year of building, learning and shipping code.',
      profileUrl: 'https://github.com/ashutosh607',
      enabled: true,
    };
    return res.json({ success: true, data: config });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PUT /api/github/config
 * Updates calendar display settings (Admin only)
 */
export async function updateCalendarConfig(req, res) {
  try {
    const { username, title, subtitle, description, profileUrl, enabled } = req.body;

    const profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (!profile.githubCalendar) {
      profile.githubCalendar = {};
    }

    const oldUsername = profile.githubCalendar.username;

    if (username !== undefined) profile.githubCalendar.username = username.trim();
    if (title !== undefined) profile.githubCalendar.title = title.trim();
    if (subtitle !== undefined) profile.githubCalendar.subtitle = subtitle.trim();
    if (description !== undefined) profile.githubCalendar.description = description.trim();
    if (profileUrl !== undefined) profile.githubCalendar.profileUrl = profileUrl.trim();
    if (enabled !== undefined) profile.githubCalendar.enabled = Boolean(enabled);

    await profile.save();

    // If username changed, flush previous cache
    if (username && username.trim().toLowerCase() !== (oldUsername || '').toLowerCase()) {
      await GitHubCache.deleteMany({ username: (oldUsername || '').toLowerCase() });
    }

    return res.json({
      success: true,
      message: 'GitHub calendar configuration updated successfully',
      data: profile.githubCalendar,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

