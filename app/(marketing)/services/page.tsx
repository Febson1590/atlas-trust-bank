import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Briefcase,
  TrendingUp,
  CreditCard,
  Send,
  PiggyBank,
  Wallet,
  Building2,
  Globe,
  LineChart,
  BarChart3,
  Landmark,
  ScrollText,
  Users,
  BadgeDollarSign,
  Scale,
  FileText,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services — Atlas Trust Bank",
  description:
    "Explore Atlas Trust Bank's comprehensive financial services: Personal Banking, Business Solutions, and Wealth Management across 160 countries.",
};

const personalFeatures = [
  {
    icon: Wallet,
    title: "Premium Accounts",
    description:
      "Multi-currency checking and savings accounts with competitive interest rates, zero-fee international transfers, and 24/7 digital access.",
  },
  {
    icon: Send,
    title: "Global Transfers",
    description:
      "Send and receive funds across 160 countries with real-time exchange rates, same-day settlement, and end-to-end encryption.",
  },
  {
    icon: CreditCard,
    title: "Cards & Payments",
    description:
      "Visa and Mastercard debit and credit cards with contactless payments, customizable spending limits, and worldwide ATM access.",
  },
  {
    icon: PiggyBank,
    title: "Savings & Deposits",
    description:
      "High-yield savings accounts, fixed-term deposits, and automated savings plans designed to grow your wealth steadily.",
  },
];

const businessFeatures = [
  {
    icon: Building2,
    title: "Corporate Accounts",
    description:
      "Dedicated business accounts with multi-signatory controls, bulk payment processing, and integrated cash management tools.",
  },
  {
    icon: BadgeDollarSign,
    title: "Treasury Services",
    description:
      "Liquidity management, foreign exchange hedging, and short-term investment solutions tailored for corporate treasury operations.",
  },
  {
    icon: Globe,
    title: "Trade Finance",
    description:
      "Letters of credit, bank guarantees, documentary collections, and supply chain financing to support international commerce.",
  },
  {
    icon: ScrollText,
    title: "Payroll & Compliance",
    description:
      "Automated payroll disbursement, tax withholding integration, and full regulatory compliance across all operating jurisdictions.",
  },
];

const wealthFeatures = [
  {
    icon: LineChart,
    title: "Investment Advisory",
    description:
      "Personalized investment strategies from our team of Chartered Financial Analysts, covering equities, fixed income, alternatives, and structured products.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Management",
    description:
      "Discretionary and advisory portfolio management with real-time reporting, risk analytics, and access to exclusive institutional-grade opportunities.",
  },
  {
    icon: Scale,
    title: "Estate Planning",
    description:
      "Comprehensive succession and estate planning, including trust formation, philanthropic advisory, and cross-border inheritance structuring.",
  },
  {
    icon: ShieldCheck,
    title: "Private Banking",
    description:
      "A dedicated relationship manager, bespoke credit facilities, priority access to IPOs, and exclusive banking privileges for high-net-worth clients.",
  },
];

const serviceSections = [
  {
    id: "personal",
    icon: Shield,
    label: "Personal Banking",
    heading: "Personal Banking",
    description:
      "Banking that adapts to your life. Whether you are managing day-to-day finances or planning for the future, our personal banking services provide the security, convenience, and flexibility you deserve.",
    features: personalFeatures,
  },
  {
    id: "business",
    icon: Briefcase,
    label: "Business Solutions",
    heading: "Business Solutions",
    description:
      "From startups to multinational enterprises, Atlas Trust Bank provides the financial infrastructure your business needs to operate efficiently, expand confidently, and compete globally.",
    features: businessFeatures,
  },
  {
    id: "wealth",
    icon: TrendingUp,
    label: "Wealth Management",
    heading: "Wealth Management",
    description:
      "Preserve and grow your legacy with our institutional-grade wealth management services. Our team of seasoned advisors crafts strategies aligned with your financial objectives and risk tolerance.",
    features: wealthFeatures,
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-navy-900">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-gold-500/[0.04] blur-[120px]" />
          <div className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-navy-600/30 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(197,165,90,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(197,165,90,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold-500">
              Comprehensive Solutions
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Financial <span className="gold-text">Services</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary">
              From everyday banking to complex corporate treasury and bespoke
              wealth management, Atlas Trust Bank offers a full spectrum of
              financial services designed for a global clientele.
            </p>
          </div>

          {/* Quick nav pills */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {serviceSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-gold-500/30 bg-navy-800/60 px-5 py-2.5 text-sm font-medium text-gold-400 transition-all hover:bg-gold-500/10 hover:border-gold-400"
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Sections ───────────────────────────────────── */}
      {serviceSections.map((section, idx) => (
        <section
          key={section.id}
          id={section.id}
          className={`relative py-24 ${
            idx % 2 === 0 ? "bg-navy-950" : "bg-navy-900"
          }`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Section heading */}
            <div className="max-w-3xl animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10">
                  <section.icon className="h-6 w-6 text-gold-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  {section.heading}
                </h2>
              </div>
              <p className="text-lg text-text-secondary leading-relaxed">
                {section.description}
              </p>
            </div>

            {/* Feature cards */}
            <div className="mt-14 grid gap-8 sm:grid-cols-2">
              {section.features.map((feature) => (
                <div
                  key={feature.title}
                  className="card-shine group rounded-2xl border border-border-subtle bg-navy-800/50 p-8 transition-all duration-300 hover:border-gold-500/30 hover:gold-glow"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 transition-colors group-hover:bg-gold-500/20">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="relative bg-navy-950 py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-gold-500/20 bg-navy-800/60 px-8 py-16 text-center sm:px-16 lg:py-20">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-gold-500/[0.06] blur-[80px]" />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl gold-glow" />

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Ready to Get <span className="gold-text">Started</span>?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
                Open an account in minutes and unlock the full suite of Atlas
                Trust Bank financial services. Our team is standing by to help
                you choose the right solutions for your needs.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="gold-gradient inline-flex items-center gap-2 rounded-lg px-10 py-4 text-sm font-semibold text-navy-950 transition-all hover:opacity-90"
                >
                  Open Your Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg border border-gold-500/40 px-10 py-4 text-sm font-medium text-gold-400 transition-all hover:border-gold-400 hover:bg-gold-500/10"
                >
                  Speak to an Advisor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
