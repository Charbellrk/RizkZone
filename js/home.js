import { updateNavAuth } from './auth.js';
import { fetchFeaturedMatch, fetchUpcomingMatches } from './api.js';
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

function renderHighlights() {
  const container = document.getElementById('stats-highlights');
  const items = [
    { label: 'Top Scorer', ...SEASON_HIGHLIGHTS.topScorer },
    { label: 'Top Assists', ...SEASON_HIGHLIGHTS.topAssists },
    { label: 'Player of the Week', ...SEASON_HIGHLIGHTS.playerOfWeek },
  ];

  container.innerHTML = items
    .map(
      (item) => `
    <div class="highlight-card fade-in">
      <div class="label">${item.label}</div>
      <h3>${item.name}</h3>
      <div class="stat">${item.stat}</div>
      <div class="league">${item.league}</div>
    </div>
  `
    )
    .join('');
}

async function loadFeaturedMatch() {
  const container = document.getElementById('featured-match');
  try {
    const match = await fetchFeaturedMatch();
    if (!match) {
      container.innerHTML = '<p class="state-empty">No featured match available today.</p>';
      return;
    }
    container.innerHTML = `
      <div class="featured-match fade-in">
        <div class="featured-teams">
          <span class="featured-team">${match.home}</span>
          <span class="featured-score">${match.homeScore} - ${match.awayScore}</span>
          <span class="featured-team">${match.away}</span>
        </div>
        <div class="featured-meta">${match.league} • ${match.date} ${match.time ? `• ${match.time}` : ''}</div>
      </div>
    `;
  } catch {
    showError(container, 'Could not load featured match.');
  }
}

async function loadUpcoming() {
  const container = document.getElementById('upcoming-matches');
  try {
    const matches = await fetchUpcomingMatches(5);
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
        <div class="match-meta">${m.date} ${m.time ? `• ${m.time}` : ''}</div>
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
