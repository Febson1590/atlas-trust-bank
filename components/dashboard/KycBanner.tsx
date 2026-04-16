import Link from "next/link";
import {
  ShieldAlert,
  Clock,
  XCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { KycStatus } from "@/generated/prisma";

/**
 * KYC status banner shown near the top of the dashboard overview for
 * any user whose identity isn't verified yet. Hidden for VERIFIED users
 * (requirement #5 says "hide the warning banner").
 *
 * States:
 *   NOT_STARTED → amber warning, "Complete KYC" CTA
 *   PENDING     → gold/info, "View KYC Status" CTA
 *   REJECTED    → red error, "Resubmit KYC" CTA
 *   VERIFIED    → returns null (no banner)
 */
export default function KycBanner({ status }: { status: KycStatus }) {
  if (status === "VERIFIED") return null;

  const config = {
    NOT_STARTED: {
      icon: ShieldAlert,
      title: "Verification Required",
      body: "Complete identity verification to unlock transfers, cards, and full account access.",
      cta: "Complete KYC",
      border: "border-warning/30",
      bg: "bg-warning/5",
      iconBg: "bg-warning/10 border-warning/20",
      iconColor: "text-warning",
      titleColor: "text-warning",
      ctaBg:
        "bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20",
    },
    PENDING: {
      icon: Clock,
      title: "Verification Under Review",
      body: "Your identity documents are being reviewed. This usually takes 1–2 business days.",
      cta: "View KYC Status",
      border: "border-gold-500/30",
      bg: "bg-gold-500/5",
      iconBg: "bg-gold-500/10 border-gold-500/20",
      iconColor: "text-gold-500",
      titleColor: "text-gold-500",
      ctaBg:
        "bg-gold-500/10 border border-gold-500/30 text-gold-500 hover:bg-gold-500/20",
    },
    REJECTED: {
      icon: XCircle,
      title: "Verification Rejected",
      body: "Your identity check was unsuccessful. Please upload new documents to try again.",
      cta: "Resubmit KYC",
      border: "border-error/30",
      bg: "bg-error/5",
      iconBg: "bg-error/10 border-error/20",
      iconColor: "text-error",
      titleColor: "text-error",
      ctaBg:
        "bg-error/10 border border-error/30 text-error hover:bg-error/20",
    },
  }[status];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border ${config.border} ${config.bg} p-4 sm:p-5`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon + text */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${config.iconBg}`}
          >
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${config.titleColor}`}>
              {config.title}
            </p>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              {config.body}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/kyc"
          className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${config.ctaBg} w-full sm:w-auto`}
        >
          {config.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Small inline "Verified" badge to show next to the user's name in the
 * dashboard greeting when their KYC is complete. Renders nothing for
 * non-verified users.
 */
export function KycVerifiedBadge({ status }: { status: KycStatus }) {
  if (status !== "VERIFIED") return null;
  return (
    <span className="inline-flex items-center gap-1 ml-2 rounded-full bg-success/10 border border-success/20 px-2.5 py-0.5 text-xs font-medium text-success align-middle">
      <ShieldCheck className="h-3 w-3" />
      Verified
    </span>
  );
}
