import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>
        <PublicLayout>
          {children}
        </PublicLayout>
      </body>
    </html>
  );
}
