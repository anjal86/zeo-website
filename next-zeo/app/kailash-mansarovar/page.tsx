import type { Metadata } from "next";
import KailashMansarovarLoader from "@/components/Kailash/KailashMansarovarLoader";
import type { KailashGalleryPhoto } from "@/components/Kailash/KailashMansarovarClient";
import JsonLd from "@/components/seo/JsonLd";
import {
  createBreadcrumbSchema,
  createOrganizationSchema,
  createTouristDestinationSchema,
} from "@/server/seo/schema";

export const revalidate = 3600;

const PAGE_TITLE =
  "Kailash Mansarovar Yatra 2026 | Routes, Permits & Packages";
const PAGE_DESCRIPTION =
  "Compare Kailash Mansarovar Yatra routes from Kathmandu, understand Tibet permits and altitude preparation, and explore current overland, helicopter and Lhasa itineraries.";
const PAGE_URL = "https://zeotourism.com/kailash-mansarovar";

const FALLBACK_GALLERY: KailashGalleryPhoto[] = [
  {
    id: "kailash-fallback-1",
    title: "Mount Kailash",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=82&w=1920&h=1080&fit=crop",
    alt: "Himalayan mountain landscape representing Mount Kailash",
  },
  {
    id: "kailash-fallback-2",
    title: "Sacred Himalayan landscape",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=82&w=1920&h=1080&fit=crop",
    alt: "High Himalayan valley on the route toward Kailash Mansarovar",
  },
  {
    id: "kailash-fallback-3",
    title: "Journey across the plateau",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=82&w=1920&h=1080&fit=crop",
    alt: "Snow-covered Himalayan peaks beneath a dramatic sky",
  },
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/kailash-mansarovar",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/kailash-mansarovar",
    siteName: "Zeo Tourism",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: FALLBACK_GALLERY[0].image,
        width: 1920,
        height: 1080,
        alt: "Mount Kailash and the Himalayan landscape",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [FALLBACK_GALLERY[0].image],
  },
};

const structuredData = [
  createOrganizationSchema(),
  createBreadcrumbSchema([
    { name: "Home", url: "https://zeotourism.com" },
    { name: "Kailash Mansarovar Yatra", url: PAGE_URL },
  ]),
  createTouristDestinationSchema({
    name: "Mount Kailash and Lake Mansarovar",
    description: PAGE_DESCRIPTION,
    country: "China",
    image: FALLBACK_GALLERY[0].image,
    url: PAGE_URL,
    toursCount: 0,
  }),
];

export default function KailashMansarovarPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <KailashMansarovarLoader fallbackGallery={FALLBACK_GALLERY} />
    </>
  );
}
