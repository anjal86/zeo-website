import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./styles/accessibility.css";
import PublicLayout from "../src/components/Layout/PublicLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = process.env.APP_URL || "https://www.zeotourism.com";
const isProduction = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Zeo Tourism",
  title: "Zeo Tourism | Nepal Tours, Trekking & Kailash Mansarovar Yatra",
  description:
    "Plan Nepal tours, Himalayan journeys and Kailash Mansarovar Yatra packages with a Kathmandu-based travel team offering practical local support.",
  category: "travel",
  creator: "Zeo Tourism",
  publisher: "Zeo Tourism",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  robots: isProduction
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : {
        index: false,
        follow: false,
        nocache: true,
      },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#055fac",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      data-scroll-behavior="smooth"
    >
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
      <body className="bg-white font-sans text-slate-800 antialiased">
        <PublicLayout>{children}</PublicLayout>
      </body>
    </html>
  );
}
