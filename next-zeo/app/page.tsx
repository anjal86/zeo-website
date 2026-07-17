import type { Metadata } from "next";
import HomeClient, { type HomeData } from "@/components/Home/HomeClient";
import {
  listSliders,
  listTestimonials,
  getContactSettings,
} from "@/server/repositories/content";
import { listDestinations } from "@/server/repositories/catalog";
import {
  createOrganizationSchema,
  createTravelAgencySchema,
  createWebSiteSchema,
} from "@/utils/schema";

export const revalidate = 3600;

const HOME_TITLE = "Nepal Tours, Trekking & Kailash Yatra | Zeo Tourism";
const HOME_DESCRIPTION =
  "Plan Nepal tours, Himalayan adventures and Kailash Mansarovar Yatra packages with a Kathmandu-based travel team offering clear routes and practical local support.";
const HOME_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&h=900&fit=crop";

type DestinationSummary = {
  id: number | string;
  name?: string | null;
  title?: string | null;
  country?: string | null;
  image?: string | null;
  image_url?: string | null;
  href?: string | null;
  slug: string;
  tourCount?: number | string | null;
  tour_count?: number | string | null;
};

type TestimonialSummary = {
  is_featured?: boolean | number | null;
  is_approved?: boolean | number | null;
  rating?: number | string | null;
};

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    siteName: "Zeo Tourism",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: HOME_IMAGE,
        width: 1600,
        height: 900,
        alt: "Himalayan mountain landscape representing Zeo Tourism journeys",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [HOME_IMAGE],
  },
};

const heroFallbackSlide = {
  id: 0,
  title: "Kailash Mansarovar Yatra & Nepal Tours",
  subtitle:
    "Plan sacred journeys, Himalayan adventures, and cultural tours with a Kathmandu-based travel team.",
  location: "Nepal",
  image: HOME_IMAGE,
  video: null,
  video_start_time: null,
  order_index: 0,
  is_active: true,
  button_text: "Explore Packages",
  button_url: "/tours",
  button_style: "primary",
  show_button: true,
};

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.warn(
      "Home data source failed:",
      error instanceof Error ? error.message : error,
    );
    return fallback;
  }
}

async function getFeaturedDestinations() {
  const featured = await safe(
    listDestinations({ featured: "true", limit: "6" }),
    { items: [], total: 0 },
  );
  if (featured.items.length > 0) return featured.items;

  const fallback = await safe(listDestinations({ limit: "6" }), {
    items: [],
    total: 0,
  });
  return fallback.items;
}

async function getHomeData(): Promise<HomeData> {
  const [sliders, destinations, testimonials, contactInfo] = await Promise.all([
    safe(listSliders(), []),
    getFeaturedDestinations(),
    safe(listTestimonials(), []),
    safe(getContactSettings(), {}),
  ]);

  const featuredTestimonials = testimonials.filter(
    (testimonial: TestimonialSummary) => Boolean(testimonial.is_featured),
  );
  const visibleTestimonials = (
    featuredTestimonials.length > 0 ? featuredTestimonials : testimonials
  ).slice(0, 6);

  return {
    sliders: sliders.length > 0 ? sliders : [heroFallbackSlide],
    featuredDestinations: destinations
      .slice(0, 6)
      .map((destination: DestinationSummary) => ({
        id: destination.id,
        name: destination.name || destination.title || "Destination",
        country: destination.country || "Nepal",
        image:
          destination.image ||
          destination.image_url ||
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&h=900&fit=crop",
        href: destination.href || `/destinations/${destination.slug}`,
        tourCount: Number(
          destination.tourCount ?? destination.tour_count ?? 0,
        ),
      })),
    testimonials: visibleTestimonials,
    contactInfo,
  };
}

function getLiveRating(testimonials: TestimonialSummary[]) {
  const approved = testimonials.filter(
    (testimonial) =>
      Boolean(testimonial.is_approved) && Number(testimonial.rating) > 0,
  );
  if (!approved.length) return undefined;

  const average =
    approved.reduce(
      (sum, testimonial) => sum + Number(testimonial.rating),
      0,
    ) / approved.length;

  return {
    ratingValue: Math.round(average * 10) / 10,
    reviewCount: approved.length,
  };
}

export default async function Home() {
  const homeData = await getHomeData();
  const liveRating = getLiveRating(
    homeData.testimonials as TestimonialSummary[],
  );
  const structuredData = [
    createOrganizationSchema(),
    createWebSiteSchema(),
    createTravelAgencySchema(liveRating),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeClient {...homeData} />
    </>
  );
}
