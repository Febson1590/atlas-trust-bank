"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, X, AlertCircle, CheckCircle2 } from "lucide-react";

// Two-step email change: new email + password → code sent to the new
// address → enter code. The new email becomes the login on success.
export default function ChangeEmail({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"details" | "code">("details");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function openModal() {
    setOpen(true);
    setStep("details");
    setNewEmail("");
    setPassword("");
    setCode("");
    setError("");
    setSuccess("");
  }

  function closeModal() {
    if (loading) return;
    setOpen(false);
  }

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send code");
        return;
      }
      setStep("code");
      setCode("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code");
        setCode("");
        return;
      }
      setOpen(false);
      setSuccess(`Email changed. Use ${data.data.email} to sign in from now on.`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg bg-navy-900 border border-border-subtle px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all";
  const labelClasses = "block text-xs font-medium text-text-muted mb-1.5";

  return (
    <div className="flex flex-col items-end min-w-0">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text-primary break-all text-right">
          {currentEmail}
        </span>
        <button
          type="button"
          onClick={openModal}
          className="shrink-0 rounded-lg bg-navy-700 border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-primary hover:border-gold-500/30 transition-all"
        >
          Change
        </button>
      </div>

      {success && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-text-primary">
                <Mail className="h-5 w-5 text-gold-500" />
                <h3 className="text-lg font-semibold">Change Email</h3>
              </div>
              <button
                onClick={closeModal}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-4 py-2.5">
                <AlertCircle className="h-4 w-4 text-error shrink-0" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {step === "details" ? (
              <form onSubmit={requestCode} className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Your new email will be used to sign in. We&apos;ll send a code to it to
                  make sure it&apos;s yours.
                </p>
                <div>
                  <label htmlFor="newEmail" className={labelClasses}>
                    New Email Address
                  </label>
                  <input
                    id="newEmail"
                    type="email"
                    autoComplete="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="emailChangePassword" className={labelClasses}>
                    Current Password
                  </label>
                  <input
                    id="emailChangePassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !newEmail || !password}
                  className="w-full gold-gradient rounded-lg px-6 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Code
                </button>
              </form>
            ) : (
              <form onSubmit={confirmCode} className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Enter the 6-digit code we sent to{" "}
                  <span className="text-text-primary font-medium">{newEmail}</span>.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className={`${inputClasses} text-center text-xl tracking-[0.5em] font-semibold`}
                  aria-label="Verification code"
                />
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full gold-gradient rounded-lg px-6 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm Change
                </button>
                <div className="flex justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("details");
                      setError("");
                    }}
                    disabled={loading}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    Use a different email
                  </button>
                  <button
                    type="button"
                    onClick={() => requestCode()}
                    disabled={loading}
                    className="text-gold-500 hover:text-gold-400 transition-colors"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
