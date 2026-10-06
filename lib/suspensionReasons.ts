// ─── Suspension reasons ─────────────────────────────────
// Admin picks one of these when suspending a user. `label` is shown to
// admins; `title` + `message` are shown to the user on the sign-in page.
// Shared by client and server — keep this file free of server imports.

export const SUSPENSION_REASONS = {
  multiple_locations: {
    label: "Login from multiple locations",
    title: "Account Suspended",
    message:
      "Your account has been suspended due to sign-in activity from multiple locations. For your security, access has been restricted until our team reviews your account.",
  },
  concurrent_sessions: {
    label: "Multiple active sessions at the same time",
    title: "Account Suspended",
    message:
      "Your account has been suspended because multiple sessions were active at the same time. For your security, access has been restricted until our team reviews your account.",
  },
  unusual_activity: {
    label: "Unusual transaction activity",
    title: "Account Suspended",
    message:
      "Your account has been suspended while we review unusual activity. This is a precaution to protect your funds.",
  },
  kyc_required: {
    label: "Identity verification required",
    title: "Account Suspended",
    message:
      "Your account has been suspended pending identity verification. Please contact support to complete verification and restore access.",
  },
  compromised: {
    label: "Account possibly compromised",
    title: "Account Suspended",
    message:
      "Your account has been suspended because we believe it may have been accessed by someone else. Please contact support to secure your account.",
  },
  terms_violation: {
    label: "Violation of Terms of Service",
    title: "Account Suspended",
    message: "Your account has been suspended for a violation of our Terms of Service.",
  },
  customer_request: {
    label: "Requested by account holder",
    title: "Account Suspended",
    message:
      "Your account has been suspended at your request. Contact support when you are ready to reactivate it.",
  },
  regulatory_hold: {
    label: "Legal or regulatory hold",
    title: "Account Suspended",
    message: "Your account has been suspended due to a legal or regulatory requirement.",
  },
  other: {
    label: "Other",
    title: "Account Suspended",
    message: "Your account has been suspended. Please contact support for more information.",
  },
} as const;

export type SuspensionReason = keyof typeof SUSPENSION_REASONS;

export const SUPPORT_EMAIL = "support@atlastrustcore.com";

export function isSuspensionReason(v: unknown): v is SuspensionReason {
  return (
    typeof v === "string" &&
    Object.prototype.hasOwnProperty.call(SUSPENSION_REASONS, v)
  );
}

/** User-facing copy for a stored reason; falls back to the generic message. */
export function suspensionNotice(reason: string | null | undefined) {
  const r = isSuspensionReason(reason) ? reason : "other";
  return {
    reason: r,
    title: SUSPENSION_REASONS[r].title,
    message: SUSPENSION_REASONS[r].message,
  };
}
