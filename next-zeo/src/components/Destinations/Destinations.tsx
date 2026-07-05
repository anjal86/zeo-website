"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Compass, Globe2, MapPin, Mountain, Plane, Route } from 'lucide-react';
import { useDestinations } from '../../hooks/useApi';
import SkeletonCard from '../UI/SkeletonCard';
import ErrorMessage from '../UI/ErrorMessage';

const fallbackImages = {
  nepal: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop',
  china: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1600&auto=format&fit=crop',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1600&auto=format&fit=crop',
  thailand: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1600&auto=format&fit=crop',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop',
  vietnam: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600&auto=format&fit=crop',
  tibet: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1600&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
};

const getSlug = (destination: any) => {
  if (destination.href) return destination.href;
  if (destination.slug) return `/destinations/${destination.slug}`;
  return `/destinations/${String(destination.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
};

const getFallbackImage = (destination: any) => {
  const key = String(destination.name || destination.country || '').toLowerCase();
  if (key.includes('nepal')) return fallbackImages.nepal;
  if (key.includes('china')) return fallbackImages.china;
  if (key.includes('bali')) return fallbackImages.bali;
  if (key.includes('thailand')) return fallbackImages.thailand;
  if (key.includes('dubai') || key.includes('uae')) return fallbackImages.dubai;
  if (key.includes('vietnam') || key.includes('viet')) return fallbackImages.vietnam;
  if (key.includes('tibet')) return fallbackImages.tibet;
  return fallbackImages.default;
};

const getImage = (destination: any) => {
  const image = destination.image || destination.featured_image || destination.image_url;
  if (!image || String(image).includes('undefined') || String(image).includes('null')) {
    return getFallbackImage(destination);
  }
  return image;
};

const DestinationCard = ({ destination, index, featured = false }: { destination: any; index: number; featured?: boolean }) => {
  const href = getSlug(destination);
  const isInternational = destination.country !== 'Nepal' && destination.name !== 'Nepal';

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={`group ${featured ? 'lg:col-span-2' : ''}`}
    >
      <Link href={href} className="block h-full">
        <div className={`relative overflow-hidden bg-gray-950 shadow-lg shadow-gray-900/10 ${featured ? 'min-h-[430px]' : 'min-h-[320px]'}`}>
          <img
            src={getImage(destination)}
            alt={`${destination.name} travel destination`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getFallbackImage(destination);
            }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/45 to-gray-950/5" />
          <div className="absolute left-5 top-5 flex items-center gap-2 bg-white/90 px-3 py-2 backdrop-blur-sm">
            {isInternational ? <Plane className="h-3.5 w-3.5 text-secondary" /> : <Mountain className="h-3.5 w-3.5 text-primary" />}
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-700">
              {isInternational ? 'International' : 'Nepal'}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-7">
            <div className="mb-3 flex items-center gap-2 text-sm text-white/75">
              <MapPin className="h-4 w-4" />
              <span>{destination.country || destination.name}</span>
            </div>
            <h3 className={`${featured ? 'text-3xl md:text-4xl' : 'text-2xl'} font-serif font-bold leading-tight`}>
              {destination.name}
            </h3>
            <div className="mt-5 inline-flex items-center text-xs font-bold uppercase tracking-wider text-white/90">
              Explore destination <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

const Destinations: React.FC = () => {
  const { data: destinations, loading, error } = useDestinations();

  const listedDestinations = destinations?.filter((destination: any) => destination.listed !== false) || [];
  const nepalDestinations = listedDestinations.filter((destination: any) => destination.country === 'Nepal' || destination.type === 'nepal');
  const internationalDestinations = listedDestinations.filter((destination: any) => destination.country !== 'Nepal' && destination.type !== 'nepal');

  const nepalDestination = {
    id: 'nepal-all-tours',
    name: 'Nepal Tours',
    country: 'Nepal',
    image: fallbackImages.nepal,
    href: '/destinations/nepal',
  };

  const displayDestinations = [nepalDestination, ...internationalDestinations];
  const featuredDestination = displayDestinations[0];
  const remainingDestinations = displayDestinations.slice(1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <section className="bg-white py-14 md:py-18">
      <div className="container-xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.42fr_0.58fr] lg:items-end">
          <div>
            <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">Explore by region</span>
            <h2 className="mt-4 max-w-xl text-3xl md:text-4xl font-serif font-bold text-gray-950 leading-tight">
              Choose where your next route begins.
            </h2>
          </div>
          <div className="lg:max-w-xl lg:justify-self-end">
            <p className="text-sm md:text-base leading-7 text-gray-600">
              Start with Nepal, nearby pilgrimage routes, or international destinations. Each route can be shaped around timing, group size and travel purpose.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700">
                <Mountain className="mr-2 h-3.5 w-3.5 text-primary" /> Nepal routes: {nepalDestinations.length || 1}
              </span>
              <span className="inline-flex items-center border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700">
                <Globe2 className="mr-2 h-3.5 w-3.5 text-secondary" /> International: {internationalDestinations.length}
              </span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} type="destination" />
            ))}
          </div>
        )}

        {error && (
          <ErrorMessage
            message={`Failed to load destinations: ${error}`}
            className="py-20"
          />
        )}

        {!loading && !error && displayDestinations.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            <DestinationCard destination={featuredDestination} index={0} featured />
            {remainingDestinations.map((destination, index) => (
              <DestinationCard key={destination.id || destination.name} destination={destination} index={index + 1} />
            ))}
          </motion.div>
        )}

        {!loading && !error && displayDestinations.length === 0 && (
          <div className="border border-gray-200 bg-gray-50 p-8 text-center">
            <Compass className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-4 text-2xl font-serif font-bold text-gray-950">Destinations are being updated</h3>
            <p className="mt-3 text-sm text-gray-600">Please contact the team for current routes and private planning options.</p>
          </div>
        )}

        <div className="mt-12 grid gap-4 border border-gray-200 bg-gray-50 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Need route clarity?</span>
            <h3 className="mt-2 text-2xl font-serif font-bold text-gray-950">Tell us where you want to go. We’ll help shape the route.</h3>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-primary px-6 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark"
          >
            Plan your trip <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
