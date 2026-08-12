"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordResponseAction } from "../actions";
import type { ProposalClientProps } from "./RomanticLoveTemplate";
import OurStoryWatermark from "./OurStoryWatermark";

const kolkataPlaces = [
  { name: "Victoria Memorial", img: "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800&auto=format&fit=crop" },
  { name: "Princep Ghat", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop" },
  { name: "Eco Park", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" },
  { name: "Park Street", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop" },
  { name: "Botanical Garden", img: "/demos/date-planner/botanical_garden_1785673618350.png" },
  { name: "Rabindra Sarobar", img: "/demos/date-planner/rabindra_sarobar_1785673637512.png" },
  { name: "Maidan", img: "/demos/date-planner/maidan_1785673647167.png" },
  { name: "St. Paul's Cathedral", img: "/demos/date-planner/st_pauls_cathedral_1785674292764.png" }
];

const kolkataFoods = [
  { name: "Kolkata Biryani", img: "/demos/jalpaiguri-planner/food_biryani_1785674635340.png" },
  { name: "Momo", img: "/demos/jalpaiguri-planner/food_momo_1785674624905.png" },
  { name: "Fuchka", img: "/demos/jalpaiguri-planner/food_fuchka_1785674646896.png" },
  { name: "Kathi Roll", img: "/demos/date-planner/food_roll_1785674656539.png" },
  { name: "Kolkata Chowmein", img: "/demos/date-planner/food_chowmein_1785674895686.png" },
  { name: "Coffee & Snacks", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop" },
  { name: "Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" },
  { name: "Desserts", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop" }
];

const jalpaiguriPlaces = [
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
];

const jalpaiguriFoods = [
  { name: "Hot Steamed Momo", img: "/demos/jalpaiguri-planner/food_momo_1785674624905.png" },
  { name: "Special Biryani", img: "/demos/jalpaiguri-planner/food_biryani_1785674635340.png" },
  { name: "Tangy Fuchka", img: "/demos/jalpaiguri-planner/food_fuchka_1785674646896.png" },
  { name: "Kathi Roll", img: "/demos/date-planner/food_roll_1785674656539.png" },
  { name: "Chowmein", img: "/demos/date-planner/food_chowmein_1785674895686.png" },
  { name: "Coffee & Snacks", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop" },
  { name: "Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop" },
  { name: "Desserts", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop" }
];

const REASONS = [
  "Your smile is honestly my favorite notification.",
  "You make ordinary days feel like main character moments.",
  "You're funny even when you're not trying to be.",
  "I think about random things and wonder if you'd laugh at them.",
  "You're kind in a way that's rare and very noticeable.",
  "Being around you just feels... easy. And nice."
];

const TIME_OPTIONS = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"
];

export default function DatePlannerTemplate({
  slug,
  title,
  demoId,
  recipientName,
}: ProposalClientProps) {
  const [stage, setStage] = useState(0); // 0: Envelope Gateway, 1: Hero+Reasons, 2: Yay, 3: Places, 4: Foods, 5: Date, 6: Summary
  const [showHearts, setShowHearts] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dodgeCount, setDodgeCount] = useState(0);
  
  const [selectedPlace, setSelectedPlace] = useState<{name: string, img: string} | null>(null);
  const [selectedFood, setSelectedFood] = useState<{name: string, img: string} | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const isJalpaiguri = demoId === "jalpaiguri-planner";
  const places = isJalpaiguri ? jalpaiguriPlaces : kolkataPlaces;
  const foods = isJalpaiguri ? jalpaiguriFoods : kolkataFoods;
  
  const hasViewedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // For Typewriter
  const heroLines = [
    "I made this tiny corner of the internet just for you...",
    isJalpaiguri ? "Let's explore the romantic rivers & parks of Jalpaiguri 👀" : "Yes, this whole page. For you. Keep scrolling 👀"
  ];
  const [typewriterText, setTypewriterText] = useState("");

  useEffect(() => {
    setMounted(true);
    if (!hasViewedRef.current) {
      recordResponseAction(slug, "VIEWED");
      hasViewedRef.current = true;
    }
  }, [slug]);

  useEffect(() => {
    if (stage === 1) {
      let currentLine = 0;
      let currentChar = 0;
      let isDeleting = false;
      let text = "";

      const interval = setInterval(() => {
        if (!isDeleting && currentChar <= heroLines[currentLine].length) {
          text = heroLines[currentLine].substring(0, currentChar);
          setTypewriterText(text);
          currentChar++;
        } else if (isDeleting && currentChar >= 0) {
          text = heroLines[currentLine].substring(0, currentChar);
          setTypewriterText(text);
          currentChar--;
        }

        if (currentChar > heroLines[currentLine].length) {
          if (currentLine === heroLines.length - 1) {
            clearInterval(interval);
            return;
          }
          setTimeout(() => { isDeleting = true; }, 1000);
        } else if (isDeleting && currentChar < 0) {
          isDeleting = false;
          currentLine++;
          currentChar = 0;
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleOpenEnvelope = () => {
    setStage(1);
    // iOS-safe: audio started inside a user gesture handler
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      setIsPlaying(true);
    }
  };

  const handleNoHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    setDodgeCount(prev => prev + 1);
    const btn = e.currentTarget;
    
    // Give it fixed position if it doesn't have it
    btn.style.position = 'fixed';
    btn.style.zIndex = '50';
    
    const maxX = window.innerWidth - btn.offsetWidth - 20;
    const maxY = window.innerHeight - btn.offsetHeight - 20;

    const randomX = Math.max(20, Math.floor(Math.random() * maxX));
    const randomY = Math.max(20, Math.floor(Math.random() * maxY));

    btn.style.left = randomX + "px";
    btn.style.top = randomY + "px";
    
    // Show a small heart burst at mouse coordinates
    const burst = document.createElement("div");
    burst.className = "burst-heart";
    burst.innerHTML = "💔";
    burst.style.left = e.clientX + "px";
    burst.style.top = e.clientY + "px";
    burst.style.setProperty('--tx', (Math.random() * 100 - 50) + "px");
    burst.style.setProperty('--ty', (Math.random() * -100 - 50) + "px");
    burst.style.setProperty('--rot', (Math.random() * 90 - 45) + "deg");
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 1600);
  };

  const handleProposalYes = () => {
    recordResponseAction(slug, "ACCEPTED");
    setStage(2);
    window.scrollTo(0, 0);
  };

  const copySummaryText = () => {
    const txt = `❤️ Date Planned! ❤️\n📍 Place: ${selectedPlace?.name}\n🍽️ Food: ${selectedFood?.name}\n📅 Date: ${selectedDate}\n⏰ Time: ${selectedTime}`;
    navigator.clipboard.writeText(txt);
    alert("Copied to clipboard!");
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getFormattedDate = (dateString: string) => {
    if (!dateString) return "";
    // Ensure we parse the date correctly by appending timezone to prevent off-by-one day bugs
    const d = new Date(dateString + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="date-planner-root">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Quicksand:wght@400;500;600;700&display=swap');
        
        .date-planner-root {
          font-family: 'Quicksand', sans-serif;
          background: linear-gradient(160deg, #fff0f5, #ffe1ec 40%, #ffd6e6 100%);
          color: #4a1942;
          overflow-x: hidden;
          min-height: 100vh;
          position: relative;
        }

        .date-planner-root h1.script,
        .date-planner-root h2.script-title {
          font-family: 'Dancing Script', cursive;
        }
        /* ---------- GATEWAY ---------- */
        .gateway-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(160deg, #fff0f5, #ffe1ec 40%, #ffd6e6 100%);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: opacity 0.8s ease, visibility 0.8s ease;
        }

        .gateway-overlay.hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .gateway-overlay h2 {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(36px, 8vw, 64px);
          color: #e0356a;
          margin-bottom: 30px;
          text-align: center;
          padding: 0 20px;
          text-shadow: 0 4px 15px rgba(255, 77, 125, 0.2);
        }

        /* Background hearts */
        .bg-hearts { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .bg-heart { position: absolute; bottom: -10%; font-size: 20px; opacity: .55; animation: floatUp linear infinite; filter: drop-shadow(0 0 6px rgba(255, 143, 171, .4)); }
        
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: .6; }
          50% { transform: translateY(-50vh) translateX(20px) rotate(15deg); }
          90% { opacity: .5; }
          100% { transform: translateY(-110vh) translateX(-20px) rotate(-10deg); opacity: 0; }
        }

        .full-screen-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 22px;
          position: relative;
          z-index: 1;
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
          background: linear-gradient(135deg, #ff4d7d, #e0356a);
          color: #fff;
          box-shadow: 0 12px 30px rgba(224, 53, 106, .4);
        }
        .btn:hover { transform: scale(1.08); box-shadow: 0 16px 36px rgba(224, 53, 106, .5); }
        .btn-outline {
          background: #fff;
          color: #e0356a;
          border: 2px solid #ff8fab;
          box-shadow: none;
        }
        
        .script-hero { font-size: clamp(48px, 9vw, 110px); color: #e0356a; line-height: 1.05; text-shadow: 0 6px 30px rgba(255, 77, 125, .25); }
        .script-title { font-size: clamp(36px, 6vw, 72px); color: #e0356a; margin-bottom: 30px; text-shadow: 0 4px 15px rgba(255, 77, 125, 0.15); }
        
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 22px;
          max-width: 750px;
          width: 100%;
        }
        
        .reason-card {
          perspective: 1000px;
          height: 190px;
          cursor: pointer;
        }
        .reason-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform .7s cubic-bezier(.4, .2, .2, 1);
          transform-style: preserve-3d;
        }
        .reason-card:hover .reason-card-inner { transform: rotateY(180deg); }
        
        .reason-face {
          position: absolute; inset: 0; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; backface-visibility: hidden; padding: 18px; box-shadow: 0 10px 30px rgba(224, 53, 106, .15);
        }
        .reason-front { background: linear-gradient(150deg, #fff, #fff0f5); border: 1px solid rgba(255, 143, 171, .4); }
        .reason-back { background: linear-gradient(150deg, #ff4d7d, #e0356a); color: #fff; transform: rotateY(180deg); font-size: 15px; font-weight: 600; line-height: 1.4; }
        
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
        }
        .place-card:hover { transform: translateY(-8px); box-shadow: 0 15px 40px rgba(224, 53, 106, .25); }
        
        .place-img { width: 100%; height: 200px; object-fit: cover; }
        .place-name { font-family: 'Dancing Script', cursive; font-size: 26px; color: #e0356a; font-weight: 700; padding: 20px; text-align: center; }

        .burst-heart {
          position: fixed;
          font-size: 22px;
          animation: burstOut 1.6s ease-out forwards;
          z-index: 9999;
        }

        @keyframes burstOut {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1) rotate(var(--rot)); opacity: 0; }
        }
        
        .music-widget {
          position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(10px); border: 1px solid #ff8fab; border-radius: 50px; padding: 8px 18px; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 24px rgba(224, 53, 106, 0.25); cursor: pointer; transition: transform 0.2s ease;
        }
        .music-widget:hover { transform: scale(1.05); }
        .music-icon { font-size: 18px; animation: spinMusic 3s linear infinite; }
        .music-icon.paused { animation-play-state: paused; }
        @keyframes spinMusic { 100% { transform: rotate(360deg); } }
      `}} />

      <audio ref={audioRef} loop src={isJalpaiguri ? "/demos/jalpaiguri-planner/Tum_Se_Hi.mp3" : "/demos/date-planner/Tum_Se_Hi.mp3"} />

      {stage > 0 && (
        <div className="music-widget" onClick={toggleMusic}>
          <span className={`music-icon ${!isPlaying ? 'paused' : ''}`}>🎵</span>
          <span className="text-sm font-bold text-[#e0356a]">Tum Se Hi</span>
        </div>
      )}

      {showHearts && mounted && (
        <div className="bg-hearts">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="bg-heart" style={{
              left: Math.random() * 100 + "%",
              animationDuration: (Math.random() * 6 + 6) + "s",
              animationDelay: (Math.random() * 5) + "s"
            }}>💖</div>
          ))}
        </div>
      )}

      <AnimatePresence>
      </AnimatePresence>

      {/* ---- STAGE 0: GATEWAY QUESTION ---- */}
      {stage === 0 && (
        <div className="gateway-overlay">
          <h2>I have a question for you...<br />Are you ready?</h2>
          <button
            onClick={handleOpenEnvelope}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #ff4d7d, #e0356a)',
              color: '#fff',
              boxShadow: '0 12px 30px rgba(224, 53, 106, .4)'
            }}
          >
            Yes 💖
          </button>
        </div>
      )}

      {stage === 1 && (
        <>
          <section className="full-screen-section">
            <div className="text-[12px] font-semibold tracking-[0.35em] uppercase text-[#e0356a] mb-4">a little something for you</div>
            <h1 className="script-hero script mb-6">{title || `Hey ${recipientName || 'Beautiful'} 💕`}</h1>
            <p className="text-[20px] text-[#7a3b63] font-medium min-h-[30px]">
              {typewriterText}<span className="inline-block w-[2px] h-[20px] bg-[#ff4d7d] ml-[2px] animate-pulse"></span>
            </p>
            <span className="absolute bottom-[90px] text-[13px] tracking-[0.2em] uppercase text-[#7a3b63] animate-bounce">Scroll Down ↓</span>
          </section>
          
          <section className="full-screen-section">
            <h2 className="script-title">Here are 6 reasons why...</h2>
            <p className="text-[#7a3b63] mb-12 text-[16px] max-w-[460px]">Hover or tap the cards below (I could write 100 reasons but I didn't want to break the internet).</p>
            <div className="cards-grid">
              {REASONS.map((r, i) => (
                <div key={i} className="reason-card">
                  <div className="reason-card-inner">
                    <div className="reason-face reason-front">
                      <span className="font-['Dancing_Script'] text-[38px] text-[#ff4d7d]">0{i+1}</span>
                      <span className="text-[13px] text-[#7a3b63] tracking-wider uppercase">Reason</span>
                    </div>
                    <div className="reason-face reason-back">{r}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="full-screen-section">
            <h2 className="script-title max-w-[700px]">so... can I finally take you out on a proper date? 🥺</h2>
            <div className="flex flex-wrap gap-7 items-center justify-center min-h-[120px] w-full relative">
              <button className="btn" onClick={handleProposalYes}>Yes 💖</button>
              <button className="btn btn-outline" onMouseOver={handleNoHover} onClick={handleNoHover}>No</button>
            </div>
            <p className="mt-6 text-[14px] text-[#7a3b63] opacity-85">(the no button is a little shy, fair warning)</p>
          </section>
        </>
      )}

      {stage === 2 && (
        <section className="full-screen-section">
          <h2 className="script-title">Yayyy!! 🎉💗</h2>
          <p className="mt-4 text-[18px] text-[#7a3b63] max-w-[460px] mb-9">You just made my whole entire day. Thank you for being you. Now go smile about it — I'll be smiling too. 🥰</p>
          <button className="btn" onClick={() => setStage(3)}>Date ? 👀</button>
        </section>
      )}

      {stage === 3 && (
        <section className="full-screen-section bg-gradient-radial from-white to-[#fff0f5]">
          <h2 className="script-title">Where should we go? 🥺</h2>
          <div className="places-grid">
            {places.map((p, i) => (
              <div key={i} className="place-card" onClick={() => { setSelectedPlace(p); setStage(4); window.scrollTo(0,0); }}>
                <img src={p.img} alt={p.name} className="place-img" />
                <div className="place-name">{p.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {stage === 4 && (
        <section className="full-screen-section bg-gradient-radial from-white to-[#fff0f5]">
          <h2 className="script-title">Okay, perfect! Now... what are we eating? 🤤</h2>
          <div className="places-grid">
            {foods.map((f, i) => (
              <div key={i} className="place-card" onClick={() => { setSelectedFood(f); setStage(5); window.scrollTo(0,0); }}>
                <img src={f.img} alt={f.name} className="place-img" />
                <div className="place-name">{f.name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {stage === 5 && (
        <section className="full-screen-section bg-gradient-radial from-white to-[#fff0f5]">
          <h2 className="script-title">Yum! 😋 Now, when are we going? 📅</h2>
          <div className="bg-white p-10 rounded-3xl shadow-[0_15px_40px_rgba(224,53,106,.15)] border border-[#ff8fab]/30 flex flex-col gap-5 w-full max-w-[400px]">
            <input type="date" className="w-full p-4 font-['Quicksand'] text-[18px] text-[#4a1942] border-2 border-[#ff8fab] rounded-xl outline-none focus:border-[#e0356a]" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            <select className="w-full p-4 font-['Quicksand'] text-[18px] text-[#4a1942] border-2 border-[#ff8fab] rounded-xl outline-none focus:border-[#e0356a]" value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
              <option value="" disabled>Pick a time... ⏰</option>
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="btn w-full mt-4" onClick={() => {
              if (selectedDate && selectedTime) {
                const metaObj = {
                  place: selectedPlace?.name,
                  food: selectedFood?.name,
                  date: getFormattedDate(selectedDate),
                  time: selectedTime
                };
                recordResponseAction(slug, `ACCEPTED|${JSON.stringify(metaObj)}`);
                setStage(6);
              }
              else alert("Please pick a date and time!");
            }}>It's a Date! 💖</button>
          </div>
        </section>
      )}

      {stage === 6 && (
        <section className="full-screen-section bg-gradient-radial from-white to-[#fff0f5]">
          <div className="bg-white p-10 rounded-[36px] shadow-[0_20px_60px_rgba(255,143,171,0.2)] max-w-[550px] w-full text-center border border-[#ff8fab]/20">
            <h2 className="font-['Dancing_Script'] text-[42px] text-[#e0356a] mb-8">It's a Date! 🎉 💖</h2>
            
            <div className="flex justify-center gap-8 mb-8 flex-wrap">
              <div className="flex flex-col items-center max-w-[160px]">
                <img src={selectedPlace?.img} className="w-[130px] h-[130px] object-cover rounded-[28px] shadow-[0_0_20px_rgba(255,143,171,0.5)] mb-4 border-2 border-transparent hover:border-[#ff8fab] transition-all" />
                <p className="text-[14px] text-[#7a3b63] opacity-80 mb-1">📍 We are going to:</p>
                <p className="font-bold text-[#ff4d7d] text-[16px]">{selectedPlace?.name}</p>
              </div>
              
              <div className="flex flex-col items-center max-w-[160px]">
                <img src={selectedFood?.img} className="w-[130px] h-[130px] object-cover rounded-[28px] shadow-[0_0_20px_rgba(255,143,171,0.5)] mb-4 border-2 border-transparent hover:border-[#ff8fab] transition-all" />
                <p className="text-[14px] text-[#7a3b63] opacity-80 mb-1">🍽️ We are eating:</p>
                <p className="font-bold text-[#ff4d7d] text-[16px]">{selectedFood?.name}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mb-8 mt-2">
              <p className="text-[17px] text-[#7a3b63]">📅 See you on: <span className="font-bold text-[#ff4d7d] text-[19px] ml-1">{getFormattedDate(selectedDate)}</span></p>
              <p className="text-[17px] text-[#7a3b63]">⏰ At exactly: <span className="font-bold text-[#ff4d7d] text-[19px] ml-1">{selectedTime}</span></p>
            </div>
            
            <p className="text-[15px] text-[#7a3b63] opacity-85">Take a screenshot so you don't forget! 🥰</p>
          </div>
        </section>
      )}

      {/* OurStory viral watermark badge */}
      <OurStoryWatermark variant="light" templateId="date-planner" />

    </div>
  );
}
