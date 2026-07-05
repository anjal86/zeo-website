import HomeClient, { type HomeData } from "@/components/Home/HomeClient";
import { listSliders, listTestimonials, getContactSettings } from "@/server/repositories/content";
import { listDestinations } from "@/server/repositories/catalog";
import { createOrganizationSchema, createTravelAgencySchema, createWebSiteSchema } from "@/utils/schema";

export const revalidate = 3600;

const heroFallbackSlide = {
  id: 0,
  title: "Kailash Mansarovar Yatra & Nepal Tours",
  subtitle: "Plan sacred journeys, Himalayan adventures, and cultural tours with a Kathmandu-based travel team.",
  location: "Nepal",
  image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop",
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
    console.warn("Home data source failed:", error instanceof Error ? error.message : error);
    return fallback;
  }
}

async function getFeaturedDestinations() {
  const featured = await safe(listDestinations({ featured: "true", limit: "6" }), { items: [], total: 0 });
  if (featured.items.length > 0) return featured.items;

  const fallback = await safe(listDestinations({ limit: "6" }), { items: [], total: 0 });
  return fallback.items;
}

async function getHomeData(): Promise<HomeData> {
  const [sliders, destinations, testimonials, contactInfo] = await Promise.all([
    safe(listSliders(), []),
    getFeaturedDestinations(),
    safe(listTestimonials(), []),
    safe(getContactSettings(), {}),
  ]);

  const featuredTestimonials = testimonials.filter((testimonial: any) => testimonial.is_featured);
  const visibleTestimonials = (featuredTestimonials.length > 0 ? featuredTestimonials : testimonials).slice(0, 6);

  return {
    sliders: sliders.length > 0 ? sliders : [heroFallbackSlide],
    featuredDestinations: destinations.slice(0, 6).map((destination: any) => ({
      id: destination.id,
      name: destination.name || destination.title,
      country: destination.country || "Nepal",
      image: destination.image || destination.image_url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&h=900&fit=crop",
      href: destination.href || `/destinations/${destination.slug}`,
      tourCount: Number(destination.tourCount ?? destination.tour_count ?? 0),
    })),
    testimonials: visibleTestimonials,
    contactInfo,
  };
}

function getLiveRating(testimonials: any[]) {
  const approved = testimonials.filter((testimonial) => testimonial.is_approved && Number(testimonial.rating) > 0);
  if (!approved.length) return undefined;

  const avg = approved.reduce((sum, testimonial) => sum + Number(testimonial.rating), 0) / approved.length;
  return { ratingValue: Math.round(avg * 10) / 10, reviewCount: approved.length };
}

export default async function Home() {
  const homeData = await getHomeData();
  const liveRating = getLiveRating(homeData.testimonials);
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
