// @ts-nocheck
"use client";
import React, { useEffect, useRef } from "react";
import { recordResponseAction } from "../actions";

export type ProposalClientProps = {
  slug: string;
  themeName: string;
  title?: string;
  question: string;
  acceptBtn: string;
  rejectBtn: string;
  loveMessage?: string;
  photoUrl?: string;
  demoId?: string;
  media: { id: string; url: string; type: string; }[];
};

export default function DatePlannerTemplate({ slug, demoId, title }: ProposalClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasViewedRef = useRef(false);

  useEffect(() => {
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }
  }, [slug]);

  const initialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;

    // Run the extracted JS

    /* ============ ALL PRESETS CATALOG DATA ============ */
    const PRESETS = {
      romantic: {
        key: "romantic",
        name: "Romantic Love Surprise 💖",
        badge: "Requires Customization",
        badgeClass: "badge-requires-custom",
        badgeType: "custom",
        img: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop",
        desc: "Interactive romantic surprise with floating heart animations, love song (loveSong.mp3), photo showcase, & love letter reveal.",
        heroTitle: "For My Endless Love 💖",
        heroLines: [
          "Every single moment with you is a cherished memory...",
          "Here is a small token of my infinite love for you 💌"
        ],
        placesTitle: "Where shall we go on our romantic getaway? 🌸",
        places: [
          { name: "Rose Garden Promenade", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop" },
          { name: "Lakeside Sunset Point", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop" }
        ],
        food: [
          { name: "Gourmet Pasta & Wine", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" },
          { name: "Strawberry Shortcake", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop" }
        ]
      },
      birthday: {
        key: "birthday",
        name: "Happy Birthday Surprise 🎂",
        badge: "Requires Customization",
        badgeClass: "badge-requires-custom-orange",
        badgeType: "custom",
        img: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop",
        desc: "Interactive birthday card with photo slideshow gallery, birthday music (hbd.mp3), confetti, & custom love message reveal.",
        heroTitle: "Happy Birthday My Sunshine 🎂✨",
        heroLines: [
          "Wishing the happiest birthday to the most wonderful person!",
          "May your year ahead be filled with endless magic & laughter 🎉"
        ],
        placesTitle: "Where are we hosting your birthday bash? 🎈",
        places: [
          { name: "Birthday Party Lounge", img: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop" },
          { name: "Cozy Celebration Cafe", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop" }
        ],
        food: [
          { name: "Birthday Cake & Desserts", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop" },
          { name: "Artisanal Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" }
        ]
      },
      nasamajh: {
        key: "nasamajh",
        name: "Nasamajh Lakri Proposal ❤️",
        badge: "Instant Available",
        badgeClass: "badge-instant-available",
        badgeType: "instant",
        img: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop",
        desc: "Interactive Valentine proposal with romantic audio tracks (Start.mp3, yess.mp3, no.mp3), playful buttons, & gradient aesthetic.",
        heroTitle: "Hey Nasamajh Lakri ❤️",
        heroLines: [
          "I have a very important question for my favorite nasamajh...",
          "Are you ready? Don't even think about clicking No! 🙈"
        ],
        placesTitle: "Where are we celebrating our proposal? 💖",
        places: [
          { name: "Candlelight Dinner Bistro", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop" },
          { name: "Sunset Beach Walk", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" }
        ],
        food: [
          { name: "Special Biryani & Kebabs", img: "/demos/jalpaiguri-planner/food_biryani_1785674635340.png" },
          { name: "Crispy Fuchka Treat", img: "/demos/jalpaiguri-planner/food_fuchka_1785674646896.png" }
        ]
      },
      kolkata: {
        key: "kolkata",
        name: "Kolkata Date Night Planner 🌸",
        badge: "Instant Available",
        badgeClass: "badge-instant-available",
        badgeType: "instant",
        img: "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=600&auto=format&fit=crop",
        desc: "Pre-configured with default background music (Tum Se Hi), food menu (Biryani, Momo, Fuchka), date picker & summary card.",
        heroTitle: "Hey Beautiful 💕",
        heroLines: [
          "I made this tiny corner of the internet just for you...",
          "Yes, this whole page. For you. Keep scrolling 👀"
        ],
        placesTitle: "Where should we go in Kolkata? 🥺",
        places: [
          { name: "Victoria Memorial", img: "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop" },
          { name: "Princep Ghat Riverfront", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop" },
          { name: "Eco Park Newtown", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" },
          { name: "Park Street Romantic Cafe", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop" }
        ],
        food: [
          { name: "Kolkata Special Biryani", img: "/demos/jalpaiguri-planner/food_biryani_1785674635340.png" },
          { name: "Steamed Momo", img: "/demos/jalpaiguri-planner/food_momo_1785674624905.png" },
          { name: "Crispy Fuchka", img: "/demos/jalpaiguri-planner/food_fuchka_1785674646896.png" }
        ]
      },
      jalpaiguri: {
        key: "jalpaiguri",
        name: "Jalpaiguri Date Night Planner 🌿",
        badge: "Instant Available",
        badgeClass: "badge-instant-available",
        badgeType: "instant",
        img: "/demos/jalpaiguri-planner/jalpaiguri_rajbari.png",
        desc: "Pre-configured with default background music (Tum Se Hi), food menu (Biryani, Momo, Fuchka), date picker & summary card.",
        heroTitle: "Hey Beautiful 💕",
        heroLines: [
          "I made this tiny corner of the internet just for you...",
          "Let's explore the romantic rivers & parks of Jalpaiguri 👀"
        ],
        placesTitle: "Where should we go in Jalpaiguri? 🥺",
        places: [
          { name: "Jalpaiguri Rajbari", img: "/demos/jalpaiguri-planner/jalpaiguri_rajbari.png" },
          { name: "Sapar River Bank", img: "/demos/jalpaiguri-planner/sapar.png" },
          { name: "Teesta Udyan", img: "/demos/jalpaiguri-planner/teesta_udyan.png" },
          { name: "Eco City Park", img: "/demos/jalpaiguri-planner/eco_city.png" },
          { name: "Green View Park", img: "/demos/jalpaiguri-planner/green_view.png" },
          { name: "Domohani Teesta Bank", img: "/demos/jalpaiguri-planner/domohani.png" },
          { name: "Lataguri Forest", img: "/demos/jalpaiguri-planner/lataguri.png" },
          { name: "Murti River", img: "/demos/jalpaiguri-planner/murti_river.png" },
          { name: "Boithek Khana Cafe", img: "/demos/jalpaiguri-planner/boithek_khana.png" },
          { name: "Bhorer Alo Resort", img: "/demos/jalpaiguri-planner/bhorer_alo.png" }
        ],
        food: [
          { name: "Hot Steamed Momo", img: "/demos/jalpaiguri-planner/food_momo_1785674624905.png" },
          { name: "Special Biryani", img: "/demos/jalpaiguri-planner/food_biryani_1785674635340.png" },
          { name: "Tangy Fuchka", img: "/demos/jalpaiguri-planner/food_fuchka_1785674646896.png" }
        ]
      }
    };

    let activePresetKey = "jalpaiguri";
    let heroLines = [];

    const reasons = [
      "Your smile is honestly my favorite notification.",
      "You make ordinary days feel like main character moments.",
      "You're funny even when you're not trying to be.",
      "I think about random things and wonder if you'd laugh at them.",
      "You're kind in a way that's rare and very noticeable.",
      "Being around you just feels... easy. And nice."
    ];


    /* ---------- INITIALIZATION ---------- */
    window.initializeDatePlanner = function (presetKey, recordResponseActionFn) {
      if (window.__isDatePlannerInitialized) {
        // Just update the tracking function if re-initialized by React
        window.__datePlannerTracker = recordResponseActionFn;
        return;
      }
      window.__isDatePlannerInitialized = true;
      window.__datePlannerTracker = recordResponseActionFn;

      if (window.__datePlannerTracker) window.__datePlannerTracker("VIEWED");

      // Make preset logic work with absolute paths for images if needed
      loadTemplate(presetKey);

      const noBtn = document.getElementById('noBtn');
      if (noBtn) {
        noBtn.onclick = () => {
          if (window.__datePlannerTracker) window.__datePlannerTracker("REJECTED");
        };
      }

      const confirmBtn = document.getElementById('confirmDateBtn');
      if (confirmBtn) {
        confirmBtn.onclick = () => {
          if (confirmBtn.disabled) return;
          confirmBtn.disabled = true;
          
          if (window.__datePlannerTracker) {
            const finalSelections = {
              place: document.getElementById('summaryPlace').textContent,
              food: document.getElementById('summaryFood').textContent,
              date: document.getElementById('summaryDate').textContent,
              time: document.getElementById('summaryTime').textContent
            };
            window.__datePlannerTracker("ACCEPTED", JSON.stringify(finalSelections));
          }
        };
      }
    };
    function loadTemplate(key) {
      activePresetKey = key;
      const preset = PRESETS[key] || PRESETS.jalpaiguri;

      if (document.getElementById('presetSelect')) {
        document.getElementById('presetSelect').value = key;
      }
      document.getElementById('heroTitle').textContent = preset.heroTitle || "Hey Beautiful 💕";
      document.getElementById('placesTitle').textContent = preset.placesTitle;

      heroLines = preset.heroLines ? [...preset.heroLines] : [
        "I made this tiny corner of the internet just for you...",
        "Yes, this whole page. For you. Keep scrolling 👀"
      ];

      // Render Places Grid
      const placesContainer = document.getElementById('placesGridContainer');
      placesContainer.innerHTML = '';
      preset.places.forEach(p => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.onclick = function () { selectPlace(p.name, this); };
        card.innerHTML = `
          <img class="place-img" src="${p.img}" alt="${p.name}">
          <div class="place-info">
            <div class="place-name">${p.name}</div>
          </div>
        `;
        placesContainer.appendChild(card);
      });

      // Render Food Grid
      const foodContainer = document.getElementById('foodGridContainer');
      foodContainer.innerHTML = '';
      preset.food.forEach(f => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.onclick = function () { selectFood(f.name, this); };
        card.innerHTML = `
          <img class="place-img" src="${f.img}" alt="${f.name}">
          <div class="place-info">
            <div class="place-name">${f.name}</div>
          </div>
        `;
        foodContainer.appendChild(card);
      });

      updateDirectUrlDisplay();
    }

    function switchTemplate(key) {
      loadTemplate(key);
      showToast(`Selected: ${PRESETS[key].name}! ✨`);
    }

    function updateDirectUrlDisplay() {
      const currentUrl = window.location.origin + window.location.pathname + '?template=' + activePresetKey;
      const directUrlDisplay = document.getElementById('directUrlDisplay');
      if (directUrlDisplay) {
        directUrlDisplay.textContent = currentUrl;
      }
      const preset = PRESETS[activePresetKey] || PRESETS.jalpaiguri;
      const modalTemplateName = document.getElementById('linkModalTemplateName');
      if (modalTemplateName) {
        modalTemplateName.textContent = preset.name;
      }
    }

    /* ---------- PRESET ACTIONS & MODALS ---------- */
    function launchPreviewDemo() {
      const gateway = document.getElementById('gateway');
      gateway.classList.remove('hidden');
      document.getElementById('gateway').scrollIntoView({ behavior: 'smooth' });
    }

    function openDirectLinkModal() {
      updateDirectUrlDisplay();
      document.getElementById('instantLinkModal').classList.add('active');
    }

    function openCustomizerModal() {
      document.getElementById('customizerModal').classList.add('active');
    }

    function closeModal(modalId) {
      document.getElementById(modalId).classList.remove('active');
    }

    function copyDirectLink() {
      const url = document.getElementById('directUrlDisplay').textContent;
      navigator.clipboard.writeText(url).then(() => {
        showToast("Direct instant link copied to clipboard! 📋✨");
      });
    }

    function saveCustomizations(e) {
      e.preventDefault();
      const titleVal = document.getElementById('custHeroTitle').value;
      const line1Val = document.getElementById('custHeroLine1').value;
      const line2Val = document.getElementById('custHeroLine2').value;

      if (titleVal) document.getElementById('heroTitle').textContent = titleVal;
      heroLines = [
        line1Val || heroLines[0],
        line2Val || heroLines[1]
      ];

      closeModal('customizerModal');
      showToast("Customizations saved & applied! ✨");
    }

    function resetDefaults() {
      document.getElementById('custHeroTitle').value = "Hey Beautiful 💕";
      document.getElementById('custHeroLine1').value = "I made this tiny corner of the internet just for you...";
      document.getElementById('custHeroLine2').value = "Let's explore the romantic rivers & parks of Jalpaiguri 👀";
      document.getElementById('presetSelect').value = "jalpaiguri";
      switchTemplate("jalpaiguri");
      showToast("Reset to default Jalpaiguri Date Night!");
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    function copySummaryText() {
      const place = document.getElementById('summaryPlace').textContent;
      const food = document.getElementById('summaryFood').textContent;
      const date = document.getElementById('summaryDate').textContent;
      const time = document.getElementById('summaryTime').textContent;
      const templateName = PRESETS[activePresetKey].name;

      const summaryText = `💖 Date Proposal Summary (${templateName}) 💖\n📍 Place: ${place}\n🍽️ Food: ${food}\n📅 Date: ${date}\n⏰ Time: ${time}\n\nSee you on our date! 🥰`;
      navigator.clipboard.writeText(summaryText).then(() => {
        showToast("Summary copied to clipboard! 📋💖");
      });
    }

    /* ---------- TYPEWRITER INTRO ---------- */
    function typeInto(el, text, speed, onDone) {
      let i = 0;
      el.textContent = "";
      const id = setInterval(() => {
        el.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(id);
          if (onDone) onDone();
        }
      }, speed);
    }

    const heroSpan = document.querySelector('#heroTyped span');
    function playHeroLines(idx) {
      if (!heroSpan) return;
      if (!heroLines || heroLines.length === 0) return;
      if (idx >= heroLines.length) {
        setTimeout(() => playHeroLines(0), 2200);
        return;
      }
      typeInto(heroSpan, heroLines[idx], 40, () => {
        setTimeout(() => {
          let erase = heroLines[idx].length;
          const eraseId = setInterval(() => {
            heroSpan.textContent = heroLines[idx].slice(0, erase);
            erase--;
            if (erase < 0) {
              clearInterval(eraseId);
              playHeroLines(idx + 1);
            }
          }, 18);
        }, 1600);
      });
    }

    /* ---------- REASON CARDS ---------- */
    const grid = document.getElementById('cardsGrid');
    reasons.forEach((r, i) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">
        <div class="num">${String(i + 1).padStart(2, '0')}</div>
        <span class="label">tap to reveal</span>
      </div>
      <div class="card-face card-back">${r}</div>
    </div>`;
      card.addEventListener('click', () => card.classList.toggle('flipped'));
      grid.appendChild(card);
    });

    /* ---------- BACKGROUND FLOATING HEARTS ---------- */
    const bgHearts = document.getElementById('bg-hearts');
    const heartEmojis = ['💗', '💕', '💖', '🌸', '✨'];
    function spawnBgHeart() {
      const h = document.createElement('div');
      h.className = 'bg-heart';
      h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      h.style.left = Math.random() * 100 + 'vw';
      h.style.fontSize = (14 + Math.random() * 18) + 'px';
      const duration = 8 + Math.random() * 6;
      h.style.animationDuration = duration + 's';
      bgHearts.appendChild(h);
      setTimeout(() => h.remove(), duration * 1000 + 500);
    }

    /* ---------- CURSOR HEART TRAIL ---------- */
    let lastTrail = 0;
    window.addEventListener('pointermove', (e) => {
      const now = Date.now();
      if (now - lastTrail < 60) return;
      lastTrail = now;
      const t = document.createElement('div');
      t.className = 'trail-heart';
      t.textContent = Math.random() > 0.5 ? '💗' : '✨';
      t.style.left = e.clientX + 'px';
      t.style.top = e.clientY + 'px';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 900);
    });

    /* ---------- RUNAWAY NO BUTTON ---------- */
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.getElementById('yesBtn');
    const noMessages = ["No", "Are you sure?", "Really?", "Think again!", "Pretty please?", "Last chance!", "Nope, try yes 😉"];
    let dodgeCount = 0;
    let lastDodge = 0;

    function dodge(e) {
      if (e) e.preventDefault();
      const now = Date.now();
      if (now - lastDodge < 300) return;
      lastDodge = now;

      dodgeCount++;
      noBtn.textContent = noMessages[Math.min(dodgeCount, noMessages.length - 1)];

      const margin = 20;
      const btnWidth = noBtn.offsetWidth || 120;
      const btnHeight = noBtn.offsetHeight || 50;

      const maxX = window.innerWidth - btnWidth - margin;
      const maxY = window.innerHeight - btnHeight - margin;

      const x = Math.max(margin, Math.random() * maxX);
      const y = Math.max(margin, Math.random() * maxY);

      noBtn.classList.add('roaming');
      noBtn.style.left = x + 'px';
      noBtn.style.top = y + 'px';

      const scale = Math.min(1 + dodgeCount * 0.06, 1.6);
      yesBtn.style.transform = `scale(${scale})`;
    }

    noBtn.addEventListener('pointerenter', (e) => dodge(e));
    noBtn.addEventListener('click', (e) => dodge(e));
    noBtn.addEventListener('touchstart', (e) => dodge(e), { passive: false });

    /* ---------- YES BUTTON FINALE ---------- */
    yesBtn.addEventListener('click', () => {
      document.getElementById('ask').style.display = 'none';
      const finale = document.getElementById('finale');
      finale.classList.add('show');
      finale.scrollIntoView({ behavior: 'smooth' });
      burstHearts();
    });

    function burstHearts() {
      const container = document.createElement('div');
      container.className = 'heart-burst';
      document.body.appendChild(container);
      const emojis = ['💗', '💖', '💕', '✨', '🌸', '💘'];
      for (let i = 0; i < 50; i++) {
        const h = document.createElement('div');
        h.className = 'burst-heart';
        h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        const angle = Math.random() * Math.PI * 2;
        const dist = 200 + Math.random() * 400;
        h.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        h.style.setProperty('--ty', Math.sin(angle) * dist - 100 + 'px');
        h.style.setProperty('--rot', (Math.random() * 360) + 'deg');
        h.style.animationDelay = (Math.random() * 0.3) + 's';
        container.appendChild(h);
      }
      setTimeout(() => container.remove(), 2200);
    }

    /* ---------- AUDIO CONTROLS ---------- */
    const bgMusic = document.getElementById('bgMusic');
    const musicIcon = document.getElementById('musicIcon');

    function playAudio() {
      if (bgMusic) {
        bgMusic.volume = 0.4;
        bgMusic.play().then(() => {
          musicIcon.classList.remove('paused');
        }).catch(e => console.log("Audio play deferred:", e));
      }
    }

    function toggleMusic() {
      if (bgMusic.paused) {
        bgMusic.play();
        musicIcon.classList.remove('paused');
        showToast("Playing 🎵 Tum Se Hi");
      } else {
        bgMusic.pause();
        musicIcon.classList.add('paused');
        showToast("Music paused");
      }
    }

    const gatewayBtn = document.getElementById('gatewayBtn');
    const gateway = document.getElementById('gateway');
    gatewayBtn.addEventListener('click', () => {
      gateway.classList.add('hidden');
      playAudio();
      setTimeout(() => playHeroLines(0), 1000);
      setInterval(spawnBgHeart, 700);
      for (let i = 0; i < 8; i++) setTimeout(spawnBgHeart, i * 300);
    });

    /* ---------- DATE FLOW STEP LOGIC ---------- */
    const dateBtn = document.getElementById('dateBtn');
    dateBtn.addEventListener('click', () => {
      document.getElementById('finale').style.display = 'none';
      const datePlaces = document.getElementById('date-places');
      datePlaces.classList.add('show');
      datePlaces.scrollIntoView({ behavior: 'smooth' });
    });

    let selectedPlace = "";
    let selectedPlaceImg = "";
    let selectedFood = "";
    let selectedFoodImg = "";

    function selectPlace(place, element) {
      selectedPlace = place;
      selectedPlaceImg = element.querySelector('.place-img').src;
      document.getElementById('date-places').style.display = 'none';
      const foodChoices = document.getElementById('food-choices');
      document.getElementById('foodTitle').textContent = `Okay, ${place} it is! 💖 Now... what are we eating? 🤤`;
      foodChoices.classList.add('show');
      foodChoices.scrollIntoView({ behavior: 'smooth' });
    }

    function selectFood(food, element) {
      selectedFood = food;
      selectedFoodImg = element.querySelector('.place-img').src;
      document.getElementById('food-choices').style.display = 'none';
      const datePicker = document.getElementById('date-picker');
      document.getElementById('datePickerTitle').textContent = `${food}? Yum! 😋 Now, when are we going? 📅`;
      datePicker.classList.add('show');
      datePicker.scrollIntoView({ behavior: 'smooth' });
    }

    const confirmDateBtn = document.getElementById('confirmDateBtn');
    confirmDateBtn.addEventListener('click', () => {
      const dateVal = document.getElementById('dateSelect').value;
      const timeVal = document.getElementById('timeSelect').value;
      if (!dateVal || !timeVal) {
        alert("Please pick a date and time first! 🥺");
        return;
      }

      const dateObj = new Date(dateVal);
      const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

      document.getElementById('date-picker').style.display = 'none';
      const finalSummary = document.getElementById('final-summary');
      document.getElementById('summaryPlace').textContent = selectedPlace;
      document.getElementById('summaryPlaceImg').src = selectedPlaceImg;
      document.getElementById('summaryFood').textContent = selectedFood;
      document.getElementById('summaryFoodImg').src = selectedFoodImg;
      document.getElementById('summaryDate').textContent = formattedDate;
      document.getElementById('summaryTime').textContent = timeVal;
      finalSummary.classList.add('show');
      finalSummary.scrollIntoView({ behavior: 'smooth' });

      // Trigger ACCEPTED via window.__datePlannerTracker inside window.initializeDatePlanner handler

      if (window.sendFinalResponseEmail) {
        window.sendFinalResponseEmail(selectedPlace, selectedFood, formattedDate, timeVal, dodgeCount);
      }
    });


    // Initialize the planner
    const presetKey = demoId === "date-planner" ? "kolkata" : "jalpaiguri";

    // We pass our Next.js server action down to the vanilla JS
    window.initializeDatePlanner(presetKey, (action, metadata) => {
      recordResponseAction(slug, action, metadata);
    });

    if (title) {
      const heroTitle = document.getElementById('heroTitle');
      if (heroTitle) heroTitle.textContent = title;
    }
  }, [slug, demoId, title]);

  return (
    <div ref={containerRef} className="date-planner-container">
      <style dangerouslySetInnerHTML={{
        __html: `
        .date-planner-container {
            font-family: 'Quicksand', sans-serif;
            background: linear-gradient(160deg, #fff0f5, #ffe1ec 40%, #ffd6e6 100%);
            color: #4a1942;
            overflow-x: hidden;
            min-height: 100vh;
        }
        
    :root {
      --blush: #ffe1ec;
      --blush-soft: #fff0f5;
      --blush-deep: #ff8fab;
      --rose: #ff4d7d;
      --rose-dark: #e0356a;
      --lavender: #d9b8ff;
      --gold: #ffd479;
      --cream: #fff9f5;
      --plum: #4a1942;
      --plum-soft: #7a3b63;
      --white: #fffaf8;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: 'Quicksand', sans-serif;
      background: linear-gradient(160deg, var(--blush-soft), var(--blush) 40%, #ffd6e6 100%);
      color: var(--plum);
      overflow-x: hidden;
      cursor: default;
      min-height: 100vh;
      padding-top: 20px;
    }

    ::selection {
      background: var(--rose);
      color: #fff;
    }

    /* ---------- EXPLORE DEMOS & TEMPLATE ACTIONS SECTION ---------- */
    .explore-demos-wrapper {
      max-width: 1320px;
      margin: 20px auto 40px;
      padding: 0 20px;
      position: relative;
      z-index: 5;
    }

    .explore-demos-card {
      background: rgba(255, 245, 248, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 143, 171, 0.4);
      border-radius: 28px;
      padding: 36px 30px;
      box-shadow: 0 15px 45px rgba(224, 53, 106, 0.12);
    }

    .explore-demos-header {
      margin-bottom: 30px;
      text-align: left;
    }

    .explore-demos-header h2 {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .explore-demos-header p {
      font-size: 15px;
      color: #64748b;
      margin-top: 6px;
      font-weight: 500;
    }

    .explore-demos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 22px;
    }

    .demo-item-card {
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
      border: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
    }

    .demo-item-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 35px rgba(224, 53, 106, 0.18);
    }

    .demo-card-image-wrap {
      position: relative;
      width: 100%;
      height: 180px;
      overflow: hidden;
    }

    .demo-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .demo-card-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      font-size: 11px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 20px;
      text-transform: capitalize;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    .badge-requires-custom {
      background: #9c27b0;
      color: #fff;
    }

    .badge-requires-custom-orange {
      background: #ff9800;
      color: #fff;
    }

    .badge-instant-available {
      background: #ff1744;
      color: #fff;
    }

    .demo-card-body {
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .demo-card-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .demo-card-desc {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 20px;
      flex-grow: 1;
    }

    .demo-card-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .demo-card-btn {
      width: 100%;
      padding: 10px 14px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'Quicksand', sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .demo-card-btn:hover {
      opacity: 0.92;
      transform: scale(1.01);
    }

    .demo-card-btn-demo {
      background: #fff;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }

    .demo-card-btn-demo span.btn-sub {
      color: #94a3b8;
      font-weight: 500;
      font-size: 11px;
    }

    .demo-card-btn-instant {
      background: linear-gradient(135deg, #ff1744, #f50057);
      color: #fff;
      box-shadow: 0 4px 12px rgba(255, 23, 68, 0.3);
    }

    .demo-card-btn-instant span.btn-sub {
      color: rgba(255, 255, 255, 0.95);
      font-weight: 600;
      font-size: 11px;
    }

    .demo-card-btn-custom {
      background: #0f172a;
      color: #fff;
    }

    .demo-card-btn-custom-pink {
      background: #ff1744;
      color: #fff;
    }

    .demo-card-btn-custom span.btn-sub,
    .demo-card-btn-custom-pink span.btn-sub {
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
      font-size: 11px;
    }

    /* ---------- floating background hearts ---------- */
    #bg-hearts {
      position: fixed;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
    }

    .bg-heart {
      position: absolute;
      bottom: -10%;
      font-size: 20px;
      opacity: .55;
      animation-name: floatUp;
      animation-timing-function: ease-in;
      animation-iteration-count: infinite;
      filter: drop-shadow(0 0 6px rgba(255, 143, 171, .4));
    }

    @keyframes floatUp {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg);
        opacity: 0;
      }

      10% {
        opacity: .6;
      }

      50% {
        transform: translateY(-50vh) translateX(20px) rotate(15deg);
      }

      90% {
        opacity: .5;
      }

      100% {
        transform: translateY(-110vh) translateX(-20px) rotate(-10deg);
        opacity: 0;
      }
    }

    /* ---------- cursor trail hearts ---------- */
    .trail-heart {
      position: fixed;
      pointer-events: none;
      font-size: 14px;
      z-index: 9999;
      animation: trailFade .9s ease-out forwards;
    }

    @keyframes trailFade {
      0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: .9;
      }

      100% {
        transform: translate(-50%, -140%) scale(.3);
        opacity: 0;
      }
    }

    section {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 80px 22px;
    }

    /* ---------- HERO ---------- */
    #hero .eyebrow {
      letter-spacing: .35em;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 600;
      color: var(--rose-dark);
      margin-bottom: 18px;
      opacity: 0;
      animation: fadeIn 1s ease forwards .2s;
    }

    h1.script {
      font-family: 'Dancing Script', cursive;
      font-weight: 700;
      font-size: clamp(48px, 9vw, 110px);
      color: var(--rose-dark);
      line-height: 1.05;
      text-shadow: 0 6px 30px rgba(255, 77, 125, .25);
      opacity: 0;
      animation: fadeUp 1s ease forwards .5s;
    }

    #hero .sub {
      margin-top: 22px;
      font-size: clamp(16px, 2.4vw, 20px);
      color: var(--plum-soft);
      min-height: 30px;
      font-weight: 500;
      opacity: 0;
      animation: fadeIn 1s ease forwards 1.4s;
    }

    #hero .sub .cursor-blink {
      display: inline-block;
      width: 2px;
      background: var(--rose);
      margin-left: 2px;
      animation: blink 1s step-end infinite;
    }

    .scroll-hint {
      position: absolute;
      bottom: 90px;
      font-size: 13px;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--plum-soft);
      opacity: 0;
      animation: fadeIn 1s ease forwards 2.6s, bob 2s ease-in-out infinite 2.6s;
    }

    @keyframes fadeIn {
      to {
        opacity: 1;
      }
    }

    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(24px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bob {

      0%,
      100% {
        transform: translateY(0);
      }

      50% {
        transform: translateY(8px);
      }
    }

    @keyframes blink {
      50% {
        opacity: 0;
      }
    }

    /* ---------- floating petals decoration for hero ---------- */
    .petal {
      position: absolute;
      font-size: 26px;
      opacity: .7;
      animation: sway 6s ease-in-out infinite;
    }

    @keyframes sway {

      0%,
      100% {
        transform: translateY(0) rotate(-8deg);
      }

      50% {
        transform: translateY(-18px) rotate(8deg);
      }
    }

    /* ---------- REASONS SECTION ---------- */
    #reasons h2 {
      font-family: 'Dancing Script', cursive;
      font-size: clamp(36px, 6vw, 64px);
      color: var(--rose-dark);
      margin-bottom: 8px;
    }

    #reasons p.lead {
      color: var(--plum-soft);
      margin-bottom: 48px;
      font-size: 16px;
      max-width: 460px;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 22px;
      max-width: 900px;
      width: 100%;
    }

    .card {
      perspective: 1000px;
      height: 190px;
      cursor: pointer;
    }

    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform .7s cubic-bezier(.4, .2, .2, 1);
      transform-style: preserve-3d;
    }

    .card:hover .card-inner,
    .card.flipped .card-inner {
      transform: rotateY(180deg);
    }

    .card-face {
      position: absolute;
      inset: 0;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      backface-visibility: hidden;
      padding: 18px;
      box-shadow: 0 10px 30px rgba(224, 53, 106, .15);
    }

    .card-front {
      background: linear-gradient(150deg, #fff, var(--blush-soft));
      border: 1px solid rgba(255, 143, 171, .4);
    }

    .card-front .num {
      font-family: 'Dancing Script', cursive;
      font-size: 38px;
      color: var(--rose);
    }

    .card-front span.label {
      font-size: 13px;
      color: var(--plum-soft);
      letter-spacing: .06em;
    }

    .card-back {
      background: linear-gradient(150deg, var(--rose), var(--rose-dark));
      color: #fff;
      transform: rotateY(180deg);
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
    }

    /* ---------- ASK SECTION ---------- */
    #ask {
      z-index: 10;
    }

    #ask h2 {
      font-family: 'Dancing Script', cursive;
      font-size: clamp(38px, 7vw, 72px);
      color: var(--rose-dark);
      margin-bottom: 36px;
      max-width: 700px;
    }

    .btn-row {
      display: flex;
      gap: 28px;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      position: relative;
      min-height: 120px;
      width: 100%;
    }

    .btn {
      border: none;
      border-radius: 100px;
      font-family: 'Quicksand', sans-serif;
      font-weight: 700;
      font-size: 18px;
      padding: 18px 42px;
      cursor: pointer;
      transition: transform .25s ease, box-shadow .25s ease;
    }

    .btn:focus-visible {
      outline: 3px solid var(--lavender);
      outline-offset: 3px;
    }

    #yesBtn {
      background: linear-gradient(135deg, var(--rose), var(--rose-dark));
      color: #fff;
      box-shadow: 0 12px 30px rgba(224, 53, 106, .4);
    }

    #yesBtn:hover {
      transform: scale(1.08);
      box-shadow: 0 16px 36px rgba(224, 53, 106, .5);
    }

    #noBtn {
      background: #fff;
      color: var(--rose-dark);
      border: 2px solid var(--blush-deep);
      position: relative;
    }

    #noBtn.roaming {
      position: fixed;
      z-index: 50;
    }

    .ask-hint {
      margin-top: 26px;
      font-size: 14px;
      color: var(--plum-soft);
      opacity: .85;
    }

    /* ---------- FINALE ---------- */
    #finale {
      display: none;
      background: radial-gradient(circle at 50% 30%, #fff5f8, var(--blush) 70%);
    }

    #finale.show {
      display: flex;
      animation: fadeIn .8s ease;
    }

    #finale h2 {
      font-family: 'Dancing Script', cursive;
      font-size: clamp(46px, 9vw, 100px);
      color: var(--rose-dark);
      text-shadow: 0 8px 30px rgba(255, 77, 125, .3);
    }

    #finale p {
      margin-top: 18px;
      font-size: 18px;
      color: var(--plum-soft);
      max-width: 460px;
    }

    /* ---------- DATE PLACES ---------- */
    #date-places {
      display: none;
      background: radial-gradient(circle at 50% 10%, #fff, var(--blush-soft) 80%);
      padding: 80px 20px;
      min-height: 100vh;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    #date-places.show {
      display: flex;
      animation: fadeIn .8s ease;
    }

    #date-places h2 {
      font-family: 'Dancing Script', cursive;
      font-size: clamp(38px, 7vw, 72px);
      color: var(--rose-dark);
      margin-bottom: 50px;
      text-align: center;
      text-shadow: 0 4px 15px rgba(255, 77, 125, 0.15);
    }

    /* ---------- FOOD CHOICES ---------- */
    #food-choices {
      display: none;
      background: radial-gradient(circle at 50% 10%, #fff, var(--blush-soft) 80%);
      padding: 80px 20px;
      min-height: 100vh;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    #food-choices.show {
      display: flex;
      animation: fadeIn .8s ease;
    }

    #food-choices h2 {
      font-family: 'Dancing Script', cursive;
      font-size: clamp(34px, 6vw, 64px);
      color: var(--rose-dark);
      margin-bottom: 50px;
      text-align: center;
      text-shadow: 0 4px 15px rgba(255, 77, 125, 0.15);
      max-width: 800px;
    }

    /* ---------- DATE PICKER ---------- */
    #date-picker {
      display: none;
      background: radial-gradient(circle at 50% 10%, #fff, var(--blush-soft) 80%);
      padding: 80px 20px;
      min-height: 100vh;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    #date-picker.show {
      display: flex;
      animation: fadeIn .8s ease;
    }

    #date-picker h2 {
      font-family: 'Dancing Script', cursive;
      font-size: clamp(34px, 6vw, 64px);
      color: var(--rose-dark);
      margin-bottom: 30px;
      text-align: center;
      text-shadow: 0 4px 15px rgba(255, 77, 125, 0.15);
      max-width: 800px;
    }

    .date-input-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: #fff;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 15px 40px rgba(224, 53, 106, .15);
      border: 1px solid rgba(255, 143, 171, .3);
      align-items: center;
      width: 100%;
      max-width: 400px;
    }

    .date-input {
      width: 100%;
      padding: 16px 20px;
      font-family: 'Quicksand', sans-serif;
      font-size: 18px;
      color: var(--plum);
      border: 2px solid var(--blush-deep);
      border-radius: 12px;
      outline: none;
      transition: border-color .3s ease;
    }

    .date-input:focus {
      border-color: var(--rose-dark);
    }

    /* ---------- FINAL SUMMARY ---------- */
    #final-summary {
      display: none;
      background: radial-gradient(circle at 50% 10%, #fff, var(--blush-soft) 80%);
      padding: 80px 20px;
      min-height: 100vh;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    #final-summary.show {
      display: flex;
      animation: fadeIn 1s ease;
    }

    .summary-card {
      background: #fff;
      padding: 50px 40px;
      border-radius: 30px;
      box-shadow: 0 20px 50px rgba(224, 53, 106, .2);
      border: 2px solid rgba(255, 143, 171, .4);
      max-width: 600px;
      width: 100%;
    }

    .summary-card h2 {
      font-family: 'Dancing Script', cursive;
      font-size: clamp(38px, 7vw, 72px);
      color: var(--rose-dark);
      margin-bottom: 20px;
      text-shadow: 0 4px 15px rgba(255, 77, 125, 0.15);
    }

    .summary-item {
      font-size: 22px;
      color: var(--plum);
      margin: 15px 0;
      line-height: 1.5;
    }

    .summary-item span {
      font-weight: 700;
      color: var(--rose);
    }

    .summary-images-container {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .summary-image-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 180px;
    }

    .summary-img {
      width: 140px;
      height: 140px;
      object-fit: cover;
      border-radius: 20px;
      border: 3px solid var(--blush-deep);
      box-shadow: 0 10px 20px rgba(224, 53, 106, .2);
      margin-bottom: 15px;
    }

    .summary-img-text {
      margin: 0;
      font-size: 18px;
      line-height: 1.4;
    }

    .take-screenshot-text {
      margin-top: 30px;
      font-size: 18px;
      color: var(--plum-soft);
    }

    .places-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 30px;
      max-width: 1000px;
      width: 100%;
    }

    .place-card {
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(224, 53, 106, .12);
      transition: transform .3s ease, box-shadow .3s ease;
      cursor: pointer;
      border: 1px solid rgba(255, 143, 171, .3);
      display: flex;
      flex-direction: column;
    }

    .place-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 40px rgba(224, 53, 106, .25);
    }

    .place-img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .place-info {
      padding: 20px;
      text-align: center;
      background: #fff;
    }

    .place-name {
      font-family: 'Dancing Script', cursive;
      font-size: 26px;
      color: var(--rose-dark);
      font-weight: 700;
    }

    .heart-burst {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 40;
      overflow: hidden;
    }

    .burst-heart {
      position: absolute;
      top: 50%;
      left: 50%;
      font-size: 22px;
      animation: burstOut 1.6s ease-out forwards;
    }

    @keyframes burstOut {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
      }

      70% {
        opacity: 1;
      }

      100% {
        transform: translate(var(--tx), var(--ty)) scale(1) rotate(var(--rot));
        opacity: 0;
      }
    }

    /* ---------- GATEWAY OVERLAY ---------- */
    #gateway {
      position: fixed;
      inset: 0;
      background: linear-gradient(160deg, var(--blush-soft), var(--blush) 40%, #ffd6e6 100%);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: opacity 0.8s ease, visibility 0.8s ease;
    }

    #gateway.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    #gateway h2 {
      font-family: 'Dancing Script', cursive;
      font-size: clamp(36px, 8vw, 64px);
      color: var(--rose-dark);
      margin-bottom: 30px;
      text-align: center;
      padding: 0 20px;
      text-shadow: 0 4px 15px rgba(255, 77, 125, 0.2);
    }

    /* ---------- FLOATING MUSIC WIDGET ---------- */
    #musicWidget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(10px);
      border: 1px solid var(--blush-deep);
      border-radius: 50px;
      padding: 8px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 24px rgba(224, 53, 106, 0.25);
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    #musicWidget:hover {
      transform: scale(1.05);
    }

    .music-icon {
      font-size: 18px;
      animation: spinMusic 3s linear infinite;
    }

    .music-icon.paused {
      animation-play-state: paused;
    }

    @keyframes spinMusic {
      100% {
        transform: rotate(360deg);
      }
    }

    .music-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--plum);
    }

    /* ---------- MODALS ---------- */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 100005;
      background: rgba(74, 25, 66, 0.5);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      padding: 20px;
    }

    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .modal-box {
      background: #fff;
      border-radius: 24px;
      width: 100%;
      max-width: 680px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      border: 1px solid var(--blush-deep);
      position: relative;
      max-height: 90vh;
      overflow-y: auto;
      transform: translateY(20px);
      transition: transform 0.3s ease;
    }

    .modal-overlay.active .modal-box {
      transform: translateY(0);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .modal-header h3 {
      font-family: 'Dancing Script', cursive;
      font-size: 32px;
      color: var(--rose-dark);
    }

    .modal-close {
      background: var(--blush-soft);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
      color: var(--plum);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-group {
      margin-bottom: 16px;
      text-align: left;
    }

    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: var(--plum);
      margin-bottom: 6px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid var(--blush-deep);
      border-radius: 12px;
      font-family: 'Quicksand', sans-serif;
      font-size: 14px;
      outline: none;
    }

    .form-control:focus {
      border-color: var(--rose-dark);
    }

    .link-copy-box {
      background: var(--blush-soft);
      padding: 12px 16px;
      border-radius: 12px;
      word-break: break-all;
      font-size: 13px;
      color: var(--rose-dark);
      font-weight: 600;
      border: 1px dashed var(--blush-deep);
      margin-bottom: 20px;
    }

    /* ---------- TOAST NOTIFICATION ---------- */
    #toast {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: var(--plum);
      color: #fff;
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 600;
      z-index: 100010;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    #toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    footer {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 30px 20px 40px;
      font-size: 13px;
      color: var(--plum-soft);
      letter-spacing: .05em;
    }

    @media (max-width: 768px) {
      .explore-demos-card {
        padding: 24px 18px;
      }

      .explore-demos-header h2 {
        font-size: 24px;
      }

      .explore-demos-grid {
        grid-template-columns: 1fr;
      }
    }
  
      ` }} />
      <div dangerouslySetInnerHTML={{
        __html: `<div id="gateway" class="hidden">
    <h2 id="gatewayHeading">I have a question for you...<br>Are you ready?</h2>
    <button id="gatewayBtn" class="btn"
      style="background: linear-gradient(135deg, var(--rose), var(--rose-dark)); color: #fff; box-shadow: 0 12px 30px rgba(224, 53, 106, .4);">Yes
      💖</button>
  </div>

<div id="bg-hearts"></div>

<section id="hero">
    <div class="petal" style="top:14%; left:10%;">🌸</div>
    <div class="petal" style="top:22%; right:12%; animation-delay:1.2s;">💗</div>
    <div class="petal" style="bottom:18%; left:16%; animation-delay:2.4s;">✨</div>
    <div class="petal" style="bottom:24%; right:14%; animation-delay:3.1s;">🌷</div>

    <div class="eyebrow" id="eyebrowText">a little something for you</div>
    <h1 class="script" id="heroTitle">Hey Beautiful 💕</h1>
    <p class="sub" id="heroTyped"><span></span><span class="cursor-blink"></span></p>
    <span class="scroll-hint" style="bottom: 124px; font-size: 11px; text-transform: none; letter-spacing: normal;">I
      made this tiny</span>
    <div class="scroll-hint">scroll down ↓</div>
  </section>

<section id="reasons">
    <h2>a few reasons why...</h2>
    <p class="lead">(hover or tap each card, cutie)</p>
    <div class="cards" id="cardsGrid"></div>
  </section>

<section id="ask">
    <h2 id="askQuestionText">so... can I finally take you out on a proper date? 🥺</h2>
    <div class="btn-row">
      <button class="btn" id="yesBtn">Yes 💖</button>
      <button class="btn" id="noBtn">No</button>
    </div>
    <p class="ask-hint">(the no button is a little shy, fair warning)</p>
  </section>

<section id="finale">
    <h2>Yayyy!! 🎉💗</h2>
    <p id="finaleMessageText">You just made my whole entire day. Thank you for being you. Now go smile about it — I'll be smiling too. 🥰</p>
    <button class="btn" id="dateBtn"
      style="margin-top: 36px; background: linear-gradient(135deg, var(--rose), var(--rose-dark)); color: #fff; box-shadow: 0 12px 30px rgba(224, 53, 106, .4);">Date
      ? 👀</button>
  </section>

<section id="date-places">
    <h2 id="placesTitle">Where should we go on our date? 🥺</h2>
    <div class="places-grid" id="placesGridContainer"></div>
  </section>

<section id="food-choices">
    <h2 id="foodTitle">Okay, perfect! Now... what are we eating? 🤤</h2>
    <div class="places-grid" id="foodGridContainer"></div>
  </section>

<section id="date-picker">
    <h2 id="datePickerTitle">Yum! 😋 Now, when are we going? 📅</h2>
    <div class="date-input-container">
      <input type="date" id="dateSelect" class="date-input">
      <select id="timeSelect" class="date-input">
        <option value="" disabled selected>Pick a time... ⏰</option>
        <option value="10:00 AM">10:00 AM</option>
        <option value="10:30 AM">10:30 AM</option>
        <option value="11:00 AM">11:00 AM</option>
        <option value="11:30 AM">11:30 AM</option>
        <option value="12:00 PM">12:00 PM</option>
        <option value="12:30 PM">12:30 PM</option>
        <option value="1:00 PM">1:00 PM</option>
        <option value="1:30 PM">1:30 PM</option>
        <option value="2:00 PM">2:00 PM</option>
        <option value="2:30 PM">2:30 PM</option>
        <option value="3:00 PM">3:00 PM</option>
        <option value="3:30 PM">3:30 PM</option>
        <option value="4:00 PM">4:00 PM</option>
        <option value="4:30 PM">4:30 PM</option>
        <option value="5:00 PM">5:00 PM</option>
        <option value="5:30 PM">5:30 PM</option>
        <option value="6:00 PM">6:00 PM</option>
        <option value="6:30 PM">6:30 PM</option>
        <option value="7:00 PM">7:00 PM</option>
        <option value="7:30 PM">7:30 PM</option>
        <option value="8:00 PM">8:00 PM</option>
        <option value="8:30 PM">8:30 PM</option>
        <option value="9:00 PM">9:00 PM</option>
        <option value="9:30 PM">9:30 PM</option>
        <option value="10:00 PM">10:00 PM</option>
      </select>
      <button class="btn" id="confirmDateBtn"
        style="background: linear-gradient(135deg, var(--rose), var(--rose-dark)); color: #fff; box-shadow: 0 12px 30px rgba(224, 53, 106, .4); width: 100%;">It's
        a Date! 💖</button>
    </div>
  </section>

<section id="final-summary">
    <div class="summary-card">
      <h2 id="summaryHeading">It's a Date! 🎉💖</h2>
      <div class="summary-images-container">
        <div class="summary-image-col">
          <img id="summaryPlaceImg" src="" alt="Place" class="summary-img">
          <p class="summary-item summary-img-text">📍 We are going to:<br><span id="summaryPlace"></span></p>
        </div>
        <div class="summary-image-col">
          <img id="summaryFoodImg" src="" alt="Food" class="summary-img">
          <p class="summary-item summary-img-text">🍽️ We are eating:<br><span id="summaryFood"></span></p>
        </div>
      </div>
      <p class="summary-item">📅 See you on: <span id="summaryDate"></span></p>
      <p class="summary-item">⏰ At exactly: <span id="summaryTime"></span></p>
      <p class="take-screenshot-text">Take a screenshot so you don't forget! 🥰</p>

      <div style="margin-top: 25px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
        <button class="demo-card-btn demo-card-btn-instant" style="width: auto; padding: 12px 24px;" onclick="copySummaryText()">
          📋 Copy Summary Details
        </button>
      </div>
    </div>
  </section>

<audio id="bgMusic" loop>
    <source src="/demos/jalpaiguri-planner/Tum_Se_Hi.mp3" type="audio/mpeg">
  </audio>
  <footer>made with 💗 and a little bit of code, just for you</footer>` }} />
    </div>
  );
}
