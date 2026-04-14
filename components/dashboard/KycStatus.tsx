"use client";

import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KycStatusProps {
  status: string;
  adminNote?: string | null;
}

const statusConfig = {
  NOT_STARTED: {
    icon: ShieldAlert,
    title: "Verification Needed",
    description:
      "Upload an ID document to unlock transfers, payments, and all other features.",
    bgClass: "bg-navy-800 border-gold-500/30",
    iconBg: "bg-gold-500/10",
    iconColor: "text-gold-500",
    titleColor: "text-gold-500",
    badgeClass: "bg-gold-500/15 text-gold-500 border border-gold-500/20",
    badgeLabel: "Not Submitted",
  },
  PENDING: {
    icon: Clock,
    title: "Under Review",
    description:
      "We got your document and are checking it now. This usually takes 1–2 business days.",
    bgClass: "bg-navy-800 border-warning/30",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    titleColor: "text-warning",
    badgeClass: "bg-warning/15 text-warning border border-warning/20",
    badgeLabel: "Pending Review",
  },
  VERIFIED: {
    icon: ShieldCheck,
    title: "Verified",
    description:
      "You're all set. Your identity has been verified and you have full access.",
    bgClass: "bg-navy-800 border-success/30",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    titleColor: "text-success",
    badgeClass: "bg-success/15 text-success border border-success/20",
    badgeLabel: "Verified",
  },
  REJECTED: {
    icon: AlertTriangle,
    title: "Rejected",
    description:
      "We couldn't verify your document. Check the reason below and try again.",
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
}: KycStatusProps) {
  const config =
    statusConfig[status as keyof typeof statusConfig] ??
    statusConfig.NOT_STARTED;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all animate-fade-in",
        config.bgClass
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            config.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", config.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h3 className={cn("text-base font-semibold", config.titleColor)}>
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
            <div className="mt-3 rounded-lg bg-error/5 border border-error/20 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-error mb-1">
                Reason
              </p>
              <p className="text-sm text-text-secondary">{adminNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
