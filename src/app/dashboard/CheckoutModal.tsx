"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Tag, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Script from "next/script";

type CheckoutModalProps = {
  demoId: string;
  templateName: string;
  originalPrice: number; // in paise
  durationDays: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CheckoutModal({
  demoId,
  templateName,
  originalPrice,
  durationDays,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const [finalPrice, setFinalPrice] = useState(originalPrice);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const originalPriceINR = originalPrice / 100;
  const finalPriceINR = finalPrice / 100;
  const discountINR = originalPriceINR - finalPriceINR;

  useEffect(() => {
    if (couponCode.length < 3) {
      setCouponStatus("idle");
      setFinalPrice(originalPrice);
      setCouponMessage("");
      return;
    }

    const timer = setTimeout(() => {
      validateCoupon();
    }, 500);

    return () => clearTimeout(timer);
  }, [couponCode]);

  async function validateCoupon() {
    setCouponStatus("validating");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, demoId }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setCouponStatus("valid");
        setFinalPrice(data.finalPrice);
        setCouponMessage(data.message);
      } else {
        setCouponStatus("invalid");
        setFinalPrice(originalPrice);
        setCouponMessage(data.message);
      }
    } catch (err) {
      setCouponStatus("invalid");
      setFinalPrice(originalPrice);
      setCouponMessage("Failed to validate coupon");
    }
  }

  async function handlePayment() {
    setIsProcessing(true);
    setError("");

    try {
      // 1. Create order
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoId,
          couponCode: couponStatus === "valid" ? couponCode : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      if (data.orderId === "FREE") {
        onSuccess();
        return;
      }

      if (data.isMock) {
        console.log("Mock Payment Mode Active: Simulating successful payment...");
        
        setTimeout(async () => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: data.orderId,
              razorpayPaymentId: `mock_payment_${Date.now()}`,
              razorpaySignature: "mock_signature_for_development",
              demoId,
              couponCode: couponStatus === "valid" ? couponCode : undefined,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("DEVELOPMENT MODE: Mock Payment Successful!");
            onSuccess();
          } else {
            setError(verifyData.message || "Mock payment verification failed");
            setIsProcessing(false);
          }
        }, 1500);
        
        return;
      }

      // 2. Open Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "OurStory",
        description: `Access to ${templateName}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Verify payment
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              demoId,
              couponCode: couponStatus === "valid" ? couponCode : undefined,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess();
          } else {
            setError(verifyData.message || "Payment verification failed");
            setIsProcessing(false);
          }
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setIsProcessing(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-500" /> Secure Checkout
              </h2>
              <p className="text-sm text-slate-500 mt-1">{templateName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center text-slate-700 font-medium">
              <span>Original Price</span>
              <span>₹{originalPriceINR.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" /> Apply Coupon
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase placeholder:normal-case font-medium"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {couponStatus === "validating" && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                  {couponStatus === "valid" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {couponStatus === "invalid" && <AlertCircle className="w-5 h-5 text-rose-500" />}
                </div>
              </div>
              {couponMessage && (
                <p className={`text-xs font-medium ${couponStatus === "valid" ? "text-emerald-600" : "text-rose-500"}`}>
                  {couponMessage}
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              {discountINR > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-medium text-sm">
                  <span>Discount Applied</span>
                  <span>- ₹{discountINR.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-bold">Total to Pay</span>
                <span className="text-2xl font-bold text-indigo-600">₹{finalPriceINR.toFixed(2)}</span>
              </div>
              
              <p className="text-xs text-slate-500 text-center bg-slate-50 py-2 rounded-lg">
                Includes access for <strong>{durationDays} days</strong> after creation.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                <>Pay ₹{finalPriceINR.toFixed(2)} Securely</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
