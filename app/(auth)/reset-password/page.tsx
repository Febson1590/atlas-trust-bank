"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold-500" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(
          result.error || "Failed to reset password. The link may have expired."
        );
        return;
      }

      setIsSuccess(true);

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="glass glass-border rounded-2xl p-6 sm:p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6 text-success" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary">
          Password Reset Successful
        </h2>
        <p className="text-text-secondary text-sm mt-3 leading-relaxed">
          Your password has been updated. You&apos;ll be redirected to the login
          page shortly.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="block w-full text-center gold-gradient text-navy-900 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  // No token state
  if (!token) {
    return (
      <div className="glass glass-border rounded-2xl p-6 sm:p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-error" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary">
          Invalid Reset Link
        </h2>
        <p className="text-text-secondary text-sm mt-3 leading-relaxed">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/forgot-password"
            className="block w-full text-center gold-gradient text-navy-900 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition"
          >
            Request New Link
          </Link>
          <Link
            href="/login"
            className="block w-full text-center bg-navy-700 border border-border-default text-text-primary font-medium py-3 px-6 rounded-lg hover:bg-navy-600 transition"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass glass-border rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-gold-500" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary">
          Set New Password
        </h2>
        <p className="text-text-secondary text-sm mt-2">
          Pick a new password for your account
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-6 bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-error text-sm flex items-start gap-2">
          <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-error" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Hidden token field */}
        <input type="hidden" {...register("token")} />

        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter new password"
              {...register("password")}
              className="w-full bg-navy-800 border border-border-default rounded-lg pl-10 pr-11 py-3 text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-error">
              {errors.password.message}
            </p>
          )}
          {/* Password requirements */}
          <div className="mt-2 flex items-start gap-1.5 text-text-muted">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed">
              Min 8 characters with uppercase, lowercase, number, and special
              character
            </p>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm new password"
              {...register("confirmPassword")}
              className="w-full bg-navy-800 border border-border-default rounded-lg pl-10 pr-11 py-3 text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-error">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full gold-gradient text-navy-900 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              Reset Password
            </>
          )}
        </button>
      </form>

      {/* Back to login */}
      <p className="mt-6 text-center text-sm text-text-secondary">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-gold-500 hover:text-gold-400 font-medium transition"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
