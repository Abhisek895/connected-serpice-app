import nodemailer from "nodemailer";
import { decryptSecret } from "./crypto";

export interface SmtpAccountConfig {
  id?: string;
  name: string;
  provider: string;
  host: string;
  port: number;
  username: string;
  encryptedPassword: string;
  fromName: string;
  fromEmail: string;
}

/**
 * Creates a Nodemailer transporter for an SMTP account config
 */
export function createTransporter(account: SmtpAccountConfig) {
  const plainPassword = decryptSecret(account.encryptedPassword);

  const options: nodemailer.TransportOptions | any = {
    host: account.host,
    port: account.port,
    secure: account.port === 465, // true for 465, false for other ports
    auth: {
      user: account.username,
      pass: plainPassword,
    },
    // Useful timeouts for reliable cold mailing
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert issues
    },
  };

  if (account.provider === "gmail" && !account.host.includes(".")) {
    options.service = "gmail";
  }

  return nodemailer.createTransport(options);
}

/**
 * Tests an SMTP connection without sending bulk emails
 */
export async function testSmtpConnection(account: SmtpAccountConfig): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const transporter = createTransporter(account);
    await transporter.verify();
    return {
      success: true,
      message: `Connection successful! SMTP host ${account.host}:${account.port} authenticated as ${account.username}.`,
    };
  } catch (err: any) {
    console.error("SMTP Connection Test Error:", err);
    return {
      success: false,
      message: err.message || "Failed to authenticate or connect to SMTP server.",
    };
  }
}

/**
 * Sends a single email with custom HTML & plain text
 */
export async function sendColdEmail({
  smtpAccount,
  toEmail,
  toName,
  subject,
  htmlContent,
}: {
  smtpAccount: SmtpAccountConfig;
  toEmail: string;
  toName?: string | null;
  subject: string;
  htmlContent: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createTransporter(smtpAccount);
    const fromName = smtpAccount.fromName || "OurStory Team";
    let fromEmail = (smtpAccount.fromEmail || smtpAccount.username).trim();
    if (smtpAccount.provider === "gmail" || (smtpAccount.host && smtpAccount.host.includes("gmail"))) {
      fromEmail = smtpAccount.username.trim();
    }

    const recipientAddress = toName ? `"${toName}" <${toEmail}>` : toEmail;
    const isHtml = /<[a-z][\s\S]*>/i.test(htmlContent);

    const mailOptions: any = {
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientAddress,
      subject,
      headers: {
        "X-Mailer": "OurStory Engine v1.0",
        "X-Priority": "3",
        "List-Unsubscribe": `<mailto:${fromEmail}?subject=unsubscribe>`,
      },
    };

    if (isHtml) {
      mailOptions.text = htmlToPlainText(htmlContent);
      mailOptions.html = htmlContent;
    } else {
      // 100% Pure text/plain singlepart format for 100% Primary Inbox placement
      mailOptions.text = htmlContent;
    }

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error(`Failed to send cold email to ${toEmail}:`, err);
    return {
      success: false,
      error: err.message || "Failed to send email via SMTP",
    };
  }
}

function htmlToPlainText(html: string): string {
  if (!html) return "";
  let text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<[^>]+>/g, " ");
  return text.replace(/\s+/g, " ").trim();
}
