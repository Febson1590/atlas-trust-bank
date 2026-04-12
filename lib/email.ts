import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "placeholder");
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Atlas Trust Bank <noreply@atlastrust.com>";
const APP_NAME = "Atlas Trust Bank";

// ─── Base Email Template ─────────────────────────────────
// Premium dark + gold branded HTML email shell

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#0A1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1628;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#0F1D32;border-radius:12px;overflow:hidden;border:1px solid #1E3054;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px;text-align:center;border-bottom:1px solid #1E3054;">
              <h1 style="margin:0;color:#C5A55A;font-size:24px;font-weight:700;letter-spacing:1px;">
                Atlas Trust Bank
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;border-top:1px solid #1E3054;">
              <p style="margin:0;color:#8A9AB5;font-size:12px;line-height:1.6;">
                This is an automated message from ${APP_NAME}.<br>
                Please do not reply to this email.<br>
                &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </td>
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
    purpose === "login" ? "sign-in" : purpose === "transfer" ? "transfer confirmation" : "email verification";

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#F1F1F1;font-size:20px;">Verification Code</h2>
    <p style="color:#8A9AB5;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Use the following code for your ${purposeText}. This code expires in 5 minutes.
    </p>
    <div style="background-color:#0A1628;border:2px solid #C5A55A;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
      <span style="color:#C5A55A;font-size:36px;font-weight:700;letter-spacing:8px;">${code}</span>
    </div>
    <p style="color:#8A9AB5;font-size:13px;line-height:1.6;margin:0;">
      If you did not request this code, please ignore this email or contact our support team immediately.
    </p>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} — Your Verification Code`,
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
    <h2 style="margin:0 0 16px;color:#F1F1F1;font-size:20px;">Welcome to ${APP_NAME}</h2>
    <p style="color:#8A9AB5;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Dear ${firstName},
    </p>
    <p style="color:#8A9AB5;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Your account has been successfully created. You now have access to our premium banking services including secure transfers, account management, and investment tools.
    </p>
    <p style="color:#8A9AB5;font-size:15px;line-height:1.6;margin:0 0 24px;">
      To get started, please complete your KYC verification to unlock all features.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background-color:#C5A55A;color:#0A1628;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:15px;">
        Access Your Dashboard
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
    <h2 style="margin:0 0 16px;color:#F1F1F1;font-size:20px;">Password Reset Request</h2>
    <p style="color:#8A9AB5;font-size:15px;line-height:1.6;margin:0 0 24px;">
      We received a request to reset your password. Click the button below to create a new password. This link expires in 15 minutes.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${resetUrl}" style="display:inline-block;background-color:#C5A55A;color:#0A1628;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:15px;">
        Reset Password
      </a>
    </div>
    <p style="color:#8A9AB5;font-size:13px;line-height:1.6;margin:0;">
      If you did not request a password reset, you can safely ignore this email. Your account remains secure.
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
    <h2 style="margin:0 0 16px;color:#F1F1F1;font-size:20px;">Transfer ${details.status === "completed" ? "Completed" : details.status === "failed" ? "Failed" : "Update"}</h2>
    <p style="color:#8A9AB5;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Dear ${firstName}, your transfer has been updated.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1628;border-radius:8px;padding:20px;margin:0 0 24px;">
      <tr><td style="padding:8px 16px;color:#8A9AB5;font-size:14px;">Amount</td><td style="padding:8px 16px;color:#F1F1F1;font-size:14px;text-align:right;">${details.amount}</td></tr>
      <tr><td style="padding:8px 16px;color:#8A9AB5;font-size:14px;">Recipient</td><td style="padding:8px 16px;color:#F1F1F1;font-size:14px;text-align:right;">${details.recipient}</td></tr>
      <tr><td style="padding:8px 16px;color:#8A9AB5;font-size:14px;">Reference</td><td style="padding:8px 16px;color:#F1F1F1;font-size:14px;text-align:right;">${details.reference}</td></tr>
      <tr><td style="padding:8px 16px;color:#8A9AB5;font-size:14px;">Status</td><td style="padding:8px 16px;font-size:14px;text-align:right;"><span style="color:${statusColor};font-weight:600;">${details.status.toUpperCase()}</span></td></tr>
    </table>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} — Transfer ${details.status === "completed" ? "Completed" : "Update"}`,
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
      ? "Your identity verification has been approved. You now have full access to all banking features."
      : status === "REJECTED"
      ? `Your identity verification has been rejected.${note ? ` Reason: ${note}` : ""} Please re-submit your documents.`
      : "Your identity verification is being reviewed. We will notify you once the review is complete.";

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#F1F1F1;font-size:20px;">KYC Verification Update</h2>
    <p style="color:#8A9AB5;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Dear ${firstName},
    </p>
    <p style="color:#8A9AB5;font-size:15px;line-height:1.6;margin:0 0 24px;">
      ${statusText}
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/kyc" style="display:inline-block;background-color:#C5A55A;color:#0A1628;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:15px;">
        View Status
      </a>
    </div>
  `);

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} — KYC Verification ${status === "VERIFIED" ? "Approved" : "Update"}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send KYC update email:", error);
    return false;
  }
}

export async function sendSecurityAlertEmail(
  email: string,
  firstName: string,
  details: { action: string; device: string; ip: string; time: string }
): Promise<boolean> {
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;color:#F1F1F1;font-size:20px;">Security Alert</h2>
    <p style="color:#8A9AB5;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Dear ${firstName}, we detected a new ${details.action} on your account.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1628;border-radius:8px;padding:20px;margin:0 0 24px;">
      <tr><td style="padding:8px 16px;color:#8A9AB5;font-size:14px;">Activity</td><td style="padding:8px 16px;color:#F1F1F1;font-size:14px;text-align:right;">${details.action}</td></tr>
      <tr><td style="padding:8px 16px;color:#8A9AB5;font-size:14px;">Device</td><td style="padding:8px 16px;color:#F1F1F1;font-size:14px;text-align:right;">${details.device}</td></tr>
      <tr><td style="padding:8px 16px;color:#8A9AB5;font-size:14px;">IP Address</td><td style="padding:8px 16px;color:#F1F1F1;font-size:14px;text-align:right;">${details.ip}</td></tr>
      <tr><td style="padding:8px 16px;color:#8A9AB5;font-size:14px;">Time</td><td style="padding:8px 16px;color:#F1F1F1;font-size:14px;text-align:right;">${details.time}</td></tr>
    </table>
    <p style="color:#EF4444;font-size:13px;line-height:1.6;margin:0;">
      If this was not you, please secure your account immediately by changing your password.
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
