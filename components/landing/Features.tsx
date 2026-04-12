import { Globe, ShieldCheck, UserCheck, Percent } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Access your finances from anywhere in the world, with 24/7 support across every time zone.",
  },
  {
    icon: ShieldCheck,
    title: "Military-Grade Security",
    description:
      "Advanced encryption and multi-factor authentication protect every transaction you make.",
  },
  {
    icon: UserCheck,
    title: "Premium Service",
    description:
      "Dedicated relationship managers for personalized financial guidance at every stage.",
  },
  {
    icon: Percent,
    title: "Competitive Rates",
    description:
      "Best-in-class interest rates and minimal fees across all services and account types.",
  },
];

export default function Features() {
  return (
    <section className="relative bg-navy-900 py-24">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold-500/[0.02] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* ── Heading ── */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Why Choose <span className="gold-text">Atlas Trust Bank</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            Decades of expertise, global infrastructure, and an unwavering
            commitment to safeguarding your financial future.
          </p>
        </div>

        {/* ── Feature grid ── */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border-subtle bg-navy-800/50 p-8 text-center transition-all duration-300 hover:border-gold-500/20"
            >
              {/* Icon circle */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/10 text-gold-400 transition-colors group-hover:bg-gold-500/15">
                <feature.icon className="h-6 w-6" />
              </div>

              {/* Title */}
              <h3 className="mt-6 text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
