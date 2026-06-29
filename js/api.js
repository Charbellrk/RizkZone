import { API_BASE, FOOTBALL_LEAGUES, NBA_LEAGUE_ID } from './config.js';

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }
  return response.json();
}

function todayDateString() {
  return new Date().toISOString().split('T')[0];
}

function normalizeEvent(event) {
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
    status: event.strStatus || '',
    thumb: event.strThumb || event.strLeagueBadge || '',
    sport: event.strSport || '',
  };
}

export async function fetchLiveScores(sport = 'Soccer') {
  const data = await fetchJson(`${API_BASE}/eventsday.php?d=${todayDateString()}&s=${sport}`);
  return (data.events || []).map(normalizeEvent);
}

export async function fetchLeaguePastEvents(leagueId, limit = 15) {
  const data = await fetchJson(`${API_BASE}/eventspastleague.php?id=${leagueId}`);
  return (data.events || []).slice(0, limit).map(normalizeEvent);
}

export async function fetchLeagueUpcomingEvents(leagueId, limit = 5) {
  const data = await fetchJson(`${API_BASE}/eventsnextleague.php?id=${leagueId}`);
  return (data.events || []).slice(0, limit).map(normalizeEvent);
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

export async function fetchFootballMatches(leagueKey = 'all', limit = 15) {
  if (leagueKey === 'worldcup') {
    return fetchLeaguePastEvents(FOOTBALL_LEAGUES.worldcup.id, limit);
  }

  const league = FOOTBALL_LEAGUES[leagueKey];
  if (league?.id) {
    return fetchLeaguePastEvents(league.id, limit);
  }

  const leagueIds = ['4328', '4335', '4332', '4331', '4334'];
  const results = await Promise.all(
    leagueIds.map((id) => fetchLeaguePastEvents(id, Math.ceil(limit / leagueIds.length) + 2))
  );
  return results
    .flat()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export async function fetchBasketballMatches(limit = 15) {
  return fetchLeaguePastEvents(NBA_LEAGUE_ID, limit);
}

export async function fetchUpcomingMatches(limit = 5) {
  const leagueIds = ['4328', '4335', '4332', '4387'];
  const results = await Promise.all(
    leagueIds.map((id) => fetchLeagueUpcomingEvents(id, 3))
  );
  return results
    .flat()
    .filter((m) => m.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, limit);
}

export async function fetchFeaturedMatch() {
  const matches = await fetchFootballMatches('premier', 5);
  return matches.find((m) => m.homeScore !== '-' && m.awayScore !== '-') || matches[0] || null;
}
