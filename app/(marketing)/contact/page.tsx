import { Mail, Phone, MapPin, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Atlas Trust Bank",
  description:
    "Get in touch with Atlas Trust Bank. Reach our team by phone, email, or visit one of our global offices.",
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    primary: "support@atlastrust.com",
    secondary: "corporate@atlastrust.com",
    note: "We respond within 24 hours",
  },
  {
    icon: Phone,
    title: "Phone",
    primary: "+1 (800) 482-7878",
    secondary: "+44 20 7946 0958",
    note: "Available 24/7 for priority clients",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    primary: "Bahnhofstrasse 42",
    secondary: "8001 Zurich, Switzerland",
    note: "Regional offices in New York, London, Singapore, Dubai",
  },
  {
    icon: Clock,
    title: "Business Hours",
    primary: "Mon - Fri: 8:00 AM - 8:00 PM (CET)",
    secondary: "Sat: 9:00 AM - 2:00 PM (CET)",
    note: "Online banking available 24/7",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-navy-900">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-gold-500/[0.04] blur-[120px]" />
          <div className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full bg-navy-600/30 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(197,165,90,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(197,165,90,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold-500">
              Get in Touch
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Contact <span className="gold-text">Us</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary">
              Whether you have questions about our services, need support with
              your account, or want to explore a partnership, our team is ready
              to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────── */}
      <section className="relative bg-navy-950 py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* ── Left: Contact Form ─────────────────────────────── */}
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Send Us a Message
              </h2>
              <p className="text-text-muted mb-8">
                Fill out the form below and a member of our team will respond
                within one business day.
              </p>

              <form
                action="/api/support"
                method="POST"
                className="space-y-6"
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-border-default bg-navy-800 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-border-default bg-navy-800 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    placeholder="How can we help you?"
                    className="w-full rounded-lg border border-border-default bg-navy-800 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Please describe your inquiry in detail..."
                    className="w-full rounded-lg border border-border-default bg-navy-800 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="gold-gradient w-full rounded-lg px-6 py-3.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* ── Right: Contact Info Cards ──────────────────────── */}
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Contact Information
              </h2>
              <p className="text-text-muted mb-8">
                Reach us through any of the channels below, or visit our
                headquarters in Zurich.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {contactInfo.map((item) => (
                  <div
                    key={item.title}
                    className="card-shine group rounded-xl border border-border-subtle bg-navy-800/60 p-6 transition-all duration-300 hover:border-gold-500/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400 flex-shrink-0 transition-colors group-hover:bg-gold-500/20">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-text-secondary">
                          {item.primary}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {item.secondary}
                        </p>
                        <p className="mt-2 text-xs text-text-muted">
                          {item.note}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map Placeholder ────────────────────────────────────── */}
      <section className="relative bg-navy-900 py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-2xl font-bold text-text-primary">
              Our Global Presence
            </h2>
            <p className="mt-2 text-text-muted">
              Headquarters in Zurich, with regional offices in major financial
              centers worldwide.
            </p>
          </div>

          {/* Map placeholder */}
          <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-navy-800/60 h-80 lg:h-96">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Decorative dots to simulate map */}
              <div className="relative w-full h-full">
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(197,165,90,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(197,165,90,0.4) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Location markers */}
                <div className="absolute top-[30%] left-[47%]">
                  <div className="h-3 w-3 rounded-full bg-gold-500 animate-pulse" />
                  <p className="mt-1 text-[10px] font-medium text-gold-400 whitespace-nowrap">
                    Zurich (HQ)
                  </p>
                </div>
                <div className="absolute top-[28%] left-[44%]">
                  <div className="h-2 w-2 rounded-full bg-gold-500/60" />
                  <p className="mt-1 text-[10px] text-text-muted whitespace-nowrap">
                    London
                  </p>
                </div>
                <div className="absolute top-[32%] left-[72%]">
                  <div className="h-2 w-2 rounded-full bg-gold-500/60" />
                  <p className="mt-1 text-[10px] text-text-muted whitespace-nowrap">
                    Singapore
                  </p>
                </div>
                <div className="absolute top-[38%] left-[55%]">
                  <div className="h-2 w-2 rounded-full bg-gold-500/60" />
                  <p className="mt-1 text-[10px] text-text-muted whitespace-nowrap">
                    Dubai
                  </p>
                </div>
                <div className="absolute top-[30%] left-[22%]">
                  <div className="h-2 w-2 rounded-full bg-gold-500/60" />
                  <p className="mt-1 text-[10px] text-text-muted whitespace-nowrap">
                    New York
                  </p>
                </div>
                <div className="absolute top-[26%] left-[80%]">
                  <div className="h-2 w-2 rounded-full bg-gold-500/60" />
                  <p className="mt-1 text-[10px] text-text-muted whitespace-nowrap">
                    Tokyo
                  </p>
                </div>

                {/* Center label */}
                <div className="absolute inset-0 flex items-end justify-center pb-8">
                  <div className="glass glass-border rounded-lg px-4 py-2">
                    <p className="text-xs text-text-muted">
                      <MapPin className="inline h-3 w-3 mr-1 text-gold-400" />
                      Offices across 160+ countries
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
