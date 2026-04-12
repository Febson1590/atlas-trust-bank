"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardShellProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  unreadCount: number;
  children: React.ReactNode;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/accounts": "Accounts",
  "/dashboard/transactions": "Transactions",
  "/dashboard/transfer": "Transfer",
  "/dashboard/beneficiaries": "Beneficiaries",
  "/dashboard/cards": "Cards",
  "/dashboard/kyc": "KYC Verification",
  "/dashboard/notifications": "Notifications",
  "/dashboard/settings": "Settings",
  "/dashboard/security": "Security",
  "/dashboard/support": "Support",
};

export default function DashboardShell({
  user,
  unreadCount,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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

  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <div className="min-h-screen bg-navy-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="lg:ml-[280px] flex flex-col min-h-screen">
        <Header
          title={title}
          user={user}
          onMenuToggle={() => setSidebarOpen(true)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
