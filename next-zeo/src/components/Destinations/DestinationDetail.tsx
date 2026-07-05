"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Compass, Globe2, MapPin, Mountain, Plane, Route, Shield, Users } from 'lucide-react';
import PageHeader from '../PageHeader/PageHeader';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { useDestinations, useTours } from '../../hooks/useApi';

const destinationFallbacks: Record<string, string> = {
  nepal: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop',
  china: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2070&auto=format&fit=crop',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2070&auto=format&fit=crop',
  thailand: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2070&auto=format&fit=crop',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop',
  vietnam: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop',
  tibet: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=2070&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070&auto=format&fit=crop',
};

const seoContent: Record<string, {
  title: string;
  intro: string;
  bestFor: string;
  planningNote: string;
}> = {
  thailand: {
    title: 'Thailand travel planning from Nepal',
    intro: 'Plan Thailand with clarity around Bangkok, islands, beach stays, family trips and multi-country combinations.',
    bestFor: 'Beach holidays, family trips, city breaks and first-time international travellers.',
    planningNote: 'Thailand works well for short holidays, honeymoon-style travel and add-on routes with Malaysia or Singapore.',
  },
  nepal: {
    title: 'Nepal tours planned from Kathmandu',
    intro: 'Explore Nepal pilgrimage, culture, Himalayan routes, helicopter options, family trips and private itineraries.',
    bestFor: 'Pilgrimage guests, families, trekkers, cultural travellers and private groups.',
    planningNote: 'Nepal routes depend heavily on season, road condition, altitude, permits and local support planning.',
  },
  china: {
    title: 'China and cross-border travel planning',
    intro: 'Plan China, Tibet and connected routes with practical timing, documentation and route clarity.',
    bestFor: 'Cultural travel, cross-border routes, Tibet planning and guided group itineraries.',
    planningNote: 'China-related routes often need stronger document, timing and permit coordination before booking.',
  },
  bali: {
    title: 'Bali travel planning from Nepal',
    intro: 'Plan Bali holidays around beaches, culture, honeymoon-style stays and private leisure itineraries.',
    bestFor: 'Couples, families, leisure travellers and relaxed international holidays.',
    planningNote: 'Bali works best when hotel area, transfer timing and activity pace are planned before final booking.',
  },
  dubai: {
    title: 'Dubai travel planning from Nepal',
    intro: 'Plan Dubai city breaks, family holidays, shopping trips and premium private travel with clear support.',
    bestFor: 'Short holidays, families, shopping trips, events and premium city stays.',
    planningNote: 'Dubai planning depends on hotel area, visa process, activities, transfers and travel dates.',
  },
  vietnam: {
    title: 'Vietnam travel planning from Nepal',
    intro: 'Plan Vietnam routes through cities, culture, nature, food and multi-day private itineraries.',
    bestFor: 'Culture, food, family travel, soft adventure and multi-city holidays.',
    planningNote: 'Vietnam works best when the route is paced clearly between cities, transfers and experiences.',
  },
  tibet: {
    title: 'Tibet travel planning',
    intro: 'Plan Tibet and Himalayan cultural routes with practical timing, permit clarity and support expectations.',
    bestFor: 'Spiritual travel, cultural journeys, Himalayan landscapes and guided group routes.',
    planningNote: 'Tibet routes require careful permit, altitude, timing and border/logistics planning.',
  },
};

function normalizeSlug(slug?: string) {
  return String(slug || '').toLowerCase().trim();
}

function titleCase(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getDestinationFallback(slug: string, destination?: any) {
  const key = `${slug} ${destination?.name || ''} ${destination?.country || ''}`.toLowerCase();
  if (key.includes('nepal')) return destinationFallbacks.nepal;
  if (key.includes('china')) return destinationFallbacks.china;
  if (key.includes('bali')) return destinationFallbacks.bali;
  if (key.includes('thailand')) return destinationFallbacks.thailand;
  if (key.includes('dubai') || key.includes('uae')) return destinationFallbacks.dubai;
  if (key.includes('vietnam') || key.includes('viet')) return destinationFallbacks.vietnam;
  if (key.includes('tibet')) return destinationFallbacks.tibet;
  return destinationFallbacks.default;
}

function getDestinationImage(slug: string, destination?: any) {
  const image = destination?.image || destination?.image_url;
  if (!image || String(image).includes('undefined') || String(image).includes('null')) {
    return getDestinationFallback(slug, destination);
  }
  return image;
}

function getTourImage(tour: any, slug: string, destination: any) {
  const destinationImage = getDestinationFallback(slug, destination);
  const image = tour.image || tour.image_url;

  if (!image || String(image).includes('undefined') || String(image).includes('null')) {
    return destinationImage;
  }

  const looksLikeGenericNepal = [
    '1506905925346',
    '1544735716',
    'everest',
    'annapurna',
    'nepal',
    'placeholder',
  ].some((token) => String(image).toLowerCase().includes(token));

  if (slug !== 'nepal' && looksLikeGenericNepal) {
    return destinationImage;
  }

  return image;
}

function findDestination(destinations: any[] | undefined, slug: string) {
  if (slug === 'nepal') {
    return {
      id: 9999,
      name: 'Nepal',
      title: 'Nepal Tours',
      country: 'Nepal',
      type: 'nepal',
      image: destinationFallbacks.nepal,
      description: seoContent.nepal.intro,
      href: '/destinations/nepal',
    };
  }

  return destinations?.find((destination) => {
    const name = String(destination.name || '').toLowerCase();
    const destinationSlug = String(destination.slug || '').toLowerCase();
    const href = String(destination.href || '').toLowerCase();
    return destinationSlug === slug || href === `/destinations/${slug}` || name === slug || name.replace(/\s+/g, '-') === slug;
  });
}

function isRelatedTour(tour: any, destination: any, slug: string, destinations: any[] | undefined) {
  if (tour.listed === false) return false;

  if (slug === 'nepal') {
    const relatedText = [
      tour.title,
      tour.location,
      tour.category,
      tour.description,
      ...(tour.destinations || []).map((item: any) => `${item.slug || ''} ${item.name || ''}`),
    ].filter(Boolean).join(' ').toLowerCase();

    return ['nepal', 'kathmandu', 'muktinath', 'everest', 'annapurna', 'gosaikunda', 'pokhara', 'lumbini', 'nagarkot', 'gandruk']
      .some((keyword) => relatedText.includes(keyword));
  }

  const destinationId = destination?.id;
  const primaryDestination = destinations?.find((item) => item.id === tour.primary_destination_id);
  const secondaryDestinations = tour.secondary_destination_ids?.map((id: number) => destinations?.find((item) => item.id === id)).filter(Boolean) || [];
  const relatedDestinations = [primaryDestination, ...secondaryDestinations, ...(tour.destinations || [])].filter(Boolean);

  const relationMatch = relatedDestinations.some((item: any) => {
    const itemSlug = String(item.slug || '').toLowerCase();
    const itemName = String(item.name || '').toLowerCase();
    const itemCountry = String(item.country || '').toLowerCase();
    return item.id === destinationId || itemSlug === slug || itemName === slug || itemName.replace(/\s+/g, '-') === slug || itemCountry === slug;
  });

  if (relationMatch) return true;

  const text = [tour.title, tour.location, tour.category, tour.description].filter(Boolean).join(' ').toLowerCase();
  const destinationName = String(destination?.name || '').toLowerCase();
  const destinationCountry = String(destination?.country || '').toLowerCase();

  return text.includes(slug) || (!!destinationName && text.includes(destinationName)) || (!!destinationCountry && text.includes(destinationCountry));
}

const DestinationDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const normalizedSlug = normalizeSlug(slug);
  const { data: destinations, loading: destinationsLoading, error: destinationsError } = useDestinations();
  const { data: allTours, loading: toursLoading, error: toursError } = useTours();

  const loading = destinationsLoading || toursLoading;
  const error = destinationsError || toursError;
  const destination = findDestination(destinations, normalizedSlug);
  const pageCopy = seoContent[normalizedSlug];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={`Failed to load destination details: ${error}`} className="py-20" />;
  }

  if (!destination) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <Compass className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-5 text-3xl font-serif font-bold text-gray-950">Destination not found</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">This destination may have been moved or is currently being updated.</p>
          <Link href="/destinations" className="mt-6 inline-flex items-center justify-center bg-primary px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
            Back to destinations <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const title = destination.title || destination.name || titleCase(normalizedSlug);
  const destinationImage = getDestinationImage(normalizedSlug, destination);
  const destinationCountry = destination.country || title;
  const relatedTours = (allTours || [])
    .filter((tour: any) => isRelatedTour(tour, destination, normalizedSlug, destinations))
    .slice(0, 6);

  return (
    <div className="destination-detail-page bg-white">
      <PageHeader
        title={title}
        subtitle={pageCopy?.intro || destination.description || `Plan ${title} with route clarity, timing guidance and local travel support.`}
        breadcrumb={`Destinations > ${title}`}
        backgroundImage={destinationImage}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="container-xl">
          <div className="grid gap-10 lg:grid-cols-[0.68fr_0.32fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">Destination guide</span>
              <h2 className="mt-4 max-w-4xl text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight text-gray-950">
                {pageCopy?.title || `${title} travel planning with clear route support.`}
              </h2>
              <p className="mt-6 max-w-3xl text-sm md:text-base leading-7 text-gray-600">
                {destination.description || pageCopy?.intro || `Explore ${title} with a planning team that helps clarify route, timing, transport, support level and the practical details before booking.`}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="border border-gray-200 bg-gray-50 p-5">
                  <MapPin className="mb-4 h-5 w-5 text-primary" />
                  <div className="text-sm font-bold text-gray-950">Region</div>
                  <div className="mt-1 text-sm text-gray-600">{destinationCountry}</div>
                </div>
                <div className="border border-gray-200 bg-gray-50 p-5">
                  <Users className="mb-4 h-5 w-5 text-secondary" />
                  <div className="text-sm font-bold text-gray-950">Best for</div>
                  <div className="mt-1 text-sm text-gray-600">{pageCopy?.bestFor || 'Private, group and family travel'}</div>
                </div>
                <div className="border border-gray-200 bg-gray-50 p-5">
                  <Shield className="mb-4 h-5 w-5 text-primary" />
                  <div className="text-sm font-bold text-gray-950">Planning style</div>
                  <div className="mt-1 text-sm text-gray-600">Route-first guidance</div>
                </div>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="border border-gray-200 bg-gray-50 p-6"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Planning note</span>
              <h3 className="mt-4 text-2xl font-serif font-bold text-gray-950">Ask before you book.</h3>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                {pageCopy?.planningNote || 'The right itinerary depends on dates, route, group size, pace, budget and support level.'}
              </p>
              <Link href="/contact" className="mt-6 inline-flex w-full items-center justify-center bg-primary px-6 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark">
                Plan this route <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </motion.aside>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50 py-14 md:py-20">
        <div className="container-xl">
          <div className="mb-9 grid gap-5 lg:grid-cols-[0.42fr_0.58fr] lg:items-end">
            <div>
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">Available packages</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold leading-tight text-gray-950">
                Routes connected to {title}
              </h2>
            </div>
            <p className="text-sm md:text-base leading-7 text-gray-600 lg:max-w-xl lg:justify-self-end">
              Browse relevant packages, or contact us for a custom route if your dates, group size or travel purpose needs a different plan.
            </p>
          </div>

          {relatedTours.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedTours.map((tour: any, index: number) => (
                <motion.article
                  key={tour.slug || tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="group h-full border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/5"
                >
                  <Link href={`/tours/${tour.slug}`} className="flex h-full flex-col">
                    <div className="relative h-64 overflow-hidden bg-gray-200">
                      <img
                        src={getTourImage(tour, normalizedSlug, destination)}
                        alt={tour.title}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = getDestinationFallback(normalizedSlug, destination);
                        }}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/20 to-transparent" />
                      <div className="absolute left-4 top-4 bg-white/90 px-3 py-2 backdrop-blur-sm">
                        <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.16em] text-gray-700">
                          <Plane className="mr-2 h-3.5 w-3.5 text-secondary" /> {destinationCountry}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-serif font-bold leading-tight text-gray-950 transition-colors group-hover:text-primary">
                        {tour.title}
                      </h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{tour.description}</p>

                      <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
                        {tour.duration && (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" /> {tour.duration}
                          </span>
                        )}
                        {tour.group_size && (
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-primary" /> {tour.group_size}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">View details</span>
                        <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 bg-white p-8 text-center">
              <Compass className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-4 text-2xl font-serif font-bold text-gray-950">No listed package found yet</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                This destination can still be planned privately. Share your dates, group size and travel purpose so we can suggest the right route.
              </p>
              <Link href="/contact" className="mt-6 inline-flex items-center justify-center bg-primary px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                Request custom plan <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DestinationDetail;
