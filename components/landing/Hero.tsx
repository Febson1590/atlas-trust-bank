import Link from "next/link";
import Image from "next/image";

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
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 lg:px-8 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-screen py-24">

          {/* ── Left Column — Text & CTAs ── */}
          <div className="animate-fade-in text-center lg:text-left">
            {/* Heading */}
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-[3.5rem] xl:text-6xl">
              Global Banking{" "}
              <br />
              <span className="gold-text">Excellence</span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 max-w-md mx-auto lg:mx-0 text-base leading-relaxed text-text-secondary/80">
              Elevating your financial experience with secure
              and innovative banking solutions.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
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

            {/* ── Mobile Image — phone mockup (visible below lg) ── */}
            <div className="mt-12 flex justify-center lg:hidden">
              <Image
                src="/images/mobile-banking.png"
                alt="Atlas Trust Bank mobile banking"
                width={320}
                height={640}
                priority
                className="h-auto object-contain drop-shadow-2xl"
                style={{ width: "clamp(220px, 70vw, 320px)", maxWidth: "320px" }}
              />
            </div>
          </div>

          {/* ── Right Column — Card stack (visible lg and above) ── */}
          <div
            className="relative hidden lg:flex items-center justify-end animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Ambient glow behind cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold-500/[0.04] blur-[100px]" />

            <Image
              src="/images/hero-cards.png"
              alt="Atlas Trust Bank premium cards"
              width={560}
              height={560}
              priority
              className="relative z-10 h-auto object-contain drop-shadow-2xl"
              style={{ width: "clamp(380px, 42vw, 560px)", maxWidth: "560px" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
