import { updateNavAuth } from './auth.js';
import { fetchWC2026AllMatches, fetchFootballGamesByDate, fetchWorldCupFinal, searchTeams } from './api.js';
import { initLiveTicker, initNav, initNightMode, showSpinner, showEmpty } from './ui.js';

const WC_BADGE_STYLE = 'background:#007e4a;color:#fff;';

/* ── WC 2026 Tracker ─────────────────────────────────────────────────────── */

const wc2026Container = document.getElementById('wc2026-container');
let wc2026Matches = [];

function renderWC2026(tab) {
  const today = new Date().toISOString().split('T')[0];
  let list = wc2026Matches;
  if (tab === 'past')     list = wc2026Matches.filter((m) => m.homeScore !== '-');
  if (tab === 'upcoming') list = wc2026Matches.filter((m) => m.homeScore === '-');

  if (!list.length) {
    wc2026Container.innerHTML = `<div class="state-message state-empty"><span class="state-icon">📭</span><p>No ${tab === 'past' ? 'past results' : tab === 'upcoming' ? 'upcoming fixtures' : 'matches'} found yet.</p></div>`;
    return;
  }

  const byDate = {};
  list.forEach((m) => { if (!byDate[m.date]) byDate[m.date] = []; byDate[m.date].push(m); });

  wc2026Container.innerHTML = Object.entries(byDate).map(([date, ms]) => {
    const d = new Date(date + 'T12:00:00');
    const label = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    return `
      <div class="wc26-day-group">
        <div class="wc26-day-label">📅 ${label}</div>
        <div class="matches-grid">
          ${ms.map((m) => {
            const done = m.homeScore !== '-';
            const score = done ? `${m.homeScore} – ${m.awayScore}` : 'vs';
            const statusBadge = done
              ? `<span class="wc26-status wc26-status--done">FT</span>`
              : `<span class="wc26-status wc26-status--soon">${m.status || 'Scheduled'}</span>`;
            return `
              <div class="match-card wc26-card">
                <div class="match-league" style="${WC_BADGE_STYLE}">FIFA World Cup 2026</div>
                <div class="match-teams">
                  <span class="team">${m.home}</span>
                  <span class="match-score ${done ? '' : 'match-score--vs'}">${score}</span>
                  <span class="team">${m.away}</span>
                </div>
                <div class="match-meta">${m.venue && m.venue !== 'TBD' ? `🏟 ${m.venue} · ` : ''}${statusBadge}</div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

document.querySelectorAll('.wc26-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wc26-tab').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderWC2026(btn.dataset.tab);
  });
});

async function loadWC2026() {
  if (!wc2026Container) return;
  wc2026Matches = await fetchWC2026AllMatches();
  if (!wc2026Matches.length) {
    wc2026Container.innerHTML = '<div class="state-message state-empty"><span class="state-icon">📭</span><p>World Cup 2026 data unavailable right now. Try again later.</p></div>';
    return;
  }
  renderWC2026('past');
}

/* ── Browse WC by Date ───────────────────────────────────────────────────── */

const wcdatePicker  = document.getElementById('wcdate-picker');
const wcdatePrev    = document.getElementById('wcdate-prev');
const wcdateNext    = document.getElementById('wcdate-next');
const wcdateCont    = document.getElementById('wcdate-container');
const wcdateCount   = document.getElementById('wcdate-count');

let wcdateCurrent = '';

function shiftDay(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

async function loadWCDay(dateStr) {
  wcdateCurrent = dateStr;
  if (wcdatePicker) wcdatePicker.value = dateStr;
  if (wcdateCount) wcdateCount.textContent = `Loading matches for ${dateStr}…`;
  showSpinner(wcdateCont);

  const matches = await fetchFootballGamesByDate('worldcup', dateStr);

  if (!matches.length) {
    showEmpty(wcdateCont, `No World Cup matches on ${dateStr}. Try another date.`);
    if (wcdateCount) wcdateCount.textContent = `No matches on ${dateStr}`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'matches-grid';
  matches.forEach((m) => {
    const done = m.homeScore !== '-';
    const score = done ? `${m.homeScore} – ${m.awayScore}` : 'vs';
    const statusBadge = done
      ? `<span class="wc26-status wc26-status--done">FT</span>`
      : `<span class="wc26-status wc26-status--soon">${m.status || 'Scheduled'}</span>`;
    const card = document.createElement('div');
    card.className = 'match-card wc26-card';
    card.innerHTML = `
      <div class="match-league" style="${WC_BADGE_STYLE}">FIFA World Cup 2026</div>
      <div class="match-teams">
        <span class="team">${m.home}</span>
        <span class="match-score ${done ? '' : 'match-score--vs'}">${score}</span>
        <span class="team">${m.away}</span>
      </div>
      <div class="match-meta">${m.venue && m.venue !== 'TBD' ? `🏟 ${m.venue} · ` : ''}${statusBadge}</div>`;
    grid.appendChild(card);
  });
  wcdateCont.innerHTML = '';
  wcdateCont.appendChild(grid);
  if (wcdateCount) wcdateCount.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''} on ${dateStr}`;
}

wcdatePrev?.addEventListener('click', () => { if (wcdateCurrent) loadWCDay(shiftDay(wcdateCurrent, -1)); });
wcdateNext?.addEventListener('click', () => { if (wcdateCurrent) loadWCDay(shiftDay(wcdateCurrent, 1)); });
wcdatePicker?.addEventListener('change', (e) => { if (e.target.value) loadWCDay(e.target.value); });

/* ── All-Time Winners ────────────────────────────────────────────────────── */

const WC_WINNERS = [
  { year: 2022, country: 'Argentina',    flag: '🇦🇷', runnerUp: 'France',          score: '3–3 (4–2p)', host: 'Qatar' },
  { year: 2018, country: 'France',       flag: '🇫🇷', runnerUp: 'Croatia',         score: '4–2',        host: 'Russia' },
  { year: 2014, country: 'Germany',      flag: '🇩🇪', runnerUp: 'Argentina',       score: '1–0 AET',    host: 'Brazil' },
  { year: 2010, country: 'Spain',        flag: '🇪🇸', runnerUp: 'Netherlands',     score: '1–0 AET',    host: 'South Africa' },
  { year: 2006, country: 'Italy',        flag: '🇮🇹', runnerUp: 'France',          score: '1–1 (5–3p)', host: 'Germany' },
  { year: 2002, country: 'Brazil',       flag: '🇧🇷', runnerUp: 'Germany',         score: '2–0',        host: 'Japan/S.Korea' },
  { year: 1998, country: 'France',       flag: '🇫🇷', runnerUp: 'Brazil',          score: '3–0',        host: 'France' },
  { year: 1994, country: 'Brazil',       flag: '🇧🇷', runnerUp: 'Italy',           score: '0–0 (3–2p)', host: 'USA' },
  { year: 1990, country: 'West Germany', flag: '🇩🇪', runnerUp: 'Argentina',       score: '1–0',        host: 'Italy' },
  { year: 1986, country: 'Argentina',    flag: '🇦🇷', runnerUp: 'West Germany',    score: '3–2',        host: 'Mexico' },
  { year: 1982, country: 'Italy',        flag: '🇮🇹', runnerUp: 'West Germany',    score: '3–1',        host: 'Spain' },
  { year: 1978, country: 'Argentina',    flag: '🇦🇷', runnerUp: 'Netherlands',     score: '3–1 AET',    host: 'Argentina' },
  { year: 1974, country: 'West Germany', flag: '🇩🇪', runnerUp: 'Netherlands',     score: '2–1',        host: 'West Germany' },
  { year: 1970, country: 'Brazil',       flag: '🇧🇷', runnerUp: 'Italy',           score: '4–1',        host: 'Mexico' },
  { year: 1966, country: 'England',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', runnerUp: 'West Germany',    score: '4–2 AET',    host: 'England' },
  { year: 1962, country: 'Brazil',       flag: '🇧🇷', runnerUp: 'Czechoslovakia',  score: '3–1',        host: 'Chile' },
  { year: 1958, country: 'Brazil',       flag: '🇧🇷', runnerUp: 'Sweden',          score: '5–2',        host: 'Sweden' },
  { year: 1954, country: 'West Germany', flag: '🇩🇪', runnerUp: 'Hungary',         score: '3–2',        host: 'Switzerland' },
  { year: 1950, country: 'Uruguay',      flag: '🇺🇾', runnerUp: 'Brazil',          score: '2–1 *',      host: 'Brazil' },
  { year: 1938, country: 'Italy',        flag: '🇮🇹', runnerUp: 'Hungary',         score: '4–2',        host: 'France' },
  { year: 1934, country: 'Italy',        flag: '🇮🇹', runnerUp: 'Czechoslovakia',  score: '2–1 AET',    host: 'Italy' },
  { year: 1930, country: 'Uruguay',      flag: '🇺🇾', runnerUp: 'Argentina',       score: '4–2',        host: 'Uruguay' },
];

async function renderWorldCupWinners() {
  const grid = document.getElementById('wc-winners-grid');
  if (!grid) return;
  const latest = await fetchWorldCupFinal('2022');
  grid.innerHTML = WC_WINNERS.map((w, i) => {
    const isLatest = w.year === 2022 && latest;
    const score = isLatest ? `${latest.homeScore}–${latest.awayScore}` : w.score;
    const apiTag = isLatest ? '<span class="wc-api-tag">API</span>' : '';
    return `
      <div class="wc-card ${i === 0 ? 'wc-card--featured' : ''}">
        <div class="wc-year">${w.year}</div>
        <div class="wc-flag">${w.flag}</div>
        <div class="wc-winner">${w.country}</div>
        <div class="wc-score">${score} ${apiTag}</div>
        <div class="wc-runner">vs ${w.runnerUp}</div>
        <div class="wc-host">📍 ${w.host}</div>
      </div>`;
  }).join('');
}

/* ── Country Search ──────────────────────────────────────────────────────── */

const wcSearchInput  = document.getElementById('wc-country-search');
const wcSearchResult = document.getElementById('wc-country-result');
let wcSearchTimer = null;

async function handleWCSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) { wcSearchResult.innerHTML = ''; return; }

  const wins = WC_WINNERS.filter((w) => w.country.toLowerCase().includes(q));
  if (!wins.length) {
    wcSearchResult.innerHTML = `
      <div class="state-message state-empty">
        <span class="state-icon">🏳</span>
        <p>No World Cup wins found for "<strong>${query.trim()}</strong>". Try Brazil, Germany, France…</p>
      </div>`;
    return;
  }

  wcSearchResult.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';

  let badgeUrl = '';
  try {
    const teams = await searchTeams(wins[0].country);
    const national = teams.find(
      (t) => (t.strTeam || '').toLowerCase().includes('national') ||
              (t.strLeague || '').toLowerCase().includes('international') ||
              (t.strLeague || '').toLowerCase().includes('world cup')
    ) || teams[0];
    badgeUrl = national?.strTeamBadge || '';
  } catch { /* badge optional */ }

  const country = wins[0].country;
  const flag    = wins[0].flag;
  const count   = wins.length;
  const years   = wins.map((w) => w.year).join(', ');

  wcSearchResult.innerHTML = `
    <div class="wc-search-result">
      ${badgeUrl
        ? `<img src="${badgeUrl}" alt="${country}" class="wc-search-badge" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="wc-search-flag">${flag}</div>`}
      <div class="wc-search-info">
        <div class="wc-search-name">${flag} ${country}</div>
        <div class="wc-search-count">🏆 ${count} World Cup title${count !== 1 ? 's' : ''}</div>
        <div class="wc-search-years">Won in: <strong>${years}</strong></div>
        <div class="wc-search-editions">
          ${wins.map((w) => `
            <div class="wc-search-edition">
              <span class="wc-search-year">${w.year}</span>
              <span>Final vs ${w.runnerUp} — ${w.score}</span>
              <span class="wc-search-host">📍 ${w.host}</span>
            </div>`).join('')}
        </div>
        <div class="wc-api-note">🔗 Badge via TheSportsDB · Results from FIFA historical records</div>
      </div>
    </div>`;
}

wcSearchInput?.addEventListener('input', (e) => {
  clearTimeout(wcSearchTimer);
  wcSearchTimer = setTimeout(() => handleWCSearch(e.target.value), 350);
});

/* ── Quick-nav scroll spy ────────────────────────────────────────────────── */

const quicknavBtns = document.querySelectorAll('.quicknav-btn');
const sections = ['section-wc2026', 'section-wcdate', 'section-winners', 'section-wcsearch']
  .map((id) => document.getElementById(id)).filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      quicknavBtns.forEach((b) => b.classList.remove('active'));
      const active = document.querySelector(`.quicknav-btn[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach((s) => observer.observe(s));

/* ── Init ────────────────────────────────────────────────────────────────── */

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();

loadWC2026();
loadWCDay('2026-06-11');
renderWorldCupWinners();
