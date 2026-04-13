import Link from "next/link";
import { ArrowRight, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Layered background system ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Layer 1: Deep navy-black gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />

        {/* Layer 2: Cinematic radial lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 h-[900px] w-[900px] rounded-full bg-gradient-to-b from-gold-500/[0.07] to-transparent blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-navy-600/20 blur-[100px]" />
        <div className="absolute top-1/3 left-0 h-[400px] w-[400px] rounded-full bg-gold-600/[0.03] blur-[80px]" />

        {/* Layer 3: Subtle noise / grid texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(212,185,110,0.4) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Layer 4: Vignette edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,8,17,0.7)_100%)]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/[0.06] px-4 py-1.5 mb-8">
            <div className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-[pulse-gold_2s_infinite]" />
            <span className="text-xs font-medium tracking-wider text-gold-400">
              TRUSTED BY 1.2M+ CLIENTS WORLDWIDE
            </span>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-in mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Banking built for{" "}
            <span className="gold-text">the modern world</span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-in mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg" style={{ animationDelay: "0.1s" }}>
            Experience premium digital banking with institutional-grade security,
            real-time analytics, and seamless global transfers.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: "0.2s" }}>
            <Link
              href="/register"
              className="gold-gradient group inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-semibold text-navy-950 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/25"
            >
              Open Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 rounded-xl border border-border-default bg-navy-900/50 px-8 py-3.5 text-sm font-medium text-text-secondary backdrop-blur-sm transition-all duration-300 hover:border-gold-500/30 hover:text-gold-400"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* ── Banking Dashboard Preview ── */}
        <div className="animate-fade-in-up mt-20 mx-auto max-w-5xl" style={{ animationDelay: "0.35s" }}>
          <div className="relative">
            {/* Glow behind dashboard */}
            <div className="absolute -inset-4 rounded-3xl bg-gold-500/[0.04] blur-2xl" />

            {/* Main dashboard card */}
            <div className="relative rounded-2xl border border-border-default/60 bg-navy-800/50 p-6 backdrop-blur-xl sm:p-8">
              {/* Dashboard header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-medium tracking-wider text-text-muted uppercase">Total Balance</p>
                  <p className="mt-1.5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                    $284,739<span className="text-xl text-text-muted">.20</span>
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                  <span className="text-xs font-semibold text-success">+12.4%</span>
                </div>
              </div>

              {/* Dashboard grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Income/Expense mini chart */}
                <div className="col-span-1 sm:col-span-2 rounded-xl border border-border-subtle bg-navy-900/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-medium tracking-wider text-text-muted uppercase">Monthly Overview</p>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
                        <span className="h-2 w-2 rounded-full bg-gold-500" /> Income
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
                        <span className="h-2 w-2 rounded-full bg-navy-500" /> Expense
                      </span>
                    </div>
                  </div>
                  {/* Bar chart */}
                  <div className="flex items-end gap-3 h-32">
                    {[
                      [75, 45], [60, 35], [85, 50], [70, 40],
                      [90, 55], [80, 48], [95, 42], [72, 38],
                    ].map(([income, expense], i) => (
                      <div key={i} className="flex-1 flex items-end gap-1 h-full">
                        <div
                          className="flex-1 rounded-t bg-gradient-to-t from-gold-600/70 to-gold-400/90 transition-all duration-500"
                          style={{ height: `${income}%` }}
                        />
                        <div
                          className="flex-1 rounded-t bg-navy-500/50 transition-all duration-500"
                          style={{ height: `${expense}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent transactions */}
                <div className="rounded-xl border border-border-subtle bg-navy-900/50 p-5">
                  <p className="text-xs font-medium tracking-wider text-text-muted uppercase mb-4">Recent</p>
                  <div className="space-y-3.5">
                    {[
                      { name: "Apple Inc.", amount: "-$249.99", type: "out" },
                      { name: "Salary Deposit", amount: "+$8,500", type: "in" },
                      { name: "Netflix", amount: "-$15.99", type: "out" },
                      { name: "Transfer In", amount: "+$1,200", type: "in" },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                            tx.type === "in"
                              ? "bg-success/10 text-success"
                              : "bg-navy-700 text-text-muted"
                          }`}>
                            {tx.type === "in" ? (
                              <ArrowDownLeft className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                          </div>
                          <span className="text-xs text-text-secondary">{tx.name}</span>
                        </div>
                        <span className={`text-xs font-medium ${
                          tx.type === "in" ? "text-success" : "text-text-primary"
                        }`}>
                          {tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trust bar ── */}
        <div className="animate-fade-in mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6" style={{ animationDelay: "0.5s" }}>
          {[
            { value: "$84B+", label: "Assets Managed" },
            { value: "160+", label: "Countries" },
            { value: "99.99%", label: "Uptime" },
            { value: "1.2M+", label: "Clients" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-lg font-bold tracking-tight text-text-primary sm:text-xl">{stat.value}</p>
              <p className="mt-0.5 text-[11px] tracking-wider text-text-muted uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
