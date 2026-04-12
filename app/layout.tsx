import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
