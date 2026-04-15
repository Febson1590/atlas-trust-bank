"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations";

/**
 * Public contact form. Posts to /api/contact which is unauthenticated,
 * rate-limited by IP, and forwards to the support inbox via Resend.
 */
export default function ContactForm() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    setServerError("");
    setSuccessMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || "Something went wrong. Please try again.");
        return;
      }
      setSuccessMessage(
        result.data?.message ||
          "Thanks — your message is on its way. We'll get back to you within one business day."
      );
      reset();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && (
        <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {serverError && (
        <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error flex items-start gap-2">
          <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-error" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          autoComplete="name"
          placeholder="Full name"
          {...register("name")}
          className="w-full rounded-lg border border-border-default bg-navy-800 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-error">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          className="w-full rounded-lg border border-border-default bg-navy-800 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-error">{errors.email.message}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          Subject
        </label>
        <input
          type="text"
          id="subject"
          placeholder="How can we help you?"
          {...register("subject")}
          className="w-full rounded-lg border border-border-default bg-navy-800 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
        />
        {errors.subject && (
          <p className="mt-1.5 text-xs text-error">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Tell us how we can help..."
          {...register("message")}
          className="w-full rounded-lg border border-border-default bg-navy-800 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors resize-none"
        />
        {errors.message && (
          <p className="mt-1.5 text-xs text-error">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="gold-gradient w-full rounded-lg px-6 py-3.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
