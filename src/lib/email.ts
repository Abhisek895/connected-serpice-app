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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://ourstory.app";
  const fullShareUrl = opts.shareUrl.startsWith("http") ? opts.shareUrl : `${appUrl}${opts.shareUrl}`;
  const title = opts.templateTitle || "Your Surprise 💖";
  const expiryNote = opts.expiresAt
    ? `<p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">This link is active until <strong style="color:#f43f5e;">${new Date(opts.expiresAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</strong>.</p>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(244,63,94,0.08);border:1px solid #fce7f3;max-width:520px;width:100%;">

        <!-- Header gradient bar -->
        <tr><td style="height:5px;background:linear-gradient(90deg,#f43f5e,#ec4899,#fb923c);"></td></tr>

        <!-- Logo + Hero -->
        <tr><td style="padding:36px 36px 0;text-align:center;">
          <p style="margin:0 0 6px;font-size:28px;font-weight:800;color:#f43f5e;font-family:Georgia,serif;">OurStory 💖</p>
          <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;font-weight:500;">Digital Memory Pages</p>
          <div style="font-size:56px;line-height:1;margin-bottom:20px;">🎉</div>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;">Payment Successful!</h1>
          <p style="margin:0 0 6px;font-size:15px;color:#475569;font-weight:500;">Your <strong style="color:#f43f5e;">${title}</strong> is live and ready to share.</p>
        </td></tr>

        <!-- Share Link Card -->
        <tr><td style="padding:28px 36px;">
          <div style="background:linear-gradient(135deg,#fff1f2,#fdf2f8);border:2px dashed #fda4af;border-radius:16px;padding:20px 24px;text-align:center;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#be123c;text-transform:uppercase;letter-spacing:.08em;">🔗 Your Shareable Gift Link</p>
            <p style="margin:0 0 16px;font-size:13px;color:#64748b;word-break:break-all;">${fullShareUrl}</p>
            ${expiryNote}
            <a href="${fullShareUrl}"
               style="display:inline-block;background:linear-gradient(135deg,#f43f5e,#ec4899);color:#ffffff;font-size:15px;font-weight:800;padding:14px 32px;border-radius:12px;text-decoration:none;box-shadow:0 4px 14px rgba(244,63,94,0.35);letter-spacing:.01em;">
              🌸 Open My Gift Link
            </a>
          </div>
        </td></tr>

        <!-- Instructions -->
        <tr><td style="padding:0 36px 28px;">
          <div style="background:#f8fafc;border-radius:14px;padding:18px 20px;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#334155;">📋 How to share:</p>
            <ol style="margin:0;padding-left:20px;color:#64748b;font-size:13px;line-height:1.8;">
              <li>Tap <strong>"Open My Gift Link"</strong> above to preview it</li>
              <li>Copy the link and send it via WhatsApp, Instagram DM, or SMS</li>
              <li>Watch your recipient's reaction in real-time ✨</li>
            </ol>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 36px 32px;text-align:center;border-top:1px solid #f1f5f9;">
          <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">Made with 💖 by OurStory</p>
          <p style="margin:0;font-size:11px;color:#cbd5e1;">If you have any issues, reply to this email and we'll help you out.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendMail({
    to: opts.to,
    subject: `🎉 Your gift link is ready — ${title}`,
    html,
  });
}
