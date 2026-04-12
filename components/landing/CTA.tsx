import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative bg-navy-900 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-gold-500/20 bg-navy-800/60 px-8 py-16 text-center sm:px-16 lg:py-20">
          {/* Background glow inside the card */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-gold-500/[0.06] blur-[80px]" />
          </div>

          {/* Subtle border glow */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl gold-glow" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Ready to Experience{" "}
              <span className="gold-text">Premium Banking</span>?
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
              Join thousands of clients who trust Atlas Trust Bank for their
              financial future. Open an account in minutes and gain access to
              world-class financial services.
            </p>

            <div className="mt-10">
              <Link
                href="/register"
                className="gold-gradient inline-flex items-center gap-2 rounded-lg px-10 py-4 text-sm font-semibold text-navy-950 transition-all hover:opacity-90"
              >
                Open Your Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
