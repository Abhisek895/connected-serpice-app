const stages = [
    {
        image: "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif",
        title: "Do you love me? 🤗",
        subtext: "mvn is all yours",
    },
    {
        image: "https://media.giphy.com/media/ROF8OQvDmxytW/giphy.gif",
        title: "Ek aur baar Soch lo! 🥺",
        subtext: "kyu aisa kar rahi ho Pls Maan jao 🥺",
    },
    {
        image: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif",
        title: "Please think again! 😳",
        subtext: "itni jaldi na matt bolo 🥺",
    },
    {
        image: "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif",
        title: "beautiful pls Man jao na! Kitna code likh waogi 😭",
        subtext: "bhut galat baat hai yrr 🥺",
    },
];

let stageIndex = 0;
let isEscaped = false;

const stickerImg = document.getElementById("stickerImg");
const proposalHeading = document.getElementById("proposalHeading");
const proposalSubtext = document.getElementById("proposalSubtext");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const btnGroup = document.getElementById("btnGroup");
const confettiBox = document.getElementById("confettiBox");

function moveNoButton() {
    isEscaped = true;
    noBtn.classList.add("escaped");

    const padding = 80;
    const maxX = window.innerWidth - 140;
    const maxY = window.innerHeight - 80;

    const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
    const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;
}

function updateStage() {
    const current = stages[Math.min(stageIndex, stages.length - 1)];
    stickerImg.src = current.image;
    proposalHeading.textContent = current.title;
    proposalSubtext.textContent = current.subtext;

    // Scale up YES button as she keeps saying No
    if (stageIndex >= 2) {
        const scale = 1 + (stageIndex * 0.12);
        yesBtn.style.transform = `scale(${scale})`;
    }
}

noBtn.addEventListener("click", () => {
    stageIndex++;
    updateStage();

    if (stageIndex >= 3) {
        moveNoButton();
    }
});

noBtn.addEventListener("mouseenter", () => {
    if (stageIndex >= 3) {
        moveNoButton();
    }
});

noBtn.addEventListener("touchstart", (e) => {
    if (stageIndex >= 3) {
        e.preventDefault();
        moveNoButton();
    }
});

yesBtn.addEventListener("click", () => {
    // Celebration
    stickerImg.src = "https://media1.tenor.com/m/gUiu1zyxfzYAAAAC/bear-kiss-bear-hug.gif";
    proposalHeading.textContent = "Yayyy! I knew you loved me! 💖🥰";
    proposalSubtext.textContent = "You can never say no! 🙈✨";

    btnGroup.style.display = "none";

    // Confetti
    const emojis = ["💖", "🌸", "💕", "✨", "🥰", "😍", "💞", "💝", "🎉", "🌹"];
    for (let i = 0; i < 35; i++) {
        const el = document.createElement("div");
        el.className = "confetti-item";
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = `${Math.random() * 100}vw`;
        el.style.fontSize = `${Math.random() * 18 + 22}px`;
        el.style.animationDuration = `${Math.random() * 3 + 3}s`;
        confettiBox.appendChild(el);
    }

    try {
        const audio = new Audio("/demos/nasamajh-lakri/yess.mp3");
        audio.volume = 0.4;
        audio.play();
    } catch (e) {}
});
