"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Tag, Loader2, CheckCircle2, AlertCircle, Zap, Heart } from "lucide-react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { loadRazorpayScript } from "@/hooks/useRazorpay";

type CheckoutModalProps = {
  demoId: string;
  templateName: string;
  originalPrice: number; // in paise
  durationDays: number;
  isPremiumUser?: boolean;
  onClose: () => void;
  onSuccess: (usedCouponCode?: string) => void;
};

/** Read a cookie value by name (client-side only) */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

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

  // Live admin pricing & content states (self-hydrated from database)
  const [livePrice, setLivePrice] = useState<number>(originalPrice);
  const [liveDurationDays, setLiveDurationDays] = useState<number>(durationDays);
  const [liveTemplateTitle, setLiveTemplateTitle] = useState<string>(templateName);
  const [activeCoupons, setActiveCoupons] = useState<Array<{ code: string; discountType: string; discountValue: number }>>([]);

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [useWallet, setUseWallet] = useState<boolean>(true);
  const [couponCode, setCouponCode] = useState(isPremiumAccount ? "PREMIUM_FREE" : "");
  const [couponStatus, setCouponStatus] = useState<"idle" | "validating" | "valid" | "invalid">(isPremiumAccount ? "valid" : "idle");
  const [couponMessage, setCouponMessage] = useState(isPremiumAccount ? "👑 Premium Member: 100% FREE Access Granted!" : "");
  const [finalPrice, setFinalPrice] = useState(isPremiumAccount ? 0 : originalPrice);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState("");
  const [isFree1Eligible, setIsFree1Eligible] = useState<boolean | null>(null);
  // Referral attribution — read from cookie set by ReferralTracker
  const [referredByCode, setReferredByCode] = useState<string | null>(null);

  // Fetch live pricing and duration set by admin from DB on mount
  useEffect(() => {
    if (!demoId) return;

    fetch(`/api/theme/pricing?demoId=${encodeURIComponent(demoId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (typeof data.price === "number") {
            setLivePrice(data.price);
            if (!isPremiumAccount && couponStatus !== "valid") {
              setFinalPrice(data.price);
            }
          }
          if (typeof data.durationDays === "number") {
            setLiveDurationDays(data.durationDays);
          }
          if (data.title) {
            setLiveTemplateTitle(data.title);
          }
          if (Array.isArray(data.activeCoupons)) {
            setActiveCoupons(data.activeCoupons);
          }
        }
      })
      .catch(() => {});
  }, [demoId, isPremiumAccount, couponStatus]);

  // Fetch wallet balance + read referral cookie on mount
  useEffect(() => {
    // Read referral code from cookie (set by ReferralTracker when user landed via ref link)
    const refCookie = getCookie("ourstory_ref_code") || localStorage.getItem("ourstory_ref_code");
    if (refCookie) setReferredByCode(refCookie);

    if (isPremiumAccount) return;
    fetch("/api/referral/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.walletBalance !== undefined) {
          setWalletBalance(data.walletBalance);
        }
      })
      .catch(() => { });
  }, [isPremiumAccount]);

  const originalPriceINR = livePrice / 100;
  const priceAfterCouponPaise = isPremiumAccount ? 0 : finalPrice;
  const discountINR = (livePrice - priceAfterCouponPaise) / 100;

  // Wallet deduction calculation (in paise)
  const isWalletActive = useWallet && walletBalance > 0 && !isPremiumAccount && priceAfterCouponPaise > 0;
  const walletDeductionPaise = isWalletActive ? Math.min(walletBalance, priceAfterCouponPaise) : 0;
  const walletDeductionINR = walletDeductionPaise / 100;

  const totalToPayPaise = Math.max(0, priceAfterCouponPaise - walletDeductionPaise);
  const totalToPayINR = totalToPayPaise / 100;

  const remainingWalletBalancePaise = Math.max(0, walletBalance - walletDeductionPaise);
  const remainingWalletBalanceINR = remainingWalletBalancePaise / 100;

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
          // Keep couponCode empty so the actual admin-configured price (e.g. ₹21 / 7d) displays by default!
          // The user can click the FREE100% coupon chip if they want to claim the free trial pass.
          setCouponCode("");
        } else {
          setIsFree1Eligible(false);
          setCouponCode("");
        }
      } catch (e) {
        setIsFree1Eligible(false);
        setCouponCode("");
      }
    }
    checkFree1Eligibility();
  }, [demoId, isPremiumAccount]);

  useEffect(() => {
    if (isPremiumAccount) return;

    if (couponCode.length < 3) {
      setCouponStatus("idle");
      setFinalPrice(livePrice);
      setCouponMessage("");
      return;
    }

    const timer = setTimeout(() => {
      validateCoupon();
    }, 400);

    return () => clearTimeout(timer);
  }, [couponCode, isPremiumAccount, livePrice]);

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
        setFinalPrice(livePrice);
        setCouponMessage(data.message);
      }
    } catch (err) {
      setCouponStatus("invalid");
      setFinalPrice(livePrice);
      setCouponMessage("Failed to validate coupon");
    }
  }

  async function handlePayment() {
    setIsProcessing(true);
    setError("");

    try {
      const activeCoupon = couponStatus === "valid" ? couponCode : undefined;

      // 1. Create order (pass referredByCode so the server can credit referrer on payment success)
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoId,
          couponCode: activeCoupon,
          useWallet: Boolean(useWallet && walletBalance > 0),
          referredByCode: referredByCode || undefined,
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
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess(activeCoupon);
          } else {
            // Poll as fallback
            setIsPolling(true);
            await pollForFulfillment(data.orderId, activeCoupon);
          }
        }, 1200);

        return;
      }

      // 2. Open Razorpay
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
      }

      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "OurStory 💖",
        description: `Purchase ${templateName}`,
        order_id: data.orderId,
        prefill: {
          name: session?.user?.name || undefined,
          email: session?.user?.email || undefined,
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              onSuccess(activeCoupon);
            } else {
              // 🔄 Poll as fallback
              setIsPolling(true);
              await pollForFulfillment(response.razorpay_order_id, activeCoupon);
            }
          } catch (err) {
            // 🔄 Network error — poll as fallback
            setIsPolling(true);
            await pollForFulfillment(data.orderId, activeCoupon);
          }
        },
        modal: {
          ondismiss: async function () {
            // On mobile UPI app switch, check if payment went through before closing
            try {
              const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(data.orderId)}`);
              const stat = await res.json();
              if (stat.fulfilled) {
                setIsProcessing(false);
                onSuccess(activeCoupon);
                return;
              }
            } catch { }
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

  /**
   * Recovery poller — polls /api/payment/status every 2s for up to 60s.
   */
  async function pollForFulfillment(orderId: string, couponUsed?: string) {
    const MAX_ATTEMPTS = 30;
    let attempts = 0;

    const poll = async (): Promise<void> => {
      attempts++;
      try {
        const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (data.fulfilled) {
          setIsPolling(false);
          setIsProcessing(false);
          onSuccess(couponUsed);
          return;
        }

        if (data.failed) {
          setError("Payment was not successful. Please try again.");
          setIsPolling(false);
          setIsProcessing(false);
          return;
        }

        if (attempts < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 2000));
          return poll();
        }

        setError("Payment confirmation is taking longer than expected. Please refresh or contact support.");
        setIsPolling(false);
        setIsProcessing(false);
      } catch {
        if (attempts < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 2000));
          return poll();
        }
        setIsPolling(false);
        setIsProcessing(false);
      }
    };

    return poll();
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-8 sm:pt-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-2 sm:my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-rose-50 to-pink-50">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-500" /> Secure Checkout
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-rose-600 mt-0.5">{liveTemplateTitle || templateName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-4 space-y-3">
            {/* Original Price */}
            <div className="flex justify-between items-center text-slate-700 font-medium">
              <span>Original Price</span>
              <span className="font-bold">₹{originalPriceINR.toFixed(2)}</span>
            </div>

            {/* Coupon Code Section or Premium Member Banner */}
            {couponMessage.includes("Premium Member") ? (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 text-center space-y-1">
                <div className="text-amber-800 font-black text-sm flex items-center justify-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                  👑 Premium Unlimited Pass Active
                </div>
                <p className="text-xs text-amber-700 font-semibold">
                  As a Premium Member ∞, you enjoy 100% FREE instant link activation with NO expiry on all templates!
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
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
                    placeholder="Enter code (e.g. SPECIAL50)"
                    className="w-full pl-4 pr-10 py-2 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all uppercase placeholder:normal-case font-black text-slate-900 text-sm tracking-wide"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {couponStatus === "validating" && <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />}
                    {couponStatus === "valid" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {couponStatus === "invalid" && <AlertCircle className="w-5 h-5 text-rose-500" />}
                  </div>
                </div>

                {/* Conditional Coupon Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {isFree1Eligible && (
                    <button
                      type="button"
                      onClick={() => setCouponCode("FREE100%")}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border font-black transition flex items-center gap-1.5 ${["FREE100%", "FREE1"].includes(couponCode)
                          ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200 ring-2 ring-rose-300"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        }`}
                    >
                      <Tag className="w-3 h-3" />
                      🎁 FREE100% (100% OFF 1-Day Pass)
                    </button>
                  )}

                  {(activeCoupons.length > 0
                    ? activeCoupons.map((c) => c.code)
                    : ["SPECIAL50", "LOVE2026", "OURSTORY"]
                  ).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCouponCode(code)}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border font-black transition flex items-center gap-1 ${couponCode === code
                          ? "bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300"
                          : "bg-slate-100 text-slate-950 border-slate-300 hover:bg-slate-200"
                        }`}
                    >
                      🏷️ <span className="text-slate-950 font-black">{code}</span>
                    </button>
                  ))}
                </div>

                {couponMessage && (
                  <p className={`text-xs font-bold mt-1.5 ${couponStatus === "valid" ? "text-emerald-600" : "text-rose-500"}`}>
                    {couponStatus === "valid" ? `✓ ${couponMessage}` : couponMessage}
                  </p>
                )}
              </div>
            )}

            {/* 💰 Wallet Balance Card */}
            {walletBalance > 0 && !isPremiumAccount && (
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-3 sm:p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-black text-xs text-emerald-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>💰 Apply Wallet Balance</span>
                  </label>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300/60 px-2.5 py-0.5 rounded-full">
                    Available: ₹{(walletBalance / 100).toFixed(0)}
                  </span>
                </div>

                {useWallet && walletDeductionPaise > 0 && (
                  <div className="pt-2 border-t border-emerald-200/80 space-y-1 text-xs font-bold text-emerald-800">
                    <div className="flex justify-between items-center">
                      <span>Wallet Deduction:</span>
                      <span className="text-emerald-700 font-extrabold">- ₹{walletDeductionINR.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                      <span>Remaining Wallet Balance:</span>
                      <span className="font-extrabold text-slate-700">₹{remainingWalletBalanceINR.toFixed(0)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Discount Summary */}
            <div className="border-t border-slate-100 pt-2 space-y-1.5">
              {discountINR > 0 && !couponMessage.includes("Premium Member") && (
                <div className="flex justify-between items-center text-emerald-700 font-extrabold text-xs bg-emerald-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-emerald-200">
                  <span>Coupon Discount 🎉 ({couponCode})</span>
                  <span>- ₹{discountINR.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-900 font-bold">Total to Pay</span>
                <div className="text-right">
                  <span className="text-xl font-black text-rose-600">₹{totalToPayINR.toFixed(2)}</span>
                  {totalToPayINR === 0 && (
                    <span className="block text-[10px] text-amber-600 font-extrabold uppercase tracking-wide">
                      {couponMessage.includes("Premium Member")
                        ? "👑 PREMIUM MEMBER ∞"
                        : walletDeductionPaise > 0
                          ? "💰 100% COVERED BY WALLET"
                          : "100% FREE PASS"}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center bg-slate-50 py-1.5 rounded-xl border border-slate-100 font-medium">
                {couponMessage.includes("Premium Member") ? (
                  <>Includes <strong>Full Access for Premium Member ∞</strong> + instant link publishing.</>
                ) : (
                  <>Includes full access for <strong>{["FREE100%", "FREE100", "FREE1"].includes(couponCode) ? 1 : liveDurationDays} days</strong> + instant link publishing.</>
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
            {isPolling && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Confirming your payment… 🔄</p>
                  <p className="text-xs text-amber-600 font-medium mt-0.5">
                    This usually takes a few seconds. Do not close this page.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || isPolling}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer group"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preparing Your Love Story... 💌</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
                  <span>
                    Tell Them You Love Them 💖
                    {couponMessage.includes("Premium Member")
                      ? " · Free for Premium ∞"
                      : totalToPayINR === 0
                        ? ""
                        : ` · ₹${totalToPayINR.toFixed(0)} / ${liveDurationDays}d`}
                  </span>
                </>
              )}
            </button>

            <p className="text-[9px] text-slate-400 text-center flex items-center justify-center gap-1 pb-1">
              <span>🔒 256-Bit SSL Encrypted Payment</span>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
