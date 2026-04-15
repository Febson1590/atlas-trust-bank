import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransferWizard from "@/components/dashboard/TransferWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transfer Funds",
};

export default async function TransferPage() {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  // ── Fetch user with KYC status ─────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      firstName: true,
      kycStatus: true,
      transferPin: true,
      accounts: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          accountNumber: true,
          label: true,
          balance: true,
          currency: true,
          type: true,
        },
      },
      beneficiaries: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          bankName: true,
          accountNumber: true,
          routingNumber: true,
          swiftCode: true,
          country: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  // ── KYC Check ──────────────────────────────────────────────
  if (user.kycStatus !== "VERIFIED") {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Transfer Funds</h2>
          <p className="text-sm text-text-muted mt-1">
            Send money securely to any account
          </p>
        </div>

        <div className="rounded-xl bg-navy-800 border border-warning/20 p-8">
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 border border-warning/20 mb-4">
              <ShieldAlert className="h-7 w-7 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Identity Verification Required
            </h3>
            <p className="text-sm text-text-muted mb-6">
              You need to complete your KYC verification before you can make
              transfers. This helps us keep your account secure and comply with
              regulations.
            </p>
            <Link
              href="/dashboard/kyc"
              className="gold-gradient rounded-lg px-6 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90"
            >
              Complete Verification
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Check for dormant accounts ─────────────────────────────
  if (user.accounts.length === 0) {
    // Check if user has dormant accounts
    const dormantCount = await prisma.account.count({
      where: { userId: session.userId, status: "DORMANT" },
    });

    const isDormant = dormantCount > 0;

    // Find when accounts became dormant (earliest updatedAt)
    const dormantAccount = isDormant
      ? await prisma.account.findFirst({
          where: { userId: session.userId, status: "DORMANT" },
          select: { updatedAt: true },
          orderBy: { updatedAt: "asc" },
        })
      : null;

    const dormantDays = dormantAccount
      ? Math.floor((Date.now() - new Date(dormantAccount.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Transfer Funds</h2>
          <p className="text-sm text-text-muted mt-1">
            Send money securely to any account
          </p>
        </div>

        <div className={`rounded-xl bg-navy-800 border ${isDormant ? "border-warning/20" : "border-border-subtle"} p-8`}>
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${isDormant ? "bg-warning/10 border border-warning/20" : "bg-navy-700 border border-border-subtle"} mb-4`}>
              <AlertTriangle className={`h-7 w-7 ${isDormant ? "text-warning" : "text-text-muted"}`} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {isDormant ? "Account Dormant" : "No Active Accounts"}
            </h3>
            <p className="text-sm text-text-muted mb-6">
              {isDormant
                ? `Your account is currently dormant. It has been inactive for ${dormantDays} ${dormantDays === 1 ? "day" : "days"}. Please contact support to reactivate your account.`
                : "You need at least one active account to make a transfer. Please contact support to set up your account."}
            </p>
            <Link
              href="/dashboard/support"
              className="gold-gradient rounded-lg px-6 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Serialize for client component ─────────────────────────
  const accounts = user.accounts.map((acc) => ({
    id: acc.id,
    accountNumber: acc.accountNumber,
    label: acc.label,
    balance: Number(acc.balance),
    currency: acc.currency,
    type: acc.type,
  }));

  const beneficiaries = user.beneficiaries.map((b) => ({
    id: b.id,
    name: b.name,
    bankName: b.bankName,
    accountNumber: b.accountNumber,
    routingNumber: b.routingNumber,
    swiftCode: b.swiftCode,
    country: b.country,
  }));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Transfer Funds</h2>
        <p className="text-sm text-text-muted mt-1">
          Send money securely to any account
        </p>
      </div>

      <TransferWizard accounts={accounts} beneficiaries={beneficiaries} hasTransferPin={!!user.transferPin} />
    </div>
  );
}
