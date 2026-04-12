"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.requiresVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
          return;
        }
        setServerError(result.error || "Invalid email or password");
        return;
      }

      // Redirect based on role
      if (result.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="glass glass-border rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-text-primary">
          Welcome Back
        </h2>
        <p className="text-text-secondary text-sm mt-2">
          Sign in to your account to continue
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
            <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-secondary"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-gold-500 hover:text-gold-400 transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
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
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-gold-500 hover:text-gold-400 font-medium transition"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
