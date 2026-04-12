import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Globe,
  Users,
  Target,
  Eye,
  Shield,
  Award,
  Landmark,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Atlas Trust Bank",
  description:
    "Discover the story, mission, and leadership behind Atlas Trust Bank. Over 25 years of trusted global financial services.",
};

const stats = [
  { label: "Years of Service", value: "25+" },
  { label: "Countries Served", value: "160+" },
  { label: "Assets Under Management", value: "$84B+" },
  { label: "Trusted Clients", value: "1.2M+" },
];

const leadership = [
  {
    name: "Richard W. Harrington",
    role: "Chief Executive Officer",
    initials: "RH",
    bio: "With over 30 years in global finance, Richard has led Atlas Trust Bank through its most transformative era. Previously served as Managing Director at Goldman Sachs and as an advisor to the Federal Reserve Board.",
  },
  {
    name: "Catherine M. Albright",
    role: "Chief Financial Officer",
    initials: "CA",
    bio: "Catherine brings two decades of financial leadership experience from JP Morgan Chase and Deutsche Bank. She oversees all fiscal operations, treasury management, and regulatory compliance across our global network.",
  },
  {
    name: "James T. Nakamura",
    role: "Chief Operating Officer",
    initials: "JN",
    bio: "James directs the bank's operational strategy across 160 countries. His previous tenure as SVP of Operations at HSBC and Citigroup provides deep expertise in scaling financial infrastructure globally.",
  },
  {
    name: "Dr. Sophia L. Voss",
    role: "Chief Risk Officer",
    initials: "SV",
    bio: "Dr. Voss holds a PhD in Financial Economics from MIT and has spent 15 years developing risk frameworks for major institutions. She leads our enterprise risk management and regulatory strategy teams.",
  },
];

export default function AboutPage() {
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
              Established 1998
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              About <span className="gold-text">Atlas Trust Bank</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary">
              For over two decades, Atlas Trust Bank has been a pillar of
              stability and innovation in global finance, helping individuals and
              institutions navigate the complexities of modern wealth management.
            </p>
          </div>
        </div>
      </section>

      {/* ── Our Story ──────────────────────────────────────────── */}
      <section className="relative bg-navy-950 py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left -- decorative card */}
            <div className="relative animate-fade-in">
              <div className="absolute -inset-4 rounded-2xl bg-gold-500/[0.04] blur-2xl" />
              <div className="relative rounded-2xl border border-gold-500/20 bg-navy-800/80 p-10 backdrop-blur-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold-500/10 mb-6">
                  <Landmark className="h-7 w-7 text-gold-400" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  A Legacy of Trust
                </h3>
                <p className="text-text-secondary leading-relaxed mb-6">
                  Founded in 1998 in Zurich, Switzerland, Atlas Trust Bank began
                  as a boutique wealth management firm serving a select group of
                  European families. Our founders, a team of seasoned bankers from
                  Credit Suisse and UBS, envisioned a financial institution that
                  combined the discretion of Swiss banking with the ambition of
                  global finance.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  By 2005, we had expanded into the Middle East and Asia-Pacific
                  markets. The 2008 financial crisis proved to be a defining
                  moment -- while many institutions faltered, our conservative
                  risk approach and transparent client relationships allowed us to
                  emerge stronger, gaining the trust of a new generation of
                  investors.
                </p>
              </div>
            </div>

            {/* Right -- text content */}
            <div className="animate-fade-in">
              <p className="text-sm font-semibold uppercase tracking-widest text-gold-500 mb-4">
                Our Story
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-6">
                From Zurich to the World
              </h2>
              <div className="space-y-5 text-text-secondary leading-relaxed">
                <p>
                  Today, Atlas Trust Bank operates across 160 countries with over
                  $84 billion in assets under management. We serve more than 1.2
                  million clients, ranging from individuals seeking personal
                  banking solutions to multinational corporations requiring
                  complex treasury and trade finance services.
                </p>
                <p>
                  Our growth has been deliberate and principled. We entered the
                  North American market in 2010, launched our digital banking
                  platform in 2015, and introduced our AI-powered wealth advisory
                  service in 2022. Throughout every expansion, we have maintained
                  the same core commitment: to be the most trusted name in
                  banking.
                </p>
                <p>
                  We hold banking licenses in all major financial jurisdictions,
                  maintain Tier 1 capital ratios well above regulatory
                  requirements, and invest heavily in cybersecurity and regulatory
                  compliance. Our clients choose us not just for what we offer,
                  but for the integrity with which we operate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ───────────────────────────────────── */}
      <section className="relative bg-navy-900 py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Mission & <span className="gold-text">Vision</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
              The guiding principles that shape every decision, every
              relationship, and every service we provide.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Mission */}
            <div className="card-shine group rounded-2xl border border-gold-500/20 bg-navy-800/60 p-8 transition-all duration-300 hover:border-gold-500/30 hover:gold-glow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 transition-colors group-hover:bg-gold-500/20">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-text-primary">
                Our Mission
              </h3>
              <p className="mt-3 leading-relaxed text-text-secondary">
                To deliver exceptional financial services that empower our
                clients to build, protect, and transfer wealth across
                generations. We combine cutting-edge technology with
                time-honored banking principles to serve as a true financial
                partner.
              </p>
            </div>

            {/* Vision */}
            <div className="card-shine group rounded-2xl border border-gold-500/20 bg-navy-800/60 p-8 transition-all duration-300 hover:border-gold-500/30 hover:gold-glow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 transition-colors group-hover:bg-gold-500/20">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-text-primary">
                Our Vision
              </h3>
              <p className="mt-3 leading-relaxed text-text-secondary">
                To be the world's most trusted financial institution -- one that
                sets the standard for transparency, innovation, and client
                stewardship. We aspire to a future where every person has access
                to sophisticated financial tools and guidance.
              </p>
            </div>

            {/* Values */}
            <div className="card-shine group rounded-2xl border border-gold-500/20 bg-navy-800/60 p-8 transition-all duration-300 hover:border-gold-500/30 hover:gold-glow sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 transition-colors group-hover:bg-gold-500/20">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-text-primary">
                Our Values
              </h3>
              <ul className="mt-3 space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                  Integrity in every transaction and relationship
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                  Innovation that serves, not complicates
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                  Security as a non-negotiable standard
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                  Excellence in client service and stewardship
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <section className="relative bg-navy-950 py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center animate-fade-in">
                <p className="text-3xl font-bold text-text-primary sm:text-4xl gold-text">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leadership ─────────────────────────────────────────── */}
      <section className="relative bg-navy-900 py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-500 mb-4">
              Executive Team
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Our <span className="gold-text">Leadership</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
              Guided by decades of combined experience in global finance,
              regulation, and technology.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((member) => (
              <div
                key={member.name}
                className="card-shine group rounded-2xl border border-border-subtle bg-navy-800/60 p-6 text-center transition-all duration-300 hover:border-gold-500/30 hover:gold-glow"
              >
                {/* Avatar */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-500/10 border-2 border-gold-500/30">
                  <span className="text-2xl font-bold gold-text">
                    {member.initials}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-text-primary">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-gold-400">
                  {member.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                Become Part of the{" "}
                <span className="gold-text">Atlas Trust</span> Family
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
                Experience the difference that principled banking and genuine
                partnership can make for your financial future.
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
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
