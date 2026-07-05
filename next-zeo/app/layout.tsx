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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
