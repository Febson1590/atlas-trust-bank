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
    "Learn about Atlas Trust Bank. Over 25 years of helping people and businesses manage their money worldwide.",
};

const stats = [
  { label: "Years in Business", value: "25+" },
  { label: "Countries Served", value: "160+" },
  { label: "Money We Manage", value: "$84B+" },
  { label: "Happy Customers", value: "1.2M+" },
];

const leadership = [
  {
    name: "Richard W. Harrington",
    role: "Chief Executive Officer",
    initials: "RH",
    bio: "Richard has led Atlas Trust Bank for over 30 years. Before that, he worked at Goldman Sachs and advised the Federal Reserve. He brought the bank through its biggest growth period.",
  },
  {
    name: "Catherine M. Albright",
    role: "Chief Financial Officer",
    initials: "CA",
    bio: "Catherine runs all our finances and has 20 years of experience at JP Morgan Chase and Deutsche Bank. She makes sure our money operations work smoothly across the world.",
  },
  {
    name: "James T. Nakamura",
    role: "Chief Operating Officer",
    initials: "JN",
    bio: "James manages our day-to-day operations in 160 countries. He used to lead operations at HSBC and Citigroup, so he knows how to run things at a global level.",
  },
  {
    name: "Dr. Sophia L. Voss",
    role: "Chief Risk Officer",
    initials: "SV",
    bio: "Dr. Voss has a PhD from MIT and spent 15 years building safety systems for banks. She keeps our risk low and makes sure we follow all the rules.",
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
              For over 25 years, Atlas Trust Bank has helped people and
              businesses manage their money. We keep things simple, safe, and
              global.
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
                  Built on Trust
                </h3>
                <p className="text-text-secondary leading-relaxed mb-6">
                  We started in 1998 in Zurich, Switzerland as a small team of
                  experienced bankers from Credit Suisse and UBS. They wanted to
                  build a bank that combined Swiss reliability with big
                  ambitions.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  By 2005, we had grown into the Middle East and Asia. When the
                  2008 financial crisis hit, our careful approach kept us strong
                  while others struggled. That earned us even more trust.
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
                  Today, we work in 160 countries and manage over $84 billion.
                  We serve more than 1.2 million customers, from individuals to
                  large companies.
                </p>
                <p>
                  We grew step by step. We came to North America in 2010,
                  launched online banking in 2015, and added AI-powered advice
                  in 2022. Through it all, our goal stayed the same: be the
                  most trusted name in banking.
                </p>
                <p>
                  We have banking licenses everywhere it matters. Our finances
                  are well above what regulators require. And we invest heavily
                  in security. People choose us because we do things the right
                  way.
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
              The ideas that guide everything we do.
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
                To give people great banking tools so they can build, protect,
                and pass on their wealth. We mix new technology with solid
                banking to be a real partner for your money.
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
                To be the most trusted bank in the world. We want to set the
                bar for honesty, new ideas, and taking care of our customers.
                Everyone should have access to good financial tools.
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
                  Honesty in every deal and relationship
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                  New ideas that help, not confuse
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                  Security that never takes a day off
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                  Going above and beyond for our customers
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
              Led by people with decades of experience in global banking and
              technology.
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
                Join the{" "}
                <span className="gold-text">Atlas Trust</span> Family
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
                See what honest banking and real support can do for you.
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
