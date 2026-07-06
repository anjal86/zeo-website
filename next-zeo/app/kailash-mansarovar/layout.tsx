import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Kailash Mansarovar Yatra 2026 | Tour Packages from Nepal — Zeo Tourism",
  description: "Plan Kailash Mansarovar Yatra 2026 from Kathmandu with Zeo Tourism. Compare overland, helicopter and aerial darshan packages, permits, documents, route, cost, safety and expert guide support.",
  alternates: {
    canonical: "/kailash-mansarovar",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">Kailash Mansarovar Yatra</h1>
      {children}
    </>
  );
}
