import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import TawkWidget from "@/components/TawkWidget";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Production canonical URL. metadataBase + OG + Twitter all use this.
// Override via NEXT_PUBLIC_APP_URL on Vercel for non-prod deploys.
const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://atlastrustcore.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Atlas Trust Bank — Global Banking Excellence",
    template: "%s | Atlas Trust Bank",
  },
  description:
    "Trusted financial services, connecting wealth globally. Premium banking, investments, and wealth management.",
  applicationName: "Atlas Trust Bank",
  keywords: [
    "banking",
    "global banking",
    "international transfers",
    "wealth management",
    "private banking",
    "savings accounts",
    "investment accounts",
    "Atlas Trust Bank",
  ],
  authors: [{ name: "Atlas Trust Bank" }],
  creator: "Atlas Trust Bank",
  publisher: "Atlas Trust Bank",
  // Icons + social preview images are auto-wired by Next.js 16 via the
  // `app/icon.png`, `app/apple-icon.png`, `app/opengraph-image.png`, and
  // `app/twitter-image.png` magic files. Declaring them here would double
  // up (Next.js emits the proper <link rel="icon"> + OG/Twitter tags on
  // its own with correct dimensions and fingerprints).
  openGraph: {
    title: "Atlas Trust Bank — Global Banking Excellence",
    description:
      "Trusted financial services, connecting wealth globally. Premium banking, investments, and wealth management.",
    url: SITE_URL,
    siteName: "Atlas Trust Bank",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Trust Bank — Global Banking Excellence",
    description:
      "Trusted financial services, connecting wealth globally. Premium banking, investments, and wealth management.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A1628",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${playfair.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        {/* Tawk.to livechat widget — visible on public/marketing/auth pages,
            hidden on /dashboard and /admin (users there have in-app support). */}
        <TawkWidget />
        {/* Google-Translate-powered language switcher. Appears on every page
            (marketing, auth, dashboard, admin). Bottom-left so it never
            overlaps the Tawk bubble (bottom-right). */}
        <LanguageSwitcher />
      </body>
    </html>
  );
}
