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
  // NOTE: we redirect with `?redirect=/dashboard` so that `proxy.ts` can
  // detect a bounce from a protected route and clear a stale session cookie,
  // instead of looping back here forever.
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  // ── Fetch user ────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatarUrl: true,
      status: true,
    },
  });

  if (!user) {
    redirect("/login?redirect=/dashboard");
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
        avatarUrl: user.avatarUrl,
      }}
      unreadCount={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
