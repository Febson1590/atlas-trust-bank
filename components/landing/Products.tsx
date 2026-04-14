import { User, Building2, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

const products = [
  {
    icon: User,
    title: "Personal Banking",
    description:
      "Checking and savings accounts with competitive rates, multi-currency cards, and real-time visibility into your finances.",
    href: "/services#personal",
  },
  {
    icon: Building2,
    title: "Business Banking",
    description:
      "Dedicated business accounts with payroll integration, multi-currency support, and cash management tools built for scale.",
    href: "/services#business",
  },
  {
    icon: TrendingUp,
    title: "Investment Solutions",
    description:
      "Portfolio management, market insights, and advisory services designed to help you build long-term wealth with clarity.",
    href: "/services#wealth",
  },
];

export default function Products() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-navy-950" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/15 to-transparent" />
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gold-500/[0.02] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Our Products
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Banking that{" "}
            <span className="gold-text">works for you</span>
          </h2>
          <p className="mt-4 leading-relaxed text-text-secondary">
            Personal accounts, business tools, and investment services
            — all on one platform.
          </p>
        </div>

        {/* Product cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.title}
              className="card-premium card-shine group rounded-2xl p-6 sm:p-7"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/[0.08] text-gold-400 transition-all duration-300 group-hover:bg-gold-500/[0.14] group-hover:shadow-lg group-hover:shadow-gold-500/10">
                <product.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>

              {/* Title */}
              <h3 className="mt-5 text-lg font-semibold text-text-primary transition-colors duration-300 group-hover:text-gold-400">
                {product.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {product.description}
              </p>

              {/* Link */}
              <Link
                href={product.href}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gold-500 transition-all duration-300 hover:text-gold-400 hover:gap-2.5"
              >
                Learn more
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
