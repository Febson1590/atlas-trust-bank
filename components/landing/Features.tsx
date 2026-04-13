import { Globe, Lock, Zap, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Global Reach",
    value: "160+",
    unit: "Countries",
    description: "Access your finances anywhere with 24/7 support across every time zone.",
  },
  {
    icon: Lock,
    title: "Military-Grade Security",
    value: "256",
    unit: "Bit Encryption",
    description: "End-to-end encryption and continuous threat monitoring on every transaction.",
  },
  {
    icon: Zap,
    title: "Instant Transfers",
    value: "<30",
    unit: "Seconds",
    description: "Real-time domestic transfers and same-day international settlements.",
  },
  {
    icon: HeadphonesIcon,
    title: "Priority Support",
    value: "24/7",
    unit: "Availability",
    description: "Dedicated relationship managers and instant chat support around the clock.",
  },
];

export default function Features() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-navy-950" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gold-500/[0.025] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500 mb-4">
            Why Atlas Trust
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for <span className="gold-text">performance</span> and trust
          </h2>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Decades of expertise, global infrastructure, and an unwavering commitment to your financial future.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-premium card-shine group rounded-2xl p-7 text-center"
            >
              {/* Icon */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/[0.08] text-gold-400 transition-all duration-300 group-hover:bg-gold-500/[0.14] group-hover:shadow-lg group-hover:shadow-gold-500/10">
                <feature.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>

              {/* Stat */}
              <div className="mt-5">
                <span className="text-2xl font-bold tracking-tight text-text-primary">{feature.value}</span>
                <span className="ml-1 text-xs font-medium uppercase tracking-wider text-text-muted">{feature.unit}</span>
              </div>

              {/* Title */}
              <h3 className="mt-2 text-sm font-semibold text-text-primary group-hover:text-gold-400 transition-colors duration-300">
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
