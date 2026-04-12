import { Shield, Briefcase, TrendingUp } from "lucide-react";

const services = [
  {
    icon: Shield,
    title: "Personal Banking",
    description:
      "Secure accounts, seamless transactions, and personalized banking tailored to your lifestyle.",
  },
  {
    icon: Briefcase,
    title: "Business Solutions",
    description:
      "Comprehensive financial tools designed to grow and protect your business.",
  },
  {
    icon: TrendingUp,
    title: "Wealth Management",
    description:
      "Expert investment strategies and portfolio management for lasting prosperity.",
  },
];

export default function Services() {
  return (
    <section className="relative bg-navy-950 py-24">
      {/* Subtle top edge glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* ── Heading ── */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Our <span className="gold-text">Services</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            Comprehensive financial solutions crafted for individuals,
            businesses, and high-net-worth clients worldwide.
          </p>
        </div>

        {/* ── Card grid ── */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="card-shine group rounded-2xl border border-border-subtle bg-navy-700/50 p-8 transition-all duration-300 hover:border-gold-500/30 hover:gold-glow"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 transition-colors group-hover:bg-gold-500/20">
                <service.icon className="h-6 w-6" />
              </div>

              {/* Title */}
              <h3 className="mt-6 text-xl font-semibold text-text-primary">
                {service.title}
              </h3>

              {/* Description */}
              <p className="mt-3 leading-relaxed text-text-secondary">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
