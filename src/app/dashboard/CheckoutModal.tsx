"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Tag, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Script from "next/script";
import { useSession } from "next-auth/react";

type CheckoutModalProps = {
  demoId: string;
  templateName: string;
  originalPrice: number; // in paise
  durationDays: number;
  isPremiumUser?: boolean;
  onClose: () => void;
  onSuccess: (usedCouponCode?: string) => void;
};

export default function CheckoutModal({
  demoId,
  templateName,
  originalPrice,
  durationDays,
  isPremiumUser,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const { data: session } = useSession();
  const userObj = session?.user as any;
  const isPremiumAccount = Boolean(isPremiumUser) || userObj?.plan === "PREMIUM" || userObj?.role === "super_admin";

  const [couponCode, setCouponCode] = useState(isPremiumAccount ? "PREMIUM_FREE" : "");
  const [couponStatus, setCouponStatus] = useState<"idle" | "validating" | "valid" | "invalid">(isPremiumAccount ? "valid" : "idle");
  const [couponMessage, setCouponMessage] = useState(isPremiumAccount ? "👑 Premium Member: 100% FREE Access Granted!" : "");
  const [finalPrice, setFinalPrice] = useState(isPremiumAccount ? 0 : originalPrice);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isFree1Eligible, setIsFree1Eligible] = useState<boolean | null>(null);

  const originalPriceINR = originalPrice / 100;
  const finalPriceINR = isPremiumAccount ? 0 : finalPrice / 100;
  const discountINR = originalPriceINR - finalPriceINR;

  // On mount: Check FREE100% eligibility automatically for regular users
  useEffect(() => {
    if (isPremiumAccount) {
      setFinalPrice(0);
      setCouponMessage("👑 Premium Member: 100% FREE Access Granted!");
      setCouponStatus("valid");
      return;
    }

    async function checkFree1Eligibility() {
      try {
        const res = await fetch("/api/coupon/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: "FREE100%", demoId }),
        });
        const data = await res.json();
        if (data.isPremium || data.message?.includes("Premium Member")) {
          setFinalPrice(0);
          setCouponMessage("👑 Premium Member: 100% FREE Access Granted!");
          setCouponStatus("valid");
          return;
        }
        if (data.valid) {
          setIsFree1Eligible(true);
          setCouponCode("FREE100%");
        } else {
          setIsFree1Eligible(false);
          setCouponCode("LOVE2026");
        }
      } catch (e) {
        setIsFree1Eligible(false);
        setCouponCode("LOVE2026");
      }
    }
    checkFree1Eligibility();
  }, [demoId, isPremiumAccount]);

  useEffect(() => {
    if (isPremiumAccount) return;

    if (couponCode.length < 3) {
      setCouponStatus("idle");
      setFinalPrice(originalPrice);
      setCouponMessage("");
      return;
    }

    const timer = setTimeout(() => {
      validateCoupon();
    }, 400);

    return () => clearTimeout(timer);
  }, [couponCode, isPremiumAccount]);

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
        setCouponMessage(data.message || "Coupon applied successfully!");
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
      const activeCoupon = couponStatus === "valid" ? couponCode : undefined;

      // 1. Create order
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoId,
          couponCode: activeCoupon,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      if (data.orderId === "FREE" || data.amount === 0) {
        onSuccess(activeCoupon);
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
              couponCode: activeCoupon,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess(activeCoupon);
          } else {
            setError(verifyData.message || "Mock payment verification failed");
            setIsProcessing(false);
          }
        }, 1200);

        return;
      }

      // 2. Open Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "OurStory",
        description: `Purchase ${templateName}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                demoId,
                couponCode: activeCoupon,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              onSuccess(activeCoupon);
            } else {
              setError("Payment verification failed. Please contact support.");
              setIsProcessing(false);
            }
          } catch (err) {
            setError("Error verifying payment");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
        theme: {
          color: "#e11d48",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment");
      setIsProcessing(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-rose-50 to-pink-50">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-500" /> Secure Checkout
              </h2>
              <p className="text-sm font-semibold text-rose-600 mt-0.5">{templateName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Original Price */}
            <div className="flex justify-between items-center text-slate-700 font-medium">
              <span>Original Price</span>
              <span className="font-bold">₹{originalPriceINR.toFixed(2)}</span>
            </div>

            {/* Coupon Code Section or Premium Member Banner */}
            {couponMessage.includes("Premium Member") ? (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 text-center space-y-1">
                <div className="text-amber-800 font-black text-sm flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                  👑 Premium Unlimited Pass Active
                </div>
                <p className="text-xs text-amber-700 font-semibold">
                  As a Premium Member ∞, you enjoy 100% FREE instant link activation with NO expiry on all templates!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-rose-500" /> Apply Coupon Code
                  </span>
                  <span className="text-[11px] text-rose-600 font-semibold">Suggested for you 👇</span>
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. LOVE2026)"
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all uppercase placeholder:normal-case font-black text-slate-900 text-sm tracking-wide"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {couponStatus === "validating" && <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />}
                    {couponStatus === "valid" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {couponStatus === "invalid" && <AlertCircle className="w-5 h-5 text-rose-500" />}
                  </div>
                </div>

                {/* Conditional Coupon Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {/* Show FREE100% ONLY if the user has 1 pass count remaining */}
                  {isFree1Eligible && (
                    <button
                      type="button"
                      onClick={() => setCouponCode("FREE100%")}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border font-black transition flex items-center gap-1.5 ${
                        ["FREE100%", "FREE1"].includes(couponCode)
                          ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200 ring-2 ring-rose-300"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 fill-white" />
                      🎁 FREE100% (100% OFF 1-Day Pass)
                    </button>
                  )}

                  {/* Standard coupons with crisp black text */}
                  {["LOVE2026", "SPECIAL50", "OURSTORY"].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCouponCode(code)}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border font-black transition flex items-center gap-1 ${
                        couponCode === code
                          ? "bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300"
                          : "bg-slate-100 text-slate-950 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      🏷️ <span className="text-slate-950 font-black">{code}</span>
                    </button>
                  ))}
                </div>

                {/* Status Message */}
                {couponMessage && (
                  <p className={`text-xs font-bold mt-1.5 ${couponStatus === "valid" ? "text-emerald-600" : "text-rose-500"}`}>
                    {couponStatus === "valid" ? `✓ ${couponMessage}` : couponMessage}
                  </p>
                )}
              </div>
            )}

            {/* Discount Summary */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              {discountINR > 0 && !couponMessage.includes("Premium Member") && (
                <div className="flex justify-between items-center text-emerald-700 font-extrabold text-xs bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <span>Discount Applied 🎉 ({couponCode})</span>
                  <span>- ₹{discountINR.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-bold">Total to Pay</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-rose-600">₹{finalPriceINR.toFixed(2)}</span>
                  {finalPriceINR === 0 && (
                    <span className="block text-[10px] text-amber-600 font-extrabold uppercase tracking-wide">
                      {couponMessage.includes("Premium Member") ? "👑 PREMIUM MEMBER ∞" : "100% FREE PASS"}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center bg-slate-50 py-2.5 rounded-xl border border-slate-100 font-medium">
                {couponMessage.includes("Premium Member") ? (
                  <>Includes <strong>Full Access for Premium Member ∞</strong> + instant link publishing.</>
                ) : (
                  <>Includes full access for <strong>{["FREE100%", "FREE100", "FREE1"].includes(couponCode) ? 1 : durationDays} days</strong> + instant link publishing.</>
                )}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {couponMessage.includes("Premium Member")
                    ? "Activating Premium Link..."
                    : finalPriceINR === 0
                    ? "Activating 1-Day Pass..."
                    : "Processing Payment..."}
                </>
              ) : couponMessage.includes("Premium Member") ? (
                "🚀 Activate Link (Free for Premium Member ∞)"
              ) : finalPriceINR === 0 ? (
                "🚀 Activate 1-Day Free Pass (₹0)"
              ) : (
                `Pay ₹${finalPriceINR.toFixed(2)} & Activate Link`
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <span>🔒 256-Bit SSL Encrypted Payment</span>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
