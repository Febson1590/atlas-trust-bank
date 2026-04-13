import { Send, Landmark, Headphones } from "lucide-react";

const features = [
  {
    icon: Send,
    title: "Fast & Secure Transfers",
    description: "Move your money globally with ease and confidence",
  },
  {
    icon: Landmark,
    title: "High-Interest Savings",
    description: "Grow your wealth with our competitive savings accounts",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    description: "Get professional assistance anytime, anywhere",
  },
];

export default function Services() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-navy-950" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="gold-text">Trusted, Secure, Smart</span> Banking
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary/80 max-w-lg">
            Experience the highest standards of banking with Atlas Trust Bank. We provide
            fast, secure, and tailored financial services to meet your needs.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-premium card-shine group rounded-2xl p-7"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gold-500/[0.08] text-gold-400 transition-all duration-300 group-hover:bg-gold-500/[0.14] group-hover:shadow-lg group-hover:shadow-gold-500/10">
                  <feature.icon className="h-5 w-5" strokeWidth={1.8} />
                </div>

                <div>
                  {/* Title */}
                  <h3 className="text-base font-semibold text-text-primary group-hover:text-gold-400 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
