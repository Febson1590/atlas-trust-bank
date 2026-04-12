import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-800 border border-border-subtle mb-4">
        <Icon className="h-7 w-7 text-text-muted" />
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-1">
        {title}
      </h3>

      <p className="text-sm text-text-muted max-w-sm mb-6">
        {description}
      </p>

      {action && (
        action.href ? (
          <a
            href={action.href}
            className="gold-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90"
          >
            {action.label}
          </a>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="gold-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
