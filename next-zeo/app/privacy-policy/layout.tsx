import React from 'react';

export const metadata = {
  title: "Privacy Policy | Zeo Tourism",
  description: "Read Zeo Tourism's privacy policy for travel enquiries, bookings, cookies, data protection, retention, third-party service partners and contact details.",
  alternates: {
    canonical: "https://zeotourism.com/privacy-policy"
  }
};


export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
