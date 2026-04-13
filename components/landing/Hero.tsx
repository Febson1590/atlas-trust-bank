import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute top-0 right-0 h-[70%] w-[60%] bg-gradient-to-bl from-amber-900/[0.07] via-orange-900/[0.03] to-transparent blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[350px] w-[700px] bg-gradient-to-t from-amber-800/[0.10] via-gold-700/[0.04] to-transparent blur-[120px]" />
        <div className="absolute bottom-[18%] inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-700/15 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_40%,transparent_30%,rgba(5,5,8,0.7)_100%)]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-12 py-28 sm:py-32 lg:py-0 lg:min-h-screen">

          {/* ── Left: Text ── */}
          <div className="animate-fade-in text-center lg:text-left">
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-[3.4rem] xl:text-[3.75rem]">
              Global Banking
              <br />
              <span className="gold-text">Excellence</span>
            </h1>

            <p className="mt-6 max-w-[26rem] mx-auto lg:mx-0 text-base leading-relaxed text-text-secondary/80">
              Elevating your financial experience with secure
              and innovative banking solutions.
            </p>

            <div className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:justify-center lg:justify-start">
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

            {/* ── Mobile: phone image ── */}
            <div className="mt-14 flex justify-center lg:hidden">
              <div className="relative overflow-hidden rounded-2xl" style={{ width: "clamp(220px, 68vw, 300px)", maxWidth: "300px" }}>
                <Image
                  src="/images/mobile-banking.png"
                  alt="Atlas Trust Bank mobile banking"
                  width={600}
                  height={900}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* ── Right: Card stack (desktop only) ── */}
          <div
            className="relative hidden lg:flex items-center justify-end animate-fade-in"
            style={{ animationDelay: "0.15s" }}
          >
            {/* Subtle glow */}
            <div className="absolute top-1/2 right-[10%] -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gold-500/[0.03] blur-[100px]" />

            <div
              className="relative overflow-hidden"
              style={{ width: "clamp(360px, 40vw, 520px)", maxWidth: "520px" }}
            >
              <Image
                src="/images/hero-cards.png"
                alt="Atlas Trust Bank premium cards"
                width={1024}
                height={1024}
                priority
                className="relative z-10 h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
