"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter as useNavigate } from 'next/navigation';
import {
  MapPin,
  Clock,
  Users,
  ArrowRight
} from 'lucide-react';
import type { Tour } from '../../services/api';
import { formatDuration } from '../../utils/formatDuration';

interface TourCardProps {
  tour: Tour;
  onBookNow?: (tour: Tour) => void;
  onViewDetails?: (tour: Tour) => void;
  variant?: 'grid' | 'list';
  destinations?: Array<{ id: number; name: string; country?: string }>;
}

const TourCard: React.FC<TourCardProps> = ({
  tour,
  onViewDetails,
  variant = 'grid',
  destinations
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(tour);
    } else {
      // Default navigation to tour detail page using slug with React Router
      navigate.push(`/tours/${tour.slug}`);
    }
  };

  // Get the primary destination name for this tour
  const getDestinationName = () => {
    if (destinations && (tour as any).primary_destination_id) {
      const primaryDestination = destinations.find(dest => dest.id === (tour as any).primary_destination_id);
      if (primaryDestination) {
        return primaryDestination.country ? `${primaryDestination.name}, ${primaryDestination.country}` : primaryDestination.name;
      }
    }

    // Fallback to the location field if no destination relationship exists
    return tour.location || 'Location not specified';
  };

  const destinationName = getDestinationName();

  // List layout design - horizontal layout
  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-500 cursor-pointer group w-full"
        onClick={handleViewDetails}
      >
        <div className="flex flex-col md:flex-row md:items-stretch">
          {/* Image Container - Left Side */}
          <div className="relative md:w-80 h-56 md:h-auto overflow-hidden flex-shrink-0">
            <div className={`absolute inset-0 bg-gray-200 animate-pulse ${imageLoaded ? 'hidden' : 'block'}`} />
            <img
              src={tour.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070'}
              alt={`${tour.title} - ${tour.location || 'Nepal tour'}`}
              loading="lazy"
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070';
              }}
            />
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Featured Badge - Minimal Floating */}
            {tour.featured && (
              <div className="absolute top-3 left-3 z-10">
                <div className="bg-white/95 backdrop-blur-sm text-yellow-600 px-3 py-1 rounded-full shadow-sm font-bold text-[10px] uppercase tracking-wider border border-white/50">
                  Featured
                </div>
              </div>
            )}

            {/* Other Badges */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-end items-start pointer-events-none">
              {/* Right: Discount Badge */}
              <div>
                {(tour.hasDiscount && tour.discountPercentage) || tour.discount ? (
                  <div className="bg-red-500 text-white min-w-[45px] h-[45px] flex items-center justify-center rounded-full shadow-xl border-2 border-white/20 transform rotate-12 hover:rotate-0 transition-transform duration-300">
                    <div className="text-center leading-none">
                      <span className="block text-xs font-bold">{tour.discountPercentage || tour.discount}%</span>
                      <span className="block text-[8px] uppercase font-medium">OFF</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Content Area - Right Side */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center text-primary font-medium text-sm tracking-wide uppercase">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {destinationName}
                </div>
                <div className="flex items-center space-x-4 text-gray-500 text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {formatDuration(tour.duration)}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1.5" />
                    {tour.group_size}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-heading text-2xl font-semibold text-brand-dark mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                {tour.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-base line-clamp-2 mb-6 leading-relaxed">
                {tour.description}
              </p>
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div>
                {tour.priceAvailable !== false ? (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400 font-medium mb-0.5">Starting from</span>
                    <div className="flex items-baseline">
                      {tour.hasDiscount && tour.discountPercentage ? (
                        <>
                          <span className="font-heading text-2xl font-semibold text-brand-dark">
                            ${Math.round(tour.price * (1 - tour.discountPercentage / 100))}
                          </span>
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            ${tour.price}
                          </span>
                        </>
                      ) : (
                        <span className="font-heading text-2xl font-semibold text-brand-dark">
                          ${tour.price}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-green-600">
                      Request Price
                    </span>
                    <span className="text-xs text-gray-500">Contact for pricing</span>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewDetails}
                className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors shadow-sm"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid layout design - vertical layout (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-500 cursor-pointer group w-full h-full flex flex-col"
      onClick={handleViewDetails}
    >
      {/* Large Image Container */}
      <div className="relative h-64 overflow-hidden flex-shrink-0">
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${imageLoaded ? 'hidden' : 'block'}`} />
        <img
          src={tour.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070'}
          alt={`${tour.title} - ${tour.location || 'Nepal tour'}`}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070';
          }}
        />

        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Featured Badge - Minimal Floating */}
        {tour.featured && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/95 backdrop-blur-sm text-yellow-600 px-3 py-1 rounded-full shadow-lg font-bold text-[10px] uppercase tracking-wider border border-white/50">
              Featured
            </div>
          </div>
        )}

        {/* Other Badges */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-end items-start pointer-events-none">
          {/* Right: Discount Badge */}
          <div>
            {(tour.hasDiscount && tour.discountPercentage) || tour.discount ? (
              <div className="bg-red-500 text-white min-w-[50px] h-[50px] flex items-center justify-center rounded-full shadow-xl border-2 border-white/20 transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <div className="text-center leading-none">
                  <span className="block text-sm font-bold">{tour.discountPercentage || tour.discount}%</span>
                  <span className="block text-[10px] uppercase font-medium">OFF</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 relative">
        {/* Floating Category/Location Badge */}
        <div className="absolute -top-5 right-6 bg-white shadow-lg rounded-2xl px-4 py-2 flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wide border border-gray-50">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {destinationName}
        </div>

        {/* Title */}
        <h3 className="font-heading text-xl font-semibold text-brand-dark mt-2 mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {tour.title}
        </h3>

        {/* Minimal Meta */}
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            {formatDuration(tour.duration)}
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            {tour.group_size}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Price and Details Button */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
          <div className="flex flex-col">
            {tour.priceAvailable !== false ? (
              <>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">From</span>
                <div className="flex items-baseline gap-2">
                  {tour.hasDiscount && tour.discountPercentage ? (
                    <>
                      <span className="font-heading text-2xl font-semibold text-brand-dark">
                        ${Math.round(tour.price * (1 - tour.discountPercentage / 100))}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ${tour.price}
                      </span>
                    </>
                  ) : (
                    <span className="font-heading text-2xl font-semibold text-brand-dark">
                      ${tour.price}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-green-600">
                  Request Price
                </span>
                <span className="text-xs text-gray-500">Contact for pricing</span>
              </>
            )}
          </div>

          <motion.button
            whileHover={{ x: 5 }}
            className="group/btn flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2.5 rounded-2xl hover:bg-sky-600 hover:text-white transition-all"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TourCard;
