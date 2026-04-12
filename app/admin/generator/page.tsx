import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Zap } from "lucide-react";
import GeneratorForm from "./GeneratorForm";

export const dynamic = "force-dynamic";

export default async function AdminGeneratorPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const accounts = await prisma.account.findMany({
    orderBy: [{ user: { firstName: "asc" } }, { createdAt: "desc" }],
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const serialized = accounts.map((a) => ({
    id: a.id,
    accountNumber: a.accountNumber,
    label: a.label,
    type: a.type,
    balance: Number(a.balance),
    currency: a.currency,
    userName: `${a.user.firstName} ${a.user.lastName}`,
    displayLabel: `${a.user.firstName} ${a.user.lastName} — ${a.accountNumber} (${formatCurrency(Number(a.balance), a.currency)})`,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
            <Zap className="h-5 w-5 text-navy-950" />
          </div>
          Transaction Generator
        </h1>
        <p className="text-text-muted mt-1">Generate realistic transaction history for testing and demonstration</p>
      </div>

      <GeneratorForm accounts={serialized} />
    </div>
  );
}
