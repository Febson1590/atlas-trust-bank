"use client";

import { useState } from "react";
import { ChevronDown, Landmark } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import AccountActions from "../accounts/AccountActions";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Account {
  id: string;
  accountNumber: string;
  type: string;
  label: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: string;
  user: User;
}

/**
 * One user = one collapsible card. Header shows the user at a glance
 * (name, email, account count, mix of statuses). Clicking the header
 * expands the card to reveal each account inline with its Credit /
 * Debit / status buttons.
 *
 * Why this shape:
 *   - The old design (one card per account) created 4+ cards per user
 *     which felt repetitive and made the page infinite on mobile.
 *   - A dropdown-to-pick-account (as user suggested) would re-introduce
 *     the same clipping bug that bit us on the old /admin/accounts page.
 *   - Grouping by user + inline account rows keeps everything reachable
 *     in the document flow, no floating menus, no clipping.
 */
export default function UserAccountsGroup({
  user,
  accounts,
  defaultOpen = false,
}: {
  user: User;
  accounts: Account[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  // Build a short per-currency summary for the collapsed header.
  // "$629K + €74K + £34K + ₿1.2" is more informative than "4 accounts"
  // but we cap at 3 chips so the header stays readable on mobile.
  const byCurrency = accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.currency] = (acc[a.currency] || 0) + a.balance;
    return acc;
  }, {});
  const currencyChips = Object.entries(byCurrency).slice(0, 3);

  // Status distribution — for the collapsed header, show the unique set
  // of statuses across this user's accounts so admins can spot frozen /
  // restricted / dormant without expanding.
  const uniqueStatuses = Array.from(new Set(accounts.map((a) => a.status)));

  return (
    <div className="glass glass-border rounded-xl overflow-hidden">
      {/* Header — click to toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left flex items-center justify-between gap-3 px-4 sm:px-6 py-4 hover:bg-navy-800/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 border border-border-default flex-shrink-0">
            <span className="text-sm font-semibold gold-text">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-text-primary font-medium truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-text-muted text-xs truncate">{user.email}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-text-muted">
                {accounts.length} account{accounts.length !== 1 ? "s" : ""}
              </span>
              {currencyChips.map(([currency, total]) => (
                <span
                  key={currency}
                  className="text-[11px] px-1.5 py-0.5 rounded bg-navy-800 text-text-secondary font-mono"
                >
                  {formatCurrency(total, currency)}
                </span>
              ))}
              {Object.keys(byCurrency).length > 3 && (
                <span className="text-[11px] text-text-muted">
                  +{Object.keys(byCurrency).length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {uniqueStatuses.length === 1 ? (
            <StatusBadge status={uniqueStatuses[0]} />
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted px-2 py-1 rounded-md bg-navy-800 border border-border-default">
              Mixed
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-text-muted transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded — each account as its own row with inline action buttons */}
      {open && (
        <div className="border-t border-border-default divide-y divide-border-default/50">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="px-4 sm:px-6 py-4 bg-navy-900/20 space-y-3"
            >
              {/* Account header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 border border-border-default flex-shrink-0">
                    <Landmark className="h-3.5 w-3.5 text-gold-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-primary font-mono text-xs break-all">
                      {account.accountNumber}
                    </p>
                    <p className="text-[11px] text-text-muted capitalize">
                      {account.type.toLowerCase()} · Created{" "}
                      {formatDate(account.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={account.status} />
              </div>

              {/* Balance */}
              <div className="rounded-lg bg-navy-900/50 border border-border-default px-3 py-2">
                <p className="text-[11px] text-text-muted uppercase tracking-wider">
                  Balance
                </p>
                <p className="text-text-primary font-semibold text-base">
                  {formatCurrency(account.balance, account.currency)}
                </p>
              </div>

              {/* Action buttons — delegated to AccountActions */}
              <AccountActions mode="row" account={account} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
