import { redirect } from "next/navigation";
import { CreditCard, Wifi, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, maskCardNumber, cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import type { CardType, CardStatus } from "@/generated/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cards",
};

const cardGradients: Record<CardType, { bg: string; logo: string }> = {
  VISA: {
    bg: "from-navy-900 via-navy-800 to-navy-700",
    logo: "VISA",
  },
  MASTERCARD: {
    bg: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    logo: "MASTERCARD",
  },
};

const statusOverlay: Record<CardStatus, string> = {
  ACTIVE: "",
  FROZEN: "opacity-50 grayscale",
  CANCELLED: "opacity-40 grayscale",
};

export default async function CardsPage() {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  // ── Fetch cards through user's accounts ────────────────────
  const accounts = await prisma.account.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });

  const accountIds = accounts.map((a) => a.id);

  const cards =
    accountIds.length > 0
      ? await prisma.card.findMany({
          where: { accountId: { in: accountIds } },
          orderBy: { createdAt: "desc" },
          include: {
            account: {
              select: {
                id: true,
                accountNumber: true,
                label: true,
                type: true,
                currency: true,
                balance: true,
              },
            },
          },
        })
      : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Your Cards</h2>
        <p className="text-sm text-text-muted mt-1">
          Manage your debit and credit cards
        </p>
      </div>

      {/* ── Summary ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
            Total Cards
          </p>
          <p className="text-2xl font-bold text-text-primary">{cards.length}</p>
        </div>
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Active Cards
            </p>
          </div>
          <p className="text-2xl font-bold text-success">
            {cards.filter((c) => c.status === "ACTIVE").length}
          </p>
        </div>
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CreditCard className="h-3.5 w-3.5 text-gold-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Daily Limit
            </p>
          </div>
          <p className="text-2xl font-bold gold-text">
            {formatCurrency(
              cards
                .filter((c) => c.status === "ACTIVE")
                .reduce((sum, c) => sum + Number(c.dailyLimit), 0)
            )}
          </p>
        </div>
      </div>

      {/* ── Cards Grid ──────────────────────────────────────── */}
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((card) => {
            const gradient = cardGradients[card.type];
            const overlay = statusOverlay[card.status];
            const isInactive = card.status !== "ACTIVE";

            return (
              <div key={card.id} className="space-y-4">
                {/* ── Physical Card Visual ────────────────────── */}
                <div
                  className={cn(
                    "relative rounded-2xl bg-gradient-to-br p-6 aspect-[1.586/1] max-w-[420px] w-full overflow-hidden border border-border-subtle/50 shadow-xl shadow-navy-950/50 transition-all duration-300 hover:shadow-2xl hover:shadow-navy-950/70",
                    gradient.bg,
                    overlay
                  )}
                >
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/4" />

                  {/* Top row — chip + contactless + status */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      {/* Chip */}
                      <div className="w-10 h-7 rounded-md bg-gradient-to-br from-gold-400 to-gold-500 opacity-80 flex items-center justify-center">
                        <div className="w-6 h-4 rounded-sm border border-gold-500/40 bg-gold-400/50" />
                      </div>
                      <Wifi className="h-5 w-5 text-text-muted/50 rotate-90" />
                    </div>
                    {isInactive && (
                      <StatusBadge status={card.status} />
                    )}
                  </div>

                  {/* Card number */}
                  <div className="mt-6 sm:mt-8 relative z-10">
                    <p className="text-lg sm:text-xl font-mono tracking-[0.2em] text-text-primary/90">
                      {maskCardNumber(card.lastFour)}
                    </p>
                  </div>

                  {/* Bottom row — cardholder + expiry + logo */}
                  <div className="flex items-end justify-between mt-4 sm:mt-6 relative z-10">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted/60 mb-0.5">
                        Card Holder
                      </p>
                      <p className="text-sm font-semibold text-text-primary/90 uppercase tracking-wide">
                        {card.cardholderName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted/60 mb-0.5">
                        Expires
                      </p>
                      <p className="text-sm font-mono text-text-primary/90">
                        {card.expiryDate}
                      </p>
                    </div>
                    <div className="absolute bottom-0 right-0">
                      {card.type === "VISA" ? (
                        <span className="text-2xl font-bold italic text-white/70 tracking-wider">
                          VISA
                        </span>
                      ) : (
                        <div className="flex items-center -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-red-500/70" />
                          <div className="w-8 h-8 rounded-full bg-orange-400/70" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Card Details ─────────────────────────────── */}
                <div className="rounded-xl bg-navy-800 border border-border-subtle p-5 max-w-[420px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-text-primary">
                      Card Details
                    </span>
                    <StatusBadge status={card.status} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">Card Type</span>
                      <span className="text-xs font-medium text-text-secondary">
                        {card.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">
                        Linked Account
                      </span>
                      <span className="text-xs font-medium text-text-secondary">
                        {card.account.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">Daily Limit</span>
                      <span className="text-xs font-medium text-gold-500">
                        {formatCurrency(Number(card.dailyLimit))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">
                        Account Balance
                      </span>
                      <span className="text-xs font-medium text-text-secondary">
                        {formatCurrency(
                          Number(card.account.balance),
                          card.account.currency
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">
                        Account Type
                      </span>
                      <span className="text-xs font-medium text-text-secondary capitalize">
                        {card.account.type.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-navy-800 border border-border-subtle">
          <EmptyState
            icon={CreditCard}
            title="No cards yet"
            description="Cards are issued by your account manager. Contact support to request a new card."
            action={{ label: "Contact Support", href: "/dashboard/support" }}
          />
        </div>
      )}

      {/* ── Info Note ───────────────────────────────────────── */}
      {cards.length > 0 && (
        <div className="rounded-xl bg-navy-800/50 border border-border-subtle/50 px-5 py-4">
          <p className="text-xs text-text-muted">
            <span className="font-semibold text-text-secondary">Note:</span>{" "}
            Cards are managed by your account manager. To request a new card,
            increase your daily limit, or report a lost/stolen card, please{" "}
            <a
              href="/dashboard/support"
              className="text-gold-500 hover:text-gold-400 underline underline-offset-2 transition-colors"
            >
              contact support
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
