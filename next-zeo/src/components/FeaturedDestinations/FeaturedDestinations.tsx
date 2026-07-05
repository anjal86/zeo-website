"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mountain, ArrowRight, MapPin } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

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

const FeaturedDestinations: React.FC<Props> = ({ featuredDestinations }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50 border-t border-gray-100">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16"
        >
          <span className="text-secondary text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
            Explore
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900">
            Popular Destinations
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {featuredDestinations.map((destination) => (
            <motion.div
              key={destination.id}
              variants={itemVariants}
              className="group"
            >
              <Link href={destination.href || `/destinations/${destination.name.toLowerCase()}`} className="block">
                <div className="relative overflow-hidden aspect-[4/3] border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl">
                  <img
                    src={destination.image}
                    alt={`${destination.name} - ${destination.country} travel destination`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                    <div className="flex items-center mb-2 opacity-80">
                      <MapPin className="w-3 h-3 mr-1.5" />
                      <span className="text-xs uppercase tracking-wider font-medium">{destination.country}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold leading-tight">
                      {destination.name}
                    </h3>
                    <div className="flex items-center mt-2 opacity-70">
                      <Mountain className="w-3 h-3 mr-1.5" />
                      <span className="text-xs">
                        {destination.tourCount} {destination.tourCount === 1 ? 'Tour' : 'Tours'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {featuredDestinations.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <Link
              href="/destinations"
              className="inline-flex items-center border border-gray-300 text-gray-950 px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-colors duration-300"
            >
              View All Destinations
              <ArrowRight className="w-4 h-4 ml-3" />
            </Link>
          </div>
        )}

        {featuredDestinations.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No destinations with tours available at the moment.
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedDestinations;
