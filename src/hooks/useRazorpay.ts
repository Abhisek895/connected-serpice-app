import { useState, useEffect } from "react";

/**
 * Ensures the Razorpay checkout script is loaded in the browser.
 * Resolves to true when window.Razorpay is available, false on error.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve(false);
    }

    if ((window as any).Razorpay) {
      return resolve(true);
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      if ((window as any).Razorpay) return resolve(true);
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK script");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setIsLoaded(loaded);
    });
  }, []);

  return isLoaded;
}

