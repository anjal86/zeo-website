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

const fallbackDestinationImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&h=900&fit=crop';

const FeaturedDestinations: React.FC<Props> = ({ featuredDestinations }) => {
  if (!featuredDestinations || featuredDestinations.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
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
    <section className="py-14 sm:py-18 md:py-24 bg-gray-50 border-t border-gray-100">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em] mb-4 block">
              Explore
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight">
              Popular Destinations
            </h2>
            <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-gray-600">
              Handpicked Himalayan, pilgrimage and cultural routes planned with local ground support.
            </p>
          </div>
          <Link
            href="/destinations"
            className="hidden md:inline-flex items-center border border-gray-300 bg-white text-gray-950 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-colors duration-300"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-3" />
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
        >
          {featuredDestinations.map((destination) => {
            const tourLabel = destination.tourCount > 0
              ? `${destination.tourCount} ${destination.tourCount === 1 ? 'Tour' : 'Tours'}`
              : 'Explore packages';

            return (
              <motion.div key={destination.id} variants={itemVariants} className="group">
                <Link href={destination.href || `/destinations/${destination.name.toLowerCase().replace(/\s+/g, '-')}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
                  <div className="relative overflow-hidden aspect-[4/3] border border-gray-200 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-primary hover:shadow-2xl hover:shadow-gray-900/10">
                    <img
                      src={destination.image || fallbackDestinationImage}
                      alt={`${destination.name} - ${destination.country} travel destination`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(event) => {
                        const img = event.target as HTMLImageElement;
                        if (img.src !== fallbackDestinationImage) img.src = fallbackDestinationImage;
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 top-0 flex justify-between p-4">
                      <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
                        {destination.country || 'Nepal'}
                      </span>
                      <span className="h-8 w-8 rounded-full border border-white/20 bg-black/25 flex items-center justify-center text-white/80 backdrop-blur-md transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                      <div className="flex items-center mb-2 text-white/75">
                        <MapPin className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-xs uppercase tracking-wider font-medium">Destination</span>
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
