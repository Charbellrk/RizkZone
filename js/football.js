import { updateNavAuth } from './auth.js';
import { fetchFootballMatches, fetchFootballGamesByDate, searchTeams, fetchLeagueTable, fetchTeamPlayers, fetchTeamTrophies } from './api.js';
import { FOOTBALL_SCORERS } from './data/players-data.js';
import {
  showSpinner,
  showError,
  showEmpty,
  createMatchCard,
  showMatchModal,
  initLiveTicker,
  initNav,
  initNightMode,
} from './ui.js';

const LEAGUE_META = {
  'Premier League':   { color: '#38003c', text: '#fff' },
  'La Liga':          { color: '#e4002b', text: '#fff' },
  'Serie A':          { color: '#034694', text: '#fff' },
  'Bundesliga':       { color: '#d3010c', text: '#fff' },
  'Ligue 1':          { color: '#001489', text: '#fff' },
  'Champions League': { color: '#001489', text: '#ffd700' },
  'FIFA World Cup':   { color: '#007e4a', text: '#fff' },
};

function leagueBadgeStyle(leagueName) {
  const meta = LEAGUE_META[leagueName];
  return meta ? `background:${meta.color};color:${meta.text};` : 'background:var(--accent);color:#fff;';
}

const matchesContainer = document.getElementById('matches-container');
const matchCountLabel  = document.getElementById('match-count-label');
const leagueIndicator  = document.getElementById('league-indicator');
const pagination       = document.getElementById('pagination');

function updateLeagueIndicator(leagueKey) {
  if (!leagueIndicator) return;
  const leagueNames = {
    all:        '🌍 All Leagues',
    premier:    '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
    laliga:     '🇪🇸 La Liga',
    seriea:     '🇮🇹 Serie A',
    bundesliga: '🇩🇪 Bundesliga',
    ligue1:     '🇫🇷 Ligue 1',
    champions:  '⭐ Champions League',
    worldcup:   '🏆 FIFA World Cup',
  };
  const label = leagueNames[leagueKey] || '🌍 All Leagues';
  leagueIndicator.textContent = `Now viewing: ${label} · Last 5 matches`;
  leagueIndicator.className = leagueKey === 'all'
    ? 'league-indicator league-indicator--all'
    : 'league-indicator';
}

function renderMatches(matches) {
  matchesContainer.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'matches-grid';
  matches.forEach((match) => {
    const card = createMatchCard(match, showMatchModal);
    const badge = card.querySelector('.match-league');
    if (badge) badge.setAttribute('style', leagueBadgeStyle(match.league));
    grid.appendChild(card);
  });
  matchesContainer.appendChild(grid);
}

async function loadMatches(leagueKey = 'all') {
  showSpinner(matchesContainer);
  updateLeagueIndicator(leagueKey);

  const leagueLabel = leagueKey === 'worldcup' ? 'FIFA World Cup'
    : leagueKey === 'all' ? 'All Leagues'
    : (document.getElementById('league-filter').selectedOptions[0]?.text || leagueKey);
  matchCountLabel.textContent = `Loading ${leagueLabel} matches…`;

  try {
    const matches = await fetchFootballMatches(leagueKey);
    if (!matches.length) {
      showEmpty(matchesContainer, 'No recent matches found for this league. Try another league or check back later.');
      matchCountLabel.textContent = 'No matches found';
      return;
    }
    matchCountLabel.textContent = `Last ${matches.length} matches · ${leagueLabel}`;
    renderMatches(matches);
  } catch {
    showError(matchesContainer, 'Failed to load matches. Please check your connection and try again.');
  }
}

function renderScorers() {
  const tbody = document.getElementById('scorers-body');
  tbody.innerHTML = FOOTBALL_SCORERS.slice(0, 5).map((p) => `
    <tr>
      <td>${p.rank}</td>
      <td>${p.name}</td>
      <td>${p.country}</td>
      <td>${p.goals.toLocaleString()}</td>
      <td>${p.active ? '🟢 Active' : '⚪ Retired'}</td>
    </tr>
  `).join('');
}

document.getElementById('league-filter').addEventListener('change', (e) => {
  loadMatches(e.target.value);
  /* date section reloads separately via its own listener below */
});



/* Hide pagination — no longer needed with fixed 5-match display */
if (pagination) pagination.style.display = 'none';

const guestBanner = document.getElementById('guest-banner');
if (guestBanner) guestBanner.remove();

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();
renderScorers();
loadMatches();

/* ── European Team Search ────────────────────────────────────────────────── */

const teamSearchInput   = document.getElementById('team-search-input');
const teamSearchResults = document.getElementById('team-search-results');
let teamSearchTimer = null;

const teamPlayerRoster = document.getElementById('team-player-roster');

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0] || '').slice(0, 2).join('').toUpperCase();
}

function renderPlayerRoster(players, teamName) {
  return `
    <div class="squad-header">
      <h3>Top 5 Players — ${teamName}</h3>
      <span class="squad-count">${players.length} shown</span>
    </div>
    <div class="player-roster-grid">
      ${players.map((p) => {
        const initials = getInitials(p.strPlayer);
        const photo = p.strThumb || p.strCutout || '';
        return `
          <div class="player-card">
            <div class="player-card-photo">
              ${photo
                ? `<img src="${photo}" alt="${p.strPlayer}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\"player-initials\\">${initials}</span>'">`
                : `<span class="player-initials">${initials}</span>`}
            </div>
            <div class="player-card-info">
              <div class="player-name">${p.strPlayer || 'Unknown'}</div>
              ${p.strPosition ? `<div class="player-pos">${p.strPosition}</div>` : ''}
              ${p.strNationality ? `<div class="player-nat">${p.strNationality}</div>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

function renderTrophies(trophies, teamName) {
  const grouped = {};
  trophies.forEach((t) => {
    const key = t.strTrophy || 'Trophy';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t.strSeason || t.strYear || '');
  });
  const entries = Object.entries(grouped);
  return `
    <div class="squad-header" style="margin-top:24px;">
      <h3>🏆 Accomplishments — ${teamName}</h3>
      <span class="squad-count">${trophies.length} trophy win${trophies.length !== 1 ? 's' : ''}</span>
    </div>
    <div class="trophies-grid">
      ${entries.map(([trophy, seasons]) => `
        <div class="trophy-card">
          <div class="trophy-name">${trophy}</div>
          <div class="trophy-count">×${seasons.length}</div>
          <div class="trophy-seasons">${seasons.filter(Boolean).join(', ') || '—'}</div>
        </div>`).join('')}
    </div>`;
}

async function loadTeamSquad(teamId, teamName, leagueName) {
  if (!teamPlayerRoster) return;
  teamPlayerRoster.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading squad & honours…</p></div>';
  teamPlayerRoster.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const [players, trophies] = await Promise.all([
    fetchTeamPlayers(teamId, teamName, leagueName),
    fetchTeamTrophies(teamId),
  ]);

  let html = '';

  if (players.length) {
    const display = players.slice(0, 5);
    html += renderPlayerRoster(display, teamName);
  } else {
    html += `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>No player data available for ${teamName}.</p>
      </div>`;
  }

  if (trophies.length) {
    html += renderTrophies(trophies, teamName);
  } else {
    html += `
      <div class="squad-header" style="margin-top:24px;">
        <h3>🏆 Accomplishments — ${teamName}</h3>
        <span class="squad-count">No trophy data in database</span>
      </div>`;
  }

  teamPlayerRoster.innerHTML = html;
}

function renderTeamCards(teams) {
  if (!teams.length) {
    teamSearchResults.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>No teams found. Try a different name.</p>
      </div>`;
    return;
  }
  teamSearchResults.innerHTML = `<div class="team-search-grid">${
    teams.map((t) => `
      <div class="team-card">
        ${t.strTeamBadge
          ? `<img class="team-card-badge" src="${t.strTeamBadge}" alt="${t.strTeam}" loading="lazy" onerror="this.style.display='none'">`
          : '<div class="team-card-badge team-card-badge--empty">⚽</div>'}
        <div class="team-card-info">
          <div class="team-card-name">${t.strTeam}</div>
          <span class="team-card-league">${t.strLeague || '—'}</span>
          <div class="team-card-meta">🌍 ${t.strCountry || '—'}</div>
          ${t.intFormedYear ? `<div class="team-card-meta">🗓 Founded ${t.intFormedYear}</div>` : ''}
          ${t.strStadium ? `<div class="team-card-meta">🏟 ${t.strStadium}</div>` : ''}
          <button class="view-squad-btn" data-team-id="${t.idTeam}" data-team-name="${t.strTeam}" data-league="${t.strLeague || ''}">🏃 View Squad</button>
        </div>
      </div>`).join('')
  }</div>`;
}

teamSearchResults?.addEventListener('click', (e) => {
  const btn = e.target.closest('.view-squad-btn');
  if (!btn) return;
  loadTeamSquad(btn.dataset.teamId, btn.dataset.teamName, btn.dataset.league);
});

teamSearchInput?.addEventListener('input', (e) => {
  clearTimeout(teamSearchTimer);
  const q = e.target.value;
  if (!q.trim()) { teamSearchResults.innerHTML = ''; if (teamPlayerRoster) teamPlayerRoster.innerHTML = ''; return; }
  if (q.trim().length < 2) return;
  teamSearchTimer = setTimeout(async () => {
    teamSearchResults.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Searching…</p></div>';
    try {
      const teams = await searchTeams(q);
      renderTeamCards(teams);
    } catch {
      teamSearchResults.innerHTML = '<div class="state-message state-error"><span class="state-icon">⚠</span><p>Search failed. Try again.</p></div>';
    }
  }, 400);
});

/* ── League Standings ────────────────────────────────────────────────────── */

const standingsContainer = document.getElementById('standings-container');
const standingsSelect    = document.getElementById('standings-league-select');
const standingsSeasonSel = document.getElementById('standings-season-select');

function renderStandings(table) {
  if (!table.length) {
    standingsContainer.innerHTML = `<div class="state-message state-empty"><span class="state-icon">📭</span><p>Standings not available yet for this season.</p></div>`;
    return;
  }
  standingsContainer.innerHTML = `
    <div class="data-table-wrap">
      <table class="data-table standings-table">
        <thead>
          <tr>
            <th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${table.map((row) => {
            const gd = (parseInt(row.intGoalDifference) || 0);
            const gdStr = gd > 0 ? `+${gd}` : `${gd}`;
            const descClass = (row.strDescription || '').toLowerCase().includes('champion')
              ? 'standing-cl' : (row.strDescription || '').toLowerCase().includes('relegat')
              ? 'standing-rel' : '';
            return `
              <tr class="${descClass}">
                <td><strong>${row.intRank}</strong></td>
                <td>
                  ${row.strTeamBadge ? `<img src="${row.strTeamBadge}" alt="" class="standing-badge" loading="lazy">` : ''}
                  ${row.strTeam}
                </td>
                <td>${row.intPlayed}</td>
                <td>${row.intWin}</td>
                <td>${row.intDraw}</td>
                <td>${row.intLoss}</td>
                <td>${gdStr}</td>
                <td><strong>${row.intPoints}</strong></td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

async function loadStandings(leagueId, season) {
  standingsContainer.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading standings…</p></div>';
  const table = await fetchLeagueTable(leagueId, season || null);
  renderStandings(table);
}

function reloadStandings() {
  loadStandings(standingsSelect?.value || '4328', standingsSeasonSel?.value || null);
}

standingsSelect?.addEventListener('change', reloadStandings);
standingsSeasonSel?.addEventListener('change', reloadStandings);

/* ── League Date Picker ──────────────────────────────────────────────────── */

const leagueDatePicker  = document.getElementById('league-date-picker');
const leagueDatePrev    = document.getElementById('league-date-prev');
const leagueDateNext    = document.getElementById('league-date-next');
const leagueDateCont    = document.getElementById('league-date-container');
const leagueDateCount   = document.getElementById('league-date-count');
const leagueDateTitle   = document.getElementById('league-date-title');

let leagueDateCurrent = '';

const LEAGUE_DATE_NAMES = {
  all: '🌍 All Leagues', premier: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
  laliga: '🇪🇸 La Liga', seriea: '🇮🇹 Serie A',
  bundesliga: '🇩🇪 Bundesliga', ligue1: '🇫🇷 Ligue 1',
  champions: '⭐ Champions League', worldcup: '🏆 World Cup',
};

function shiftDay(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function getCurrentLeagueKey() {
  return document.getElementById('league-filter')?.value || 'all';
}

async function loadLeagueDay(dateStr) {
  leagueDateCurrent = dateStr;
  if (leagueDatePicker) leagueDatePicker.value = dateStr;
  const key = getCurrentLeagueKey();
  const name = LEAGUE_DATE_NAMES[key] || 'Football';
  if (leagueDateTitle) leagueDateTitle.textContent = `⚽ ${name} — Browse by Date`;
  if (leagueDateCount) leagueDateCount.textContent = `Loading matches for ${dateStr}…`;
  showSpinner(leagueDateCont);

  /* For "All Leagues" pick Premier League as representative */
  const queryKey = key === 'all' ? 'premier' : key;
  const matches = await fetchFootballGamesByDate(queryKey, dateStr);

  if (!matches.length) {
    showEmpty(leagueDateCont, `No matches found on ${dateStr} for ${name}. Try another date.`);
    if (leagueDateCount) leagueDateCount.textContent = `No matches on ${dateStr}`;
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'matches-grid';
  matches.forEach((m) => {
    const card = createMatchCard(m, showMatchModal);
    const badge = card.querySelector('.match-league');
    if (badge) badge.setAttribute('style', leagueBadgeStyle(m.league));
    grid.appendChild(card);
  });
  leagueDateCont.innerHTML = '';
  leagueDateCont.appendChild(grid);
  if (leagueDateCount) leagueDateCount.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''} on ${dateStr}`;
}

leagueDatePrev?.addEventListener('click', () => {
  if (leagueDateCurrent) loadLeagueDay(shiftDay(leagueDateCurrent, -1));
});
leagueDateNext?.addEventListener('click', () => {
  if (leagueDateCurrent) loadLeagueDay(shiftDay(leagueDateCurrent, 1));
});
leagueDatePicker?.addEventListener('change', (e) => {
  if (e.target.value) loadLeagueDay(e.target.value);
});

/* When league changes, reload the date section with new league */
document.getElementById('league-filter')?.addEventListener('change', () => {
  if (leagueDateCurrent) loadLeagueDay(leagueDateCurrent);
});

/* Default to today */
const todayStr = new Date().toISOString().split('T')[0];
loadLeagueDay(todayStr);

/* ── Init ────────────────────────────────────────────────────────────────── */
loadStandings('4328', standingsSeasonSel?.value || null);

/* ── Quick-nav scroll spy ────────────────────────────────────────────────── */
const quicknavBtns = document.querySelectorAll('.quicknav-btn');
const sections = ['section-matches', 'section-teams', 'section-standings', 'section-scorers']
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      quicknavBtns.forEach((btn) => btn.classList.remove('active'));
      const active = document.querySelector(`.quicknav-btn[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });

sections.forEach((s) => observer.observe(s));
