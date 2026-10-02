// Elements
const card = document.getElementById('card');
const song = document.getElementById('song');
const messageEl = document.getElementById('message');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');
const tapPrompt = document.getElementById('tapPrompt');
const lovePopup = document.getElementById('lovePopup');
const loveYesBtn = document.getElementById('loveYesBtn');
const loveNoBtn = document.getElementById('loveNoBtn');
const popupTitle = document.getElementById('popupTitle');
const popupSub = document.getElementById('popupSub');
const stage1 = document.getElementById('stage1');

// Birthday message
const mainMessage = "May all your dreams come true. You deserve all the happiness in the world! 🎉";

// ─── Typewriter Effect ────────────────────────────────────────────────────────
async function typeText(text, el, speed = 32) {
  el.innerHTML = '<span class="cursor">|</span>';
  let i = 0;
  return new Promise((resolve) => {
    const intv = setInterval(() => {
      const current = text.substring(0, i + 1);
      el.innerHTML = current + '<span class="cursor">|</span>';
      i++;
      if (i >= text.length) {
        clearInterval(intv);
        resolve();
      }
    }, speed);
  });
}

// ─── Soft Falling Confetti ─────────────────────────────────────────────────────
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const confettiPieces = Array.from({ length: 90 }).map(() => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  vy: 0.8 + Math.random() * 1.4,
  vx: (Math.random() - 0.5) * 0.4,
  width: 4 + Math.random() * 5,
  height: 3 + Math.random() * 4,
  color: ['#ffffff', '#ffd1dc', '#fca5a5', '#ff9cc6', '#ffe4e6'][Math.floor(Math.random() * 5)],
  opacity: 0.35 + Math.random() * 0.55,
  rotation: Math.random() * 360,
  vr: (Math.random() - 0.5) * 1.5,
}));

function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach((p) => {
    p.y += p.vy;
    p.x += p.vx;
    p.rotation += p.vr;

    if (p.y > confettiCanvas.height) {
      p.y = -10;
      p.x = Math.random() * confettiCanvas.width;
    }
    if (p.x > confettiCanvas.width) p.x = 0;
    if (p.x < 0) p.x = confettiCanvas.width;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
    ctx.restore();
  });
  requestAnimationFrame(drawConfetti);
}

// ─── Photo Slideshow ──────────────────────────────────────────────────────────
let currentSlide = 0;
function startSlideshow() {
  const slides = document.querySelectorAll('.photo-slider img');
  if (slides.length <= 1) return;
  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 3000);
}

// ─── Music Control ─────────────────────────────────────────────────────────────
let isPlaying = false;

function playAudio() {
  if (!song) return;
  song.play().then(() => {
    isPlaying = true;
    if (musicIcon) musicIcon.textContent = '🎵';
  }).catch(() => {
    isPlaying = false;
    if (musicIcon) musicIcon.textContent = '🔇';
  });
}

function toggleMusic(e) {
  if (e) e.stopPropagation();
  if (!song) return;
  if (isPlaying) {
    song.pause();
    isPlaying = false;
    if (musicIcon) musicIcon.textContent = '🔇';
  } else {
    song.play().then(() => {
      isPlaying = true;
      if (musicIcon) musicIcon.textContent = '🎵';
    }).catch(() => {});
  }
}

if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

// Unlock audio on first tap
const unlockAudio = () => {
  if (!isPlaying) playAudio();
  window.removeEventListener('click', unlockAudio);
  window.removeEventListener('touchstart', unlockAudio);
};
window.addEventListener('click', unlockAudio, { once: true });
window.addEventListener('touchstart', unlockAudio, { once: true });

// ─── Love Popup Logic ─────────────────────────────────────────────────────────
let noClickCount = 0;
let yesSizeScale = 1;

const noMessages = [
  { title: "Are you sure? 🥺", sub: "Think again, please…" },
  { title: "Really sure? 😢", sub: "I baked this with love!" },
  { title: "Don't break my heart! 💔", sub: "The Yes button is RIGHT THERE…" },
  { title: "Last chance! 🥺", sub: "Just click Love already!" },
  { title: "Okay fine… 😭", sub: "You clearly can't resist forever!" },
];

function openPopup() {
  if (lovePopup) {
    lovePopup.style.display = 'flex';
    // Reset
    noClickCount = 0;
    yesSizeScale = 1;
    if (popupTitle) popupTitle.textContent = 'Do you love me? 💖';
    if (popupSub) popupSub.textContent = 'Choose honestly…';
    if (loveYesBtn) loveYesBtn.style.transform = 'scale(1)';
    if (loveNoBtn) {
      loveNoBtn.style.transform = 'scale(1)';
      loveNoBtn.style.opacity = '1';
      loveNoBtn.style.display = '';
    }
  }
}

function closePopupAndReveal() {
  if (lovePopup) {
    lovePopup.classList.add('popup-fade-out');
    setTimeout(() => {
      lovePopup.style.display = 'none';
      lovePopup.classList.remove('popup-fade-out');
    }, 350);
  }
  // Hide tap prompt
  if (tapPrompt) tapPrompt.style.display = 'none';
  // Show birthday card content
  if (stage1) stage1.style.display = 'block';
  // Start music
  if (!isPlaying) playAudio();
  // Start typewriter
  setTimeout(() => typeText(mainMessage, messageEl, 30), 400);
}

// Click on card opens popup (only if not yet revealed)
let revealed = false;
if (card) {
  card.addEventListener('click', (e) => {
    if (revealed) return;
    if (e.target.closest('#musicBtn') || e.target.closest('.love-popup-overlay')) return;
    openPopup();
  });
}

if (loveYesBtn) {
  loveYesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    revealed = true;
    closePopupAndReveal();
  });
}

if (loveNoBtn) {
  loveNoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    noClickCount++;

    // Make Yes bigger, No smaller
    yesSizeScale = Math.min(yesSizeScale + 0.18, 2.2);
    const noScale = Math.max(1 - noClickCount * 0.12, 0.38);

    if (loveYesBtn) loveYesBtn.style.transform = `scale(${yesSizeScale})`;
    if (loveNoBtn) {
      loveNoBtn.style.transform = `scale(${noScale})`;
      loveNoBtn.style.opacity = `${Math.max(noScale, 0.35)}`;
    }

    // Update messages
    const msg = noMessages[Math.min(noClickCount - 1, noMessages.length - 1)];
    if (popupTitle) popupTitle.textContent = msg.title;
    if (popupSub) popupSub.textContent = msg.sub;

    // After 5 clicks, hide the no button completely
    if (noClickCount >= 5 && loveNoBtn) {
      loveNoBtn.style.display = 'none';
    }
  });
}

// ─── Initialization ───────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  drawConfetti();
  startSlideshow();
});
