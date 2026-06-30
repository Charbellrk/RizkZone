import { updateNavAuth } from './auth.js';
import { initLiveTicker, initNav, initNightMode } from './ui.js';

const FAQ_DATA = [
  // ── General / RizkZone ──────────────────────────────────────────────────
  {
    category: 'general',
    q: 'Where does RizkZone get its live data?',
    a: 'We fetch live scores and match information from TheSportsDB, a comprehensive sports database API updated regularly with results from leagues worldwide.',
  },
  {
    category: 'general',
    q: 'Do I need an account to use RizkZone?',
    a: 'No — you can browse as a guest. However, registered users get access to all 15 matches per page and both mini games, while guests see 9 matches and one game.',
  },
  {
    category: 'general',
    q: 'How often is match data updated?',
    a: 'Live scores refresh every two minutes. Match lists and upcoming fixtures are fetched each time you visit or reload a page.',
  },
  {
    category: 'general',
    q: 'What sports does RizkZone cover?',
    a: 'RizkZone currently covers football (soccer) and basketball (NBA). We track matches from top leagues worldwide including the Premier League, La Liga, Serie A, Bundesliga, and the NBA.',
  },
  {
    category: 'general',
    q: 'What is the Hall of Fame section?',
    a: 'The Hall of Fame features legendary players from both football and basketball. Hover over any player card to flip it and reveal their all-time career statistics and achievements.',
  },
  {
    category: 'general',
    q: 'Are the mini games free to play?',
    a: 'Guest users can play one mini game of their choice — either the Penalty Shootout or the Free Throw Challenge. Registered users get full access to both games.',
  },
  {
    category: 'general',
    q: 'Can I play the mini games on mobile?',
    a: 'Yes! Both the penalty shootout and free throw challenge are designed to work on desktop and touch devices.',
  },
  {
    category: 'general',
    q: 'Can I see individual player statistics?',
    a: 'Yes! Visit the Players section to browse all-time top scorers in football and basketball. Search by player name or country, and click any row to see detailed career statistics.',
  },
  {
    category: 'general',
    q: 'How do I use night mode?',
    a: 'Click the 🌙 button in the top-right navigation bar to switch to night mode. Click ☀️ to return to day mode. Your preference is saved automatically.',
  },
  {
    category: 'general',
    q: 'How do I contact RizkZone?',
    a: 'You can reach us at charbel04rk@gmail.com or message us on WhatsApp at 70/267806. We welcome your questions, suggestions, and feedback!',
  },

  // ── Football ────────────────────────────────────────────────────────────
  {
    category: 'football',
    q: 'Which football leagues does RizkZone cover?',
    a: 'We cover the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, UEFA Champions League, and FIFA World Cup matches.',
  },
  {
    category: 'football',
    q: 'What is the offside rule in football?',
    a: 'A player is offside if they are in the opponent\'s half and nearer to the goal line than both the ball and the second-to-last defender (usually the last outfield player) at the moment the ball is played to them. Being in an offside position is only penalised when the player is actively involved in play.',
  },
  {
    category: 'football',
    q: 'How does the UEFA Champions League format work?',
    a: 'From 2024–25 the competition uses a single 36-team league phase where each club plays 8 matches against 8 different opponents. The top 8 advance directly to the Round of 16, teams placed 9th–24th enter a knockout play-off round, and the bottom 12 are eliminated. From the Round of 16 onward it is a two-legged knockout bracket ending in a single-leg final.',
  },
  {
    category: 'football',
    q: 'What is VAR and how does it work?',
    a: 'VAR (Video Assistant Referee) lets a team of video officials review clear and obvious errors in four categories: goals, penalty decisions, direct red cards, and mistaken identity. They alert the on-field referee, who can check footage on a pitchside monitor before making a final decision.',
  },
  {
    category: 'football',
    q: 'How long is a standard football match?',
    a: 'Two 45-minute halves, totalling 90 minutes of regulation play. The referee adds injury/stoppage time at the end of each half. In knockout ties that are level after 90 minutes, two 15-minute extra-time periods are played, followed by a penalty shootout if still equal.',
  },
  {
    category: 'football',
    q: 'How does a penalty shootout work?',
    a: 'Each team selects five players to take alternating kicks from 12 yards (11 m). The team that scores the most wins. If still tied after five kicks each, the shootout continues in sudden death — one kick per team per round — until one team scores and the other doesn\'t.',
  },
  {
    category: 'football',
    q: 'How many players are on a football team?',
    a: 'Each team fields 11 players including one goalkeeper. Most major leagues now allow up to five substitutions per match (with a sixth allowed in extra time). Teams typically name a matchday squad of 18–23 players.',
  },
  {
    category: 'football',
    q: 'What is the FIFA World Cup?',
    a: 'The FIFA World Cup is the premier international football tournament, held every four years. From 2026 it expands to 48 national teams. Qualification rounds take place across six continental confederations over roughly two years. The 2026 edition will be co-hosted by the USA, Canada, and Mexico.',
  },
  {
    category: 'football',
    q: 'What does a yellow card and red card mean?',
    a: 'A yellow card is a formal caution for misconduct such as dangerous play, time-wasting, or dissent. Two yellow cards in the same match equal a red card and immediate dismissal. A straight red card is shown for serious offences like violent conduct or denying a clear goal-scoring opportunity. A sent-off player\'s team plays with 10 men for the rest of the match.',
  },
  {
    category: 'football',
    q: 'What is the difference between a corner kick and a goal kick?',
    a: 'A corner kick is awarded to the attacking team when the defending team last touches the ball before it crosses their own goal line (without a goal being scored). A goal kick is awarded to the defending team when the attacking team last touches the ball before it crosses the defending team\'s goal line.',
  },

  // ── Basketball ──────────────────────────────────────────────────────────
  {
    category: 'basketball',
    q: 'How long is an NBA game?',
    a: 'An NBA game consists of four 12-minute quarters (48 minutes of regulation). Stoppages for fouls, timeouts, and out-of-bounds plays mean broadcasts typically run 2–2.5 hours. Tied games go to 5-minute overtime periods until a winner is determined.',
  },
  {
    category: 'basketball',
    q: 'What is a triple-double in basketball?',
    a: 'A triple-double occurs when a player records double digits (10 or more) in three statistical categories in a single game — most commonly points, rebounds, and assists. It is considered a hallmark of an elite all-around performance.',
  },
  {
    category: 'basketball',
    q: 'How does the NBA playoff format work?',
    a: 'The regular season runs from October to April. The top 6 teams per conference qualify directly; teams ranked 7th–10th in each conference compete in a play-in tournament for the last two playoff spots. The playoffs are a best-of-7 bracket through four rounds, culminating in the NBA Finals.',
  },
  {
    category: 'basketball',
    q: 'What is the shot clock in basketball?',
    a: 'The shot clock requires the offensive team to attempt a shot that hits the rim within 24 seconds of gaining possession (NBA rules). If the ball hits the rim, the clock resets to 14 seconds. Failing to shoot in time is a turnover. FIBA international rules also use a 24-second clock.',
  },
  {
    category: 'basketball',
    q: 'How does scoring work in basketball?',
    a: 'Field goals inside the three-point arc are worth 2 points. Shots from beyond the arc count as 3 points. Free throws — awarded after certain fouls — are worth 1 point each and are taken uncontested from 15 feet (NBA) or 4.6 metres (FIBA).',
  },
  {
    category: 'basketball',
    q: 'What is the difference between NBA and FIBA rules?',
    a: 'Key differences: NBA quarters are 12 minutes vs FIBA\'s 10 minutes. The NBA three-point line sits at 7.24 m at the top of the arc; FIBA\'s is 6.75 m. The NBA allows 6 personal fouls before fouling out; FIBA allows 5. NBA courts are slightly larger, and the NBA has an Instant Replay Center for additional review.',
  },
  {
    category: 'basketball',
    q: 'What is a foul in basketball?',
    a: 'A personal foul is illegal physical contact with an opponent. Common fouls include blocking, charging, holding, and reaching in. When a player is fouled in the act of shooting they receive two free throws (three if beyond the arc). Teams in the bonus (after a set number of team fouls per quarter) send opponents to the free-throw line on any foul.',
  },
  {
    category: 'basketball',
    q: 'Who are considered the greatest NBA players of all time?',
    a: 'Widely agreed all-time greats include Michael Jordan (6× champion, 6× Finals MVP), LeBron James (4× champion with three teams), Kareem Abdul-Jabbar (all-time regular-season scoring leader until 2023), Magic Johnson, Larry Bird, Bill Russell (11 championships), Wilt Chamberlain, and Kobe Bryant. Stephen Curry reshaped the modern game with his three-point shooting and holds the all-time three-pointers record.',
  },
  {
    category: 'basketball',
    q: 'What positions exist in basketball?',
    a: 'The five positions are: Point Guard (PG) — the primary ball-handler and playmaker; Shooting Guard (SG) — typically the team\'s best perimeter scorer; Small Forward (SF) — versatile two-way player; Power Forward (PF) — physical inside player who also stretches the floor in the modern game; Center (C) — usually the tallest player, protecting the rim and anchoring the offense in the paint.',
  },
];

const CATEGORY_LABELS = {
  all: 'All Questions',
  general: '🔧 General',
  football: '⚽ Football',
  basketball: '🏀 Basketball',
};

function initFAQ() {
  const list = document.getElementById('faq-list');
  const filterBtns = document.querySelectorAll('.faq-filter-btn');

  function renderFAQ(cat) {
    const filtered = cat === 'all' ? FAQ_DATA : FAQ_DATA.filter((item) => item.category === cat);
    list.innerHTML = filtered
      .map(
        (item, i) => `
      <div class="faq-item" data-index="${i}">
        <button class="faq-question" aria-expanded="false">
          <span class="faq-cat-tag faq-cat-tag--${item.category}">${CATEGORY_LABELS[item.category]}</span>
          ${item.q}
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">${item.a}</div>
      </div>
    `
      )
      .join('');
  }

  renderFAQ('all');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderFAQ(btn.dataset.cat);
    });
  });

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    list.querySelectorAll('.faq-item').forEach((el) => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
}

const API_KEY = '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';
const SYSTEM_PROMPT =
  'You are a sports expert AI assistant for RizkZone, a sports website. You are enthusiastic and knowledgeable about football (soccer), basketball, NBA, FIFA, World Cup, Premier League, La Liga, Champions League, Serie A, Bundesliga, and all major sports worldwide. Give clear, engaging answers. You can answer non-sports questions too but always be helpful.';

function createChatbot(messagesEl, inputEl, sendBtn) {
  if (!messagesEl) return;
  const history = [{ role: 'system', content: SYSTEM_PROMPT }];

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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: history }),
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

function initNavChatbox() {
  const toggleBtn = document.getElementById('nav-chat-toggle');
  const panel     = document.getElementById('nav-chatbox');
  const closeBtn  = document.getElementById('nav-chatbox-close');
  if (!toggleBtn || !panel) return;

  function openPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.getElementById('nav-chatbot-input')?.focus();
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', () => {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });

  closeBtn?.addEventListener('click', closePanel);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== toggleBtn) closePanel();
  });

  createChatbot(
    document.getElementById('nav-chatbot-messages'),
    document.getElementById('nav-chatbot-input'),
    document.getElementById('nav-chatbot-send'),
  );
}

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();
initFAQ();
initNavChatbox();
createChatbot(
  document.getElementById('chatbot-messages'),
  document.getElementById('chatbot-input'),
  document.getElementById('chatbot-send'),
);
