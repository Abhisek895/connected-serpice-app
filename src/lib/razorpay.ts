import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Checks if production/test Razorpay keys are configured and not placeholders.
 */
export function hasValidRazorpayKeys(): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const key = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!secret || !key) return false;
  if (secret.includes("YOUR_SECRET_HERE") || key.includes("YOUR_KEY_HERE") || secret.includes("YOUR_") || key.includes("YOUR_")) return false;
  if (secret.includes(" ") || key.includes(" ")) return false;
  return true;
}

/**
 * Verifies the Razorpay payment signature using HMAC SHA256.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string = process.env.RAZORPAY_KEY_SECRET || ""
): boolean {
  if (!secret) return false;
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  return generatedSignature === signature;
}
