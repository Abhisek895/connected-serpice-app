import { useState, useEffect } from "react";

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already present
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      setIsLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup is optional here, as keeping the script is fine for SPAs
    };
  }, []);

  return isLoaded;
}
