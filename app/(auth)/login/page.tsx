"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<LoginInput | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (otpStep) {
      inputRefs.current[0]?.focus();
    }
  }, [otpStep]);

  // ─── Credentials Submit ────────────────────────────────
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
        setServerError(result.error || "Invalid email or password");
        return;
      }

      // Email not verified — redirect to verify-email page
      if (result.data?.requiresVerification) {
        router.push(
          `/verify-email?email=${encodeURIComponent(result.data.email)}`
        );
        return;
      }

      // Login OTP required — switch to OTP step
      if (result.data?.requiresOTP) {
        setOtpEmail(result.data.email);
        setSavedCredentials(data);
        setOtpStep(true);
        setCooldown(RESEND_COOLDOWN);
        return;
      }

      // Direct login (shouldn't happen with 2FA, but handle gracefully)
      if (result.data?.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  // ─── OTP Handlers ──────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!text) return;
    const newOtp = [...otp];
    for (let i = 0; i < text.length; i++) {
      newOtp[i] = text[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(text.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const submitOtp = useCallback(
    async (code: string) => {
      setServerError("");
      setIsVerifying(true);

      try {
        const res = await fetch("/api/auth/verify-login-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: otpEmail, code }),
        });

        const result = await res.json();

        if (!res.ok) {
          setServerError(result.error || "Invalid verification code");
          setIsVerifying(false);
          return;
        }

        // Login successful — redirect
        if (result.data?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } catch {
        setServerError("Something went wrong. Please try again.");
        setIsVerifying(false);
      }
    },
    [otpEmail, router]
  );

  // Auto-submit when all OTP digits filled
  useEffect(() => {
    const code = otp.join("");
    if (code.length === OTP_LENGTH && !isVerifying && otpStep) {
      submitOtp(code);
    }
  }, [otp, isVerifying, otpStep, submitOtp]);

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setServerError("Please enter the full 6-digit code");
      return;
    }
    submitOtp(code);
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !savedCredentials) return;
    setIsResending(true);
    setServerError("");

    try {
      // Re-submit login to trigger a new OTP
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savedCredentials),
      });

      if (!res.ok) {
        const result = await res.json();
        setServerError(result.error || "Failed to resend code");
      } else {
        setCooldown(RESEND_COOLDOWN);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Mask email
  const maskedEmail = otpEmail
    ? otpEmail.replace(/(.{2})(.*)(@.*)/, (_m, start, middle, end) => {
        return start + "*".repeat(Math.min(middle.length, 5)) + end;
      })
    : "";

  // ─── OTP Step UI ───────────────────────────────────────
  if (otpStep) {
    return (
      <div className="glass glass-border rounded-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-gold-500" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary">
            Verify Your Identity
          </h2>
          <p className="text-text-secondary text-sm mt-2">
            We sent a 6-digit code to{" "}
            <span className="text-text-primary font-medium">{maskedEmail}</span>
          </p>
        </div>

        {serverError && (
          <div className="mb-6 bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-error text-sm flex items-start gap-2">
            <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-error" />
            {serverError}
          </div>
        )}

        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[index]}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                disabled={isVerifying}
                className="w-11 h-13 sm:w-13 sm:h-14 bg-navy-800 border border-border-default rounded-lg text-center text-xl font-semibold text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition disabled:opacity-50"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.join("").length !== OTP_LENGTH}
            className="w-full gold-gradient text-navy-900 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Verify &amp; Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            Didn&apos;t receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-gold-500 hover:text-gold-400 transition disabled:text-text-muted disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Resend in {cooldown}s
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Resend Code
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── Credentials Step UI ───────────────────────────────
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
