"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter as useNavigate } from 'next/navigation';
import {
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { Tour } from '../../services/api';
import { formatDuration } from '../../utils/formatDuration';

interface TourCardProps {
  tour: Tour;
  onBookNow?: (tour: Tour) => void;
  onViewDetails?: (tour: Tour) => void;
  variant?: 'grid' | 'editorial';
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
      navigate.push(`/tours/${tour.slug}`);
    }
  };

  const getDestinationName = () => {
    if (destinations && (tour as any).primary_destination_id) {
      const primaryDestination = destinations.find(dest => dest.id === (tour as any).primary_destination_id);
      if (primaryDestination) {
        return primaryDestination.country ? `${primaryDestination.name}, ${primaryDestination.country}` : primaryDestination.name;
      }
    }

    if (tour.category) return tour.category;
    if (tour.country) return tour.country;

    return tour.location || 'Custom Route';
  };

  const destinationName = getDestinationName();
  const fallbackImage = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070';

  if (variant === 'editorial') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 transition-all duration-500 cursor-pointer group flex flex-col lg:flex-row w-full h-full"
        onClick={handleViewDetails}
      >
        {/* Editorial Image Container (Left on desktop) */}
        <div className="relative w-full lg:w-[55%] h-72 lg:h-auto overflow-hidden flex-shrink-0">
          <div className={`absolute inset-0 bg-gray-100 animate-pulse ${imageLoaded ? 'hidden' : 'block'}`} />
          <img
            src={tour.image || fallbackImage}
            alt={tour.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-60" />
          
          {tour.featured && (
            <div className="absolute top-6 left-6 z-10 flex items-center gap-1.5 bg-orange-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full shadow-sm font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Journey
            </div>
          )}

          {/* Floating Destination on Image */}
          <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 text-white font-medium drop-shadow-md">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm uppercase tracking-widest">{destinationName}</span>
          </div>
        </div>

        {/* Editorial Content (Right on desktop) */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center relative bg-white">
          <div className="mb-6">
            <h3 className="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-primary transition-colors">
              {tour.title}
            </h3>
            <p className="text-gray-600 text-lg line-clamp-3 leading-relaxed">
              {tour.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-10 text-gray-700 font-medium border-y border-gray-100 py-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>{formatDuration(tour.duration)}</span>
            </div>
            {tour.difficulty && (
              <div className="flex items-center gap-2 capitalize">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span>{tour.difficulty}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>{tour.group_size}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              {tour.priceAvailable !== false && tour.price > 0 ? (
                <>
                  <span className="text-sm text-gray-500 font-medium uppercase tracking-widest mb-1">From</span>
                  <div className="flex items-baseline gap-3">
                    {tour.hasDiscount && tour.discountPercentage ? (
                      <>
                        <span className="font-heading text-3xl font-bold text-gray-900">
                          ${Math.round(tour.price * (1 - tour.discountPercentage / 100))}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          ${tour.price}
                        </span>
                      </>
                    ) : (
                      <span className="font-heading text-3xl font-bold text-gray-900">
                        ${tour.price}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <span className="text-xl font-bold text-gray-900 mb-1">
                    Request Price
                  </span>
                  <span className="text-sm text-gray-500">Custom quote available</span>
                </>
              )}
            </div>

            <motion.button
              whileHover={{ x: 5 }}
              className="group/btn flex items-center gap-3 text-base font-bold text-white bg-primary px-8 py-4 rounded-2xl hover:bg-sky-600 transition-all shadow-md hover:shadow-lg"
            >
              <span>View Itinerary</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid layout design
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 cursor-pointer group w-full h-full flex flex-col"
      onClick={handleViewDetails}
    >
      {/* 4:3 Aspect Ratio Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden flex-shrink-0 bg-gray-100">
        <div className={`absolute inset-0 animate-pulse bg-gray-200 ${imageLoaded ? 'hidden' : 'block'}`} />
        <img
          src={tour.image || fallbackImage}
          alt={tour.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

        {tour.featured && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-orange-50/95 backdrop-blur-sm text-orange-700 px-3 py-1 rounded-lg shadow-sm font-bold text-[10px] uppercase tracking-wider border border-orange-100">
              Featured
            </div>
          </div>
        )}

        {/* Discount Badge */}
        <div className="absolute top-4 right-4 z-10">
          {(tour.hasDiscount && tour.discountPercentage) || tour.discount ? (
            <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-lg shadow-sm font-bold text-[10px] uppercase tracking-wider">
              {tour.discountPercentage || tour.discount}% OFF
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 relative">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {destinationName}
        </div>

        <h3 className="font-heading text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {tour.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm text-gray-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            {formatDuration(tour.duration)}
          </div>
          {tour.difficulty && (
            <>
              <div className="w-1 h-1 rounded-full bg-gray-200"></div>
              <div className="flex items-center gap-1.5 capitalize">
                {tour.difficulty}
              </div>
            </>
          )}
          <div className="w-1 h-1 rounded-full bg-gray-200"></div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-400" />
            {tour.group_size}
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-end justify-between pt-5 border-t border-gray-100 mt-auto">
          <div className="flex flex-col">
            {tour.priceAvailable !== false && tour.price > 0 ? (
              <>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">From</span>
                <div className="flex items-baseline gap-2">
                  {tour.hasDiscount && tour.discountPercentage ? (
                    <>
                      <span className="font-heading text-xl font-bold text-gray-900">
                        ${Math.round(tour.price * (1 - tour.discountPercentage / 100))}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        ${tour.price}
                      </span>
                    </>
                  ) : (
                    <span className="font-heading text-xl font-bold text-gray-900">
                      ${tour.price}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <span className="text-base font-bold text-gray-900">
                  Request Price
                </span>
                <span className="text-[11px] text-gray-500">Custom quote</span>
              </>
            )}
          </div>

          <motion.button
            whileHover={{ x: 4 }}
            className="group/btn flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all"
          >
            <span>View</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TourCard;
