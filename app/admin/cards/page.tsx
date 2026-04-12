import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate, maskCardNumber } from "@/lib/utils";
import { CreditCard, Wallet } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import CardActions from "./CardActions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminCardsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const [cards, total, allAccounts] = await Promise.all([
    prisma.card.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        account: {
          select: {
            id: true,
            accountNumber: true,
            label: true,
            type: true,
            currency: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.card.count(),
    prisma.account.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        accountNumber: true,
        label: true,
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { user: { firstName: "asc" } },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const serialized = cards.map((c) => ({
    id: c.id,
    accountId: c.accountId,
    type: c.type,
    lastFour: c.lastFour,
    expiryDate: c.expiryDate,
    cardholderName: c.cardholderName,
    status: c.status,
    dailyLimit: Number(c.dailyLimit),
    createdAt: c.createdAt.toISOString(),
    account: c.account,
  }));

  const accountOptions = allAccounts.map((a) => ({
    id: a.id,
    label: `${a.user.firstName} ${a.user.lastName} — ${a.accountNumber}`,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
              <CreditCard className="h-5 w-5 text-navy-950" />
            </div>
            Cards Management
          </h1>
          <p className="text-text-muted mt-1">{total} card{total !== 1 ? "s" : ""} issued</p>
        </div>
        <CardActions mode="header" accounts={accountOptions} />
      </div>

      {/* Table */}
      {serialized.length === 0 ? (
        <div className="glass glass-border rounded-xl">
          <EmptyState
            icon={Wallet}
            title="No cards issued"
            description="No cards have been issued yet. Create one to get started."
          />
        </div>
      ) : (
        <div className="glass glass-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Card Number</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Type</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Cardholder</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Account</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Status</th>
                  <th className="text-right px-6 py-4 text-text-muted font-medium">Daily Limit</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Expiry</th>
                  <th className="text-right px-6 py-4 text-text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {serialized.map((card) => (
                  <tr key={card.id} className="hover:bg-navy-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-text-primary">{maskCardNumber(card.lastFour)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                        card.type === "VISA" ? "text-blue-400" : "text-orange-400"
                      }`}>
                        <CreditCard className="h-3.5 w-3.5" />
                        {card.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-primary">{card.cardholderName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-text-primary text-sm">
                          {card.account.user.firstName} {card.account.user.lastName}
                        </p>
                        <p className="text-text-muted text-xs font-mono">{card.account.accountNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={card.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-text-primary">
                        {formatCurrency(card.dailyLimit)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-muted font-mono text-sm">{card.expiryDate}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CardActions mode="row" card={card} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border-default">
              <p className="text-sm text-text-muted">
                Showing {skip + 1}–{Math.min(skip + limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <a
                    href={`/admin/cards?page=${page - 1}`}
                    className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
                  >
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/admin/cards?page=${page + 1}`}
                    className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
