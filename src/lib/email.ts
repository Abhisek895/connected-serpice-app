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


// ─── Receiver Action Email ────────────────────────────────────────────────────

/**
 * Sent to the CREATOR when their recipient interacts with the template link.
 * Template-aware: different design + copy depending on demoId + action.
 */
export async function sendReceiverActionEmail(opts: {
  to: string;                   // creator's email
  demoId: string;               // e.g. "surprise", "durga-puja"
  templateTitle: string;
  action: string;               // e.g. "ACCEPTED", "REJECTED"
  metadata?: Record<string, any>;
  shareUrl?: string;            // full URL of the link
}): Promise<void> {
  const { to, demoId, templateTitle, action, metadata = {}, shareUrl } = opts;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.ourstories.shop";
  const dashboardUrl = `${appUrl}/dashboard`;

  // ── Determine theme config based on demoId ─────────────────────────────────
  type ThemeCfg = { emoji: string; headerGradient: string; accentColor: string; accentLight: string; borderColor: string };
  const THEME: Record<string, ThemeCfg> = {
    "surprise":         { emoji: "💖", headerGradient: "linear-gradient(135deg,#e11d48,#f43f5e)", accentColor: "#e11d48", accentLight: "#fff1f2", borderColor: "#fecdd3" },
    "she-cant-say-no":  { emoji: "💍", headerGradient: "linear-gradient(135deg,#be185d,#e11d48)", accentColor: "#be185d", accentLight: "#fdf2f8", borderColor: "#fbcfe8" },
    "nasamajh-lakri":   { emoji: "❤️", headerGradient: "linear-gradient(135deg,#db2777,#ec4899)", accentColor: "#db2777", accentLight: "#fdf2f8", borderColor: "#fbcfe8" },
    "im-sorry":         { emoji: "💌", headerGradient: "linear-gradient(135deg,#7c3aed,#a855f7)", accentColor: "#7c3aed", accentLight: "#f5f3ff", borderColor: "#ddd6fe" },
    "birthday-wish":    { emoji: "🎂", headerGradient: "linear-gradient(135deg,#d97706,#f59e0b)", accentColor: "#d97706", accentLight: "#fffbeb", borderColor: "#fde68a" },
    "date-planner":     { emoji: "🌸", headerGradient: "linear-gradient(135deg,#0f766e,#14b8a6)", accentColor: "#0f766e", accentLight: "#f0fdfa", borderColor: "#99f6e4" },
    "jalpaiguri-planner": { emoji: "🌿", headerGradient: "linear-gradient(135deg,#15803d,#22c55e)", accentColor: "#15803d", accentLight: "#f0fdf4", borderColor: "#bbf7d0" },
    "durga-puja":       { emoji: "🌺", headerGradient: "linear-gradient(135deg,#631726,#C0422B)", accentColor: "#631726", accentLight: "#FFF8F0", borderColor: "#D4AF37" },
  };
  const theme: ThemeCfg = THEME[demoId] || THEME["surprise"];

  // ── Parse action + metadata ────────────────────────────────────────────────
  const isAccepted = action === "ACCEPTED" || action.startsWith("ACCEPTED|");
  const isRejected = action === "REJECTED";

  // DatePlanner embeds JSON in action string: "ACCEPTED|{place,food,date,time}"
  let datePlanMeta: Record<string, string> | null = null;
  if (action.startsWith("ACCEPTED|")) {
    try { datePlanMeta = JSON.parse(action.substring(9)); } catch { }
  }

  // ── Build action headline ──────────────────────────────────────────────────
  type HeadlineMap = Record<string, Record<string, string>>;
  const headlines: HeadlineMap = {
    "surprise":         { ACCEPTED: "She Said YES! 💖",         REJECTED: "She Said No 😢" },
    "she-cant-say-no":  { ACCEPTED: "She Couldn't Say No! 💍",  REJECTED: "She Said No 😢" },
    "nasamajh-lakri":   { ACCEPTED: "She Said Haan! ❤️",       REJECTED: "She Said Na 😢" },
    "im-sorry":         { ACCEPTED: "She Forgave You! 💌🎉",   REJECTED: "She Forgave You! 💌" },
    "birthday-wish":    { ACCEPTED: "She Opened Her Birthday Surprise! 🎂🎉" },
    "date-planner":     { ACCEPTED: datePlanMeta ? "She Confirmed the Date! 🗓️💖" : "She Said Yes to the Date! 🌸" },
    "jalpaiguri-planner": { ACCEPTED: datePlanMeta ? "She Confirmed the Date! 🗓️💖" : "She Said Yes to the Date! 🌿" },
    "durga-puja":       { ACCEPTED: "She Responded to Your Puja Invitation! 🌺" },
  };
  const headline = (headlines[demoId] || {})[isRejected ? "REJECTED" : "ACCEPTED"] || `She Responded! ${theme.emoji}`;
  const subject = `${headline} — OurStory Notification`;

  // ── Build metadata rows HTML ───────────────────────────────────────────────
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;font-weight:600;width:40%;">${label}</td><td style="padding:6px 0;color:#1e293b;font-size:13px;font-weight:700;">${value}</td></tr>`;

  let metaRowsHtml = "";

  // Date Planner (via action string)
  if (datePlanMeta) {
    if (datePlanMeta.place) metaRowsHtml += row("📍 Place", datePlanMeta.place);
    if (datePlanMeta.food)  metaRowsHtml += row("🍽️ Food", datePlanMeta.food);
    if (datePlanMeta.date)  metaRowsHtml += row("📅 Date", datePlanMeta.date);
    if (datePlanMeta.time)  metaRowsHtml += row("⏰ Time", datePlanMeta.time);
  }

  // Durga Puja (rich metadata from API)
  if (demoId === "durga-puja" && metadata) {
    if (metadata.selectedDay)       metaRowsHtml += row("🗓️ Puja Day", metadata.selectedDay);
    if (metadata.selectedVibe)      metaRowsHtml += row("✨ Vibe", metadata.selectedVibe);
    if (metadata.selectedAdventure) metaRowsHtml += row("🧭 Adventure", metadata.selectedAdventure);
    if (metadata.selectedFoods?.length) metaRowsHtml += row("🍜 Food Picks", Array.isArray(metadata.selectedFoods) ? metadata.selectedFoods.join(", ") : metadata.selectedFoods);
    if (metadata.recipientNote)     metaRowsHtml += row("💬 Her Note", `"${metadata.recipientNote}"`);
    if (metadata.recipientName)     metaRowsHtml += row("👤 Recipient", metadata.recipientName);
  }

  const metaTableHtml = metaRowsHtml
    ? `<table style="width:100%;border-collapse:collapse;margin-top:16px;">${metaRowsHtml}</table>`
    : "";

  // ── Build body copy per template ─────────────────────────────────────────
  type BodyCopyMap = Record<string, string>;
  const bodyCopy: BodyCopyMap = {
    "surprise_ACCEPTED":          "Your romantic surprise worked its magic! 💕 She opened your love page and said YES. Time to celebrate — she's yours!",
    "surprise_REJECTED":          "She said no this time 💔 But don't give up. Sometimes love takes a little more time. You're brave for trying.",
    "she-cant-say-no_ACCEPTED":   "She literally couldn't say no! 💍 Your proposal worked perfectly — she said YES! Congratulations! 🎊",
    "she-cant-say-no_REJECTED":   "She managed to say no somehow 😢 But your effort was absolutely adorable. Try again?",
    "nasamajh-lakri_ACCEPTED":    "Haan! 🎉 She said yes to you. Your Nasamajh Lakri proposal was a hit! Go celebrate together!",
    "nasamajh-lakri_REJECTED":    "She said na this time 😢 Give her a little time and try again with something even more special.",
    "im-sorry_ACCEPTED":          "She forgave you! 💜 Your heartfelt apology worked. The Love Battery is fully charged again. Now go make it up to her! 🎊",
    "birthday-wish_ACCEPTED":     "She opened your birthday surprise! 🎂🥳 She's seeing all the love you put into it right now. What a special moment!",
    "date-planner_ACCEPTED":      datePlanMeta ? "She confirmed all the date details! 🗓️ Everything is locked in — now make it the most magical evening ever!" : "She said yes to going on a date with you! 🌸 Now plan the details and make it unforgettable.",
    "jalpaiguri-planner_ACCEPTED": datePlanMeta ? "She confirmed your Jalpaiguri date! 🌿🗓️ All details are locked — now make it a beautiful evening together!" : "She said yes to a Jalpaiguri date with you! 🌿 Plan the details and create a memory to cherish.",
    "durga-puja_ACCEPTED":        "She responded to your Durga Puja invitation! 🌺 Check her choices below to plan the perfect celebration together.",
  };
  const bodyKey = `${demoId}_${isRejected ? "REJECTED" : "ACCEPTED"}`;
  const bodyText = bodyCopy[bodyKey] || `${headline} — Open your OurStory dashboard to see the full response.`;

  // ── Big reaction emoji ────────────────────────────────────────────────────
  const reactionEmoji = isRejected ? "💔" : (demoId === "birthday-wish" ? "🎂" : demoId === "durga-puja" ? "🌺" : demoId === "im-sorry" ? "💜" : "💖");
  const headerText = isRejected ? "Response Received 💔" : headline;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1e293b;background-color:#f8fafc;padding:24px 12px;margin:0;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,0.08);border:1.5px solid ${theme.borderColor};">

    <!-- Header -->
    <div style="background:${theme.headerGradient};padding:28px 24px 24px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">${reactionEmoji}</div>
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.02em;text-shadow:0 2px 8px rgba(0,0,0,0.2);">${headerText}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;font-weight:500;">${templateTitle}</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 28px 32px;">
      <p style="font-size:16px;color:#334155;margin:0 0 20px;line-height:1.7;">${bodyText}</p>

      ${metaTableHtml ? `
      <!-- Details Card -->
      <div style="background:${theme.accentLight};border:1.5px solid ${theme.borderColor};border-radius:14px;padding:18px 20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:${theme.accentColor};">Her Choices ${theme.emoji}</p>
        ${metaTableHtml}
      </div>` : ""}

      <!-- CTA -->
      <div style="text-align:center;margin:24px 0 8px;">
        <a href="${dashboardUrl}" target="_blank"
           style="display:inline-block;padding:14px 32px;background:${theme.accentColor};color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;border-radius:14px;box-shadow:0 6px 18px rgba(0,0,0,0.18);letter-spacing:0.01em;">
          ${theme.emoji} Open Your Dashboard
        </a>
      </div>

      ${shareUrl ? `<p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:12px;">Share link: <a href="${shareUrl}" style="color:${theme.accentColor};">${shareUrl}</a></p>` : ""}

      <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0 18px;" />
      <p style="font-size:11px;color:#94a3b8;margin:0;text-align:center;">
        Made with ${theme.emoji} by OurStory &bull; <a href="${dashboardUrl}" style="color:${theme.accentColor};">View Dashboard</a> &bull; Reply to this email for support
      </p>
    </div>
  </div>
</body>
</html>`;

  await sendMail({
    to,
    subject,
    html,
    text: `${headline}\n\n${bodyText}\n\nOpen your dashboard: ${dashboardUrl}`,
  });
}
