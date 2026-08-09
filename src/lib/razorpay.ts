import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * Verifies the Razorpay webhook or payment signature using HMAC SHA256.
 * @param body The raw body/order payload
 * @param signature The razorpay_signature sent by client or webhook
 * @param secret The webhook secret or key secret (defaults to RAZORPAY_KEY_SECRET)
 * @returns boolean indicating if the signature is valid
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string = process.env.RAZORPAY_KEY_SECRET || ""
): boolean {
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  return generatedSignature === signature;
}
