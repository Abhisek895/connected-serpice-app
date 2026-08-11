const heartContainer = document.getElementById("heartContainer");
const starsBox = document.getElementById("starsBox");
const entryBox = document.getElementById("entryBox");
const sceneBox = document.getElementById("sceneBox");
const openBtn = document.getElementById("openBtn");

const outerPointsCount = 46;
const innerPointsCount = 20;
const repeatingWord = "I LOVE YOU";

let rotX = 12;
let rotY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;
let isOpened = false;

// 1. LAYER 1: Core Glowing 3D Heart Crystal Gem Center
const coreGem = document.createElement("div");
coreGem.className = "core-gem";
coreGem.innerHTML = "💖";
heartContainer.appendChild(coreGem);

// 2. LAYER 2: Inner Helix Ring of Floating Love Words
for (let i = 0; i < innerPointsCount; i++) {
    const t = (i / innerPointsCount) * Math.PI * 2;
    const radius = 95;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t * 3) * 35;
    const angleDeg = (-t * 180) / Math.PI;

    const el = document.createElement("div");
    el.className = "inner_helix_word";
    el.textContent = `💖 ${repeatingWord}`;
    el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${angleDeg}deg)`;
    heartContainer.appendChild(el);
}

// 3. LAYER 3: Outer 3D Parametric Heart Text Lattice
for (let i = 0; i < outerPointsCount; i++) {
    const t = (i / outerPointsCount) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const z = Math.sin(t * 2) * 9;

    const dx = 48 * Math.pow(Math.sin(t), 2) * Math.cos(t);
    const dy = 13 * Math.sin(t) - 10 * Math.sin(2 * t) - 6 * Math.sin(3 * t) - 4 * Math.sin(4 * t);
    
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;
    const hue = (i * 8 + 320) % 360;

    const el = document.createElement("div");
    el.className = "love_word";
    el.textContent = repeatingWord;
    el.style.transform = `translate3d(${x * 12.5}px, ${y * 12.5}px, ${z * 7}px) rotateZ(${angleDeg}deg)`;
    el.style.color = "#ffffff";
    el.style.textShadow = `0 2px 5px rgba(0,0,0,0.95), 0 0 6px #ffffff, 0 0 16px hsl(${hue}, 100%, 75%), 0 0 35px rgba(244,63,94,0.9)`;
    heartContainer.appendChild(el);
}

// Generate Stars
for (let i = 0; i < 35; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 4 + 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 4 + 4}s`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    starsBox.appendChild(star);
}

function updateTransform() {
    heartContainer.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
}

function animate() {
    if (isOpened && !isDragging) {
        rotY += 0.45; // Continuous smooth rotation
    }
    updateTransform();
    requestAnimationFrame(animate);
}

animate();

// Handle Open Button Click
openBtn.addEventListener("click", () => {
    isOpened = true;
    entryBox.classList.add("hidden");
    sceneBox.classList.remove("hidden");
    document.body.style.cursor = "grab";
    playMusic();
});

// Drag / Touch Listeners
function onStart(e) {
    if (!isOpened) return;
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastX = clientX;
    lastY = clientY;
    spawnSparkle(clientX, clientY);
}

function onMove(e) {
    if (!isDragging || !isOpened) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - lastX;
    const deltaY = clientY - lastY;

    rotX = Math.max(-65, Math.min(65, rotX - deltaY * 0.4));
    rotY += deltaX * 0.5;

    lastX = clientX;
    lastY = clientY;
}

function onEnd() {
    isDragging = false;
}

window.addEventListener("mousedown", onStart);
window.addEventListener("mousemove", onMove);
window.addEventListener("mouseup", onEnd);

window.addEventListener("touchstart", onStart);
window.addEventListener("touchmove", onMove);
window.addEventListener("touchend", onEnd);

function spawnSparkle(x, y) {
    const emojis = ["💖", "✨", "🌸", "💕", "❤️", "💞"];
    const sparkle = document.createElement("div");
    sparkle.className = "tap-sparkle";
    sparkle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    document.body.appendChild(sparkle);

    setTimeout(() => {
        sparkle.remove();
    }, 800);
}

let audio = null;
let isPlaying = false;

function playMusic() {
    if (!audio) {
        audio = new Audio("/demos/surprise/loveSong.mp3");
        audio.loop = true;
        audio.volume = 0.45;
    }
    if (!isPlaying) {
        audio.play().then(() => {
            isPlaying = true;
        }).catch(() => {});
    }
}
