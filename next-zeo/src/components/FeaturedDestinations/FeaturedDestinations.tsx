"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Mountain } from "lucide-react";

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
  if (destination.country && destination.country.toLowerCase() !== "nepal") return "Cross-border journey";
  return index === 0 ? "Featured route" : "Curated destination";
}

function cardLayout(index: number) {
  if (index === 0) return "md:col-span-7 md:row-span-2 min-h-[430px] md:min-h-[590px]";
  if (index === 1 || index === 2) return "md:col-span-5 min-h-[285px]";
  return "md:col-span-4 min-h-[265px]";
}

export default function FeaturedDestinations({ featuredDestinations }: Props) {
  const destinations = featuredDestinations?.slice(0, 6) || [];
  if (destinations.length === 0) return null;

  return (
    <section className="border-t border-slate-100 bg-slate-50 py-16 md:py-24">
      <div className="container-xl">
        <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">01 — Destinations</p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[1.02] tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
              Places worth planning around.
            </h2>
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-xl text-base leading-7 text-slate-600">
              A focused selection of sacred journeys, Himalayan routes and cultural destinations with practical planning support.
            </p>
            <Link
              href="/destinations"
              className="mt-5 inline-flex items-center gap-3 border-b border-slate-300 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-950 transition-colors hover:border-primary hover:text-primary"
            >
              View all destinations <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[285px]">
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
                className={`group relative overflow-hidden border border-slate-200 bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 ${cardLayout(index)}`}
              >
                <img
                  src={destinationImage(destination, index)}
                  alt={`${destination.name} in ${destination.country || "Nepal"}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                  onError={(event) => {
                    const image = event.currentTarget;
                    const fallback = fallbackDestinationImages[index % fallbackDestinationImages.length];
                    if (image.src !== fallback) image.src = fallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-950/10" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 md:p-6">
                  <span className="border border-white/20 bg-black/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                    {destination.country || "Nepal"}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center border border-white/20 bg-black/20 text-white transition-colors group-hover:border-primary group-hover:bg-primary">
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {typeLabel}
                  </p>
                  <h3 className={`mt-3 max-w-xl font-serif font-bold leading-tight ${index === 0 ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
                    {destination.name}
                  </h3>
                  <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/65">
                    <Mountain className="h-3.5 w-3.5" />
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
