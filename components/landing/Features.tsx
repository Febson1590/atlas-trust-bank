"use client";

import { Shield, Globe, Zap, HeadphonesIcon } from "lucide-react";
import { useState, useEffect, useRef, type ComponentType } from "react";

interface TrustCard {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
}

const trustCards: TrustCard[] = [
  {
    icon: Shield,
    title: "Protected Transactions",
    description:
      "256-bit encryption on every payment. Real-time monitoring catches threats before they reach you.",
  },
  {
    icon: Globe,
    title: "Available Globally",
    description:
      "Access your accounts from anywhere. Our platform supports banking across multiple regions.",
  },
  {
    icon: Zap,
    title: "Fast Transfers",
    description:
      "Domestic transfers process instantly. International payments settle within the same business day.",
  },
  {
    icon: HeadphonesIcon,
    title: "Support When You Need It",
    description:
      "Reach our team by chat, phone, or email — any time, any day. No bots, real people.",
  },
];

interface StatItem {
  value: string;
  label: string;
}

const stats: StatItem[] = [
  { value: "25+", label: "Years of Service" },
  { value: "160+", label: "Countries Served" },
  { value: "99.9%", label: "Uptime Reliability" },
  { value: "24/7", label: "Client Support" },
];

function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const numericMatch = value.match(/([\d,]+)/);
          if (!numericMatch) {
            setDisplay(value);
            return;
          }

          const rawNum = numericMatch[1].replace(/,/g, "");
          const target = parseInt(rawNum, 10);
          const prefix = value.slice(0, value.indexOf(numericMatch[1]));
          const suffix = value.slice(
            value.indexOf(numericMatch[1]) + numericMatch[1].length
          );
          const useCommas = numericMatch[1].includes(",");

          const duration = 1500;
          const startTime = performance.now();

          const formatNum = (n: number) =>
            useCommas ? n.toLocaleString("en-US") : String(n);

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            setDisplay(`${prefix}${formatNum(current)}${suffix}`);
            if (progress < 1) requestAnimationFrame(animate);
          };

          setDisplay(`${prefix}0${suffix}`);
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-navy-950" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gold-500/[0.02] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Why Atlas Trust
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built on{" "}
            <span className="gold-text">Trust</span>
          </h2>
          <p className="mt-4 leading-relaxed text-text-secondary">
            Reliable banking services for individuals and businesses, backed by
            modern security standards and dedicated support.
          </p>
        </div>

        {/* Trust cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustCards.map((card) => (
            <div
              key={card.title}
              className="card-premium card-shine group rounded-2xl p-7"
            >
              {/* Icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/[0.08] text-gold-400 transition-all duration-300 group-hover:bg-gold-500/[0.14] group-hover:shadow-lg group-hover:shadow-gold-500/10">
                <card.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>

              {/* Title */}
              <h3 className="mt-4 text-sm font-semibold text-text-primary transition-colors duration-300 group-hover:text-gold-400">
                {card.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-16 rounded-2xl border border-border-subtle bg-navy-800/40 backdrop-blur-sm px-6 py-8 sm:px-10">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl gold-text">
                  <AnimatedValue value={stat.value} />
                </p>
                <p className="mt-1 text-xs font-medium text-text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
