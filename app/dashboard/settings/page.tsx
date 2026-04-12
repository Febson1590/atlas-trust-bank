import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import SettingsForm from "./SettingsForm";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  // ── Fetch user profile ─────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      country: true,
      zipCode: true,
      kycStatus: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  const profile = {
    ...user,
    createdAt: user.createdAt.toISOString(),
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
        <p className="text-sm text-text-muted mt-1">
          Manage your personal information and account preferences
        </p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  );
}
