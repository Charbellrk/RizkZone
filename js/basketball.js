import { updateNavAuth } from './auth.js';
import { fetchBasketballMatches, fetchNBAStandings, fetchTeamPlayers, searchBasketballTeams } from './api.js';
import { BASKETBALL_SCORERS } from './data/players-data.js';
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

const matchesContainer = document.getElementById('matches-container');
const matchCountLabel  = document.getElementById('match-count-label');
const pagination       = document.getElementById('pagination');

function renderMatches(matches) {
  matchesContainer.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'matches-grid';
  matches.forEach((match) => grid.appendChild(createMatchCard(match, showMatchModal)));
  matchesContainer.appendChild(grid);
}

async function loadMatches() {
  showSpinner(matchesContainer);
  matchCountLabel.textContent = 'Loading NBA matches…';
  try {
    const matches = await fetchBasketballMatches();
    if (!matches.length) {
      showEmpty(matchesContainer, 'No recent NBA matches found. Check back shortly.');
      matchCountLabel.textContent = 'No matches found';
      return;
    }
    matchCountLabel.textContent = `Last ${matches.length} NBA matches`;
    renderMatches(matches);
  } catch {
    showError(matchesContainer, 'Failed to load NBA matches. Please check your connection and try again.');
  }
}

function renderScorers() {
  const tbody = document.getElementById('scorers-body');
  tbody.innerHTML = BASKETBALL_SCORERS.slice(0, 5).map((p) => `
    <tr>
      <td>${p.rank}</td>
      <td>${p.name}</td>
      <td>${p.country}</td>
      <td>${p.points.toLocaleString()}</td>
      <td>${p.active ? '🟢 Active' : '⚪ Retired'}</td>
    </tr>
  `).join('');
}

/* ── NBA Standings ────────────────────────────────────────────────────────── */

const nbaStandingsContainer = document.getElementById('nba-standings-container');
const nbaStandingsSeason    = document.getElementById('nba-standings-season');

function confTable(entries, confName, emoji) {
  if (!entries.length) {
    return `
      <div class="conference-block">
        <div class="conference-title">${emoji} ${confName}</div>
        <div class="state-message state-empty"><span class="state-icon">📭</span><p>No data available.</p></div>
      </div>`;
  }
  return `
    <div class="conference-block">
      <div class="conference-title">${emoji} ${confName}</div>
      <div class="data-table-wrap">
        <table class="data-table standings-table">
          <thead>
            <tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>PCT</th><th>GB</th></tr>
          </thead>
          <tbody>
            ${entries.map((t, i) => `
              <tr>
                <td><strong>${i + 1}</strong></td>
                <td>
                  ${t.logo ? `<img src="${t.logo}" alt="" class="standing-badge" loading="lazy" onerror="this.style.display='none'">` : ''}
                  ${t.team}
                </td>
                <td>${t.wins}</td>
                <td>${t.losses}</td>
                <td>${(t.pct * 100).toFixed(1)}%</td>
                <td>${t.gb}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderNBAStandings(data) {
  const { east, west } = data;
  if (!east.length && !west.length) {
    nbaStandingsContainer.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>Standings not available for this season yet. Try another season.</p>
      </div>`;
    return;
  }
  nbaStandingsContainer.innerHTML = `
    <div class="nba-standings-grid">
      ${confTable(east, 'Eastern Conference', '🏢')}
      ${confTable(west, 'Western Conference', '🏜')}
    </div>`;
}

async function loadNBAStandings(season) {
  nbaStandingsContainer.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading standings…</p></div>';
  const data = await fetchNBAStandings(season);
  renderNBAStandings(data);
}

nbaStandingsSeason?.addEventListener('change', (e) => loadNBAStandings(e.target.value));

/* ── NBA Team Finder ──────────────────────────────────────────────────────── */

const bballTeamInput   = document.getElementById('bball-team-search-input');
const bballTeamResults = document.getElementById('bball-team-search-results');
const bballTeamRoster  = document.getElementById('bball-team-roster');
let bballSearchTimer   = null;

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0] || '').slice(0, 2).join('').toUpperCase();
}

function renderPlayerRoster(players, teamName) {
  return `
    <div class="squad-header">
      <h3>Squad — ${teamName}</h3>
      <span class="squad-count">${players.length} player${players.length !== 1 ? 's' : ''}</span>
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

async function loadBballTeamSquad(teamId, teamName) {
  if (!bballTeamRoster) return;
  bballTeamRoster.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Loading squad…</p></div>';
  bballTeamRoster.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const players = await fetchTeamPlayers(teamId);
  if (!players.length) {
    bballTeamRoster.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>No player data available for ${teamName}.</p>
      </div>`;
    return;
  }
  bballTeamRoster.innerHTML = renderPlayerRoster(players, teamName);
}

function renderBballTeamCards(teams) {
  if (!teams.length) {
    bballTeamResults.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">📭</span>
        <p>No NBA teams found. Try a different name.</p>
      </div>`;
    return;
  }
  bballTeamResults.innerHTML = `<div class="team-search-grid">${
    teams.map((t) => `
      <div class="team-card">
        ${t.strTeamBadge
          ? `<img class="team-card-badge" src="${t.strTeamBadge}" alt="${t.strTeam}" loading="lazy" onerror="this.style.display='none'">`
          : '<div class="team-card-badge team-card-badge--empty">🏀</div>'}
        <div class="team-card-info">
          <div class="team-card-name">${t.strTeam}</div>
          <span class="team-card-league">${t.strLeague || '—'}</span>
          <div class="team-card-meta">🌍 ${t.strCountry || '—'}</div>
          ${t.intFormedYear ? `<div class="team-card-meta">🗓 Founded ${t.intFormedYear}</div>` : ''}
          ${t.strStadium ? `<div class="team-card-meta">🏟 ${t.strStadium}</div>` : ''}
          <button class="view-squad-btn" data-team-id="${t.idTeam}" data-team-name="${t.strTeam}">🏃 View Squad</button>
        </div>
      </div>`).join('')
  }</div>`;
}

bballTeamResults?.addEventListener('click', (e) => {
  const btn = e.target.closest('.view-squad-btn');
  if (!btn) return;
  loadBballTeamSquad(btn.dataset.teamId, btn.dataset.teamName);
});

bballTeamInput?.addEventListener('input', (e) => {
  clearTimeout(bballSearchTimer);
  const q = e.target.value;
  if (!q.trim()) {
    bballTeamResults.innerHTML = '';
    if (bballTeamRoster) bballTeamRoster.innerHTML = '';
    return;
  }
  if (q.trim().length < 2) return;
  bballSearchTimer = setTimeout(async () => {
    bballTeamResults.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div><p>Searching…</p></div>';
    try {
      const teams = await searchBasketballTeams(q);
      renderBballTeamCards(teams);
    } catch {
      bballTeamResults.innerHTML = '<div class="state-message state-error"><span class="state-icon">⚠</span><p>Search failed. Try again.</p></div>';
    }
  }, 400);
});

/* ── Quick-nav scroll spy ────────────────────────────────────────────────── */

const quicknavBtns = document.querySelectorAll('.quicknav-btn');
const sections = ['section-matches', 'section-scorers', 'section-standings', 'section-teams']
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

/* ── Init ────────────────────────────────────────────────────────────────── */

if (pagination) pagination.style.display = 'none';
const guestBanner = document.getElementById('guest-banner');
if (guestBanner) guestBanner.remove();

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();
renderScorers();
loadMatches();
loadNBAStandings(nbaStandingsSeason?.value || '2025');
