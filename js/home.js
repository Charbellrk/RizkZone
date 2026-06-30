import { updateNavAuth } from './auth.js';
import { fetchFeaturedMatch, fetchUpcomingMatches } from './api.js';
import { HALL_OF_FAME } from './data/hall-of-fame.js';
import { SEASON_HIGHLIGHTS } from './data/players-data.js';
import { getRandomFact } from './data/facts.js';
import { initCounters, initLiveTicker, initNav, initNightMode, showError } from './ui.js';

const FAQ_DATA = [
  {
    q: 'Where does RizkZone get its live data?',
    a: 'We fetch live scores and match information from TheSportsDB, a comprehensive sports database API updated regularly with results from leagues worldwide.',
  },
  {
    q: 'Do I need an account to use RizkZone?',
    a: 'No — you can browse as a guest. However, registered users get access to all 15 matches per page and both mini games, while guests see 9 matches and one game.',
  },
  {
    q: 'Which football leagues are covered?',
    a: 'We cover the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, and FIFA World Cup matches.',
  },
  {
    q: 'Can I play the mini games on mobile?',
    a: 'Yes! Both the penalty shootout and free throw challenge are designed to work on desktop and touch devices.',
  },
  {
    q: 'How often is match data updated?',
    a: 'Live scores refresh every two minutes. Match lists and upcoming fixtures are fetched each time you visit or reload a page.',
  },
  {
    q: 'What sports does RizkZone cover?',
    a: 'RizkZone currently covers football (soccer) and basketball (NBA). We track matches from top leagues worldwide including the Premier League, La Liga, Serie A, Bundesliga, and the NBA.',
  },
  {
    q: 'How do I switch between football and basketball?',
    a: 'Use the navigation bar at the top of the page. Click "⚽ Football" to browse football matches and statistics, or "🏀 Basketball" to explore NBA results and scoring legends.',
  },
  {
    q: 'What is the Hall of Fame section?',
    a: 'The Hall of Fame features legendary players from both football and basketball. Hover over any player card to flip it and reveal their all-time career statistics and achievements.',
  },
  {
    q: 'Are the mini games free to play?',
    a: 'Guest users can play one mini game of their choice — either the Penalty Shootout or the Free Throw Challenge. Registered users get full access to both games.',
  },
  {
    q: 'Can I see individual player statistics?',
    a: 'Yes! Visit the Players section to browse all-time top scorers in football and basketball. Search by player name or country, and click any row to see detailed career statistics.',
  },
  {
    q: 'How do I use night mode?',
    a: 'Click the 🌙 button in the top-right navigation bar to switch to night mode. Click ☀️ to return to day mode. Your preference is saved automatically.',
  },
  {
    q: 'How do I contact RizkZone?',
    a: 'You can reach us at charbel04rk@gmail.com or message us on WhatsApp at 70/267806. We welcome your questions, suggestions, and feedback!',
  },
];

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

function initFAQ() {
  const list = document.getElementById('faq-list');
  list.innerHTML = FAQ_DATA.map(
    (item, i) => `
    <div class="faq-item" data-index="${i}">
      <button class="faq-question" aria-expanded="false">
        ${item.q}
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-answer">${item.a}</div>
    </div>
  `
  ).join('');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    list.querySelectorAll('.faq-item').forEach((el) => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
    btn.setAttribute('aria-expanded', !isOpen);
  });
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

function initChatbot() {
  const messagesEl = document.getElementById('chatbot-messages');
  const inputEl    = document.getElementById('chatbot-input');
  const sendBtn    = document.getElementById('chatbot-send');
  const keyPrompt  = document.getElementById('chatbot-key-prompt');
  const keyInput   = document.getElementById('chatbot-key-input');
  const keySaveBtn = document.getElementById('chatbot-key-save');
  if (!messagesEl) return;

  const apiKey = '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';
  const SYSTEM = 'You are a sports expert AI assistant for RizkZone, a sports website. You are enthusiastic and knowledgeable about football (soccer), basketball, NBA, FIFA, World Cup, Premier League, La Liga, Champions League, Serie A, Bundesliga, and all major sports worldwide. Give clear, engaging answers. You can answer non-sports questions too but always be helpful.';
  const history = [{ role: 'system', content: SYSTEM }];

  if (keyPrompt) keyPrompt.style.display = 'none';

  function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg--${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  async function send() {
    const text = inputEl?.value.trim();
    if (!text) return;
    inputEl.value = '';
    if (sendBtn) sendBtn.disabled = true;
    if (inputEl) inputEl.disabled = true;
    addMessage(text, 'user');
    history.push({ role: 'user', content: text });
    const thinking = addMessage('⏳ Thinking…', 'bot');
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: history,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Error ${res.status}`);
      }
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
      thinking.textContent = reply;
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      thinking.textContent = `⚠ ${err.message}`;
      history.pop();
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      if (inputEl) { inputEl.disabled = false; inputEl.focus(); }
    }
  }

  sendBtn?.addEventListener('click', send);
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();
initCounters();
renderHallOfFame();
renderHighlights();
initFAQ();
initFacts();
initChatbot();
loadFeaturedMatch();
loadUpcoming();
loadNews();
