import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });
const siteUrl = process.env.APP_URL || "https://www.zeotourism.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Zeo Tourism | Nepal Tours, Trekking & Kailash Mansarovar Yatra",
  description: "Your trusted partner for Nepal tours and spiritual journeys since 2000. Discover trekking, tours and Kailash Mansarovar Yatra packages.",
  alternates: {
    canonical: "/",
  },
  robots: process.env.NODE_ENV === "production"
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

import PublicLayout from "../src/components/Layout/PublicLayout";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-9VP6MKBM6R"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9VP6MKBM6R');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-800 antialiased`}>
        <PublicLayout>
          {children}
        </PublicLayout>
      </body>
    </html>
  );
}
