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
          <p className="text-text-muted mt-1">
            {total} card{total !== 1 ? "s" : ""} issued
          </p>
        </div>
        <CardActions mode="header" accounts={accountOptions} />
      </div>

      {/* Content — card-per-card layout. Grid on desktop for density,
          single column on mobile for readable action buttons. Same
          overflow-free pattern as the accounts page. */}
      {serialized.length === 0 ? (
        <div className="glass glass-border rounded-xl">
          <EmptyState
            icon={Wallet}
            title="No cards issued"
            description="No cards have been issued yet. Create one to get started."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {serialized.map((card) => (
            <div
              key={card.id}
              className="glass glass-border rounded-xl overflow-hidden flex flex-col"
            >
              {/* Top row — card visual */}
              <div className="px-4 sm:px-6 py-4 border-b border-border-default flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                      card.type === "VISA"
                        ? "bg-blue-500/15 text-blue-400"
                        : "bg-orange-500/15 text-orange-400"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-primary font-mono text-sm break-all">
                      {maskCardNumber(card.lastFour)}
                    </p>
                    <p className="text-text-muted text-xs">
                      {card.type} · exp {card.expiryDate}
                    </p>
                  </div>
                </div>
                <StatusBadge status={card.status} />
              </div>

              {/* Details */}
              <div className="px-4 sm:px-6 py-4 space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">
                      Cardholder
                    </p>
                    <p className="text-text-primary font-medium truncate">
                      {card.cardholderName}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">
                      Account Owner
                    </p>
                    <p className="text-text-primary text-sm truncate">
                      {card.account.user.firstName} {card.account.user.lastName}
                    </p>
                    <p className="text-text-muted text-xs font-mono truncate">
                      {card.account.accountNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">
                      Daily Limit
                    </p>
                    <p className="text-text-primary font-semibold">
                      {formatCurrency(card.dailyLimit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">
                      Issued
                    </p>
                    <p className="text-text-muted text-xs">
                      {formatDate(card.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons — always visible, never clipped */}
              <div className="px-4 sm:px-6 py-4 border-t border-border-default/50 bg-navy-900/20">
                <CardActions mode="row" card={card} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
  );
}
