"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Power, Loader2, X } from "lucide-react";

// Dormancy is applied to the whole user: every one of their accounts is
// set to DORMANT (or back to ACTIVE) together. The user can still sign in
// and see their accounts; outgoing transfers fail with the dormant notice.
export default function DormantUserButton({
  userId,
  userName,
  isDormant,
}: {
  userId: string;
  userName: string;
  isDormant: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus: isDormant ? "ACTIVE" : "DORMANT" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action failed");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const Icon = isDormant ? Power : Moon;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className={
          isDormant
            ? "flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-2.5 text-sm font-medium text-success transition-all hover:bg-success/20"
            : "flex items-center gap-2 rounded-lg bg-navy-600/30 border border-navy-600/40 px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-navy-600/50"
        }
      >
        <Icon className="h-4 w-4" />
        {isDormant ? "Remove Dormant" : "Set Dormant"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />
          <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-text-primary">
                <Icon className="h-5 w-5 text-gold-500" />
                <h3 className="text-lg font-semibold">
                  {isDormant ? "Remove Dormant" : "Set User Dormant"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !loading && setOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-5">
              {isDormant
                ? `All of ${userName}'s accounts will be reactivated. They will be able to send money again.`
                : `All of ${userName}'s accounts will be marked dormant. They can still sign in and see their balances, but any transfer they try to finalize will fail with a message that the account is dormant due to inactivity.`}
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-error/10 border border-error/20 px-4 py-2.5 text-sm text-error">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={loading}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold gold-gradient text-navy-950 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDormant ? "Remove Dormant" : "Set Dormant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
