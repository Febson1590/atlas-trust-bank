"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Send,
  Users,
  CreditCard,
  ShieldCheck,
  Bell,
  Settings,
  Lock,
  HelpCircle,
  LogOut,
  X,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const primaryItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/dashboard/accounts", icon: Wallet },
  { label: "Send Money", href: "/dashboard/transfer", icon: Send },
  { label: "Cards", href: "/dashboard/cards", icon: CreditCard },
];

const secondaryItems = [
  { label: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { label: "Recipients", href: "/dashboard/beneficiaries", icon: Users },
  { label: "Verification", href: "/dashboard/kyc", icon: ShieldCheck },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Security", href: "/dashboard/security", icon: Lock },
  { label: "Support", href: "/dashboard/support", icon: HelpCircle },
];

const allItems = [...primaryItems, ...secondaryItems];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  // If any secondary item is active, expand the "More" section
  const secondaryActive = secondaryItems.some((item) => isActive(item.href));

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  }

  function NavLink({ item }: { item: typeof primaryItems[0] }) {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-navy-800 text-gold-500 border-l-2 border-gold-500"
            : "text-text-secondary hover:bg-navy-800/50 hover:text-text-primary border-l-2 border-transparent"
        )}
      >
        <item.icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors",
            active ? "text-gold-500" : "text-text-muted group-hover:text-text-secondary"
          )}
        />
        {item.label}
      </Link>
    );
  }

  // Desktop shows all items normally
  const desktopContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6 shrink-0">
        <Link href="/dashboard">
          <Image src="/logo.png" alt="Atlas Trust Bank" width={160} height={44} className="h-10 w-auto" />
        </Link>
      </div>
      <div className="mx-4 border-t border-border-subtle" />
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {allItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className="mx-4 border-t border-border-subtle" />
      <div className="px-3 py-4 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-navy-800/50 hover:text-error border-l-2 border-transparent"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Log Out
        </button>
      </div>
    </div>
  );

  // Mobile shows primary + collapsible "More"
  const mobileContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6 shrink-0">
        <Link href="/dashboard" onClick={onClose}>
          <Image src="/logo.png" alt="Atlas Trust Bank" width={160} height={44} className="h-10 w-auto" />
        </Link>
      </div>
      <div className="mx-4 border-t border-border-subtle" />
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {/* Primary items always visible */}
        {primaryItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {/* More toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors border-l-2 border-transparent",
              (showMore || secondaryActive)
                ? "text-text-primary bg-navy-800/30"
                : "text-text-muted hover:bg-navy-800/50 hover:text-text-secondary"
            )}
          >
            <MoreHorizontal className="h-[18px] w-[18px] shrink-0 text-text-muted" />
            More
          </button>
        </div>

        {/* Secondary items */}
        {(showMore || secondaryActive) && (
          <div className="space-y-0.5 pl-1">
            {secondaryItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        )}
      </nav>
      <div className="mx-4 border-t border-border-subtle" />
      <div className="px-3 py-4 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-navy-800/50 hover:text-error border-l-2 border-transparent"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-[280px] flex-col bg-navy-950 border-r border-border-default">
        {desktopContent}
      </aside>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] flex-col bg-navy-950 border-r border-border-default shadow-2xl transition-transform duration-300 lg:hidden flex",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-4 right-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {mobileContent}
      </aside>
    </>
  );
}
