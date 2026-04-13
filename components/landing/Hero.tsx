import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#020508]">
      {/* ── Background glow layers ── */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "70%",
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(180,130,40,0.18) 0%, rgba(140,90,20,0.06) 40%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: "-10%",
          left: "-10%",
          width: "60%",
          height: "50%",
          background:
            "radial-gradient(ellipse at 30% 70%, rgba(160,110,30,0.10) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: "-10%",
          right: "-10%",
          width: "50%",
          height: "40%",
          background:
            "radial-gradient(ellipse at 70% 80%, rgba(180,130,40,0.08) 0%, transparent 55%)",
        }}
      />

      {/* ── Dot grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #c5a55a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Bokeh particles ── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute h-1 w-1 rounded-full bg-gold-400/40 animate-float"
          style={{ top: "12%", left: "15%", filter: "blur(1px)" }}
        />
        <div
          className="absolute h-1.5 w-1.5 rounded-full bg-gold-500/25 animate-float-slow"
          style={{ top: "20%", right: "20%", filter: "blur(1.5px)" }}
        />
        <div
          className="absolute h-0.5 w-0.5 rounded-full bg-gold-300/50 animate-float-delayed"
          style={{ top: "8%", right: "35%", filter: "blur(0.5px)" }}
        />
        <div
          className="absolute h-1 w-1 rounded-full bg-amber-400/30 animate-float"
          style={{ top: "30%", left: "8%", filter: "blur(1px)" }}
        />
        <div
          className="absolute h-0.5 w-0.5 rounded-full bg-gold-400/35 animate-float-slow"
          style={{ top: "15%", left: "42%", filter: "blur(1px)" }}
        />
        <div
          className="absolute h-1.5 w-1.5 rounded-full bg-amber-300/20 animate-float-delayed"
          style={{ top: "25%", right: "10%", filter: "blur(2px)" }}
        />
      </div>

      {/* ── Floating UI elements (desktop only) ── */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {/* Mini chart card — left */}
        <div
          className="absolute glass glass-border animate-float-slow rounded-xl px-4 py-3 opacity-60"
          style={{ top: "22%", left: "6%" }}
        >
          <p className="text-[10px] font-medium text-text-muted">Portfolio</p>
          <div className="mt-1 flex items-end gap-2">
            <svg
              width="80"
              height="32"
              viewBox="0 0 80 32"
              fill="none"
              className="text-gold-500"
            >
              <polyline
                points="0,24 12,20 24,26 36,14 48,18 60,8 72,12 80,4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[10px] font-semibold text-success">
              +12.4%
            </span>
          </div>
        </div>

        {/* Mini balance card — right */}
        <div
          className="absolute glass glass-border animate-float-delayed rounded-xl px-4 py-3 opacity-60"
          style={{ top: "18%", right: "7%" }}
        >
          <p className="text-[10px] font-medium text-text-muted">
            Total Balance
          </p>
          <p className="mt-0.5 text-sm font-bold gold-text">$24,850.00</p>
          <div className="mt-1 flex items-center gap-1">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              className="text-success"
            >
              <path
                d="M5 1 L9 6 L1 6 Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-[9px] text-success">+2.8% today</span>
          </div>
        </div>

        {/* Mini transaction badge — bottom left */}
        <div
          className="absolute glass glass-border animate-float rounded-xl px-4 py-2.5 opacity-50"
          style={{ bottom: "28%", left: "10%" }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20">
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className="text-success"
              >
                <path
                  d="M1 5 L4 8 L9 2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-[9px] text-text-muted">Payment received</p>
              <p className="text-[10px] font-semibold text-text-primary">
                +$3,200.00
              </p>
            </div>
          </div>
        </div>

        {/* Mini world dots — bottom right */}
        <div
          className="absolute animate-float-slow opacity-40"
          style={{ bottom: "25%", right: "8%" }}
        >
          <svg width="100" height="50" viewBox="0 0 100 50" fill="none">
            {/* Stylized world map dots */}
            <circle cx="20" cy="15" r="1.5" fill="#c5a55a" opacity="0.6" />
            <circle cx="25" cy="12" r="1" fill="#c5a55a" opacity="0.4" />
            <circle cx="30" cy="18" r="1.5" fill="#c5a55a" opacity="0.5" />
            <circle cx="40" cy="10" r="2" fill="#c5a55a" opacity="0.7" />
            <circle cx="45" cy="15" r="1" fill="#c5a55a" opacity="0.4" />
            <circle cx="50" cy="20" r="1.5" fill="#c5a55a" opacity="0.5" />
            <circle cx="55" cy="12" r="1" fill="#c5a55a" opacity="0.6" />
            <circle cx="62" cy="18" r="2" fill="#c5a55a" opacity="0.7" />
            <circle cx="70" cy="22" r="1.5" fill="#c5a55a" opacity="0.5" />
            <circle cx="75" cy="15" r="1" fill="#c5a55a" opacity="0.4" />
            <circle cx="82" cy="25" r="1.5" fill="#c5a55a" opacity="0.6" />
            <circle cx="88" cy="20" r="1" fill="#c5a55a" opacity="0.3" />
            <circle cx="35" cy="30" r="1.5" fill="#c5a55a" opacity="0.5" />
            <circle cx="42" cy="35" r="1" fill="#c5a55a" opacity="0.4" />
            <circle cx="65" cy="35" r="1.5" fill="#c5a55a" opacity="0.5" />
          </svg>
        </div>
      </div>

      {/* ── Bottom golden wave ── */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 w-full opacity-[0.10]"
        viewBox="0 0 1440 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ height: "160px" }}
      >
        <path
          d="M0,120 C120,80 240,140 360,100 C480,60 600,130 720,110 C840,90 960,140 1080,100 C1200,60 1320,120 1440,90 L1440,200 L0,200 Z"
          fill="url(#heroWave1)"
        />
        <path
          d="M0,150 C160,110 320,170 480,130 C640,90 800,160 960,140 C1120,120 1280,160 1440,130 L1440,200 L0,200 Z"
          fill="url(#heroWave2)"
        />
        <defs>
          <linearGradient id="heroWave1" x1="0" y1="0" x2="1440" y2="0">
            <stop offset="0%" stopColor="#8a6d2b" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#c5a55a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8a6d2b" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="heroWave2" x1="0" y1="0" x2="1440" y2="0">
            <stop offset="0%" stopColor="#a88a3e" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#d4b96e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#a88a3e" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Bottom fade for section blend ── */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-950 to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-10 flex items-center justify-center px-6 py-28 sm:py-32 lg:py-44">
        <div className="mx-auto w-full max-w-3xl text-center animate-fade-in">
          {/* Badge */}
          <span className="inline-block mb-6 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-gold-400">
            Trusted by 1.2M+ Clients Worldwide
          </span>

          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-4xl md:text-5xl lg:text-6xl font-display italic">
            Banking Without Limits.
            <br />
            <span className="gold-text">
              Built for Speed, Security,
              <br className="hidden sm:block" />
              and Control.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-secondary/80 sm:text-lg">
            Elevating your financial experience with secure, innovative banking
            solutions. Open an account in minutes and take control of your
            future.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href="/register"
              className="gold-gradient inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold text-navy-950 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/25"
            >
              Get Started in Minutes
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="#features"
              className="glass glass-border inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-medium text-text-secondary transition-all duration-300 hover:border-gold-500/40 hover:text-gold-400"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
