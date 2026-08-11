const sparkleBox = document.getElementById("sparkleBox");
const musicBtn = document.getElementById("musicBtn");
const giftStage = document.getElementById("giftStage");
const openGiftBtn = document.getElementById("openGiftBtn");
const parcelBox = document.getElementById("parcelBox");
const mainStage = document.getElementById("mainStage");
const beggingBox = document.getElementById("beggingBox");
const celebrationBox = document.getElementById("celebrationBox");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const openLetterBtn = document.getElementById("openLetterBtn");
const celebLetterBtn = document.getElementById("celebLetterBtn");
const letterModal = document.getElementById("letterModal");
const closeLetterBtn = document.getElementById("closeLetterBtn");
const modalCloseAction = document.getElementById("modalCloseAction");

let dodgeCount = 0;
const dodgeMessages = [
    "I brought boba tea! 🧋",
    "I promise 100 bear hugs! 🧸",
    "Look at my sad eyes 🥺",
    "Pretty please forgive me? 🌸",
    "I promise 1000 kisses! 💋"
];

// Generate Sparkles
for (let i = 0; i < 25; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 4 + 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 4 + 4}s`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    sparkleBox.appendChild(star);
}

// Open Gift Unboxing Teaser
function handleOpenGift() {
    giftStage.classList.add("hidden");
    mainStage.classList.remove("hidden");
    playMusic();
}

openGiftBtn.addEventListener("click", handleOpenGift);
parcelBox.addEventListener("click", handleOpenGift);

// Yes Button Click
yesBtn.addEventListener("click", () => {
    beggingBox.classList.add("hidden");
    celebrationBox.classList.remove("hidden");
    confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#f472b6", "#ec4899", "#c084fc", "#fbbf24", "#38bdf8", "#34d399"]
    });
    playMusic();
});

// Runaway No Button Reaction
function dodgeNo() {
    const randomX = (Math.random() - 0.5) * 240;
    const randomY = (Math.random() - 0.5) * 180;
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
    noBtn.textContent = dodgeMessages[dodgeCount % dodgeMessages.length];
    dodgeCount++;
}

noBtn.addEventListener("mouseenter", dodgeNo);
noBtn.addEventListener("click", dodgeNo);

// Letter Drawer Toggle
openLetterBtn.addEventListener("click", () => {
    letterModal.classList.remove("hidden");
});

celebLetterBtn.addEventListener("click", () => {
    letterModal.classList.remove("hidden");
});

closeLetterBtn.addEventListener("click", () => {
    letterModal.classList.add("hidden");
});

modalCloseAction.addEventListener("click", () => {
    letterModal.classList.add("hidden");
});

// Audio logic
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
            musicBtn.textContent = "🔊 Music Playing";
        }).catch(() => {});
    }
}

musicBtn.addEventListener("click", () => {
    if (!audio) playMusic();
    else if (isPlaying) {
        audio.pause();
        isPlaying = false;
        musicBtn.textContent = "🎵 Play Music";
    } else {
        audio.play();
        isPlaying = true;
        musicBtn.textContent = "🔊 Music Playing";
    }
});
