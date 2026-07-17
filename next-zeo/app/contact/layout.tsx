import type { Metadata } from "next";

const title = "Contact Zeo Tourism | Plan Your Nepal or Kailash Journey";
const description =
  "Contact Zeo Tourism's Kathmandu team for Nepal tours, Kailash Mansarovar Yatra, trekking, activities and custom journey planning.";
const image =
  "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1600&h=900&fit=crop";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title,
    description,
    url: "/contact",
    type: "website",
    images: [
      {
        url: image,
        width: 1600,
        height: 900,
        alt: "Traveller overlooking a Himalayan mountain route",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
