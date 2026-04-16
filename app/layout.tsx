import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Atlas Trust Bank — Global Banking Excellence",
    description:
      "Trusted financial services, connecting wealth globally. Premium banking, investments, and wealth management.",
    url: SITE_URL,
    siteName: "Atlas Trust Bank",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Atlas Trust Bank",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Trust Bank — Global Banking Excellence",
    description:
      "Trusted financial services, connecting wealth globally. Premium banking, investments, and wealth management.",
    images: ["/logo.png"],
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
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
