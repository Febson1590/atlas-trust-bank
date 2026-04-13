"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Wealth Management", href: "/services" },
  { label: "Resources", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass glass-border shadow-lg shadow-navy-950/60"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Atlas Trust Bank"
            width={180}
            height={50}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-[13px] font-medium tracking-wide text-text-secondary/80 transition-colors duration-200 hover:text-gold-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-text-secondary/30 px-6 py-2 text-[13px] font-medium text-text-secondary transition-all duration-200 hover:border-gold-500/40 hover:text-gold-400"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-text-secondary/30 px-6 py-2 text-[13px] font-medium text-text-secondary transition-all duration-200 hover:border-gold-500/40 hover:text-gold-400"
          >
            Open Account
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden text-text-secondary hover:text-gold-400 transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-72 flex-col bg-navy-900 border-l border-border-subtle shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <Image
            src="/logo.png"
            alt="Atlas Trust Bank"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
          <button
            type="button"
            className="text-text-secondary hover:text-gold-400 transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <ul className="flex flex-col gap-1 px-4 mt-6">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="block rounded-lg px-4 py-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-navy-800 hover:text-gold-400"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-3 px-6 pb-8">
          <Link
            href="/login"
            className="rounded-lg border border-border-default py-3 text-center text-sm font-medium text-text-secondary transition-all hover:border-gold-500/30 hover:text-gold-400"
            onClick={() => setMobileOpen(false)}
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-border-default py-3 text-center text-sm font-medium text-text-secondary transition-all hover:border-gold-500/30 hover:text-gold-400"
            onClick={() => setMobileOpen(false)}
          >
            Open Account
          </Link>
        </div>
      </div>
    </header>
  );
}
