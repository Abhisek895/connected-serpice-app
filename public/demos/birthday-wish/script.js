// Elements
const entry = document.getElementById('entry');
const card = document.getElementById('card');
const hateMsg = document.getElementById('hateMsg');
const song = document.getElementById('song');
const messageEl = document.getElementById('message');
const msgBtn = document.getElementById('msgBtn');

const mainMessage = "Happy Birthday! 🎂✨I hope today makes you smile as much as you make everyone around you smile. You deserve all the happiness, good food, and unforgettable moments today. Stay the amazing person you are.And...I hope I get to steal a little of your time to celebrate with you someday. 😉❤️";

// Love button
document.getElementById('loveBtn').addEventListener('click', () => {
  entry.style.display = 'none';
  card.style.display = 'block';
  song.play();
  startConfetti();
  startSlideshow();
});
// Hate button
document.getElementById('hateBtn').addEventListener('click', () => {
  entry.style.display = 'none';
  hateMsg.classList.add('show');
});

// Show message
msgBtn.addEventListener('click', () => {
  msgBtn.style.display = 'none';
  typeText(mainMessage, messageEl);
  messageEl.classList.add('show');
});

// Typing effect
async function typeText(text, el, speed = 30) {
  el.textContent = "";
  let i = 0;
  return new Promise(resolve => {
    const intv = setInterval(() => {
      el.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(intv);
        resolve();
      }
    }, speed);
  });
}

// Confetti
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');
function resizeCanvas() {
  confettiCanvas.width = innerWidth;
  confettiCanvas.height = innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const confettiPieces = Array.from({ length: 150 }).map(() => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  vy: 1 + Math.random() * 2,
  size: 5 + Math.random() * 6,
  color: ['#ff9cc6', '#ffd6e8', '#ff6b9a', '#ffffff'][Math.floor(Math.random() * 4)]
}));

function drawConfetti() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  confettiPieces.forEach(p => {
    p.y += p.vy;
    if (p.y > innerHeight) p.y = -10;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
  });
  requestAnimationFrame(drawConfetti);
}
function startConfetti() { drawConfetti(); }

// Slideshow
let current = 0;
function startSlideshow() {
  const slides = document.querySelectorAll('.photo-slider img');
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 3000);
}
