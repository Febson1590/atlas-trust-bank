"use client";

import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KycStatusProps {
  status: string;
  adminNote?: string | null;
  onResubmit?: () => void;
}

const statusConfig = {
  NOT_STARTED: {
    icon: ShieldAlert,
    title: "Identity Verification Required",
    description:
      "Complete your KYC verification to unlock full banking features including transfers, payments, and card services.",
    bgClass: "bg-navy-800 border-gold-500/30",
    iconBg: "bg-gold-500/10",
    iconColor: "text-gold-500",
    titleColor: "text-gold-500",
    badgeClass: "bg-gold-500/15 text-gold-500 border border-gold-500/20",
    badgeLabel: "Not Started",
  },
  PENDING: {
    icon: Clock,
    title: "Verification Under Review",
    description:
      "Your documents have been submitted and are currently being reviewed by our compliance team. This typically takes 1-2 business days.",
    bgClass: "bg-navy-800 border-warning/30",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    titleColor: "text-warning",
    badgeClass: "bg-warning/15 text-warning border border-warning/20",
    badgeLabel: "Under Review",
  },
  VERIFIED: {
    icon: ShieldCheck,
    title: "Identity Verified",
    description:
      "Your identity has been successfully verified. You have full access to all banking features.",
    bgClass: "bg-navy-800 border-success/30",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    titleColor: "text-success",
    badgeClass: "bg-success/15 text-success border border-success/20",
    badgeLabel: "Verified",
  },
  REJECTED: {
    icon: AlertTriangle,
    title: "Verification Rejected",
    description:
      "Your verification was not approved. Please review the reason below and re-submit your documents.",
    bgClass: "bg-navy-800 border-error/30",
    iconBg: "bg-error/10",
    iconColor: "text-error",
    titleColor: "text-error",
    badgeClass: "bg-error/15 text-error border border-error/20",
    badgeLabel: "Rejected",
  },
} as const;

export default function KycStatus({
  status,
  adminNote,
  onResubmit,
}: KycStatusProps) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.NOT_STARTED;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-all animate-fade-in",
        config.bgClass
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            config.iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", config.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className={cn("text-lg font-semibold", config.titleColor)}>
              {config.title}
            </h3>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                config.badgeClass
              )}
            >
              {config.badgeLabel}
            </span>
          </div>

          <p className="text-sm text-text-muted leading-relaxed">
            {config.description}
          </p>

          {/* Rejection reason */}
          {status === "REJECTED" && adminNote && (
            <div className="mt-4 rounded-lg bg-error/5 border border-error/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-error mb-1">
                Reason for Rejection
              </p>
              <p className="text-sm text-text-secondary">{adminNote}</p>
            </div>
          )}

          {/* Action buttons */}
          {status === "NOT_STARTED" && (
            <div className="mt-4">
              <p className="text-xs text-text-muted">
                Upload the required documents below to begin the verification process.
              </p>
            </div>
          )}

          {status === "REJECTED" && onResubmit && (
            <button
              type="button"
              onClick={onResubmit}
              className="mt-4 inline-flex items-center gap-2 gold-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90"
            >
              Re-submit Documents
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {status === "PENDING" && (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              <span className="text-xs text-text-muted">
                Estimated review time: 1-2 business days
              </span>
            </div>
          )}

          {status === "VERIFIED" && (
            <div className="mt-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span className="text-xs text-success font-medium">
                Full access granted to all banking features
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
