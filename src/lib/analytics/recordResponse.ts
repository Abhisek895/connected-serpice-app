import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface RecordResponseParams {
  eventId: string;
  action: string;
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  metadata?: any;
  trackingToken?: string;
  ipAddress?: string; // Used for idempotency fallback if token missing
}

export async function recordResponse(params: RecordResponseParams) {
  const { eventId, action, device, browser, country, city, metadata, trackingToken, ipAddress } = params;

  try {
    let trackingHash = null;
    let sessionExpiry = null;
    let idempotencyKey = null;

    // 1. Process Tracking Token
    if (trackingToken) {
      // In a real app, this token would be a signed JWT containing expiry and session ID.
      // For now, we simulate hash and expiry (e.g. 2 hours from now).
      trackingHash = crypto.createHash("sha256").update(trackingToken).digest("hex");
      sessionExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); 
    }
    
    // 2. Generate Idempotency Key
    // To prevent duplicate actions in the same session/IP window.
    // If we have a trackingHash, use it. Otherwise fallback to IP.
    const identityFactor = trackingHash || ipAddress || "anonymous";
    const rawKey = `${eventId}:${action}:${identityFactor}`;
    idempotencyKey = crypto.createHash("sha256").update(rawKey).digest("hex");

    // 3. Upsert Response (Idempotent)
    // If the exact same action from the same session/IP is logged, we just return the existing one.
    const response = await prisma.response.upsert({
      where: {
        idempotencyKey: idempotencyKey,
      },
      update: {
        // If it already exists, we could potentially update metadata, but usually we do nothing
        // except maybe bumping the updated time if we had one.
      },
      create: {
        eventId,
        action,
        device,
        browser,
        country,
        city,
        metadata,
        trackingHash,
        sessionExpiry,
        isHuman: true, // simplified for now, would integrate reCAPTCHA/Turnstile
        idempotencyKey,
      },
    });

    return { success: true, data: response };

  } catch (error) {
    console.error("Error in recordResponse:", error);
    return { success: false, error: "Failed to record response" };
  }
}
