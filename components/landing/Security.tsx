import { Lock, Eye, Globe, Landmark } from "lucide-react";

const indicators = [
  {
    icon: Lock,
    label: "256-bit Encryption",
    description: "Bank-grade data protection",
  },
  {
    icon: Eye,
    label: "24/7 Monitoring",
    description: "Continuous threat detection",
  },
  {
    icon: Globe,
    label: "Global Coverage",
    description: "Operations in 160+ countries",
  },
  {
    icon: Landmark,
    label: "Regulated Banking",
    description: "Full regulatory compliance",
  },
];

export default function Security() {
  return (
    <section className="relative bg-navy-950 py-24 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-gold-500/[0.03] blur-[120px]" />
      </div>

      {/* Subtle top border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        {/* ── Heading ── */}
        <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
          <span className="gold-text">Secure.</span> Global.{" "}
          <span className="gold-text">Prestigious.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
          Managing your finances with confidence and expertise. Every layer of
          our infrastructure is designed to protect what matters most.
        </p>

        {/* ── Trust indicators ── */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {indicators.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center rounded-xl border border-border-subtle bg-navy-900/60 px-6 py-8 transition-all duration-300 hover:border-gold-500/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-400">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-text-primary">
                {item.label}
              </h3>
              <p className="mt-1 text-xs text-text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
