"use client";

import { Globe, Lock, Zap, HeadphonesIcon } from "lucide-react";
import { useState, useEffect, useRef, type ComponentType } from "react";

interface Feature {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  value: string;
  unit: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Globe,
    title: "Available Worldwide",
    value: "160+",
    unit: "Countries",
    description:
      "Use your account from anywhere. We support you around the clock, no matter your time zone.",
  },
  {
    icon: Lock,
    title: "Seriously Secure",
    value: "256",
    unit: "Bit Encryption",
    description:
      "Your data is encrypted from start to finish. We watch for threats on every transaction.",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    value: "<30",
    unit: "Seconds",
    description:
      "Send money in seconds. Local transfers happen right away. International ones arrive the same day.",
  },
  {
    icon: HeadphonesIcon,
    title: "Always Here to Help",
    value: "24/7",
    unit: "Availability",
    description:
      "Real people ready to help, anytime. Chat with us or talk to your personal manager.",
  },
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

          const numericMatch = value.match(/(\d+)/);
          if (!numericMatch) {
            setDisplay(value);
            return;
          }

          const target = parseInt(numericMatch[1], 10);
          const prefix = value.slice(0, value.indexOf(numericMatch[1]));
          const suffix = value.slice(
            value.indexOf(numericMatch[1]) + numericMatch[1].length
          );

          const duration = 1500;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            setDisplay(`${prefix}${current}${suffix}`);
            if (progress < 1) requestAnimationFrame(animate);
          };

          // Start from zero
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
    <section id="features" className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-navy-950" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gold-500/[0.025] blur-[130px]" />
      </div>

      {/* World map dots (decorative background) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
        <svg
          width="600"
          height="300"
          viewBox="0 0 600 300"
          fill="none"
          className="max-w-full"
        >
          {/* North America */}
          <circle cx="120" cy="80" r="3" fill="#c5a55a" />
          <circle cx="135" cy="75" r="2" fill="#c5a55a" />
          <circle cx="150" cy="90" r="2.5" fill="#c5a55a" />
          <circle cx="110" cy="100" r="2" fill="#c5a55a" />
          <circle cx="140" cy="110" r="3" fill="#c5a55a" />
          <circle cx="125" cy="120" r="2" fill="#c5a55a" />
          {/* South America */}
          <circle cx="170" cy="180" r="2.5" fill="#c5a55a" />
          <circle cx="180" cy="200" r="3" fill="#c5a55a" />
          <circle cx="175" cy="220" r="2" fill="#c5a55a" />
          <circle cx="165" cy="240" r="2.5" fill="#c5a55a" />
          {/* Europe */}
          <circle cx="280" cy="70" r="2.5" fill="#c5a55a" />
          <circle cx="295" cy="65" r="2" fill="#c5a55a" />
          <circle cx="310" cy="80" r="3" fill="#c5a55a" />
          <circle cx="290" cy="90" r="2" fill="#c5a55a" />
          <circle cx="275" cy="85" r="2.5" fill="#c5a55a" />
          {/* Africa */}
          <circle cx="300" cy="140" r="2.5" fill="#c5a55a" />
          <circle cx="310" cy="160" r="3" fill="#c5a55a" />
          <circle cx="290" cy="170" r="2" fill="#c5a55a" />
          <circle cx="320" cy="180" r="2.5" fill="#c5a55a" />
          {/* Asia */}
          <circle cx="380" cy="80" r="2.5" fill="#c5a55a" />
          <circle cx="400" cy="70" r="3" fill="#c5a55a" />
          <circle cx="420" cy="90" r="2" fill="#c5a55a" />
          <circle cx="440" cy="100" r="2.5" fill="#c5a55a" />
          <circle cx="460" cy="85" r="3" fill="#c5a55a" />
          <circle cx="480" cy="110" r="2" fill="#c5a55a" />
          <circle cx="450" cy="120" r="2.5" fill="#c5a55a" />
          {/* Australia */}
          <circle cx="480" cy="200" r="2.5" fill="#c5a55a" />
          <circle cx="500" cy="210" r="3" fill="#c5a55a" />
          <circle cx="490" cy="220" r="2" fill="#c5a55a" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Why Atlas Trust
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for <span className="gold-text">speed</span> and trust
          </h2>
          <p className="mt-4 leading-relaxed text-text-secondary">
            Years of experience, a worldwide network, and a real commitment
            to helping you with your money.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-premium card-shine group rounded-2xl p-7 text-center"
            >
              {/* Icon */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/[0.08] text-gold-400 transition-all duration-300 group-hover:bg-gold-500/[0.14] group-hover:shadow-lg group-hover:shadow-gold-500/10 group-hover:animate-glow-pulse">
                <feature.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>

              {/* Stat */}
              <div className="mt-5">
                <span className="text-2xl font-bold tracking-tight text-text-primary">
                  <AnimatedValue value={feature.value} />
                </span>
                <span className="ml-1 text-xs font-medium uppercase tracking-wider text-text-muted">
                  {feature.unit}
                </span>
              </div>

              {/* Title */}
              <h3 className="mt-2 text-sm font-semibold text-text-primary transition-colors duration-300 group-hover:text-gold-400">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
