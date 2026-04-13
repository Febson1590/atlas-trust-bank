import Link from "next/link";
import Image from "next/image";
import { Search, CreditCard, ArrowLeftRight, User, ChevronRight } from "lucide-react";

/* ── Phone Mockup ── */
function PhoneMockup() {
  const transactions = [
    { name: "Acco Balance", time: "4 hours ago", amount: "$87.95", positive: true },
    { name: "Amazon", time: "2 hours ago", amount: "-$87.95", positive: false },
    { name: "Refunded: Apple", time: "Yesterday", amount: "+$199.00", positive: true },
    { name: "Utility Payment", time: "2 days ago", amount: "-$185.60", positive: false },
  ];

  return (
    <div className="relative w-[280px] sm:w-[300px] lg:w-[320px] mx-auto">
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-[3px] border-white/[0.08] bg-navy-900/90 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm">
        {/* Status bar */}
        <div className="flex items-center justify-between px-7 pt-3 pb-1">
          <span className="text-[11px] font-semibold text-white/80">15:26</span>
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" opacity="0.7"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" opacity="0.7"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
          </div>
        </div>

        {/* App header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={28} height={28} className="h-6 w-auto brightness-0 invert opacity-90" />
            <div>
              <p className="text-[11px] font-bold text-gold-400 tracking-wide leading-none">Atlas Trust</p>
              <p className="text-[8px] font-semibold text-gold-400/60 tracking-[0.2em] uppercase leading-none mt-0.5">Bank</p>
            </div>
          </div>
          <Search className="h-4 w-4 text-white/50" />
        </div>

        {/* Balance card */}
        <div className="mx-4 rounded-xl bg-navy-800/80 border border-white/[0.06] p-4 mb-3">
          <p className="text-2xl font-bold text-white tracking-tight">$27,450.00</p>
          <p className="text-[11px] text-white/50 mt-0.5">Atlas Platinum</p>
        </div>

        {/* Transactions */}
        <div className="px-4 space-y-0">
          {transactions.map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
              <div>
                <p className="text-[11px] font-medium text-white/90">{tx.name}</p>
                <p className="text-[9px] text-white/35 mt-0.5">{tx.time}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[12px] font-semibold ${tx.positive ? "text-white/90" : "text-white/70"}`}>
                  {tx.amount}
                </span>
                <ChevronRight className="h-3 w-3 text-white/25" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex justify-around px-6 py-4 mt-2 border-t border-white/[0.06]">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
              <CreditCard className="h-4 w-4 text-white/60" />
            </div>
            <span className="text-[9px] text-white/40">Debit Card</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
              <ArrowLeftRight className="h-4 w-4 text-white/60" />
            </div>
            <span className="text-[9px] text-white/40">Transfers</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
              <User className="h-4 w-4 text-white/60" />
            </div>
            <span className="text-[9px] text-white/40">Accounts</span>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex justify-center gap-6 pb-4 pt-1">
          <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
          <div className="h-1.5 w-1.5 rounded-full bg-gold-400/60" />
          <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ── Layered background system ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Layer 1: Deep dark base */}
        <div className="absolute inset-0 bg-[#050508]" />

        {/* Layer 2: Subtle warm ambient from top-right */}
        <div className="absolute top-0 right-0 h-[80%] w-[70%] bg-gradient-to-bl from-amber-900/[0.08] via-orange-900/[0.04] to-transparent blur-[80px]" />

        {/* Layer 3: Golden glow at bottom center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] bg-gradient-to-t from-amber-800/[0.12] via-gold-700/[0.06] to-transparent blur-[100px]" />

        {/* Layer 4: Warm horizon line */}
        <div className="absolute bottom-[15%] inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold-700/20 to-transparent blur-sm" />

        {/* Layer 5: Bottom dark fade */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent" />

        {/* Layer 6: Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_40%,transparent_30%,rgba(5,5,8,0.7)_100%)]" />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 lg:px-8 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen py-24">

          {/* ── Left Column ── */}
          <div className="animate-fade-in">
            {/* Heading */}
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-[3.5rem] xl:text-6xl">
              Global Banking{" "}
              <br />
              <span className="gold-text">Excellence</span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 max-w-md text-base leading-relaxed text-text-secondary/80">
              Elevating your financial experience with secure
              and innovative banking solutions.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="gold-gradient inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-sm font-semibold text-navy-950 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/25"
              >
                Open Account
              </Link>
              <Link
                href="/services"
                className="glass glass-border inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-sm font-medium text-text-secondary transition-all duration-300 hover:border-gold-500/40 hover:text-gold-400"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* ── Right Column — Phone Mockup ── */}
          <div className="relative hidden lg:flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {/* Glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[400px] rounded-full bg-gold-500/[0.04] blur-[100px]" />
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
