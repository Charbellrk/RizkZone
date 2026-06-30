import {
  updateNavAuth,
  isLoggedIn,
  isGuest,
  getSession,
  canAccessGame,
  setGuestGameChoice,
} from './auth.js';
import { initLiveTicker, initNav, initNightMode } from './ui.js';

/* ── Confetti ────────────────────────────────────────────────────────────── */
function fireConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#ff6b35','#ffd700','#00d4aa','#4dabf7','#e040fb','#ff4081','#00e676'];
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width, y: -20,
    vx: (Math.random() - 0.5) * 6, vy: 3 + Math.random() * 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    w: 8 + Math.random() * 8, h: 4 + Math.random() * 4,
    rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 8,
  }));
  let frame = 0;
  const tick = () => {
    if (++frame > 200) { canvas.remove(); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.rot += p.rotV;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    requestAnimationFrame(tick);
  };
  tick();
}

/* ── Sports Trivia — Football & Basketball only ──────────────────────────── */
const TRIVIA_BANK = [
  // ── Football ──────────────────────────────────────────────────────────────
  { q: 'Who has scored the most goals in FIFA World Cup history?', a: 'Miroslav Klose', opts: ['Ronaldo Nazário', 'Just Fontaine', 'Pelé', 'Miroslav Klose'], sport: '⚽' },
  { q: 'Which country has won the most FIFA World Cup titles?', a: 'Brazil', opts: ['Germany', 'Italy', 'Argentina', 'Brazil'], sport: '⚽' },
  { q: 'Who scored the famous "Hand of God" goal in the 1986 World Cup?', a: 'Diego Maradona', opts: ['Pelé', 'Ronaldo', 'Zidane', 'Diego Maradona'], sport: '⚽' },
  { q: 'In which year was the first FIFA World Cup held?', a: '1930', opts: ['1926', '1934', '1938', '1930'], sport: '⚽' },
  { q: 'Which club has won the most UEFA Champions League titles?', a: 'Real Madrid', opts: ['Barcelona', 'Bayern Munich', 'AC Milan', 'Real Madrid'], sport: '⚽' },
  { q: 'Which player has won the Ballon d\'Or the most times?', a: 'Lionel Messi', opts: ['Cristiano Ronaldo', 'Ronaldinho', 'Zinedine Zidane', 'Lionel Messi'], sport: '⚽' },
  { q: 'Which country hosted the 2022 FIFA World Cup?', a: 'Qatar', opts: ['UAE', 'Saudi Arabia', 'Egypt', 'Qatar'], sport: '⚽' },
  { q: 'How long is a standard football match (excluding extra time)?', a: '90 minutes', opts: ['80 minutes', '100 minutes', '120 minutes', '90 minutes'], sport: '⚽' },
  { q: 'What colour card results in an immediate ejection from a football match?', a: 'Red', opts: ['Yellow', 'Orange', 'Blue', 'Red'], sport: '⚽' },
  { q: 'In which city is the Camp Nou stadium located?', a: 'Barcelona', opts: ['Madrid', 'Lisbon', 'Milan', 'Barcelona'], sport: '⚽' },
  { q: 'Who is nicknamed "The Egyptian King" and plays for Liverpool?', a: 'Mohamed Salah', opts: ['Sadio Mané', 'Riyad Mahrez', 'Pierre-Emerick Aubameyang', 'Mohamed Salah'], sport: '⚽' },
  { q: 'Which nation won the 2021 UEFA European Championship?', a: 'Italy', opts: ['France', 'England', 'Spain', 'Italy'], sport: '⚽' },
  { q: 'Who was the top scorer at the 2018 FIFA World Cup?', a: 'Harry Kane', opts: ['Cristiano Ronaldo', 'Antoine Griezmann', 'Kylian Mbappé', 'Harry Kane'], sport: '⚽' },
  { q: 'What does "FIFA" stand for?', a: 'Fédération Internationale de Football Association', opts: ['Fédération Internationale de Football Association', 'Federation of International Football Associations', 'Football International Federation of Athletes', 'Federal Institute of Football Administration'], sport: '⚽' },
  { q: 'Which country won the inaugural Copa América in 1916?', a: 'Uruguay', opts: ['Argentina', 'Brazil', 'Chile', 'Uruguay'], sport: '⚽' },
  { q: 'Cristiano Ronaldo began his club career at which Portuguese club?', a: 'Sporting CP', opts: ['Benfica', 'Porto', 'Braga', 'Sporting CP'], sport: '⚽' },
  { q: 'Which club did Zinedine Zidane score a famous volley for in the 2002 Champions League Final?', a: 'Real Madrid', opts: ['Juventus', 'AC Milan', 'Barcelona', 'Real Madrid'], sport: '⚽' },
  { q: 'Germany famously beat Brazil 7–1 in which tournament in 2014?', a: 'FIFA World Cup semi-final', opts: ['UEFA Nations League', 'FIFA World Cup final', 'Friendly match', 'FIFA World Cup semi-final'], sport: '⚽' },
  { q: 'Who is the all-time top scorer in the English Premier League?', a: 'Alan Shearer', opts: ['Wayne Rooney', 'Andrew Cole', 'Frank Lampard', 'Alan Shearer'], sport: '⚽' },
  { q: 'In which year did Argentina last win the FIFA World Cup before 2022?', a: '1986', opts: ['1978', '1990', '1994', '1986'], sport: '⚽' },
  // ── Basketball ────────────────────────────────────────────────────────────
  { q: 'Who holds the NBA all-time regular season scoring record?', a: 'LeBron James', opts: ['Kareem Abdul-Jabbar', 'Karl Malone', 'Kobe Bryant', 'LeBron James'], sport: '🏀' },
  { q: 'Which NBA player scored 100 points in a single game?', a: 'Wilt Chamberlain', opts: ['Michael Jordan', 'Kobe Bryant', 'LeBron James', 'Wilt Chamberlain'], sport: '🏀' },
  { q: 'Who invented basketball?', a: 'James Naismith', opts: ['Michael Jordan', 'Larry Bird', 'Bob Cousy', 'James Naismith'], sport: '🏀' },
  { q: 'What is the shot clock duration in NBA games?', a: '24 seconds', opts: ['30 seconds', '20 seconds', '35 seconds', '24 seconds'], sport: '🏀' },
  { q: 'How many players from each team are on the court at one time in basketball?', a: '5', opts: ['4', '6', '7', '5'], sport: '🏀' },
  { q: 'Which NBA team has won the most championships?', a: 'Boston Celtics', opts: ['Los Angeles Lakers', 'Chicago Bulls', 'Golden State Warriors', 'Boston Celtics'], sport: '🏀' },
  { q: 'What is the height of a regulation NBA basketball hoop from the floor?', a: '10 feet (3.05 m)', opts: ['9 feet (2.74 m)', '11 feet (3.35 m)', '12 feet (3.66 m)', '10 feet (3.05 m)'], sport: '🏀' },
  { q: 'Who is known by the nickname "The Black Mamba"?', a: 'Kobe Bryant', opts: ['LeBron James', 'Dwyane Wade', 'Kevin Durant', 'Kobe Bryant'], sport: '🏀' },
  { q: 'What does NBA stand for?', a: 'National Basketball Association', opts: ['National Basketball Academy', 'North Basketball Association', 'National Basketball Athletics', 'National Basketball Association'], sport: '🏀' },
  { q: 'In which year was the three-point line introduced in the NBA?', a: '1979', opts: ['1975', '1983', '1985', '1979'], sport: '🏀' },
  { q: 'Which player has the nickname "The Greek Freak"?', a: 'Giannis Antetokounmpo', opts: ['Nikola Jokić', 'Luka Dončić', 'Jayson Tatum', 'Giannis Antetokounmpo'], sport: '🏀' },
  { q: 'Which team did Michael Jordan win all 6 of his NBA championships with?', a: 'Chicago Bulls', opts: ['Washington Wizards', 'Detroit Pistons', 'Los Angeles Lakers', 'Chicago Bulls'], sport: '🏀' },
  { q: 'Nikola Jokić plays for which NBA team?', a: 'Denver Nuggets', opts: ['Oklahoma City Thunder', 'Minnesota Timberwolves', 'Phoenix Suns', 'Denver Nuggets'], sport: '🏀' },
  { q: 'Who holds the NBA record for most three-pointers made in a career?', a: 'Stephen Curry', opts: ['Ray Allen', 'Reggie Miller', 'Klay Thompson', 'Stephen Curry'], sport: '🏀' },
  { q: 'Which country does NBA star Luka Dončić represent internationally?', a: 'Slovenia', opts: ['Croatia', 'Serbia', 'Bosnia', 'Slovenia'], sport: '🏀' },
  { q: 'What is the term for scoring two points by dunking or shooting from inside the arc?', a: 'Field goal', opts: ['Free throw', 'Slam', 'Layup goal', 'Field goal'], sport: '🏀' },
  { q: 'Who won the NBA MVP award the most times (4 times)?', a: 'Kareem Abdul-Jabbar', opts: ['LeBron James', 'Michael Jordan', 'Bill Russell', 'Kareem Abdul-Jabbar'], sport: '🏀' },
  { q: 'The shortest player ever in NBA history (5\'3") was who?', a: 'Muggsy Bogues', opts: ['Spud Webb', 'Calvin Murphy', 'Isaiah Thomas', 'Muggsy Bogues'], sport: '🏀' },
  { q: 'Which NBA team set the regular season wins record with 73 wins in 2015-16?', a: 'Golden State Warriors', opts: ['Chicago Bulls', 'Los Angeles Lakers', 'San Antonio Spurs', 'Golden State Warriors'], sport: '🏀' },
  { q: 'Which country did Hakeem Olajuwon originally come from before playing in the NBA?', a: 'Nigeria', opts: ['Ghana', 'Senegal', 'Cameroon', 'Nigeria'], sport: '🏀' },
];

class TriviaGame {
  constructor() {
    this.score = 0;
    this.current = 0;
    this.questions = [];
    this.area    = document.getElementById('trivia-area');
    this.scoreEl = document.getElementById('trivia-score');
    this.statusEl = document.getElementById('trivia-status');
  }

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  start() {
    this.score = 0; this.current = 0;
    this.questions = this.shuffle(TRIVIA_BANK).slice(0, 10).map((q) => ({
      question: `${q.sport} ${q.q}`,
      correct: q.a,
      options: this.shuffle(q.opts),
      difficulty: q.sport === '⚽' ? 'football' : 'basketball',
    }));
    this.updateUI();
    this.statusEl.textContent = 'Good luck!';
    this.showQuestion();
  }

  showQuestion() {
    if (this.current >= this.questions.length) { this.end(); return; }
    const q = this.questions[this.current];
    this.statusEl.textContent = `Question ${this.current + 1} / ${this.questions.length} · ${q.difficulty}`;
    this.area.innerHTML = `
      <div class="trivia-question">${q.question}</div>
      <div class="trivia-options">
        ${q.options.map((opt) => `<button class="trivia-opt" data-answer="${opt.replace(/"/g, '&quot;')}">${opt}</button>`).join('')}
      </div>`;
    this.area.querySelectorAll('.trivia-opt').forEach((btn) => {
      btn.addEventListener('click', () => this.answer(btn, q.correct));
    });
  }

  answer(btn, correct) {
    this.area.querySelectorAll('.trivia-opt').forEach((b) => {
      b.disabled = true;
      if (b.dataset.answer === correct) b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
    });
    if (btn.dataset.answer === correct) this.score++;
    this.updateUI();
    setTimeout(() => { this.current++; this.showQuestion(); }, 1000);
  }

  end() {
    const msg = this.score >= 8 ? '🏆 Sports genius!' : this.score >= 6 ? '👏 Great job!' : this.score >= 4 ? '👍 Not bad!' : '📚 Keep learning!';
    this.area.innerHTML = `
      <div style="text-align:center;padding:20px 0;">
        <div style="font-size:2.5rem;margin-bottom:12px;">${msg.split(' ')[0]}</div>
        <div style="font-size:1.4rem;font-weight:700;margin-bottom:8px;">You scored ${this.score} / 10</div>
        <div style="color:var(--text-muted);">${msg.slice(msg.indexOf(' ') + 1)}</div>
      </div>`;
    this.statusEl.textContent = 'Quiz complete!';
    if (this.score >= 7) fireConfetti();
  }

  reset() {
    this.score = 0; this.current = 0; this.questions = [];
    this.area.innerHTML = '';
    this.statusEl.textContent = 'Ready when you are';
    this.updateUI();
  }

  updateUI() { this.scoreEl.textContent = this.score; }
}

function setupAccessControl() {
  const session = getSession();
  const penaltyCard = document.getElementById('penalty-game');
  const freethrowCard = document.getElementById('freethrow-game');
  const guestPicker = document.getElementById('guest-game-picker');

  if (!session) {
    window.location.href = 'login.html';
    return false;
  }

  if (isLoggedIn()) {
    penaltyCard.classList.remove('locked');
    freethrowCard.classList.remove('locked');
    return true;
  }

  if (isGuest()) {
    const savedChoice = localStorage.getItem('arenaSportsGuestGame');
    if (!savedChoice) {
      guestPicker.classList.remove('hidden');
      guestPicker.querySelectorAll('[data-pick]').forEach((btn) => {
        btn.addEventListener('click', () => {
          setGuestGameChoice(btn.dataset.pick);
          window.location.reload();
        });
      });
      penaltyCard.classList.add('locked');
      freethrowCard.classList.add('locked');
      return false;
    }
    applyGuestLocks(savedChoice);
    return canAccessGame('penalty') || canAccessGame('freethrow');
  }

  return false;
}

function applyGuestLocks(allowedGame) {
  const penaltyCard = document.getElementById('penalty-game');
  const freethrowCard = document.getElementById('freethrow-game');

  if (allowedGame === 'penalty') {
    penaltyCard.classList.remove('locked');
    freethrowCard.classList.add('locked');
  } else {
    freethrowCard.classList.remove('locked');
    penaltyCard.classList.add('locked');
  }
}

/* ── Penalty Shootout ── */
class PenaltyGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.score = 0;
    this.round = 0;
    this.maxRounds = 5;
    this.active = false;
    this.goalkeeperX = 200;
    this.goalkeeperDir = 1;
    this.message = 'Click Start Game';
    this.animationId = null;

    canvas.addEventListener('click', (e) => this.handleShot(e));
    this.draw();
  }

  start() {
    this.score = 0;
    this.round = 0;
    this.active = true;
    this.message = 'Click the goal to shoot!';
    this.updateUI();
    this.animate();
  }

  reset() {
    this.active = false;
    this.score = 0;
    this.round = 0;
    this.message = 'Click Start Game';
    cancelAnimationFrame(this.animationId);
    this.updateUI();
    this.draw();
  }

  animate() {
    if (!this.active) return;
    this.goalkeeperX += this.goalkeeperDir * 3;
    if (this.goalkeeperX < 120 || this.goalkeeperX > 280) {
      this.goalkeeperDir *= -1;
    }
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  handleShot(e) {
    if (!this.active || this.round >= this.maxRounds) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    if (y > 180) return;

    this.round++;
    const gkLeft = this.goalkeeperX - 30;
    const gkRight = this.goalkeeperX + 30;
    const scored = x < gkLeft || x > gkRight;

    if (scored) this.score++;
    this.message = scored ? '⚽ GOAL!' : '🧤 SAVED!';

    this.updateUI();
    this.draw(x, y, scored);

    if (this.round >= this.maxRounds) {
      this.active = false;
      cancelAnimationFrame(this.animationId);
      this.message = this.score >= 4 ? '🏆 Excellent!' : this.score >= 2 ? '👍 Not bad!' : '😅 Keep practicing!';
      if (this.score >= 4) fireConfetti();
    } else {
      setTimeout(() => {
        this.message = 'Click the goal to shoot!';
        if (this.active) this.animate();
      }, 800);
    }
  }

  updateUI() {
    document.getElementById('penalty-score').textContent = this.score;
    document.getElementById('penalty-round').textContent =
      this.round >= this.maxRounds
        ? 'Game Over'
        : `Round ${Math.min(this.round + 1, this.maxRounds)} of ${this.maxRounds}`;
  }

  draw(shotX, shotY, scored) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 400, 300);

    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = '#fff';
    ctx.fillRect(80, 40, 240, 140);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 40, 240, 140);

    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(this.goalkeeperX - 15, 130, 30, 50);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(this.goalkeeperX, 120, 12, 0, Math.PI * 2);
    ctx.fill();

    if (shotX !== undefined) {
      ctx.fillStyle = scored ? '#00d4aa' : '#ff4444';
      ctx.beginPath();
      ctx.arc(shotX, shotY, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#fff';
    ctx.font = '16px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.message, 200, 280);
  }
}

/* ── Free Throw Challenge ── */
class FreeThrowGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.score = 0;
    this.shot = 0;
    this.maxShots = 10;
    this.active = false;
    this.barX = 0;
    this.barDir = 1;
    this.barSpeed = 4;
    this.message = 'Click Start Game';
    this.animationId = null;

    canvas.addEventListener('click', () => this.handleShot());
    this.draw();
  }

  start() {
    this.score = 0;
    this.shot = 0;
    this.active = true;
    this.barSpeed = 4;
    this.message = 'Click when the bar is in the green zone!';
    this.updateUI();
    this.animate();
  }

  reset() {
    this.active = false;
    this.score = 0;
    this.shot = 0;
    this.message = 'Click Start Game';
    cancelAnimationFrame(this.animationId);
    this.updateUI();
    this.draw();
  }

  animate() {
    if (!this.active) return;
    this.barX += this.barDir * this.barSpeed;
    if (this.barX <= 0 || this.barX >= 340) this.barDir *= -1;
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  handleShot() {
    if (!this.active || this.shot >= this.maxShots) return;

    this.shot++;
    const inZone = this.barX >= 150 && this.barX <= 210;
    if (inZone) this.score++;
    this.message = inZone ? '🏀 SWISH!' : '❌ Miss!';
    this.barSpeed = Math.min(this.barSpeed + 0.5, 8);
    this.updateUI();

    if (this.shot >= this.maxShots) {
      this.active = false;
      cancelAnimationFrame(this.animationId);
      this.message = this.score >= 8 ? '🏆 MVP!' : this.score >= 5 ? '👍 Solid!' : '😅 Keep shooting!';
      if (this.score >= 8) fireConfetti();
    } else {
      setTimeout(() => {
        this.message = 'Click when the bar is in the green zone!';
        if (this.active) this.animate();
      }, 600);
    }
    this.draw();
  }

  updateUI() {
    document.getElementById('ft-score').textContent = this.score;
    document.getElementById('ft-round').textContent =
      this.shot >= this.maxShots
        ? 'Game Over'
        : `Shot ${Math.min(this.shot + 1, this.maxShots)} of ${this.maxShots}`;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 400, 300);

    ctx.fillStyle = '#1a2238';
    ctx.fillRect(0, 0, 400, 300);

    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(200, 80, 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(170, 110, 60, 8);

    ctx.fillStyle = '#333';
    ctx.fillRect(30, 220, 340, 30);
    ctx.fillRect(30, 220, 340, 30);

    ctx.fillStyle = 'rgba(0, 212, 170, 0.4)';
    ctx.fillRect(180, 225, 60, 20);

    ctx.fillStyle = '#4dabf7';
    ctx.fillRect(50 + this.barX, 225, 20, 20);

    ctx.fillStyle = '#fff';
    ctx.font = '16px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.message, 200, 280);
  }
}

updateNavAuth();
initNav();
initNightMode();
initLiveTicker();

/* Trivia is always available regardless of guest/login state */
const trivia = new TriviaGame();
document.getElementById('trivia-start')?.addEventListener('click', () => trivia.start());
document.getElementById('trivia-reset')?.addEventListener('click', () => trivia.reset());

if (setupAccessControl()) {
  const penalty = new PenaltyGame(document.getElementById('penalty-canvas'));
  const freethrow = new FreeThrowGame(document.getElementById('freethrow-canvas'));

  document.getElementById('penalty-start').addEventListener('click', () => {
    if (canAccessGame('penalty')) penalty.start();
  });
  document.getElementById('penalty-reset').addEventListener('click', () => {
    if (canAccessGame('penalty')) penalty.reset();
  });
  document.getElementById('ft-start').addEventListener('click', () => {
    if (canAccessGame('freethrow')) freethrow.start();
  });
  document.getElementById('ft-reset').addEventListener('click', () => {
    if (canAccessGame('freethrow')) freethrow.reset();
  });
}
