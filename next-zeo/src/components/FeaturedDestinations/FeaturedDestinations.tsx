"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mountain, ArrowRight, MapPin } from 'lucide-react';

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
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&h=900&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&h=900&fit=crop',
  'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&h=900&fit=crop',
  'https://images.unsplash.com/photo-1609440034849-c4d6b7a520b7?q=80&w=1200&h=900&fit=crop',
  'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?q=80&w=1200&h=900&fit=crop',
  'https://images.unsplash.com/photo-1603273997415-0f4f201c969f?q=80&w=1200&h=900&fit=crop',
];

function destinationImage(destination: FeaturedDestination, index: number) {
  if (destination.image && !destination.image.includes('1506905925346')) return destination.image;
  return fallbackDestinationImages[index % fallbackDestinationImages.length];
}

function destinationType(destination: FeaturedDestination, index: number) {
  const name = destination.name.toLowerCase();
  if (name.includes('kailash') || name.includes('muktinath') || name.includes('gosaikunda')) return 'Pilgrimage route';
  if (name.includes('everest') || name.includes('poon') || name.includes('trek')) return 'Trekking route';
  if (destination.country && destination.country.toLowerCase() !== 'nepal') return 'Cross-border journey';
  return index === 0 ? 'Featured route' : 'Curated destination';
}

const FeaturedDestinations: React.FC<Props> = ({ featuredDestinations }) => {
  if (!featuredDestinations || featuredDestinations.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45
      }
    }
  };

  return (
    <section className="py-14 sm:py-16 md:py-22 bg-gray-50 border-t border-gray-100">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-9 sm:mb-12 grid gap-5 md:grid-cols-[1fr_auto] md:items-end"
        >
          <div>
            <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em] mb-3 block">
              Explore
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-950 tracking-tight leading-none">
              Popular Destinations
            </h2>
            <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-gray-600">
              A curated starting point for Himalayan treks, sacred journeys and cultural routes.
            </p>
          </div>
          <Link
            href="/destinations"
            className="hidden md:inline-flex items-center border border-gray-300 bg-white text-gray-950 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-colors duration-300"
          >
            View all
            <ArrowRight className="w-4 h-4 ml-3" />
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
        >
          {featuredDestinations.map((destination, index) => {
            const tourLabel = destination.tourCount > 0
              ? `${destination.tourCount} ${destination.tourCount === 1 ? 'package' : 'packages'}`
              : 'Custom planning available';
            const typeLabel = destinationType(destination, index);
            const isFeatured = index === 0;

            return (
              <motion.div key={destination.id} variants={itemVariants} className={`group ${isFeatured ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                <Link href={destination.href || `/destinations/${destination.name.toLowerCase().replace(/\s+/g, '-')}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
                  <div className={`relative overflow-hidden border border-gray-200 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-primary hover:shadow-2xl hover:shadow-gray-900/10 ${isFeatured ? 'aspect-[16/10] sm:aspect-[2/1] lg:aspect-[4/3]' : 'aspect-[4/3]'}`}>
                    <img
                      src={destinationImage(destination, index)}
                      alt={`${destination.name} - ${destination.country || 'Nepal'} travel destination`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(event) => {
                        const img = event.target as HTMLImageElement;
                        const fallback = fallbackDestinationImages[index % fallbackDestinationImages.length];
                        if (img.src !== fallback) img.src = fallback;
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/28 to-transparent" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-primary/10 transition-opacity duration-500" />
                    <div className="absolute inset-x-0 top-0 flex justify-between p-4">
                      <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
                        {destination.country || 'Nepal'}
                      </span>
                      <span className="h-8 w-8 rounded-full border border-white/20 bg-black/25 flex items-center justify-center text-white/80 backdrop-blur-md transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                      <div className="flex items-center mb-2 text-white/75">
                        <MapPin className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-xs uppercase tracking-wider font-medium">{typeLabel}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold leading-tight tracking-tight">
                        {destination.name}
                      </h3>
                      <div className="flex items-center mt-3 text-white/75">
                        <Mountain className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-xs font-medium">
                          {tourLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 sm:mt-12 md:hidden">
          <Link
            href="/destinations"
            className="inline-flex w-full items-center justify-center border border-gray-300 bg-white text-gray-950 px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-colors duration-300"
          >
            View All Destinations
            <ArrowRight className="w-4 h-4 ml-3" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
