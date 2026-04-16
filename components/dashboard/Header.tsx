"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface HeaderProps {
  title: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  onMenuToggle: () => void;
  unreadCount: number;
}

export default function Header({
  title,
  user,
  onMenuToggle,
  unreadCount,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const initials = getInitials(user.firstName, user.lastName);

  return (
    <header className="sticky top-0 z-20 glass glass-border">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-800 transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-lg font-semibold text-text-primary">
            {title}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <Link
            href="/dashboard/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-navy-800 transition-colors"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-gold-500/30"
                  unoptimized
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full gold-gradient text-sm font-bold text-navy-950 ring-2 ring-gold-500/30">
                  {initials}
                </div>
              )}
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
                {/* User info in dropdown */}
                <div className="px-4 py-3 border-b border-border-subtle">
                  <p className="text-sm font-medium text-text-primary">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {user.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-navy-700 hover:text-text-primary transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-navy-700 hover:text-text-primary transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
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
  );
}
