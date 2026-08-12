"use client";

import { useEffect } from "react";

export function ReferralTracker() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref && ref.trim()) {
        const cleanRef = ref.trim();
        localStorage.setItem("ourstory_ref_code", cleanRef);
        // Also set a 30-day cookie for server-side accessibility if needed
        document.cookie = `ourstory_ref_code=${cleanRef}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
    }
  }, []);

  return null;
}
