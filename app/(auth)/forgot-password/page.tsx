"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Failed to send reset link");
        return;
      }

      setIsSuccess(true);
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
          Check Your Email
        </h2>
        <p className="text-text-secondary text-sm mt-3 leading-relaxed">
          If an account exists for{" "}
          <span className="text-text-primary font-medium">
            {getValues("email")}
          </span>
          , we&apos;ve sent a password reset link. Please check your inbox and
          spam folder.
        </p>

        <div className="mt-8 space-y-3">
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
          <Lock className="w-6 h-6 text-gold-500" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary">
          Forgot Password?
        </h2>
        <p className="text-text-secondary text-sm mt-2">
          Type your email and we&apos;ll send you a link to reset it
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
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className="w-full bg-navy-800 border border-border-default rounded-lg pl-10 pr-4 py-3 text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-error">
              {errors.email.message}
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
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Reset Link
            </>
          )}
        </button>
      </form>

      {/* Back to login */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
