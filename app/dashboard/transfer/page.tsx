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

  // ── No active accounts — check if dormant ones exist ───────
  if (user.accounts.length === 0) {
    // Load ALL accounts (including dormant) so user can fill the form
    const allAccounts = await prisma.account.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, accountNumber: true, label: true, balance: true, currency: true, type: true },
    });

    if (allAccounts.length === 0) {
      // Truly no accounts at all
      return (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Transfer Funds</h2>
            <p className="text-sm text-text-muted mt-1">Send money securely to any account</p>
          </div>
          <div className="rounded-xl bg-navy-800 border border-border-subtle p-8">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-700 border border-border-subtle mb-4">
                <AlertTriangle className="h-7 w-7 text-text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No Accounts</h3>
              <p className="text-sm text-text-muted mb-6">You need an account to make transfers. Contact support to get started.</p>
              <Link href="/dashboard/support" className="gold-gradient rounded-lg px-6 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90">Contact Support</Link>
            </div>
          </div>
        </div>
      );
    }

    // Has dormant accounts — let user fill the form; it will fail at submission
    const accounts = allAccounts.map((acc) => ({
      id: acc.id, accountNumber: acc.accountNumber, label: acc.label,
      balance: Number(acc.balance), currency: acc.currency, type: acc.type,
    }));
    const beneficiaries = user.beneficiaries.map((b) => ({
      id: b.id, name: b.name, bankName: b.bankName, accountNumber: b.accountNumber,
      routingNumber: b.routingNumber, swiftCode: b.swiftCode, country: b.country,
    }));

    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Transfer Funds</h2>
          <p className="text-sm text-text-muted mt-1">Send money securely to any account</p>
        </div>
        <TransferWizard accounts={accounts} beneficiaries={beneficiaries} hasTransferPin={!!user.transferPin} />
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
