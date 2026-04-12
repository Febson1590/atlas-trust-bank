"use client";

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";

interface SecurityFormProps {
  email: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function SecurityForm({
  email,
  status,
  lastLoginAt,
  createdAt,
}: SecurityFormProps) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  }

  function toggleVisibility(field: "current" | "new" | "confirm") {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  // Client-side validation
  function validatePassword(): string | null {
    if (!form.currentPassword) return "Current password is required";
    if (!form.newPassword) return "New password is required";
    if (form.newPassword.length < 8)
      return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(form.newPassword))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(form.newPassword))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(form.newPassword))
      return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(form.newPassword))
      return "Password must contain at least one special character";
    if (form.newPassword !== form.confirmPassword)
      return "New passwords do not match";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to change password");
        return;
      }

      setSuccess("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg bg-navy-900 border border-border-subtle px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all pr-11";

  const labelClasses = "block text-xs font-medium text-text-muted mb-1.5";

  // Password strength indicator
  const strengthChecks = [
    { label: "At least 8 characters", test: form.newPassword.length >= 8 },
    { label: "One uppercase letter", test: /[A-Z]/.test(form.newPassword) },
    { label: "One lowercase letter", test: /[a-z]/.test(form.newPassword) },
    { label: "One number", test: /[0-9]/.test(form.newPassword) },
    {
      label: "One special character",
      test: /[^A-Za-z0-9]/.test(form.newPassword),
    },
  ];

  const passedChecks = strengthChecks.filter((c) => c.test).length;

  return (
    <div className="space-y-6">
      {/* ── Change Password ─────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-xl bg-navy-800 border border-border-subtle overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10">
                <Lock className="h-4.5 w-4.5 text-gold-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Change Password
                </h3>
                <p className="text-xs text-text-muted">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Status Messages */}
            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <p className="text-sm text-success">{success}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-error shrink-0" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className={labelClasses}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  className={inputClasses}
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className={labelClasses}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  className={inputClasses}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {form.newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all",
                          i <= passedChecks
                            ? passedChecks <= 2
                              ? "bg-error"
                              : passedChecks <= 4
                              ? "bg-warning"
                              : "bg-success"
                            : "bg-navy-700"
                        )}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {strengthChecks.map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            check.test ? "bg-success" : "bg-navy-600"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs",
                            check.test ? "text-success" : "text-text-muted"
                          )}
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className={labelClasses}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className={inputClasses}
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.confirmPassword &&
                form.newPassword !== form.confirmPassword && (
                  <p className="text-xs text-error mt-1.5">
                    Passwords do not match
                  </p>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="gold-gradient rounded-lg px-6 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Change Password
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── Security Information ─────────────────────────────── */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Shield className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Security Information
              </h3>
              <p className="text-xs text-text-muted">
                Overview of your account security
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border-subtle/30">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted">Last Login</span>
            </div>
            <span className="text-sm font-medium text-text-primary">
              {lastLoginAt
                ? new Date(lastLoginAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border-subtle/30">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted">Account Status</span>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted">
                Account Created
              </span>
            </div>
            <span className="text-sm font-medium text-text-primary">
              {new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Security Tips ───────────────────────────────────── */}
      <div className="rounded-xl bg-navy-800/50 border border-border-subtle/50 px-5 py-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-secondary">
              Security Tips
            </p>
            <ul className="space-y-1.5 text-xs text-text-muted">
              <li>
                Use a strong, unique password that you don't use on other
                websites
              </li>
              <li>
                Never share your password or OTP codes with anyone, including
                bank staff
              </li>
              <li>
                Always log out when using a shared or public computer
              </li>
              <li>
                Contact support immediately if you notice any unauthorized
                activity
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
