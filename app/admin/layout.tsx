import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel — Atlas Trust Bank",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Validate session ──────────────────────────────────────
  // Use `?redirect=/admin` so proxy.ts can detect the bounce and clear
  // a stale session cookie instead of looping forever.
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/admin");
  }

  // ── Fetch user ────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  // ── Admin role check ──────────────────────────────────────
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // ── Render admin shell ────────────────────────────────────
  return (
    <AdminShell
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }}
    >
      {children}
    </AdminShell>
  );
}
