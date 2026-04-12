"use client";

import Link from "next/link";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/dashboard/accounts", icon: Wallet },
  { label: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { label: "Transfer", href: "/dashboard/transfer", icon: Send },
  { label: "Beneficiaries", href: "/dashboard/beneficiaries", icon: Users },
  { label: "Cards", href: "/dashboard/cards", icon: CreditCard },
  { label: "KYC Verification", href: "/dashboard/kyc", icon: ShieldCheck },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Security", href: "/dashboard/security", icon: Lock },
  { label: "Support", href: "/dashboard/support", icon: HelpCircle },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gold-gradient">
          <span className="text-sm font-bold text-navy-950">AT</span>
        </div>
        <div>
          <span className="text-base font-bold gold-text">Atlas Trust</span>
          <span className="block text-[10px] font-medium text-text-muted tracking-widest uppercase">
            Banking
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border-subtle" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-navy-800 text-gold-500 border-l-2 border-gold-500 ml-0"
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
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-border-subtle" />

      {/* Logout */}
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
      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-[280px] flex-col bg-navy-950 border-r border-border-default">
        {sidebarContent}
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
        {/* Close button for mobile */}
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
        {sidebarContent}
      </aside>
    </>
  );
}
