"use client";

import { useEffect } from "react";

export function ReferralTracker() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      const demo = params.get("demo");

      if (ref && ref.trim()) {
        const cleanRef = ref.trim();
        localStorage.setItem("ourstory_ref_code", cleanRef);
        // 30-day cookie for server-side accessibility
        document.cookie = `ourstory_ref_code=${cleanRef}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }

      // Also store which template they landed on
      if (demo && demo.trim()) {
        const cleanDemo = demo.trim();
        localStorage.setItem("ourstory_ref_demo", cleanDemo);
        document.cookie = `ourstory_ref_demo=${cleanDemo}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }

      // Auto-detect Acquisition Platform (WhatsApp, Instagram, Facebook, etc.)
      const utmSource = params.get("utm_source");
      let platform = "";

      if (utmSource) {
        const src = utmSource.toLowerCase();
        if (src.includes("whatsapp") || src.includes("wa")) platform = "WhatsApp 💬";
        else if (src.includes("instagram") || src.includes("ig") || src.includes("insta")) platform = "Instagram 📸";
        else if (src.includes("facebook") || src.includes("fb")) platform = "Facebook 👥";
        else if (src.includes("twitter") || src.includes("x")) platform = "Twitter 🐦";
      }

      if (!platform && typeof document !== "undefined" && document.referrer) {
        const refUrl = document.referrer.toLowerCase();
        if (refUrl.includes("whatsapp") || refUrl.includes("wa.me")) platform = "WhatsApp 💬";
        else if (refUrl.includes("instagram")) platform = "Instagram 📸";
        else if (refUrl.includes("facebook") || refUrl.includes("fb.com")) platform = "Facebook 👥";
        else if (refUrl.includes("t.co") || refUrl.includes("twitter") || refUrl.includes("x.com")) platform = "Twitter 🐦";
        else if (refUrl.includes("google")) platform = "Google Search 🌐";
      }

      if (platform) {
        localStorage.setItem("ourstory_platform", platform);
        document.cookie = `ourstory_platform=${encodeURIComponent(platform)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
    }
  }, []);

  return null;
}
