import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import SecurityForm from "./SecurityForm";

export const metadata: Metadata = {
  title: "Security",
};

export default async function SecurityPage() {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  // ── Fetch user info ────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Security</h2>
        <p className="text-sm text-text-muted mt-1">
          Manage your password and security settings
        </p>
      </div>

      <SecurityForm
        email={user.email}
        status={user.status}
        lastLoginAt={user.lastLoginAt?.toISOString() ?? null}
        createdAt={user.createdAt.toISOString()}
      />
    </div>
  );
}
