import {
  updateNavAuth,
  isLoggedIn,
  isGuest,
  getSession,
  canAccessGame,
  setGuestGameChoice,
} from './auth.js';
import { initLiveTicker, initNav } from './ui.js';

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
initLiveTicker();

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
