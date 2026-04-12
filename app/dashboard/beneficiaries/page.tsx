import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BeneficiaryList from "@/components/dashboard/BeneficiaryList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beneficiaries",
};

export default async function BeneficiariesPage() {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  // ── Fetch beneficiaries ────────────────────────────────────
  const beneficiaries = await prisma.beneficiary.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const serialized = beneficiaries.map((b) => ({
    id: b.id,
    name: b.name,
    bankName: b.bankName,
    accountNumber: b.accountNumber,
    routingNumber: b.routingNumber,
    swiftCode: b.swiftCode,
    country: b.country,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Beneficiaries</h2>
        <p className="text-sm text-text-muted mt-1">
          Manage your saved recipients for quick transfers
        </p>
      </div>

      <BeneficiaryList initialBeneficiaries={serialized} />
    </div>
  );
}
