import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Validate session ──────────────────────────────────────
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // ── Fetch user ────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Handle restricted account states
  if (user.status === "SUSPENDED") {
    redirect("/login?error=suspended");
  }

  if (user.status === "FROZEN") {
    redirect("/login?error=frozen");
  }

  // ── Fetch unread notification count ───────────────────────
  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.id,
      read: false,
    },
  });

  // ── Render shell ──────────────────────────────────────────
  return (
    <DashboardShell
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }}
      unreadCount={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
