"use client";

import { useState } from "react";
import { useRazorpay } from "@/hooks/useRazorpay";

interface CheckoutButtonProps {
  themeId: string;
  demoId?: string;
  buttonText?: string;
  className?: string;
}

export default function CheckoutButton({
  themeId,
  demoId = "",
  buttonText = "Buy Now",
  className = "",
}: CheckoutButtonProps) {
  const isRazorpayLoaded = useRazorpay();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!isRazorpayLoaded) {
      alert("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on the server
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId, demoId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // If no valid keys on server, it will return isMock=true
      if (data.isMock) {
        console.log("Mock Payment Mode Active: Simulating successful payment...");

        // Simulate a small delay for realism
        setTimeout(async () => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: data.orderId,
              razorpay_payment_id: `mock_payment_${Date.now()}`,
              razorpay_signature: "mock_signature_for_development",
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            alert("DEVELOPMENT MODE: Mock Payment Successful! Theme activated.");
          } else {
            alert("DEVELOPMENT MODE: Mock Payment verification failed!");
          }
          setLoading(false);
        }, 1500);

        return; // Exit early, do not open Razorpay
      }

      // 2. Open Razorpay Checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key for client
        amount: data.amount, // in subunits (paise)
        currency: data.currency,
        name: "OurStory",
        description: "Premium Theme Upgrade",
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment Signature securely on backend
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            alert("Payment Successful! Theme activated.");
            // Optional: refresh page or trigger callback
          } else {
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: "OurStory User", // You could fetch real user data if available
          email: "",
          contact: "",
        },
        theme: {
          color: "#38bdf8", // Matching your UI theme
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("Payment Failed:", response.error);
        alert("Payment failed: " + response.error.description);
      });

      rzp.open();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !isRazorpayLoaded}
      className={`px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition disabled:opacity-50 ${className}`}
    >
      {loading ? "Processing..." : buttonText}
    </button>
  );
}
