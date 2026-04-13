import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: {
    default: "Authentication",
    template: "%s | Atlas Trust Bank",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-navy-600/20 rounded-full blur-[100px]" />
      </div>

      {/* Logo / Brand */}
      <Link
        href="/"
        className="relative z-10 mb-8 sm:mb-10 flex flex-col items-center gap-3 group"
      >
        <Image
          src="/logo.png"
          alt="Atlas Trust Bank"
          width={220}
          height={60}
          className="h-16 w-auto group-hover:scale-105 transition-transform duration-300"
        />
        <p className="text-text-muted text-xs sm:text-sm tracking-widest uppercase">
          Global Banking Excellence
        </p>
      </Link>

      {/* Page content */}
      <main className="relative z-10 w-full max-w-md animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-8 sm:mt-10 text-center text-text-muted text-xs">
        <p>&copy; {new Date().getFullYear()} Atlas Trust Bank. All rights reserved.</p>
      </footer>
    </div>
  );
}
