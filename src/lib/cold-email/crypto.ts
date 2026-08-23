import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
// Derive 32-byte key from NEXTAUTH_SECRET or fallback
const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.NEXTAUTH_SECRET || "ourstory_secret_jwt_key_2026_production")
  .digest();

/**
 * Encrypt sensitive text (like SMTP passwords) for storage at rest
 */
export function encryptSecret(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt encrypted secret at rest
 */
export function decryptSecret(encryptedData: string): string {
  if (!encryptedData) return "";
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 2) return encryptedData; // Fallback if plain
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Failed to decrypt secret:", err);
    return "";
  }
}

/**
 * Mask password for display in UI
 */
export function maskPassword(pass?: string): string {
  if (!pass) return "";
  return "••••••••••••";
}
