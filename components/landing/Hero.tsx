import Link from "next/link";
import { Wifi } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#020508]">
      {/* ── Background layers ── */}

      {/* Primary right-side gold glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "-15%",
          right: "-10%",
          width: "70%",
          height: "90%",
          background:
            "radial-gradient(ellipse at 65% 35%, rgba(180,130,40,0.16) 0%, rgba(140,90,20,0.06) 40%, transparent 70%)",
        }}
      />
      {/* Secondary warm glow (mid-right) */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "20%",
          right: "5%",
          width: "40%",
          height: "50%",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(197,165,90,0.08) 0%, transparent 60%)",
        }}
      />
      {/* Left dark anchor */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "0%",
          left: "-5%",
          width: "55%",
          height: "100%",
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(3,8,17,0.9) 0%, transparent 70%)",
        }}
      />
      {/* Bottom gradient blend */}
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: "-10%",
          left: "0%",
          width: "100%",
          height: "40%",
          background:
            "radial-gradient(ellipse at 50% 90%, rgba(10,22,40,0.6) 0%, transparent 70%)",
        }}
      />

      {/* Dot grid overlay (subtle texture) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #c5a55a 0.7px, transparent 0.7px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Fine horizontal lines (right side depth) */}
      <div
        className="pointer-events-none absolute hidden lg:block opacity-[0.03]"
        style={{
          top: "10%",
          right: "0%",
          width: "45%",
          height: "80%",
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(197,165,90,0.3) 39px, rgba(197,165,90,0.3) 40px)",
        }}
      />

      {/* Ambient bokeh particles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute h-1 w-1 rounded-full bg-gold-400/25 animate-float" style={{ top: "18%", right: "28%", filter: "blur(1px)" }} />
        <div className="absolute h-1.5 w-1.5 rounded-full bg-gold-500/15 animate-float-slow" style={{ top: "40%", right: "18%", filter: "blur(2px)" }} />
        <div className="absolute h-0.5 w-0.5 rounded-full bg-gold-300/35 animate-float-delayed" style={{ top: "12%", right: "42%", filter: "blur(0.5px)" }} />
        <div className="absolute h-1 w-1 rounded-full bg-gold-400/20 animate-float-slow" style={{ top: "55%", right: "35%", filter: "blur(1.5px)" }} />
      </div>

      {/* Bottom section fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy-950 to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center gap-12 py-28 sm:py-32 lg:flex-row lg:gap-16 lg:py-40">

          {/* ── Left column: Text ── */}
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <span className="inline-block mb-5 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-gold-400">
              Secure Digital Banking
            </span>

            <h1 className="text-3xl font-bold leading-[1.08] tracking-tight text-text-primary sm:text-4xl md:text-5xl lg:text-[3.5rem] font-display italic">
              Banking Without Limits.
              <br />
              <span className="gold-text">
                Fast, Secure,
                <br className="hidden sm:block" />
                and in Your Control.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-text-secondary/80 sm:text-lg lg:mx-0">
              Secure digital banking designed for confidence and control. Manage
              accounts, send transfers, and track your finances — all in one place.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center lg:justify-start">
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

          {/* ── Right column: Desktop card stack ── */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="relative w-[380px] h-[340px]">
              {/* Ambient glow behind cards */}
              <div className="absolute -inset-10 rounded-full bg-gold-500/[0.05] blur-[70px]" />

              {/* Back card */}
              <div
                className="absolute rounded-2xl border border-border-subtle shadow-2xl shadow-black/40"
                style={{
                  width: "300px", height: "185px", top: "30px", left: "0px",
                  transform: "rotate(-8deg)",
                  background: "linear-gradient(145deg, #0c1829 0%, #060e1a 60%, #0a1420 100%)",
                }}
              >
                <div className="p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-text-muted/60">Atlas Trust</p>
                  <div className="mt-8 h-5 w-7 rounded-sm border border-gold-500/20 bg-gold-500/10" />
                  <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-text-muted/50">**** **** **** 7392</p>
                </div>
              </div>

              {/* Middle card */}
              <div
                className="absolute rounded-2xl border border-border-default shadow-2xl shadow-black/50"
                style={{
                  width: "300px", height: "185px", top: "50px", left: "30px",
                  transform: "rotate(-3deg)",
                  background: "linear-gradient(145deg, #122240 0%, #0c1829 50%, #060e1a 100%)",
                }}
              >
                <div className="p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-text-muted/70">Atlas Trust</p>
                  <div className="mt-8 h-5 w-7 rounded-sm border border-gold-500/25 bg-gold-500/15" />
                  <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-text-muted/60">**** **** **** 5108</p>
                </div>
              </div>

              {/* Front card (gold) */}
              <div
                className="absolute rounded-2xl border border-gold-500/25 shadow-2xl shadow-black/60"
                style={{
                  width: "300px", height: "185px", top: "75px", left: "60px",
                  transform: "rotate(2deg)",
                  background: "linear-gradient(145deg, #c5a55a 0%, #a88a3e 35%, #d4b96e 65%, #8a6d2b 100%)",
                }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-navy-950/70">Atlas Trust</p>
                    <Wifi className="h-4 w-4 text-navy-950/40 rotate-90" />
                  </div>
                  <div className="mt-6 h-6 w-8 rounded-sm bg-navy-950/15 border border-navy-950/10" />
                  <p className="mt-5 font-mono text-xs tracking-[0.2em] text-navy-950/70">**** **** **** 4821</p>
                  <div className="mt-2.5 flex items-end justify-between">
                    <div>
                      <p className="text-[8px] uppercase text-navy-950/50">Cardholder</p>
                      <p className="text-[10px] font-semibold text-navy-950/80">Atlas Member</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase text-navy-950/50">Expires</p>
                      <p className="text-[10px] font-semibold text-navy-950/80">09/28</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating mini balance */}
              <div className="absolute glass glass-border rounded-xl px-3.5 py-2.5 animate-float-slow" style={{ top: "5px", right: "-20px" }}>
                <p className="text-[9px] font-medium text-text-muted">Balance</p>
                <p className="text-sm font-bold gold-text">$24,850</p>
                <div className="mt-0.5 flex items-center gap-1">
                  <div className="h-0 w-0 border-l-[3px] border-r-[3px] border-b-[5px] border-transparent border-b-success" />
                  <span className="text-[8px] font-medium text-success">+2.8%</span>
                </div>
              </div>

              {/* Floating mini chart */}
              <div className="absolute glass glass-border rounded-xl px-3.5 py-2.5 animate-float-delayed" style={{ bottom: "10px", left: "-15px" }}>
                <p className="text-[9px] font-medium text-text-muted">Portfolio</p>
                <div className="mt-1 flex items-end gap-1.5">
                  <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className="text-gold-500">
                    <polyline points="0,18 10,15 20,20 30,10 40,13 50,5 60,3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[8px] font-semibold text-success">+12%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile visual: Phone mockup ── */}
          <div className="flex justify-center lg:hidden">
            <div className="relative w-[220px]">
              <div className="rounded-[28px] border-2 border-border-default bg-navy-900 p-2 shadow-2xl shadow-black/60">
                <div className="mx-auto mb-2 h-5 w-20 rounded-full bg-navy-950" />
                <div className="rounded-[20px] bg-navy-950 px-4 py-4 space-y-3">
                  <div>
                    <p className="text-[10px] text-text-muted">Good morning</p>
                    <p className="text-xs font-semibold text-text-primary">Welcome back</p>
                  </div>
                  <div className="rounded-xl bg-navy-800 border border-border-subtle p-3">
                    <p className="text-[9px] text-text-muted uppercase tracking-wider">Total Balance</p>
                    <p className="mt-1 text-lg font-bold gold-text">$24,850.00</p>
                    <div className="mt-1 flex items-center gap-1">
                      <div className="h-0 w-0 border-l-[3px] border-r-[3px] border-b-[4px] border-transparent border-b-success" />
                      <span className="text-[9px] text-success">+2.8% today</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-navy-800 border border-border-subtle p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] text-text-muted">This week</p>
                      <p className="text-[9px] text-gold-400">+$1,240</p>
                    </div>
                    <svg className="w-full h-8" viewBox="0 0 160 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="mobileChartFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c5a55a" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#030811" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,22 C15,20 30,18 45,15 C60,12 75,20 90,16 C105,12 120,8 135,10 C150,12 155,6 160,4" fill="none" stroke="#c5a55a" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M0,22 C15,20 30,18 45,15 C60,12 75,20 90,16 C105,12 120,8 135,10 C150,12 155,6 160,4 L160,30 L0,30 Z" fill="url(#mobileChartFill)" />
                    </svg>
                  </div>
                  <div className="flex justify-between pt-1">
                    {["Send", "Add", "Cards", "More"].map((label) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className="h-8 w-8 rounded-full bg-navy-800 border border-border-subtle flex items-center justify-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-gold-500/30" />
                        </div>
                        <span className="text-[8px] text-text-muted">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-text-muted/30" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
