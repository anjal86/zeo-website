"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useDestinations } from '../../hooks/useApi';
import SkeletonCard from '../UI/SkeletonCard';
import ErrorMessage from '../UI/ErrorMessage';

const Destinations: React.FC = () => {
  // Use API hooks to fetch destinations
  const { data: destinations, loading, error } = useDestinations();

  // 1. Get all international destinations (country !== 'Nepal')
  const internationalDestinations = destinations?.filter(d => {
    const isListed = (d as any).listed !== false;
    return isListed && d.country !== 'Nepal';
  }) || [];

  // 2. Create a single Nepal card that links to Nepal tours
  const nepalDestination = {
    id: 'nepal-all-tours',
    name: 'Nepal',
    country: 'Nepal',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070', // Nice Nepal image
    href: '/destinations/nepal'
  };

  // 3. Combine them: International countries first, then Nepal
  const displayDestinations = [...internationalDestinations, nepalDestination];

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
    <section className="py-20 bg-white">
      <div className="section-container">
        {/* Minimal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >

        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} type="destination" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage
            message={`Failed to load destinations: ${error}`}
            className="py-20"
          />
        )}

        {/* Immersive Grid */}
        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {displayDestinations.map((destination) => (
              <motion.div
                key={destination.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="group cursor-pointer"
              >
                <Link href={destination.href || `/destinations/${destination.name.toLowerCase()}`} className="block">
                  <div className="relative rounded-none sm:rounded-none overflow-hidden aspect-[4/3] sm:aspect-[3/2] shadow-lg hover:shadow-2xl transition-all duration-500">
                    <img
                      src={destination.image}
                      alt={`${destination.name} - ${destination.country} travel destination`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
                      <div className="flex items-center mb-2 sm:mb-3 opacity-80">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="text-xs sm:text-sm">{destination.country}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                        {destination.name}
                      </h3>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Destinations;
