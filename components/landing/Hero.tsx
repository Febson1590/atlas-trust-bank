import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  DollarSign,
  BarChart3,
  Globe,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-navy-900">
      {/* ── Background effects ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Radial gold glow — top right */}
        <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-gold-500/[0.04] blur-[120px]" />
        {/* Radial navy glow — bottom left */}
        <div className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-navy-600/30 blur-[100px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(197,165,90,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(197,165,90,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-32 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-0">
        {/* ── Left content ── */}
        <div className="animate-fade-in">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold-500">
            Established Trust Since 1987
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Global Banking{" "}
            <span className="gold-text">Excellence</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">
            Trusted financial services, connecting wealth globally. Experience
            premium banking with unparalleled security, personalized strategies,
            and worldwide access.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="gold-gradient inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90"
            >
              Open Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gold-500/40 px-8 py-3.5 text-sm font-medium text-gold-400 transition-all hover:border-gold-400 hover:bg-gold-500/10"
            >
              Learn More
            </Link>
          </div>

          {/* ── Trust bar ── */}
          <div className="mt-14 flex flex-wrap items-center gap-8 border-t border-border-subtle pt-8">
            <div>
              <p className="text-2xl font-bold text-text-primary">$84B+</p>
              <p className="text-xs text-text-muted">Assets Managed</p>
            </div>
            <div className="h-8 w-px bg-border-subtle" />
            <div>
              <p className="text-2xl font-bold text-text-primary">160+</p>
              <p className="text-xs text-text-muted">Countries Served</p>
            </div>
            <div className="h-8 w-px bg-border-subtle" />
            <div>
              <p className="text-2xl font-bold text-text-primary">1.2M</p>
              <p className="text-xs text-text-muted">Trusted Clients</p>
            </div>
          </div>
        </div>

        {/* ── Right decorative card (desktop) ── */}
        <div className="hidden lg:flex justify-center animate-fade-in">
          <div className="relative w-full max-w-md">
            {/* Glow behind card */}
            <div className="absolute -inset-4 rounded-2xl bg-gold-500/[0.06] blur-2xl" />

            {/* Main card */}
            <div className="relative rounded-2xl border border-gold-500/20 bg-navy-800/80 p-8 backdrop-blur-sm">
              {/* Card header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    Portfolio Overview
                  </p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">
                    $2,847,392
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/10">
                  <TrendingUp className="h-5 w-5 text-gold-400" />
                </div>
              </div>

              {/* Mock chart bars */}
              <div className="flex items-end gap-2 mb-8 h-28">
                {[40, 65, 50, 80, 60, 90, 75, 95, 70, 85, 92, 88].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-gold-600/60 to-gold-400/80"
                      style={{ height: `${h}%` }}
                    />
                  )
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 border-t border-border-subtle pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-gold-400" />
                    <span className="text-sm font-semibold text-text-primary">
                      12.4%
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-text-muted">Annual Return</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5 text-gold-400" />
                    <span className="text-sm font-semibold text-text-primary">
                      +8.2%
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-text-muted">This Quarter</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-gold-400" />
                    <span className="text-sm font-semibold text-text-primary">
                      24
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-text-muted">Active Markets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
