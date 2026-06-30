import { API_BASE, FOOTBALL_LEAGUES, NBA_LEAGUE_ID } from './config.js';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json();
}

function todayDateString() {
  return new Date().toISOString().split('T')[0];
}

/* Status codes TheSportsDB sends for in-progress matches */
const LIVE_STATUSES = new Set(['1H', '2H', 'HT', 'ET', 'PEN', 'LIVE', 'IN PROGRESS']);

function normalizeEvent(event) {
  const status = event.strStatus || '';
  const isLive = LIVE_STATUSES.has(status.toUpperCase());
  /* strProgress = current minute e.g. "45'" | strStatus = "HT" / "1H" / "2H" */
  const progress = event.strProgress || event.intProgress
    ? (event.strProgress ? String(event.strProgress) : `${event.intProgress}'`)
    : '';

  return {
    id: event.idEvent,
    home: event.strHomeTeam || 'TBD',
    away: event.strAwayTeam || 'TBD',
    homeScore: event.intHomeScore ?? '-',
    awayScore: event.intAwayScore ?? '-',
    date: event.dateEvent || event.strTimestamp?.split('T')[0] || '',
    time: event.strTime?.slice(0, 5) || '',
    league: event.strLeague || 'Unknown League',
    venue: event.strVenue || 'TBD',
    status,
    isLive,
    progress,          /* current match minute e.g. "67'" or "" */
    thumb: event.strThumb || event.strLeagueBadge || '',
    sport: event.strSport || '',
  };
}

/* Returns up to `limit` past events for one league — endpoint naturally gives ~15 */
export async function fetchLeaguePastEvents(leagueId, limit = 15) {
  const data = await fetchJson(`${API_BASE}/eventspastleague.php?id=${leagueId}`);
  return (data.events || []).slice(0, limit).map(normalizeEvent);
}

/* Returns the last `limit` completed events from the current (or prior) season */
async function fetchSeasonPastEvents(leagueId, limit = 5) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startYear = month >= 8 ? year : year - 1;
  const seasons = [`${startYear}-${startYear + 1}`, `${startYear - 1}-${startYear}`];

  for (const season of seasons) {
    try {
      const data = await fetchJson(`${API_BASE}/eventsseason.php?id=${leagueId}&s=${season}`);
      const events = (data.events || [])
        .filter((e) => e.intHomeScore !== null && e.intHomeScore !== undefined && String(e.intHomeScore) !== '')
        .sort((a, b) => new Date(b.dateEvent) - new Date(a.dateEvent))
        .slice(0, limit)
        .map(normalizeEvent);
      if (events.length > 0) return events;
    } catch { /* try next season */ }
  }
  /* Last resort: fall back to past-league endpoint */
  return fetchLeaguePastEvents(leagueId, limit);
}

export async function fetchLeagueUpcomingEvents(leagueId, limit = 5) {
  const data = await fetchJson(`${API_BASE}/eventsnextleague.php?id=${leagueId}`);
  return (data.events || []).slice(0, limit).map(normalizeEvent);
}

export async function fetchLiveScores(sport = 'Soccer') {
  const data = await fetchJson(`${API_BASE}/eventsday.php?d=${todayDateString()}&s=${sport}`);
  return (data.events || []).map(normalizeEvent);
}

export async function fetchEventDetails(eventId) {
  const data = await fetchJson(`${API_BASE}/lookupevent.php?id=${eventId}`);
  const event = data.events?.[0];
  if (!event) return null;
  return {
    ...normalizeEvent(event),
    homeBadge: event.strHomeTeamBadge || '',
    awayBadge: event.strAwayTeamBadge || '',
    leagueBadge: event.strLeagueBadge || '',
    round: event.intRound || '',
    season: event.strSeason || '',
    referee: event.strReferee || 'TBD',
    attendance: event.intSpectators || 'N/A',
    description: event.strDescriptionEN || 'No description available.',
    video: event.strVideo || '',
  };
}

/* Fetch last 5 completed football matches for a league key */
export async function fetchFootballMatches(leagueKey = 'all') {
  if (leagueKey === 'worldcup') {
    return fetchSeasonPastEvents(FOOTBALL_LEAGUES.worldcup.id, 5);
  }

  const league = FOOTBALL_LEAGUES[leagueKey];
  if (league?.id) {
    return fetchSeasonPastEvents(league.id, 5);
  }

  /* "All Leagues" — 1 most recent match per league, show 5 newest across all */
  const leagueIds = ['4328', '4335', '4332', '4331', '4334', '4480'];
  const results = await Promise.all(leagueIds.map((id) => fetchSeasonPastEvents(id, 1)));
  return results
    .flat()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
}

/* Fetch last 5 completed NBA matches */
export async function fetchBasketballMatches() {
  return fetchSeasonPastEvents(NBA_LEAGUE_ID, 5);
}

export async function fetchUpcomingMatches(limit = 5) {
  try {
    const leagueIds = ['4328', '4335', '4332', '4387'];
    const results = await Promise.all(leagueIds.map((id) => fetchLeagueUpcomingEvents(id, 3)));
    return results
      .flat()
      .filter((m) => m.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function fetchFeaturedMatch() {
  const matches = await fetchFootballMatches('premier');
  return matches.find((m) => m.homeScore !== '-' && m.awayScore !== '-') || matches[0] || null;
}

/* ── Player search ────────────────────────────────────────────────────────── */

const teamCache = new Map();
let nbaPlayerCache = null; // loaded once, reused for all NBA searches

async function fetchAllNBAPlayers() {
  if (nbaPlayerCache) return nbaPlayerCache;
  const data = await fetchJson(`${API_BASE}/lookup_all_players.php?id=${NBA_LEAGUE_ID}`);
  nbaPlayerCache = data.player || [];
  return nbaPlayerCache;
}

export async function searchPlayers(query, sport = 'soccer') {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();

  if (sport === 'basketball') {
    /* Try direct search first */
    try {
      const data = await fetchJson(`${API_BASE}/searchplayers.php?p=${encodeURIComponent(query.trim())}`);
      const bball = (data.player || []).filter((p) => (p.strSport || '').toLowerCase().includes('basket'));
      if (bball.length > 0) return bball.slice(0, 15);
    } catch { /* fall through */ }

    /* Fallback: fetch the full NBA roster (cached) and filter by name */
    const allNBA = await fetchAllNBAPlayers();
    return allNBA.filter((p) => (p.strPlayer || '').toLowerCase().includes(q)).slice(0, 15);
  }

  /* Football / Soccer */
  const data = await fetchJson(`${API_BASE}/searchplayers.php?p=${encodeURIComponent(query.trim())}`);
  return (data.player || []).filter((p) => {
    const s = (p.strSport || '').toLowerCase();
    return s.includes('soccer') || s.includes('football');
  }).slice(0, 15);
}

export async function lookupTeam(teamId) {
  if (!teamId) return null;
  if (teamCache.has(teamId)) return teamCache.get(teamId);
  try {
    const data = await fetchJson(`${API_BASE}/lookupteam.php?id=${teamId}`);
    const team = data.teams?.[0] || null;
    teamCache.set(teamId, team);
    return team;
  } catch {
    return null;
  }
}

/* Enrich a list of raw TheSportsDB players with league info from team lookup */
export async function enrichPlayersWithLeague(rawPlayers) {
  const uniqueTeamIds = [...new Set(rawPlayers.map((p) => p.idTeam).filter(Boolean))];
  await Promise.all(uniqueTeamIds.map((id) => lookupTeam(id)));
  return rawPlayers.map((p) => {
    const team = teamCache.get(p.idTeam) || {};
    return {
      id: p.idPlayer,
      name: p.strPlayer || 'Unknown',
      team: p.strTeam || 'Unknown Club',
      teamId: p.idTeam,
      league: team.strLeague || '—',
      leagueCountry: team.strCountry || '',
      nationality: p.strNationality || '—',
      position: p.strPosition || '—',
      thumb: p.strThumb || p.strCutout || '',
      status: p.strStatus || 'Active',
      born: p.dateBorn || '',
    };
  });
}

/* ── ESPN API helpers ─────────────────────────────────────────────────────── */

function parseESPNLeaders(data, statKeywords) {
  /* ESPN returns either data.leaders (array) or data.leaders.categories (array) */
  const cats = Array.isArray(data.leaders)
    ? data.leaders
    : (data.leaders?.categories || data.categories || []);

  const cat = cats.find((c) =>
    statKeywords.some((kw) => (c.name || '').toLowerCase().includes(kw) || (c.displayName || '').toLowerCase().includes(kw))
  ) || cats[0];

  if (!cat?.leaders?.length) return [];

  return cat.leaders.slice(0, 30).map((entry, i) => ({
    rank: entry.rank || i + 1,
    name: entry.athlete?.displayName || entry.athlete?.shortName || 'Unknown',
    team: entry.team?.displayName || entry.team?.location || 'N/A',
    value: entry.value ?? 0,
    displayValue: entry.displayValue || String(Math.round(entry.value ?? 0)),
    statLabel: cat.shortDisplayName || cat.displayName || '',
  }));
}

/* Football (soccer) top scorers — tries current leaders, then explicit 2024-25 season */
export async function fetchESPNSoccerScorers(competition = 'eng.1') {
  const urls = [
    `${ESPN_BASE}/soccer/${competition}/leaders`,
    `${ESPN_BASE}/soccer/${competition}/leaders?season=2025`,
    `${ESPN_BASE}/soccer/${competition}/leaders?season=2024`,
  ];
  for (const url of urls) {
    try {
      const data = await fetchJson(url);
      const leaders = parseESPNLeaders(data, ['goal', 'score']);
      if (leaders.length > 0) return leaders;
    } catch { /* try next */ }
  }
  return [];
}

/* NBA scoring leaders — tries current season, then explicit 2024-25 */
export async function fetchESPNNBAScorers() {
  const urls = [
    `${ESPN_BASE}/basketball/nba/leaders`,
    `${ESPN_BASE}/basketball/nba/leaders?season=2025`,
    `${ESPN_BASE}/basketball/nba/leaders?season=2024`,
  ];
  for (const url of urls) {
    try {
      const data = await fetchJson(url);
      const leaders = parseESPNLeaders(data, ['point', 'scor', 'avg']);
      if (leaders.length > 0) return leaders;
    } catch { /* try next */ }
  }
  return [];
}

/* Search European football teams by name */
export async function searchTeams(query) {
  if (!query || query.trim().length < 2) return [];
  const data = await fetchJson(`${API_BASE}/searchteams.php?t=${encodeURIComponent(query.trim())}`);
  return (data.teams || [])
    .filter((t) => t.strSport === 'Soccer')
    .slice(0, 12);
}

/* Fetch league standings table; pass explicit season string like "2024-2025" or null to auto-detect */
export async function fetchLeagueTable(leagueId, season = null) {
  if (!season) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 8 ? year : year - 1;
    season = `${startYear}-${startYear + 1}`;
  }
  try {
    const data = await fetchJson(`${API_BASE}/lookuptable.php?l=${leagueId}&s=${season}`);
    return data.table || [];
  } catch {
    return [];
  }
}

/* Fetch NBA standings — tries ESPN (multiple formats) then TheSportsDB flat fallback */
export async function fetchNBAStandings(espnSeason = null) {
  const season = espnSeason || '2025';

  const espnUrls = [
    `${ESPN_BASE}/basketball/nba/standings?season=${season}`,
    `https://site.web.api.espn.com/apis/v2/sports/basketball/nba/standings?season=${season}&seasontype=2&type=0`,
  ];

  for (const url of espnUrls) {
    try {
      const data = await fetchJson(url);
      const groups = data.children || data.groups || data.standings?.groups || [];
      if (!groups.length) continue;
      const result = { east: [], west: [] };
      let hasData = false;
      groups.forEach((conf) => {
        const name = (conf.name || conf.abbreviation || '').toLowerCase();
        const isEast = name.includes('east');
        const entries = (conf.standings?.entries || conf.entries || []).map((e) => {
          const stats = {};
          (e.stats || []).forEach((s) => { stats[s.name] = s.value; });
          const gb = stats.gamesBehind ?? stats.divisionGamesBehind ?? null;
          return {
            team: e.team?.displayName || 'Unknown',
            logo: e.team?.logos?.[0]?.href || '',
            wins: Math.round(stats.wins ?? 0),
            losses: Math.round(stats.losses ?? 0),
            pct: stats.winPercent ?? 0,
            gb: gb == null ? '—' : gb === 0 ? '—' : parseFloat(gb).toFixed(1),
          };
        }).sort((a, b) => b.pct - a.pct).slice(0, 5);
        if (entries.length) hasData = true;
        if (isEast) result.east = entries;
        else result.west = entries;
      });
      if (hasData) return result;
    } catch { /* try next */ }
  }

  /* TheSportsDB fallback — flat list, no conference split */
  try {
    const tsdbSeason = season === '2026' ? '2025-2026' : season === '2025' ? '2024-2025' : '2023-2024';
    const data = await fetchJson(`${API_BASE}/lookuptable.php?l=4387&s=${tsdbSeason}`);
    const table = (data.table || []).map((row) => ({
      team: row.strTeam,
      logo: row.strTeamBadge || '',
      wins: parseInt(row.intWin) || 0,
      losses: parseInt(row.intLoss) || 0,
      pct: (parseInt(row.intWin) || 0) / Math.max((parseInt(row.intWin) || 0) + (parseInt(row.intLoss) || 0), 1),
      gb: '—',
    })).sort((a, b) => b.pct - a.pct);
    if (table.length) return { east: table.slice(0, 5), west: table.slice(5, 10), fallback: true };
  } catch { /* ignore */ }

  return { east: [], west: [] };
}

/* Fetch all players for a team; supplements with name-search if results are thin */
export async function fetchTeamPlayers(teamId, teamName = null) {
  if (!teamId) return [];
  const seen = new Set();
  const players = [];

  try {
    const data = await fetchJson(`${API_BASE}/lookup_all_players.php?id=${teamId}`);
    (data.player || []).forEach((p) => { seen.add(p.idPlayer); players.push(p); });
  } catch { /* continue to fallback */ }

  if (teamName && players.length < 14) {
    try {
      const data2 = await fetchJson(`${API_BASE}/searchplayers.php?t=${encodeURIComponent(teamName)}`);
      (data2.player || []).forEach((p) => {
        if (!seen.has(p.idPlayer)) { seen.add(p.idPlayer); players.push(p); }
      });
    } catch { /* optional */ }
  }

  return players;
}

/* Search basketball / NBA teams */
export async function searchBasketballTeams(query) {
  if (!query || query.trim().length < 2) return [];
  const data = await fetchJson(`${API_BASE}/searchteams.php?t=${encodeURIComponent(query.trim())}`);
  return (data.teams || [])
    .filter((t) => t.strSport === 'Basketball')
    .slice(0, 8);
}

/* Fetch the World Cup final match for a given year from TheSportsDB */
export async function fetchWorldCupFinal(year) {
  try {
    const data = await fetchJson(`${API_BASE}/eventsseason.php?id=4429&s=${year}`);
    const events = (data.events || [])
      .filter((e) => e.intHomeScore !== null && e.intHomeScore !== undefined && String(e.intHomeScore) !== '')
      .sort((a, b) => new Date(b.dateEvent) - new Date(a.dateEvent));
    return events[0] ? normalizeEvent(events[0]) : null;
  } catch {
    return null;
  }
}
