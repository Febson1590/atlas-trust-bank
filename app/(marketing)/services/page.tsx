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
    "See what Atlas Trust Bank offers: personal banking, business tools, and help growing your wealth. Available in 160 countries.",
};

const personalFeatures = [
  {
    icon: Wallet,
    title: "Premium Accounts",
    description:
      "Bank in multiple currencies with great rates, free international transfers, and full online access anytime.",
  },
  {
    icon: Send,
    title: "Global Transfers",
    description:
      "Send and receive money in 160 countries with live exchange rates, same-day delivery, and full security.",
  },
  {
    icon: CreditCard,
    title: "Cards & Payments",
    description:
      "Visa and Mastercard cards with tap-to-pay, custom spending limits, and ATM access worldwide.",
  },
  {
    icon: PiggyBank,
    title: "Savings & Deposits",
    description:
      "Savings accounts with great returns, fixed deposits, and auto-save plans to help your money grow.",
  },
];

const businessFeatures = [
  {
    icon: Building2,
    title: "Corporate Accounts",
    description:
      "Business accounts with multi-user access, bulk payments, and tools to manage your cash flow.",
  },
  {
    icon: BadgeDollarSign,
    title: "Treasury Services",
    description:
      "Cash management, currency protection, and short-term investments built for business needs.",
  },
  {
    icon: Globe,
    title: "Trade Finance",
    description:
      "Letters of credit, guarantees, and supply chain financing to support your international trade.",
  },
  {
    icon: ScrollText,
    title: "Payroll & Compliance",
    description:
      "Automatic payroll, tax handling, and full compliance with local rules in every country you operate.",
  },
];

const wealthFeatures = [
  {
    icon: LineChart,
    title: "Investment Advisory",
    description:
      "Personal investment plans from expert analysts, covering stocks, bonds, and other options.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Management",
    description:
      "We manage your investments with live reports, risk analysis, and access to opportunities most people don't get.",
  },
  {
    icon: Scale,
    title: "Estate Planning",
    description:
      "Plan for the future with trust setup, charity guidance, and help with passing wealth across borders.",
  },
  {
    icon: ShieldCheck,
    title: "Private Banking",
    description:
      "A personal manager, special credit options, early access to new opportunities, and exclusive perks for top clients.",
  },
];

const serviceSections = [
  {
    id: "personal",
    icon: Shield,
    label: "Personal Banking",
    heading: "Personal Banking",
    description:
      "Banking that fits your life. Whether you handle daily money or plan ahead, we give you the safety, ease, and freedom you deserve.",
    features: personalFeatures,
  },
  {
    id: "business",
    icon: Briefcase,
    label: "Business Solutions",
    heading: "Business Solutions",
    description:
      "From startups to big companies, we give your business the money tools it needs to run well, grow with confidence, and compete worldwide.",
    features: businessFeatures,
  },
  {
    id: "wealth",
    icon: TrendingUp,
    label: "Wealth Management",
    heading: "Wealth Management",
    description:
      "Protect and grow what you've built. Our experienced team creates plans that match your goals and how much risk you're comfortable with.",
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
              What We Offer
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Financial <span className="gold-text">Services</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary">
              From daily banking to business tools and growing your wealth, we
              have everything you need — wherever you are.
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
                Open an account in minutes and get access to everything Atlas
                Trust Bank has to offer. Our team is ready to help you pick the
                right plan.
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
                  Talk to an Expert
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
