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
      : "https://www.ourstories.shop";
  const fullShareUrl = opts.shareUrl.startsWith("http") ? opts.shareUrl : `${appUrl}${opts.shareUrl}`;
  const title = opts.templateTitle || "Your Surprise Page";
  const expiryText = opts.expiresAt
    ? `\nThis link is active until ${new Date(opts.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`
    : "";

  const text = `Payment Successful! 💖

Hi! Thank you for your payment. Your surprise page "${title}" has been created and is live now!

Your Live Surprise Link:
${fullShareUrl}
${expiryText}

You can copy this link and send it directly to your special someone via WhatsApp, Instagram, or SMS.

Made with 💖 by OurStory • If you have any questions, simply reply directly to this email.
`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 24px 12px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #ffe4e6;">
    <div style="background: linear-gradient(135deg, #e11d48, #f43f5e); padding: 20px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">
        Payment Successful! 💖
      </h1>
    </div>

    <div style="padding: 24px 24px 28px;">
      <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 16px;">
        Hi! Thank you for your payment. Your surprise page <strong>"${title}"</strong> has been created and is live now!
      </p>

      <div style="margin: 24px 0; padding: 20px; background-color: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 14px; text-align: center;">
        <div style="color: #9f1239; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px;">
          Your Live Surprise Link:
        </div>
        <a href="${fullShareUrl}" style="display: block; color: #e11d48; font-size: 15px; font-weight: 700; word-break: break-all; text-decoration: underline; margin-bottom: 16px;">
          ${fullShareUrl}
        </a>

        <a href="${fullShareUrl}" target="_blank" style="display: inline-block; padding: 12px 26px; background-color: #e11d48; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; border-radius: 12px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);">
          🌸 Open My Gift Link
        </a>
      </div>

      <p style="font-size: 14px; color: #475569; margin-bottom: 16px;">
        You can copy this link and send it directly to your special someone via WhatsApp, Instagram, or SMS.
      </p>

      ${opts.expiresAt ? `<p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">⏳ This link is active until <strong>${new Date(opts.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>.</p>` : ""}

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 20px;" />

      <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">
        Made with 💖 by OurStory • If you have any questions, simply reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>`;

  await sendMail({
    to: opts.to,
    subject: `Payment Successful! Your Surprise Link is Live 🎉`,
    text,
    html,
  });
}
