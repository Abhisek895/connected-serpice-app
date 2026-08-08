
    /* ============ EDIT ME ============
       Personalize this page in 10 seconds:
       - Change heroLines below with your own words
       - Change the reasons array with real reasons about her
       =================================== */

    const heroLines = [
      "I made this tiny corner of the internet just for you...",
      "Yes, this whole page. For you. Keep scrolling 👀"
    ];

    const reasons = [
      "Your smile is honestly my favorite notification.",
      "You make ordinary days feel like main character moments.",
      "You're funny even when you're not trying to be.",
      "I think about random things and wonder if you'd laugh at them.",
      "You're kind in a way that's rare and very noticeable.",
      "Being around you just feels... easy. And nice."
    ];

    /* ---------- typewriter helper ---------- */
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

    /* ---------- hero typewriter sequence ---------- */
    const heroSpan = document.querySelector('#heroTyped span');
    function playHeroLines(idx) {
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
    // Will be called when gateway opens

    /* ---------- reason cards ---------- */
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

    /* ---------- background floating hearts ---------- */
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
    // Will be called when gateway opens

    /* ---------- cursor heart trail ---------- */
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

    /* ---------- runaway "no" button ---------- */
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.getElementById('yesBtn');
    const btnRow = document.querySelector('.btn-row');
    const noMessages = ["No", "Are you sure?", "Really?", "Think again!", "Pretty please?", "Last chance!", "Nope, try yes 😉"];
    let dodgeCount = 0;
    let lastDodge = 0;

    function dodge(e) {
      if (e) e.preventDefault();
      const now = Date.now();
      if (now - lastDodge < 300) return; // Prevent multiple fires on touch
      lastDodge = now;

      dodgeCount++;
      noBtn.textContent = noMessages[Math.min(dodgeCount, noMessages.length - 1)];

      // Use dynamic button dimensions and smaller margin for mobile screens
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

      // grow the yes button a little each dodge, for extra cuteness
      const scale = Math.min(1 + dodgeCount * 0.06, 1.6);
      yesBtn.style.transform = `scale(${scale})`;
    }

    noBtn.addEventListener('pointerenter', (e) => dodge(e));
    noBtn.addEventListener('click', (e) => dodge(e));
    noBtn.addEventListener('touchstart', (e) => dodge(e), { passive: false });

    /* ---------- yes -> finale ---------- */
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

    /* ---------- gateway & audio logic ---------- */
    const gatewayBtn = document.getElementById('gatewayBtn');
    const gateway = document.getElementById('gateway');
    const bgMusic = document.getElementById('bgMusic');

    gatewayBtn.addEventListener('click', () => {
      // Hide gateway
      gateway.classList.add('hidden');
      
      // Play audio
      if (bgMusic) {
        bgMusic.volume = 0.4;
        bgMusic.play().catch(e => console.log("Audio play failed:", e));
      }
      
      // Start animations
      setTimeout(() => playHeroLines(0), 1000);
      setInterval(spawnBgHeart, 700);
      for (let i = 0; i < 8; i++) setTimeout(spawnBgHeart, i * 300);
    });

    /* ---------- date button logic ---------- */
    const dateBtn = document.getElementById('dateBtn');
    dateBtn.addEventListener('click', () => {
      document.getElementById('finale').style.display = 'none';
      const datePlaces = document.getElementById('date-places');
      datePlaces.classList.add('show');
      datePlaces.scrollIntoView({ behavior: 'smooth' });
    });

    /* ---------- select place logic ---------- */
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

    /* ---------- select food logic ---------- */
    function selectFood(food, element) {
      selectedFood = food;
      selectedFoodImg = element.querySelector('.place-img').src;
      document.getElementById('food-choices').style.display = 'none';
      const datePicker = document.getElementById('date-picker');
      document.getElementById('datePickerTitle').textContent = `${food}? Yum! 😋 Now, when are we going? 📅`;
      datePicker.classList.add('show');
      datePicker.scrollIntoView({ behavior: 'smooth' });
    }

    /* ---------- confirm date logic ---------- */
    const confirmDateBtn = document.getElementById('confirmDateBtn');
    confirmDateBtn.addEventListener('click', () => {
      const dateVal = document.getElementById('dateSelect').value;
      const timeVal = document.getElementById('timeSelect').value;
      if (!dateVal || !timeVal) {
        alert("Please pick a date and time first! 🥺");
        return;
      }
      
      // Optionally, format the date nicely too (e.g., YYYY-MM-DD -> nicer format)
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

      // Send the email notification in the background
      if (window.sendFinalResponseEmail) {
        window.sendFinalResponseEmail(selectedPlace, selectedFood, formattedDate, timeVal, dodgeCount);
      }
    });
  