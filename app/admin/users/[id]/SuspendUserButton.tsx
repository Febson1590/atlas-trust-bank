"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Ban, Loader2, X } from "lucide-react";
import {
  SUSPENSION_REASONS,
  isSuspensionReason,
  type SuspensionReason,
} from "@/lib/suspensionReasons";

function ConfirmButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Suspend User
    </button>
  );
}

export default function SuspendUserButton({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<SuspensionReason | "">("");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setReason("");
          setOpen(true);
        }}
        className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 px-4 py-2.5 text-sm font-medium text-warning transition-all hover:bg-warning/20"
      >
        <Ban className="h-4 w-4" />
        Suspend User
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <form
            action={action}
            className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-warning">
                <Ban className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Suspend User</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-4">
              The user will be signed out and blocked from signing in. They will
              see the message for the reason you pick.
            </p>

            <label
              htmlFor="suspend-reason"
              className="block text-xs font-medium text-text-secondary mb-2"
            >
              Reason for suspension
            </label>
            <select
              id="suspend-reason"
              name="reason"
              required
              value={reason}
              onChange={(e) =>
                setReason(isSuspensionReason(e.target.value) ? e.target.value : "")
              }
              className="w-full rounded-lg border border-border-default bg-navy-900 px-4 py-2.5 text-sm text-text-primary focus:border-gold-500 focus:outline-none transition-colors"
            >
              <option value="" disabled>
                Select a reason…
              </option>
              {(Object.keys(SUSPENSION_REASONS) as SuspensionReason[]).map((r) => (
                <option key={r} value={r}>
                  {SUSPENSION_REASONS[r].label}
                </option>
              ))}
            </select>

            {reason && (
              <div className="mt-4 rounded-lg bg-navy-900/60 border border-border-default px-4 py-3 text-sm text-text-secondary">
                <span className="font-medium text-text-primary">User will see:</span>{" "}
                {SUSPENSION_REASONS[reason].message}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
              >
                Cancel
              </button>
              <ConfirmButton disabled={!reason} />
            </div>
          </form>
        </div>
      )}
    </>
  );
}
