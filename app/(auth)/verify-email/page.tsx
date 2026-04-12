"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, RotateCcw, Mail } from "lucide-react";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold-500" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Start cooldown on mount (code was just sent)
  useEffect(() => {
    setCooldown(RESEND_COOLDOWN);
  }, []);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last digit
    setOtp(newOtp);

    // Auto-advance
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;

    const newOtp = [...otp];
    for (let i = 0; i < text.length; i++) {
      newOtp[i] = text[i];
    }
    setOtp(newOtp);

    // Focus the next empty or last input
    const focusIndex = Math.min(text.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const submitOtp = useCallback(async (code: string) => {
    setServerError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Invalid verification code");
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }, [email, router]);

  // Auto-submit when all digits filled
  useEffect(() => {
    const code = otp.join("");
    if (code.length === OTP_LENGTH && !isSubmitting) {
      submitOtp(code);
    }
  }, [otp, isSubmitting, submitOtp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setServerError("Please enter the full 6-digit code");
      return;
    }
    submitOtp(code);
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setServerError("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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

  // Mask email for display
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_m, start, middle, end) => {
        return start + "*".repeat(Math.min(middle.length, 5)) + end;
      })
    : "";

  return (
    <div className="glass glass-border rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-gold-500" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary">
          Verify Your Email
        </h2>
        <p className="text-text-secondary text-sm mt-2">
          We sent a 6-digit code to{" "}
          <span className="text-text-primary font-medium">{maskedEmail}</span>
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-6 bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-error text-sm flex items-start gap-2">
          <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-error" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Inputs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isSubmitting}
              className="w-11 h-13 sm:w-13 sm:h-14 bg-navy-800 border border-border-default rounded-lg text-center text-xl font-semibold text-text-primary placeholder-text-muted focus:border-gold-500 focus:outline-none transition disabled:opacity-50"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || otp.join("").length !== OTP_LENGTH}
          className="w-full gold-gradient text-navy-900 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Verify Email
            </>
          )}
        </button>
      </form>

      {/* Resend */}
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
