/**
 * /src/lib/email.ts
 *
 * Shared, lightweight email utility using the platform SMTP credentials
 * already configured in .env (SMTP_USER / SMTP_PASS / SMTP_SERVICE).
 *
 * All outgoing emails use this single function so styling stays consistent.
 */

import nodemailer from "nodemailer";

// ─── Transporter (lazy-cached) ───────────────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;

  const service = process.env.SMTP_SERVICE || "gmail";
  const host = process.env.SMTP_HOST || "";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  const config: nodemailer.TransportOptions | any = host
    ? {
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      }
    : {
        service,
        auth: { user, pass },
      };

  _transporter = nodemailer.createTransport(config);
  return _transporter;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ─── Core send function ───────────────────────────────────────────────────────

export async function sendMail(opts: SendMailOptions): Promise<void> {
  const fromName = process.env.SMTP_FROM_NAME || "OurStory 💖";
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || "hello@ourstory.app";

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text ?? opts.html.replace(/<[^>]+>/g, ""),
    html: opts.html,
  });
}

// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * Sends the "Your gift link is ready 🎉" email after successful payment.
 */
export async function sendPaymentSuccessEmail(opts: {
  to: string;
  recipientName?: string;
  shareUrl: string;          // full URL e.g. https://ourstory.app/p/surprise-abc123
  templateTitle?: string;
  expiresAt?: Date | null;
}): Promise<void> {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  const appUrl =
    envUrl && !envUrl.includes("loca.lt") && !envUrl.includes("localhost")
      ? envUrl
      : "https://connected-serpice-app.vercel.app";
  const fullShareUrl = opts.shareUrl.startsWith("http") ? opts.shareUrl : `${appUrl}${opts.shareUrl}`;
  const title = opts.templateTitle || "Your Surprise Page";
  const expiryText = opts.expiresAt
    ? `\nThis link is active until ${new Date(opts.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`
    : "";

  const text = `Payment Successful! 💖

Hi! Thank you for your payment. Your surprise page "${title}" has been created and published successfully!

Here is your live surprise link:
${fullShareUrl}
${expiryText}

You can copy this link and send it directly to your special someone via WhatsApp, Instagram, or SMS.

Thank you for choosing OurStory!
— OurStory Team 💖
`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; background-color: #ffffff; padding: 20px; max-width: 560px;">
  <p style="font-size: 18px; font-weight: bold; color: #e11d48; margin-bottom: 14px;">
    Payment Successful! 💖
  </p>

  <p style="margin-bottom: 14px;">
    Hi! Thank you for your payment. Your surprise page <strong>"${title}"</strong> has been created and is live now!
  </p>

  <div style="margin: 20px 0; padding: 16px 18px; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px;">
    <strong style="color: #9f1239; font-size: 13px; text-transform: uppercase; letter-spacing: .05em;">Your Live Surprise Link:</strong><br/>
    <a href="${fullShareUrl}" style="display: inline-block; margin-top: 8px; color: #e11d48; font-size: 16px; font-weight: bold; word-break: break-all; text-decoration: underline;">
      ${fullShareUrl}
    </a>
  </div>

  <p style="margin-bottom: 14px;">
    You can copy this link and send it directly to your special someone via WhatsApp, Instagram, or SMS.
  </p>

  ${opts.expiresAt ? `<p style="font-size: 13px; color: #64748b; margin-bottom: 14px;">This link is active until ${new Date(opts.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.</p>` : ""}

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

  <p style="font-size: 12px; color: #94a3b8; margin: 0;">
    Made with 💖 by OurStory • If you have any questions, simply reply directly to this email.
  </p>
</body>
</html>`;

  await sendMail({
    to: opts.to,
    subject: `Payment Successful! Your Surprise Link is Live 🎉`,
    text,
    html,
  });
}
