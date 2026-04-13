import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border-default to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-gold-500/15 bg-gradient-to-br from-navy-800/60 via-navy-800/40 to-navy-900/60 px-8 py-20 text-center sm:px-16 backdrop-blur-sm">
          {/* Interior glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[500px] rounded-full bg-gold-500/[0.06] blur-[100px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-32 w-[300px] rounded-full bg-gold-500/[0.03] blur-[60px]" />
          </div>

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to experience{" "}
              <span className="gold-text">premium banking</span>?
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-base text-text-secondary leading-relaxed">
              Open your account in minutes. No paperwork, no waiting — just
              modern banking that works.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="gold-gradient group inline-flex items-center gap-2.5 rounded-xl px-10 py-4 text-sm font-semibold text-navy-950 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/25"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-navy-900/50 px-8 py-4 text-sm font-medium text-text-secondary backdrop-blur-sm transition-all duration-300 hover:border-gold-500/30 hover:text-gold-400"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
