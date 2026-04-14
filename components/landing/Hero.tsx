import Link from "next/link";
import { Wifi } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#020508]">
      {/* ── Full-width background layers ── */}

      {/* Far-right gold glow (soft, diffused) */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "-20%",
          right: "-20%",
          width: "75%",
          height: "110%",
          background:
            "radial-gradient(ellipse at 85% 40%, rgba(160,120,35,0.12) 0%, rgba(130,90,20,0.04) 45%, transparent 75%)",
        }}
      />
      {/* Secondary glow (mid-far right, lower) */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "30%",
          right: "-5%",
          width: "45%",
          height: "50%",
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(197,165,90,0.06) 0%, transparent 65%)",
        }}
      />
      {/* Left dark anchor — keeps text readable */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "0",
          left: "0",
          width: "60%",
          height: "100%",
          background:
            "linear-gradient(to right, rgba(2,5,8,0.95) 0%, rgba(2,5,8,0.6) 50%, transparent 100%)",
        }}
      />
      {/* Bottom blend into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950 to-transparent" />

      {/* Subtle dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #c5a55a 0.6px, transparent 0.6px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Fine horizontal rules (right side depth, desktop) */}
      <div
        className="pointer-events-none absolute hidden lg:block opacity-[0.025]"
        style={{
          top: "8%",
          right: "0",
          width: "40%",
          height: "84%",
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 43px, rgba(197,165,90,0.25) 43px, rgba(197,165,90,0.25) 44px)",
        }}
      />

      {/* Bokeh particles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute h-1 w-1 rounded-full bg-gold-400/20 animate-float" style={{ top: "20%", right: "30%", filter: "blur(1px)" }} />
        <div className="absolute h-1.5 w-1.5 rounded-full bg-gold-500/12 animate-float-slow" style={{ top: "45%", right: "20%", filter: "blur(2px)" }} />
        <div className="absolute h-0.5 w-0.5 rounded-full bg-gold-300/30 animate-float-delayed" style={{ top: "14%", right: "45%", filter: "blur(0.5px)" }} />
        <div className="absolute h-1 w-1 rounded-full bg-gold-400/15 animate-float-slow" style={{ top: "60%", right: "38%", filter: "blur(1.5px)" }} />
      </div>

      {/* ── Content container ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center gap-8 pb-16 pt-28 sm:gap-10 sm:pb-24 sm:pt-36 lg:flex-row lg:gap-14 lg:pb-28 lg:pt-40">

          {/* ── Left: Text ── */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <span className="inline-block mb-4 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-gold-400">
              Secure Digital Banking
            </span>

            <h1 className="text-[1.65rem] font-bold leading-[1.12] tracking-tight text-text-primary sm:text-4xl md:text-5xl lg:text-[3.4rem] font-display italic">
              Banking Without Limits.
              <br />
              <span className="gold-text">
                Fast, secure,
                <br className="hidden sm:block" />
                {" "}and in your control.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-secondary/80 sm:text-base sm:mt-5 lg:mx-0 lg:text-lg">
              Secure digital banking designed for confidence and control.
              Manage accounts, send transfers, and track your finances
              — all in one place.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/register"
                className="gold-gradient inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold text-navy-950 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/25"
              >
                Open an Account
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#features"
                className="glass glass-border inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-medium text-text-secondary transition-all duration-300 hover:border-gold-500/40 hover:text-gold-400"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* ── Right: Desktop card stack ── */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="relative w-[370px] h-[330px]">
              {/* Card glow */}
              <div className="absolute -inset-12 rounded-full bg-gold-500/[0.04] blur-[80px]" />

              {/* Back card */}
              <div
                className="absolute rounded-2xl border border-border-subtle shadow-2xl shadow-black/40"
                style={{
                  width: "290px", height: "180px", top: "28px", left: "0px",
                  transform: "rotate(-8deg)",
                  background: "linear-gradient(145deg, #0c1829 0%, #060e1a 60%, #0a1420 100%)",
                }}
              >
                <div className="p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-text-muted/60">Atlas Trust</p>
                  <div className="mt-7 h-5 w-7 rounded-sm border border-gold-500/20 bg-gold-500/10" />
                  <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-text-muted/50">**** **** **** 7392</p>
                </div>
              </div>

              {/* Middle card */}
              <div
                className="absolute rounded-2xl border border-border-default shadow-2xl shadow-black/50"
                style={{
                  width: "290px", height: "180px", top: "48px", left: "28px",
                  transform: "rotate(-3deg)",
                  background: "linear-gradient(145deg, #122240 0%, #0c1829 50%, #060e1a 100%)",
                }}
              >
                <div className="p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-text-muted/70">Atlas Trust</p>
                  <div className="mt-7 h-5 w-7 rounded-sm border border-gold-500/25 bg-gold-500/15" />
                  <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-text-muted/60">**** **** **** 5108</p>
                </div>
              </div>

              {/* Front card (gold) */}
              <div
                className="absolute rounded-2xl border border-gold-500/25 shadow-2xl shadow-black/60"
                style={{
                  width: "290px", height: "180px", top: "72px", left: "58px",
                  transform: "rotate(2deg)",
                  background: "linear-gradient(145deg, #c5a55a 0%, #a88a3e 35%, #d4b96e 65%, #8a6d2b 100%)",
                }}
              >
                <div className="p-4.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-navy-950/70">Atlas Trust</p>
                    <Wifi className="h-3.5 w-3.5 text-navy-950/40 rotate-90" />
                  </div>
                  <div className="mt-5 h-5.5 w-7.5 rounded-sm bg-navy-950/15 border border-navy-950/10" />
                  <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-navy-950/70">**** **** **** 4821</p>
                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <p className="text-[7px] uppercase text-navy-950/50">Cardholder</p>
                      <p className="text-[9px] font-semibold text-navy-950/80">Atlas Member</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] uppercase text-navy-950/50">Expires</p>
                      <p className="text-[9px] font-semibold text-navy-950/80">09/28</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating mini balance */}
              <div className="absolute glass glass-border rounded-xl px-3 py-2 animate-float-slow" style={{ top: "2px", right: "-18px" }}>
                <p className="text-[8px] font-medium text-text-muted">Balance</p>
                <p className="text-[13px] font-bold gold-text">$24,850</p>
                <div className="mt-0.5 flex items-center gap-1">
                  <div className="h-0 w-0 border-l-[2.5px] border-r-[2.5px] border-b-[4px] border-transparent border-b-success" />
                  <span className="text-[7px] font-medium text-success">+2.8%</span>
                </div>
              </div>

              {/* Floating mini chart */}
              <div className="absolute glass glass-border rounded-xl px-3 py-2 animate-float-delayed" style={{ bottom: "12px", left: "-12px" }}>
                <p className="text-[8px] font-medium text-text-muted">Portfolio</p>
                <div className="mt-1 flex items-end gap-1.5">
                  <svg width="52" height="20" viewBox="0 0 52 20" fill="none" className="text-gold-500">
                    <polyline points="0,15 8,12 16,17 24,8 32,11 40,4 52,2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[7px] font-semibold text-success">+12%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile: Phone mockup (smaller, faded bottom) ── */}
          <div className="flex justify-center lg:hidden">
            <div className="relative w-[175px] opacity-85">
              {/* Bottom fade mask */}
              <div className="absolute inset-x-0 bottom-0 h-20 z-10 bg-gradient-to-t from-[#020508] to-transparent rounded-b-[24px]" />
              <div className="rounded-[24px] border-2 border-border-default bg-navy-900 p-1.5 shadow-xl shadow-black/50">
                <div className="mx-auto mb-1.5 h-4 w-16 rounded-full bg-navy-950" />
                <div className="rounded-[18px] bg-navy-950 px-3 py-3 space-y-2.5">
                  <div>
                    <p className="text-[9px] text-text-muted">Good morning</p>
                    <p className="text-[11px] font-semibold text-text-primary">Welcome back</p>
                  </div>
                  <div className="rounded-lg bg-navy-800 border border-border-subtle p-2.5">
                    <p className="text-[8px] text-text-muted uppercase tracking-wider">Total Balance</p>
                    <p className="mt-0.5 text-base font-bold gold-text">$24,850.00</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <div className="h-0 w-0 border-l-[2.5px] border-r-[2.5px] border-b-[3.5px] border-transparent border-b-success" />
                      <span className="text-[8px] text-success">+2.8%</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-navy-800 border border-border-subtle p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[8px] text-text-muted">This week</p>
                      <p className="text-[8px] text-gold-400">+$1,240</p>
                    </div>
                    <svg className="w-full h-6" viewBox="0 0 160 24" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="mobileChartFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c5a55a" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="#030811" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,18 C20,16 40,14 60,11 C80,8 100,16 120,12 C140,8 150,4 160,3" fill="none" stroke="#c5a55a" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M0,18 C20,16 40,14 60,11 C80,8 100,16 120,12 C140,8 150,4 160,3 L160,24 L0,24 Z" fill="url(#mobileChartFill)" />
                    </svg>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    {["Send", "Add", "Cards", "More"].map((label) => (
                      <div key={label} className="flex flex-col items-center gap-0.5">
                        <div className="h-6 w-6 rounded-full bg-navy-800 border border-border-subtle flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-gold-500/25" />
                        </div>
                        <span className="text-[7px] text-text-muted">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mx-auto mt-1.5 h-0.5 w-12 rounded-full bg-text-muted/25" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
