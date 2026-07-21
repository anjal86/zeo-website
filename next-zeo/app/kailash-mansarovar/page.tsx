import type { Metadata } from "next";
import KailashMansarovarClient, {
  type KailashGalleryPhoto,
} from "@/components/Kailash/KailashMansarovarClient";
import JsonLd from "@/components/seo/JsonLd";
import type { Tour } from "@/services/api";
import { listKailashGallery } from "@/server/repositories/company";
import { listDestinations } from "@/server/repositories/catalog";
import { getContactSettings } from "@/server/repositories/content";
import { listTours } from "@/server/repositories/tours";
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
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&h=900&fit=crop";
const DATA_TIMEOUT_MS = 4_000;
const MAX_HERO_IMAGES = 8;

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
        url: FALLBACK_IMAGE,
        width: 1600,
        height: 900,
        alt: "Mount Kailash and the Himalayan landscape",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [FALLBACK_IMAGE],
  },
};

type GalleryResult = Awaited<ReturnType<typeof listKailashGallery>>;
type ToursResult = Awaited<ReturnType<typeof listTours>>;
type DestinationsResult = Awaited<ReturnType<typeof listDestinations>>;
type ContactSettings = Awaited<ReturnType<typeof getContactSettings>>;

async function safe<T>(
  label: string,
  request: () => Promise<T>,
  fallback: T,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(
        `Kailash page ${label} data timed out after ${DATA_TIMEOUT_MS}ms; rendering fallback content.`,
      );
      resolve(fallback);
    }, DATA_TIMEOUT_MS);
  });

  try {
    return await Promise.race([request(), timeout]);
  } catch (error) {
    console.warn(
      `Kailash page ${label} data source failed:`,
      error instanceof Error ? error.message : error,
    );
    return fallback;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export default async function KailashMansarovarPage() {
  const [galleryResult, toursResult, destinationsResult, contactInfo] =
    await Promise.all([
      safe("gallery", () => listKailashGallery(), { gallery: [] }),
      safe(
        "tours",
        () => listTours({ search: "kailash", limit: "12" }),
        {
          items: [],
          total: 0,
        },
      ),
      safe("destinations", () => listDestinations({ limit: "100" }), {
        items: [],
        total: 0,
      }),
      safe("contact", () => getContactSettings(), {}),
    ]);

  const galleryPhotos: KailashGalleryPhoto[] = galleryResult.gallery
    .filter((photo) => Boolean(photo.image))
    .slice(0, MAX_HERO_IMAGES)
    .map((photo) => ({
      id: photo.id,
      title: photo.title,
      image: photo.image,
      alt: photo.alt,
    }));

  const tours = toursResult.items as unknown as Tour[];
  const destinations = destinationsResult.items.map((destination) => ({
    id: Number(destination.id),
    name: destination.name,
    country: destination.country || undefined,
  }));
  const heroImage = galleryPhotos[0]?.image || FALLBACK_IMAGE;

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
      image: heroImage,
      url: PAGE_URL,
      toursCount: tours.length,
    }),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <KailashMansarovarClient
        galleryPhotos={galleryPhotos}
        tours={tours}
        destinations={destinations}
        contactInfo={contactInfo}
      />
    </>
  );
}
