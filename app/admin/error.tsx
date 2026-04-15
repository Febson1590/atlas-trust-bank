"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

/**
 * Error boundary for the /admin segment.
 *
 * Keeps the AdminShell visible if any admin Server Component throws, and
 * shows the real error message in development so operators can diagnose
 * instead of hitting Next.js's generic error screen.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] page error:", error);
    if (error?.digest) {
      console.error("[admin] error digest:", error.digest);
    }
  }, [error]);

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-2xl bg-navy-800 border border-error/20 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-error" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary">
            Something went wrong
          </h2>
          <p className="text-text-secondary text-sm mt-2">
            An error occurred while loading this admin page. Try again or head
            back to the admin overview.
          </p>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <div className="mb-6 bg-error/10 border border-error/20 rounded-lg px-4 py-3 text-error text-xs font-mono break-words">
            <p className="font-semibold mb-1">{error?.name || "Error"}</p>
            <p className="opacity-80">{error?.message || "Unknown error"}</p>
            {error?.digest && (
              <p className="opacity-60 mt-1">digest: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 gold-gradient text-navy-950 font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/admin"
            className="flex-1 bg-navy-700 border border-border-subtle text-text-primary font-semibold py-3 px-6 rounded-lg hover:bg-navy-600 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Admin Home
          </Link>
        </div>
      </div>
    </div>
  );
}
