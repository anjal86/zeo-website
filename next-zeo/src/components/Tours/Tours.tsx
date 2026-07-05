"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import { Calendar, Users, Heart, TrendingUp, Shield, Award } from 'lucide-react';
import { useTours } from '../../hooks/useApi';
import type { Tour } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { formatDuration } from '../../utils/formatDuration';

const Tours: React.FC = () => {
  // Use API hook to fetch tours
  const { data: tours, loading, error } = useTours();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      case 'Challenging': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <section id="tours" className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="section-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center section-gap"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-secondary mr-2" />
            <span className="text-secondary font-semibold text-lg">Popular Tours</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Handcrafted <span className="text-gradient">Experiences</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our carefully curated collection of tours, each designed to create memories that last a lifetime
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">100% Safe & Secure</span>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Best Price Guarantee</span>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Expert Local Guides</span>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <LoadingSpinner className="py-20" size="lg" />
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage
            message={`Failed to load tours: ${error}`}
            className="py-20"
          />
        )}

        {/* Tours Carousel */}
        {!loading && !error && tours && tours.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              effect="coverflow"
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false,
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="tours-swiper pb-12"
            >
              {tours.map((tour: Tour) => (
                <SwiperSlide key={tour.id}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-none overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                  >
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={tour.image}
                        alt={tour.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {tour.featured && (
                          <span className="glass px-3 py-1 rounded-full text-white text-xs font-semibold">
                            Featured
                          </span>
                        )}
                        {tour.discount && (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {tour.discount}% OFF
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button className="absolute top-4 right-4 glass w-10 h-10 rounded-full flex items-center justify-center group/heart">
                        <Heart className="w-5 h-5 text-white group-hover/heart:text-red-500 transition-colors" />
                      </button>

                      {/* Category */}
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                          {tour.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                        {tour.title}
                      </h3>

                      {/* Tour Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDuration(tour.duration)}
                          </span>
                          <span className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            Group: {tour.group_size}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(tour.difficulty)}`}>
                            {tour.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {tour.highlights.slice(0, 2).map((highlight: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-none"
                          >
                            {highlight}
                          </span>
                        ))}
                        {tour.highlights.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{tour.highlights.length - 2} more
                          </span>
                        )}
                      </div>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-gray-900">
                              ${tour.price}
                            </span>
                            {tour.originalPrice && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ${tour.originalPrice}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">per person</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                        >
                          Plan your trip
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}

        {/* View All Tours Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-secondary to-secondary-light text-white px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300"
          >
            View All Tours
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Tours;
