import { updateNavAuth } from './auth.js';
import { fetchFeaturedWCMatch, fetchWCUpcomingMatches, fetchUpcomingMatches, fetchESPNSoccerScorers, fetchESPNSoccerAssists, fetchESPNNBAScorers } from './api.js';
import { HALL_OF_FAME } from './data/hall-of-fame.js';
import { SEASON_HIGHLIGHTS } from './data/players-data.js';
import { getRandomFact } from './data/facts.js';
import { initCounters, initLiveTicker, initNav, initNightMode, showError } from './ui.js';


function renderHallOfFame() {
  const grid = document.getElementById('hof-grid');
  const sportIcon = (sport) => sport === 'Football' ? '⚽' : '🏀';
  grid.innerHTML = HALL_OF_FAME.map(
    (player) => `
    <div class="hof-card">
      <div class="hof-card-inner">
        <div class="hof-card-front">
          <img src="${player.image}" alt="${player.name}" loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
          <div class="hof-img-fallback" style="display:none;position:absolute;inset:0;background:var(--bg-elevated);align-items:center;justify-content:center;flex-direction:column;gap:8px;font-size:2.5rem;">
            ${sportIcon(player.sport)}
            <span style="font-size:0.85rem;font-weight:700;color:var(--text-muted);">${player.name}</span>
          </div>
          <div class="hof-info">
            <h3>${player.name}</h3>
            <span>${player.sport}</span>
          </div>
        </div>
        <div class="hof-card-back">
          <h3>${player.name}</h3>
          ${Object.entries(player.stats)
            .map(([key, val]) => `<div class="hof-stat"><dt>${key}</dt><dd>${val}</dd></div>`)
            .join('')}
        </div>
      </div>
    </div>
  `
  ).join('');
}

async function renderHighlights() {
  const container = document.getElementById('stats-highlights');

  const now = new Date();
  const yr  = now.getFullYear();
  const mo  = now.getMonth(); // 0-based

  // Soccer season ends in May/June; Aug onwards = next season starts
  const soccerSeason = mo >= 7 ? String(yr + 1) : String(yr);
  const soccerLabel  = `Premier League ${parseInt(soccerSeason) - 1}/${soccerSeason.slice(2)}`;

  // NBA season ends in June; Oct onwards = next season starts
  const nbaSeason = mo >= 9 ? String(yr + 1) : String(yr);
  const nbaLabel  = `NBA ${parseInt(nbaSeason) - 1}-${nbaSeason.slice(2)}`;

  const liveBadge = '<span style="font-size:0.65rem;background:#16a34a;color:#fff;padding:1px 6px;border-radius:999px;margin-left:4px;vertical-align:middle;">🔴 Live</span>';

  const [scorerRes, assistRes, nbaRes] = await Promise.allSettled([
    fetchESPNSoccerScorers('eng.1', soccerSeason),
    fetchESPNSoccerAssists('eng.1', soccerSeason),
    fetchESPNNBAScorers(nbaSeason),
  ]);

  const ok = (r) => r.status === 'fulfilled' && r.value?.length;

  const items = [
    ok(scorerRes)
      ? { label: `Top Scorer${liveBadge}`,  name: scorerRes.value[0].name,  stat: `${scorerRes.value[0].displayValue} goals`,   league: `${soccerLabel} · ${scorerRes.value[0].team}` }
      : { label: 'Top Scorer',              ...SEASON_HIGHLIGHTS.topScorer },
    ok(assistRes)
      ? { label: `Top Assists${liveBadge}`, name: assistRes.value[0].name,  stat: `${assistRes.value[0].displayValue} assists`, league: `${soccerLabel} · ${assistRes.value[0].team}` }
      : { label: 'Top Assists',             ...SEASON_HIGHLIGHTS.topAssists },
    ok(nbaRes)
      ? { label: `NBA PPG Leader${liveBadge}`, name: nbaRes.value[0].name, stat: `${nbaRes.value[0].displayValue} PPG`,        league: `${nbaLabel} · ${nbaRes.value[0].team}` }
      : { label: 'Player of the Week',         ...SEASON_HIGHLIGHTS.playerOfWeek },
  ];

  container.innerHTML = items
    .map((item) => `
      <div class="highlight-card fade-in">
        <div class="label">${item.label}</div>
        <h3>${item.name}</h3>
        <div class="stat">${item.stat}</div>
        <div class="league">${item.league}</div>
      </div>`)
    .join('');
}

async function loadFeaturedMatch() {
  const container = document.getElementById('featured-match');
  try {
    const match = await fetchFeaturedWCMatch();
    if (!match) {
      container.innerHTML = '<p class="state-empty">No World Cup match available right now.</p>';
      return;
    }

    const isScheduled = match.homeScore === '-' && match.awayScore === '-';
    const isLive = match.isLive;
    const statusBadge = isLive
      ? '<span style="display:inline-block;background:#dc2626;color:#fff;font-size:0.7rem;padding:2px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;animation:pulse 1.5s infinite;">🔴 LIVE</span>'
      : isScheduled
        ? '<span style="display:inline-block;background:#2563eb;color:#fff;font-size:0.7rem;padding:2px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;">⏰ Upcoming</span>'
        : '<span style="display:inline-block;background:#16a34a;color:#fff;font-size:0.7rem;padding:2px 8px;border-radius:999px;vertical-align:middle;margin-left:6px;">✅ FT</span>';

    const scoreDisplay = isScheduled
      ? `<span class="featured-score">${match.time ? match.time + ' UTC' : 'TBD'}</span>`
      : `<span class="featured-score">${match.homeScore} - ${match.awayScore}</span>`;

    container.innerHTML = `
      <div class="featured-match fade-in">
        <div style="text-align:center;margin-bottom:8px;">
          <span style="font-size:0.8rem;font-weight:600;color:var(--accent);letter-spacing:0.05em;">🏆 FIFA WORLD CUP 2026</span>
          ${statusBadge}
        </div>
        <div class="featured-teams">
          <span class="featured-team">${match.home}</span>
          ${scoreDisplay}
          <span class="featured-team">${match.away}</span>
        </div>
        <div class="featured-meta">${match.date}${match.venue && match.venue !== 'TBD' ? ` • ${match.venue}` : ''}</div>
      </div>
    `;
  } catch {
    showError(container, 'Could not load World Cup match.');
  }
}

async function loadUpcoming() {
  const container = document.getElementById('upcoming-matches');
  try {
    const wcMatches = await fetchWCUpcomingMatches(3);
    let matches = wcMatches;
    if (matches.length < 3) {
      const others = await fetchUpcomingMatches(3 - matches.length);
      matches = [...matches, ...others];
    }
    matches = matches.slice(0, 3);
    if (!matches.length) {
      container.innerHTML = '<div class="state-message state-empty"><p>No upcoming matches found.</p></div>';
      return;
    }
    container.innerHTML = matches
      .map(
        (m) => `
      <article class="match-card fade-in">
        <div class="match-league">${m.league}</div>
        <div class="match-teams">
          <span class="team">${m.home}</span>
          <span class="match-score">vs</span>
          <span class="team">${m.away}</span>
        </div>
        <div class="match-meta">${m.date}${m.time ? ` • ${m.time} UTC` : ''}</div>
      </article>
    `
      )
      .join('');
  } catch {
    showError(container, 'Could not load upcoming matches.');
  }
}


function initFacts() {
  const factEl = document.getElementById('random-fact');
  const showFact = () => {
    factEl.textContent = getRandomFact();
  };
  showFact();
  document.getElementById('new-fact-btn').addEventListener('click', showFact);
}

async function loadNews() {
  const container = document.getElementById('news-feed');
  if (!container) return;
  try {
    const res = await fetch('https://content.guardianapis.com/search?q=football+NBA+basketball&section=sport&page-size=6&api-key=test');
    const data = await res.json();
    const articles = data.response?.results || [];
    if (!articles.length) {
      container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">No news available right now.</p>';
      return;
    }
    container.innerHTML = `<div class="news-grid">${
      articles.map((a) => {
        const date = new Date(a.webPublicationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return `
          <a class="news-card" href="${a.webUrl}" target="_blank" rel="noopener noreferrer">
            <div class="news-card-meta">${date}</div>
            <div class="news-card-title">${a.webTitle}</div>
            <div class="news-card-source">The Guardian ↗</div>
          </a>`;
      }).join('')
    }</div>`;
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">News temporarily unavailable.</p>';
  }
}


updateNavAuth();
initNav();
initNightMode();
initLiveTicker();
initCounters();
renderHallOfFame();
renderHighlights();
initFacts();
loadFeaturedMatch();
loadUpcoming();
loadNews();
