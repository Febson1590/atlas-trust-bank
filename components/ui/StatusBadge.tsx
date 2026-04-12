import { cn } from "@/lib/utils";

type StatusVariant =
  | "completed"
  | "active"
  | "verified"
  | "pending"
  | "processing"
  | "failed"
  | "rejected"
  | "dormant"
  | "restricted"
  | "frozen"
  | "cancelled"
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Green — success states
  completed: "bg-success/15 text-success border border-success/20",
  active: "bg-success/15 text-success border border-success/20",
  verified: "bg-success/15 text-success border border-success/20",
  resolved: "bg-success/15 text-success border border-success/20",

  // Yellow — pending / in-progress states
  pending: "bg-warning/15 text-warning border border-warning/20",
  processing: "bg-warning/15 text-warning border border-warning/20",
  open: "bg-warning/15 text-warning border border-warning/20",
  in_progress: "bg-warning/15 text-warning border border-warning/20",
  not_started: "bg-warning/15 text-warning border border-warning/20",

  // Red — failure states
  failed: "bg-error/15 text-error border border-error/20",
  rejected: "bg-error/15 text-error border border-error/20",
  cancelled: "bg-error/15 text-error border border-error/20",

  // Neutral — inactive / restricted states
  dormant: "bg-navy-600/30 text-text-muted border border-navy-600/30",
  restricted: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  frozen: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  closed: "bg-navy-600/30 text-text-muted border border-navy-600/30",
  suspended: "bg-error/15 text-error border border-error/20",
};

function normalizeStatus(status: string): string {
  return status.toLowerCase().replace(/[\s-]/g, "_");
}

function formatLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({
  status,
  variant,
  className,
}: StatusBadgeProps) {
  const key = variant ?? normalizeStatus(status);
  const style =
    statusStyles[key] ??
    "bg-navy-600/30 text-text-secondary border border-navy-600/30";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        style,
        className
      )}
    >
      {formatLabel(status)}
    </span>
  );
}
