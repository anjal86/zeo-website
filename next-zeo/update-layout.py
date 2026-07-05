with open('app/layout.tsx', 'r') as f:
    content = f.read()

new_layout = """import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: "Zeo Tourism | Nepal Tours, Trekking & Kailash Mansarovar Yatra",
  description: "Your trusted partner for Nepal tours and spiritual journeys since 2000. Discover trekking, tours and Kailash Mansarovar Yatra packages.",
  robots: process.env.NODE_ENV === "production"
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

import PublicLayout from "../src/components/Layout/PublicLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className={`${inter.className} bg-slate-50 text-slate-800 antialiased`}>
        <PublicLayout>
          {children}
        </PublicLayout>
      </body>
    </html>
  );
}
"""

with open('app/layout.tsx', 'w') as f:
    f.write(new_layout)
