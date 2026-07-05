import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeo Tourism Migration",
  description: "Next.js migration shell for Zeo Tourism.",
  robots: {
    index: false,
    follow: false,
  },
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
