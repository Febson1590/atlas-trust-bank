import {
  CreditCard,
  ArrowLeftRight,
  ShieldCheck,
  BarChart3,
  Smartphone,
  Landmark,
} from "lucide-react";

const services = [
  {
    icon: CreditCard,
    title: "Smart Cards",
    description:
      "Virtual and physical cards with real-time controls, instant freeze, and cashback on every purchase.",
  },
  {
    icon: ArrowLeftRight,
    title: "Global Transfers",
    description:
      "Send money to 160+ countries with zero hidden fees and real-time exchange rates.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    description:
      "256-bit encryption, biometric auth, and 24/7 fraud monitoring protect every transaction.",
  },
  {
    icon: BarChart3,
    title: "Wealth Analytics",
    description:
      "AI-powered insights, spending breakdowns, and portfolio tracking in one dashboard.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description:
      "Full banking from your phone — deposits, payments, support, and account management.",
  },
  {
    icon: Landmark,
    title: "Business Banking",
    description:
      "Multi-currency accounts, payroll, invoicing, and financial tools built for teams.",
  },
];

export default function Services() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border-default to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gold-500/[0.02] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500 mb-4">
            What we offer
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need,{" "}
            <span className="gold-text">nothing you don&apos;t</span>
          </h2>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Modern banking tools designed to simplify your financial life.
          </p>
        </div>

        {/* Card grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="card-premium card-shine group rounded-2xl p-7"
            >
              {/* Icon */}
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/[0.08] text-gold-400 transition-all duration-300 group-hover:bg-gold-500/[0.14] group-hover:shadow-lg group-hover:shadow-gold-500/10">
                <service.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>

              {/* Title */}
              <h3 className="mt-5 text-base font-semibold text-text-primary group-hover:text-gold-400 transition-colors duration-300">
                {service.title}
              </h3>

              {/* Description */}
              <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
