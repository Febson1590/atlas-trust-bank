import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Zap } from "lucide-react";
import GeneratorForm from "./GeneratorForm";

export const dynamic = "force-dynamic";

export default async function AdminGeneratorPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  // Fund-target users: every non-admin user. Ordered alphabetically so
  // the admin can find specific people quickly.
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      _count: { select: { accounts: true } },
    },
  });

  const serialized = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    accountCount: u._count.accounts,
    displayLabel: `${u.firstName} ${u.lastName} — ${u.email}`,
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
        <p className="text-text-muted mt-1">
          Fund a user with realistic transaction history. Enter total credit
          and total debit in USD; the generator distributes the final balance
          across their Primary Checking, EUR, GBP, and BTC accounts.
        </p>
      </div>

      <GeneratorForm users={serialized} />
    </div>
  );
}
