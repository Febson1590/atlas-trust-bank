import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "placeholder");
  }
  return _resend;
}

// Production canonical URL. Centralized so every email link points at the
// same place. Override via NEXT_PUBLIC_APP_URL in Vercel for non-prod
// deploys (preview, staging, etc).
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://atlastrustcore.com";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "Atlas Trust Bank <noreply@atlastrustcore.com>";
const SUPPORT_INBOX =
  process.env.CONTACT_INBOX || "support@atlastrustcore.com";
const APP_NAME = "Atlas Trust Bank";
const LOGO_URL = `${APP_URL}/logo.png`;

// HTML-escape user-provided text before dropping it into an email template.
// Prevents the contact form from being used to inject arbitrary markup into
// our support inbox.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Base Email Template ─────────────────────────────────
// Premium dark + gold branded HTML email shell

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#E8ECF1;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#E8ECF1;padding:0;margin:0;">
    <tr>
      <td align="center" style="padding:32px 16px 40px;">
        <!-- Card container — NO overflow:hidden -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;">
          <!-- Logo Header — dark navy -->
          <tr>
            <td align="center" bgcolor="#0A1628" style="background-color:#0A1628;padding:40px 32px 32px;border-radius:12px 12px 0 0;">
              <img src="${LOGO_URL}" alt="${APP_NAME}" width="220" style="display:block;margin:0 auto;width:220px;max-width:80%;height:auto;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>
          <!-- Content — clean white -->
          <tr>
            <td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:36px 32px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer — light gray, fully visible -->
          <tr>
            <td bgcolor="#F4F6F8" style="background-color:#F4F6F8;padding:28px 32px 32px;border-radius:0 0 12px 12px;">
              <p style="margin:0;color:#8A9AB5;font-size:12px;line-height:1.8;text-align:center;">
                This email was sent by ${APP_NAME}.<br>
                You can't reply to this email.<br>
                &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
        <!-- Bottom spacer for mobile Gmail -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;">
          <tr>
            <td style="height:24px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Email Senders ───────────────────────────────────────

export async function sendOTPEmail(
  email: string,
  code: string,
  purpose: string = "verification"
): Promise<boolean> {
  const purposeText =
    purpose === "login" ? "sign-in" : purpose === "transfer" ? "transfer" : "email verification";

  const html = baseTemplate(`
    <h2 style="margin:0 0 12px;color:#0A1628;font-size:20px;font-weight:700;">Your Code</h2>
    <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Here's your ${purposeText} code. It's good for 5 minutes.
    </p>
    <div style="background-color:#0A1628;border:2px solid #C5A55A;border-radius:8px;padding:22px 16px;text-align:center;margin:0 0 24px;">
      <span style="color:#C5A55A;font-size:36px;font-weight:700;letter-spacing:8px;">${code}</span>
    </div>
    <p style="color:#718096;font-size:13px;line-height:1.6;margin:0;">
      Didn't ask for this code? You can ignore this email. If you're worried, reach out to our support team.
    </p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} — Your Code`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string
): Promise<boolean> {
  const html = baseTemplate(`
    <h2 style="margin:0 0 12px;color:#0A1628;font-size:20px;font-weight:700;">Welcome to ${APP_NAME}</h2>
    <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Hi ${firstName},
    </p>
    <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Your account is ready! You can now send transfers, manage your accounts, and use our investment tools.
    </p>
    <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      To unlock all features, please verify your identity first.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${APP_URL}/dashboard" style="display:inline-block;background-color:#C5A55A;color:#0A1628;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:15px;">
        Go to Your Dashboard
      </a>
    </div>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to ${APP_NAME}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<boolean> {
  const html = baseTemplate(`
    <h2 style="margin:0 0 12px;color:#0A1628;font-size:20px;font-weight:700;">Reset Your Password</h2>
    <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      We got your request to reset your password. Click the button below to pick a new one. This link works for 15 minutes.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${resetUrl}" style="display:inline-block;background-color:#C5A55A;color:#0A1628;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:15px;">
        Reset Password
      </a>
    </div>
    <p style="color:#718096;font-size:13px;line-height:1.6;margin:0;">
      Didn't ask to reset your password? No worries -- just ignore this email. Your account is safe.
    </p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} — Password Reset`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
}

export async function sendTransferAlertEmail(
  email: string,
  firstName: string,
  details: {
    amount: string;
    recipient: string;
    reference: string;
    status: string;
  }
): Promise<boolean> {
  const statusColor =
    details.status === "completed"
      ? "#22C55E"
      : details.status === "failed" || details.status === "rejected"
      ? "#EF4444"
      : "#F59E0B";

  const html = baseTemplate(`
    <h2 style="margin:0 0 12px;color:#0A1628;font-size:20px;font-weight:700;">Transfer ${details.status === "completed" ? "Done" : details.status === "failed" ? "Failed" : "Update"}</h2>
    <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hi ${firstName}, here's an update on your transfer.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F6F8;border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;">Amount</td><td style="padding:10px 16px;color:#0A1628;font-size:14px;font-weight:600;text-align:right;">${details.amount}</td></tr>
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;border-top:1px solid #E2E8F0;">Recipient</td><td style="padding:10px 16px;color:#0A1628;font-size:14px;text-align:right;border-top:1px solid #E2E8F0;">${details.recipient}</td></tr>
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;border-top:1px solid #E2E8F0;">Reference</td><td style="padding:10px 16px;color:#0A1628;font-size:14px;text-align:right;border-top:1px solid #E2E8F0;">${details.reference}</td></tr>
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;border-top:1px solid #E2E8F0;">Status</td><td style="padding:10px 16px;font-size:14px;text-align:right;border-top:1px solid #E2E8F0;"><span style="color:${statusColor};font-weight:600;">${details.status.toUpperCase()}</span></td></tr>
    </table>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} — Transfer ${details.status === "completed" ? "Done" : "Update"}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send transfer alert email:", error);
    return false;
  }
}

export async function sendKycUpdateEmail(
  email: string,
  firstName: string,
  status: string,
  note?: string
): Promise<boolean> {
  const statusText =
    status === "VERIFIED"
      ? "Good news -- your identity has been verified! You now have full access to all features."
      : status === "REJECTED"
      ? `We weren't able to verify your identity.${note ? ` Reason: ${note}` : ""} Please upload your documents again.`
      : "We're reviewing your identity documents. We'll let you know as soon as we're done.";

  const html = baseTemplate(`
    <h2 style="margin:0 0 12px;color:#0A1628;font-size:20px;font-weight:700;">Identity Check Update</h2>
    <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hi ${firstName},
    </p>
    <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      ${statusText}
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${APP_URL}/dashboard/kyc" style="display:inline-block;background-color:#C5A55A;color:#0A1628;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:15px;">
        Check Status
      </a>
    </div>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} — Identity Check ${status === "VERIFIED" ? "Approved" : "Update"}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send KYC update email:", error);
    return false;
  }
}

export async function sendContactEmail(details: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const safeName = escapeHtml(details.name);
  const safeEmail = escapeHtml(details.email);
  const safeSubject = escapeHtml(details.subject);
  const safeMessage = escapeHtml(details.message).replace(/\n/g, "<br>");

  const html = baseTemplate(`
    <h2 style="margin:0 0 12px;color:#0A1628;font-size:20px;font-weight:700;">New Contact Form Message</h2>
    <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Someone just sent a message through the ${APP_NAME} contact form.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F6F8;border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;">From</td><td style="padding:10px 16px;color:#0A1628;font-size:14px;font-weight:600;text-align:right;">${safeName}</td></tr>
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;border-top:1px solid #E2E8F0;">Email</td><td style="padding:10px 16px;color:#0A1628;font-size:14px;text-align:right;border-top:1px solid #E2E8F0;">${safeEmail}</td></tr>
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;border-top:1px solid #E2E8F0;">Subject</td><td style="padding:10px 16px;color:#0A1628;font-size:14px;text-align:right;border-top:1px solid #E2E8F0;">${safeSubject}</td></tr>
    </table>
    <div style="background-color:#F4F6F8;border-radius:8px;padding:18px 20px;color:#0A1628;font-size:14px;line-height:1.7;white-space:pre-wrap;">
      ${safeMessage}
    </div>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_INBOX,
      replyTo: details.email,
      subject: `[Contact] ${details.subject}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return false;
  }
}

export async function sendSecurityAlertEmail(
  email: string,
  firstName: string,
  details: { action: string; device: string; ip: string; time: string }
): Promise<boolean> {
  const html = baseTemplate(`
    <h2 style="margin:0 0 12px;color:#0A1628;font-size:20px;font-weight:700;">Security Alert</h2>
    <p style="color:#4A5568;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hi ${firstName}, we noticed a new ${details.action} on your account.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F6F8;border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;">Activity</td><td style="padding:10px 16px;color:#0A1628;font-size:14px;font-weight:600;text-align:right;">${details.action}</td></tr>
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;border-top:1px solid #E2E8F0;">Device</td><td style="padding:10px 16px;color:#0A1628;font-size:14px;text-align:right;border-top:1px solid #E2E8F0;">${details.device}</td></tr>
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;border-top:1px solid #E2E8F0;">IP Address</td><td style="padding:10px 16px;color:#0A1628;font-size:14px;text-align:right;border-top:1px solid #E2E8F0;">${details.ip}</td></tr>
      <tr><td style="padding:10px 16px;color:#718096;font-size:14px;border-top:1px solid #E2E8F0;">Time</td><td style="padding:10px 16px;color:#0A1628;font-size:14px;text-align:right;border-top:1px solid #E2E8F0;">${details.time}</td></tr>
    </table>
    <p style="color:#EF4444;font-size:13px;line-height:1.6;margin:0;">
      Wasn't you? Change your password right away to keep your account safe.
    </p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} — Security Alert`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send security alert email:", error);
    return false;
  }
}
