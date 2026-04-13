import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Atlas Trust completely transformed how I manage my international business finances. The speed and security are unmatched.",
    name: "Sarah Chen",
    country: "Singapore",
    rating: 5,
  },
  {
    quote:
      "I switched from a traditional bank and the difference is night and day. Real-time transfers and the dashboard are incredibly intuitive.",
    name: "Marcus Johnson",
    country: "United States",
    rating: 5,
  },
  {
    quote:
      "The investment tools and personalized advisory service have helped me grow my portfolio significantly in the first year.",
    name: "Elena Petrova",
    country: "Switzerland",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-navy-950" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/10 to-transparent" />
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gold-500/[0.02] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Client Testimonials
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by clients{" "}
            <span className="gold-text">around the world</span>
          </h2>
          <p className="mt-4 leading-relaxed text-text-secondary">
            Hear from the people who bank with us every day.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="card-premium card-shine group rounded-2xl p-7"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? "fill-gold-500 text-gold-500"
                        : "fill-navy-700 text-navy-700"
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="mt-4 text-sm italic leading-relaxed text-text-secondary">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Divider */}
              <div className="mt-5 border-t border-border-subtle pt-5">
                <p className="text-sm font-semibold text-text-primary">
                  {testimonial.name}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {testimonial.country}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
