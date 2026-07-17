"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Sparkles, Users } from 'lucide-react';
import type { Tour } from '../../services/api';
import { formatDuration } from '../../utils/formatDuration';

interface TourCardProps {
  tour: Tour;
  onBookNow?: (tour: Tour) => void;
  onViewDetails?: (tour: Tour) => void;
  variant?: 'grid' | 'editorial';
  destinations?: Array<{ id: number; name: string; country?: string }>;
}

type TourWithDestination = Tour & { primary_destination_id?: number };

export default function TourCard({
  tour,
  onViewDetails,
  variant = 'grid',
  destinations,
}: TourCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const tourWithDestination = tour as TourWithDestination;
  const href = `/tours/${tour.slug}`;

  const destination = destinations?.find(
    (item) => item.id === tourWithDestination.primary_destination_id,
  );

  const destinationName = destination
    ? destination.country
      ? `${destination.name}, ${destination.country}`
      : destination.name
    : tour.location || tour.country || tour.category || 'Custom route';

  const fallbackImage =
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop';

  const displayPrice =
    tour.hasDiscount && tour.discountPercentage
      ? Math.round(tour.price * (1 - tour.discountPercentage / 100))
      : tour.price;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onViewDetails) return;
    event.preventDefault();
    onViewDetails(tour);
  };

  if (variant === 'editorial') {
    return (
      <Link href={href} onClick={handleClick} className="group block h-full focus:outline-none">
        <article className="ui-surface grid h-full overflow-hidden transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card-hover)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-72 overflow-hidden bg-slate-100">
            <div className={`absolute inset-0 animate-pulse bg-slate-200 ${imageLoaded ? 'hidden' : ''}`} />
            <img
              src={tour.image || fallbackImage}
              alt={`${tour.title} tour`}
              loading="lazy"
              className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent" />
            <p className="ui-eyebrow absolute bottom-5 left-5 flex items-center gap-2 text-white">
              <MapPin className="h-4 w-4 text-secondary" />
              {destinationName}
            </p>
          </div>

          <div className="flex flex-col p-7 md:p-9">
            {tour.featured && (
              <span className="ui-eyebrow mb-4 inline-flex w-fit items-center gap-2 text-secondary-dark">
                <Sparkles className="h-4 w-4" /> Featured journey
              </span>
            )}
            <h3 className="ui-heading text-3xl transition-colors group-hover:text-primary">{tour.title}</h3>
            <p className="ui-body mt-4 line-clamp-3">{tour.description}</p>
            <TourFacts tour={tour} />
            <CardFooter tour={tour} displayPrice={displayPrice} />
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={href} onClick={handleClick} className="group block h-full focus:outline-none">
      <article className="ui-surface flex h-full flex-col overflow-hidden transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card-hover)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <div className={`absolute inset-0 animate-pulse bg-slate-200 ${imageLoaded ? 'hidden' : ''}`} />
          <img
            src={tour.image || fallbackImage}
            alt={`${tour.title} tour`}
            loading="lazy"
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

          <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
            {tour.featured ? (
              <span className="ui-eyebrow inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-secondary-dark shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Featured
              </span>
            ) : (
              <span />
            )}
            {(tour.discountPercentage || tour.discount) && (
              <span className="ui-eyebrow rounded-full bg-slate-950/85 px-3 py-2 text-white">
                {tour.discountPercentage || tour.discount}% off
              </span>
            )}
          </div>

          <p className="ui-eyebrow absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white">
            <MapPin className="h-4 w-4 text-secondary" />
            <span className="truncate">{destinationName}</span>
          </p>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="ui-heading text-2xl transition-colors group-hover:text-primary">{tour.title}</h3>
          <p className="ui-body mt-3 line-clamp-2 text-sm">{tour.description}</p>
          <TourFacts tour={tour} compact />
          <CardFooter tour={tour} displayPrice={displayPrice} />
        </div>
      </article>
    </Link>
  );
}

function TourFacts({ tour, compact = false }: { tour: Tour; compact?: boolean }) {
  return (
    <dl className={`mt-6 grid grid-cols-2 gap-3 border-y border-slate-200 py-4 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center gap-2 text-slate-600">
        <Clock className="h-4 w-4 text-primary" />
        <dt className="sr-only">Duration</dt>
        <dd>{formatDuration(tour.duration)}</dd>
      </div>
      <div className="flex items-center gap-2 text-slate-600">
        <Users className="h-4 w-4 text-primary" />
        <dt className="sr-only">Group size</dt>
        <dd>{tour.group_size || 'Flexible'}</dd>
      </div>
      {tour.difficulty && (
        <div className="col-span-2 flex items-center gap-2 capitalize text-slate-600">
          <span className="h-2 w-2 rounded-full bg-secondary" />
          <dt className="sr-only">Difficulty</dt>
          <dd>{tour.difficulty}</dd>
        </div>
      )}
    </dl>
  );
}

function CardFooter({ tour, displayPrice }: { tour: Tour; displayPrice: number }) {
  return (
    <div className="mt-auto flex items-end justify-between gap-4 pt-5">
      <div>
        {tour.priceAvailable !== false && tour.price > 0 ? (
          <>
            <p className="ui-eyebrow text-slate-400">From</p>
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="font-secondary text-xl text-slate-950">${displayPrice}</strong>
              {displayPrice !== tour.price && <span className="text-sm text-slate-400 line-through">${tour.price}</span>}
            </div>
          </>
        ) : (
          <>
            <strong className="font-secondary text-base text-slate-950">Request price</strong>
            <p className="mt-1 text-xs text-slate-500">Based on dates and group size</p>
          </>
        )}
      </div>
      <span className="ui-button-quiet px-2" aria-hidden="true">
        View details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </div>
  );
}
