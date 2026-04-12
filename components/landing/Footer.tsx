import Link from "next/link";
import Image from "next/image";

const columns = [
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Banking",
    links: [
      { label: "Personal", href: "/services#personal" },
      { label: "Business", href: "/services#business" },
      { label: "Wealth", href: "/services#wealth" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", href: "/contact" },
      { label: "Contact", href: "/contact" },
      { label: "FAQs", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Compliance", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* ── Brand column ── */}
          <div className="lg:col-span-1">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Atlas Trust Bank"
                width={160}
                height={44}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Trusted financial services, connecting wealth globally since 1987.
            </p>
          </div>

          {/* ── Link columns ── */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gold-500">
                {col.heading}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-text-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 sm:flex-row">
          <p className="text-xs text-text-muted">
            &copy; 2025 Atlas Trust Bank. All rights reserved.
          </p>

          {/* Social icons — minimal SVG icons */}
          <div className="flex items-center gap-5">
            {/* LinkedIn */}
            <a
              href="#"
              className="text-text-muted transition-colors hover:text-gold-400"
              aria-label="LinkedIn"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            {/* Twitter / X */}
            <a
              href="#"
              className="text-text-muted transition-colors hover:text-gold-400"
              aria-label="Twitter"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="#"
              className="text-text-muted transition-colors hover:text-gold-400"
              aria-label="Facebook"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
