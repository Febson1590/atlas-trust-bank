"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import { Menu, ChevronDown, LogOut } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface AdminShellProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  children: React.ReactNode;
}

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "User Management",
  "/admin/accounts": "Accounts",
  "/admin/transactions": "Transactions",
  "/admin/transfers": "Transfers",
  "/admin/kyc": "KYC Review",
  "/admin/cards": "Cards",
  "/admin/notifications": "Notifications",
  "/admin/generator": "Transaction Generator",
  "/admin/audit-logs": "Audit Logs",
  "/admin/support": "Support Tickets",
  "/admin/settings": "Settings",
};

export default function AdminShell({ user, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  }

  // Determine page title — also handle dynamic routes like /admin/users/[id]
  let title = pageTitles[pathname] ?? "Admin";
  if (pathname.startsWith("/admin/users/") && pathname !== "/admin/users") {
    title = "User Details";
  }

  const initials = getInitials(user.firstName, user.lastName);

  return (
    <div className="min-h-screen bg-navy-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="lg:ml-[280px] flex flex-col min-h-screen">
        {/* Admin Header */}
        <header className="sticky top-0 z-20 glass glass-border">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-800 transition-colors lg:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-text-primary">
                  {title}
                </h1>
                <span className="hidden sm:inline-flex rounded-md bg-gold-500/15 border border-gold-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-500">
                  Admin Panel
                </span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-navy-800 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full gold-gradient text-xs font-bold text-navy-950">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-text-primary leading-tight">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-text-muted leading-tight truncate max-w-[140px]">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "hidden sm:block h-4 w-4 text-text-muted transition-transform",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-navy-800 border border-border-default shadow-xl shadow-navy-950/50 animate-fade-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-subtle">
                      <p className="text-sm font-medium text-text-primary">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {user.email}
                      </p>
                      <span className="mt-1 inline-flex rounded-md bg-gold-500/15 border border-gold-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-500">
                        Administrator
                      </span>
                    </div>

                    <div className="border-t border-border-subtle py-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-navy-700 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
