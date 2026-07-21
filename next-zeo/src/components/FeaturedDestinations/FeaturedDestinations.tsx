"use client";

import Link from "next/link";
import { ArrowRight, Compass, MapPin, Mountain } from "lucide-react";

export interface FeaturedDestination {
  id: number;
  name: string;
  country: string;
  image: string;
  href?: string;
  tourCount: number;
}

interface Props {
  featuredDestinations: FeaturedDestination[];
}

const fallbackDestinationImages = [
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&h=900&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&h=900&fit=crop",
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&h=900&fit=crop",
  "https://images.unsplash.com/photo-1609440034849-c4d6b7a520b7?q=80&w=1200&h=900&fit=crop",
  "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=1200&h=900&fit=crop",
  "https://images.unsplash.com/photo-1603273997415-0f4f201c969f?q=80&w=1200&h=900&fit=crop",
];

function destinationImage(destination: FeaturedDestination, index: number) {
  if (destination.image && !destination.image.includes("1506905925346")) return destination.image;
  return fallbackDestinationImages[index % fallbackDestinationImages.length];
}

function destinationType(destination: FeaturedDestination, index: number) {
  const name = destination.name.toLowerCase();
  if (name.includes("kailash") || name.includes("muktinath") || name.includes("gosaikunda")) return "Pilgrimage route";
  if (name.includes("everest") || name.includes("poon") || name.includes("trek")) return "Trekking route";
  if (destination.country && destination.country.toLowerCase() !== "nepal") return "International journey";
  return index === 0 ? "Featured journey" : "Curated destination";
}

function cardLayout(index: number) {
  if (index === 0) return "md:col-span-2 lg:col-span-2 min-h-[390px] md:min-h-[430px]";
  if (index === 1) return "min-h-[390px] md:min-h-[430px]";
  return "min-h-[310px]";
}

export default function FeaturedDestinations({ featuredDestinations }: Props) {
  const destinations = featuredDestinations?.slice(0, 6) || [];
  if (destinations.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-t border-slate-100 bg-slate-50 py-16 md:py-24">
      <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-secondary/8 blur-3xl" aria-hidden="true" />

      <div className="container-xl relative">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
              <Compass className="h-4 w-4" aria-hidden="true" />
              Featured destinations
            </p>
            <h2 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 md:text-5xl">
              Find a journey worth planning around.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Explore sacred routes, Himalayan landscapes and cultural destinations with the practical details needed to choose confidently.
            </p>
          </div>

          <Link
            href="/destinations"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Explore all destinations
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => {
            const tourLabel = destination.tourCount > 0
              ? `${destination.tourCount} ${destination.tourCount === 1 ? "package" : "packages"}`
              : "Custom planning available";
            const typeLabel = destinationType(destination, index);
            const href = destination.href || `/destinations/${destination.name.toLowerCase().replace(/\s+/g, "-")}`;

            return (
              <Link
                key={destination.id}
                href={href}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 ${cardLayout(index)}`}
              >
                <img
                  src={destinationImage(destination, index)}
                  alt={`${destination.name} in ${destination.country || "Nepal"}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]"
                  onError={(event) => {
                    const image = event.currentTarget;
                    const fallback = fallbackDestinationImages[index % fallbackDestinationImages.length];
                    if (image.src !== fallback) image.src = fallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/32 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/25 to-transparent" />

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 md:p-6">
                  <span className="rounded-full border border-white/20 bg-black/30 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                    {destination.country || "Nepal"}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-black/25 text-white backdrop-blur-sm transition-colors duration-200 group-hover:border-primary group-hover:bg-primary">
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
                  <p className="flex items-center gap-2 text-xs font-semibold text-white/75">
                    <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                    {typeLabel}
                  </p>
                  <h3 className={`mt-3 max-w-xl font-serif font-bold leading-tight ${index === 0 ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}>
                    {destination.name}
                  </h3>
                  <p className="mt-4 flex items-center gap-2 text-sm font-medium text-white/72">
                    <Mountain className="h-4 w-4" aria-hidden="true" />
                    {tourLabel}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
