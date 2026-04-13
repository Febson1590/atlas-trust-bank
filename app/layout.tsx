import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "Atlas Trust Bank — Global Banking Excellence",
    template: "%s | Atlas Trust Bank",
  },
  description:
    "Trusted financial services, connecting wealth globally. Premium banking, investments, and wealth management.",
  openGraph: {
    title: "Atlas Trust Bank — Global Banking Excellence",
    description:
      "Trusted financial services, connecting wealth globally. Premium banking, investments, and wealth management.",
    type: "website",
  },
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
