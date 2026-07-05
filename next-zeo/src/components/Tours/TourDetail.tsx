"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, Users, Star, ChevronDown, ChevronUp,
  Check, X, Phone, Mail, MessageCircle, ArrowLeft, Mountain
} from 'lucide-react';
import type { Tour } from '../../services/api';

export interface TourDetails extends Tour {
  gallery?: string[];
  exclusions?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
    accommodation?: string;
    meals?: string;
  }>;
  fitness_requirements?: string;
  altitude_profile?: {
    max_altitude: string;
    acclimatization_days: number;
    difficulty_level: string;
  };
  wildlife_info?: {
    best_viewing_time: string;
    common_species: string[];
    conservation_status: string;
  };
  booking_info?: {
    advance_booking: string;
    group_discounts: string;
    cancellation_policy: string;
  };
  good_to_know?: {
    main_attractions: string;
    travel_distances: string;
    accommodation_standards: string;
    additional_activities: string;
  };
  faqs?: Array<{ question: string; answer: string }>;
  primary_destination_id?: number;
  secondary_destination_ids?: number[];
  activity_ids?: number[];
  related_destinations?: string[];
  related_activities?: string[];
}

interface TourDetailProps {
  tour: TourDetails;
}

const TourDetail: React.FC<TourDetailProps> = ({ tour }) => {
  const router = useRouter();
  const [detailedTour, setDetailedTour] = useState<TourDetails>(tour);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'inclusions' | 'faqs'>('overview');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);
  const [currentImage, setCurrentImage] = useState(0);

  // Fetch full tour details from API
  

  const t = detailedTour;
  const gallery = t.gallery || (t.image ? [t.image] : []);
  const images = gallery.length > 0 ? gallery : [t.image].filter(Boolean) as string[];

  const difficultyColor = {
    'Easy': 'text-green-600 bg-green-50',
    'Moderate': 'text-yellow-600 bg-yellow-50',
    'Challenging': 'text-red-600 bg-red-50',
  }[t.difficulty] || 'text-gray-600 bg-gray-50';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image Gallery */}
      {images.length > 0 && (
        <div className="relative h-[60vh] bg-gray-900 overflow-hidden">
          <img
            src={images[currentImage]}
            alt={t.title}
            className="w-full h-full object-cover opacity-90 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="absolute top-24 left-6 flex items-center gap-2 text-white/80 hover:text-white bg-black/20 backdrop-blur-sm px-3 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Image navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-white w-8' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-5xl mx-auto">
              <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 ${difficultyColor}`}>
                {t.difficulty}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">{t.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                {t.location && (
                  <span className="flex items-center gap-1.5 text-sm">
                    <MapPin className="w-4 h-4" /> {t.location}
                  </span>
                )}
                {t.duration && (
                  <span className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4" /> {t.duration}
                  </span>
                )}
                {t.group_size && (
                  <span className="flex items-center gap-1.5 text-sm">
                    <Users className="w-4 h-4" /> {t.group_size}
                  </span>
                )}
                {t.rating > 0 && (
                  <span className="flex items-center gap-1.5 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {t.rating.toFixed(1)} ({t.reviews} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
              {(['overview', 'itinerary', 'inclusions', 'faqs'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-semibold capitalize whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab === 'inclusions' ? 'Inclusions & Exclusions' : tab}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {t.description && (
                  <div className="prose prose-gray max-w-none mb-8">
                    <p className="text-gray-700 leading-relaxed text-base">{t.description}</p>
                  </div>
                )}
                {t.highlights && t.highlights.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Highlights</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {t.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {t.best_time && (
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-primary mb-1">Best Time to Visit</p>
                    <p className="text-gray-700 text-sm">{t.best_time}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Itinerary Tab */}
            {activeTab === 'itinerary' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {t.itinerary && t.itinerary.length > 0 ? (
                  <div className="space-y-4">
                    {t.itinerary.map((day, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-4 p-4 bg-gray-50">
                          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {day.day}
                          </div>
                          <h3 className="font-semibold text-gray-900">{day.title}</h3>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-700 text-sm leading-relaxed">{day.description}</p>
                          {(day.accommodation || day.meals) && (
                            <div className="flex gap-4 mt-3 text-xs text-gray-500">
                              {day.accommodation && <span>🏠 {day.accommodation}</span>}
                              {day.meals && <span>🍽 {day.meals}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Detailed itinerary available on request. Contact us for a personalized day-by-day plan.</p>
                )}
              </motion.div>
            )}

            {/* Inclusions & Exclusions Tab */}
            {activeTab === 'inclusions' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" /> Inclusions
                    </h3>
                    <ul className="space-y-2">
                      {(t.inclusions || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {(!t.inclusions || t.inclusions.length === 0) && (
                        <li className="text-gray-400 text-sm">Contact us for detailed inclusions.</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" /> Exclusions
                    </h3>
                    <ul className="space-y-2">
                      {(t.exclusions || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <X className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                      {(!t.exclusions || t.exclusions.length === 0) && (
                        <li className="text-gray-400 text-sm">International airfare, visa fees, personal expenses.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {t.faqs && t.faqs.length > 0 ? (
                  <div className="space-y-3">
                    {t.faqs.map((faq, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900 text-sm">{faq.question}</span>
                          {expandedFAQ === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        </button>
                        {expandedFAQ === i && (
                          <div className="px-4 pb-4 text-gray-700 text-sm leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Have questions? Contact us and we'll answer them promptly.</p>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price Card */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                {t.priceAvailable !== false ? (
                  <div className="mb-4">
                    {t.hasDiscount && t.originalPrice && (
                      <p className="text-gray-400 line-through text-sm">
                        USD {t.originalPrice.toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        USD {t.price?.toLocaleString() || 'On Request'}
                      </span>
                      {t.hasDiscount && t.discountPercentage && (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          {t.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-1">per person</p>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-gray-900 mb-4">Request Price</p>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-gray-900">{t.duration || 'Custom'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Group Size</span>
                    <span className="font-medium text-gray-900">{t.group_size || 'Flexible'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Difficulty</span>
                    <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${difficultyColor}`}>{t.difficulty}</span>
                  </div>
                  {t.best_time && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Best Time</span>
                      <span className="font-medium text-gray-900 text-right max-w-[60%]">{t.best_time}</span>
                    </div>
                  )}
                </div>

                <Link
                  href="/contact"
                  className="block w-full text-center bg-primary text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors mb-3"
                >
                  Book This Tour
                </Link>
                <a
                  href="tel:+9779851234567"
                  className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call to Book
                </a>
              </div>

              {/* Need Help */}
              <div className="bg-gray-50 rounded-xl p-5">
                <Mountain className="w-6 h-6 text-primary mb-3" />
                <h4 className="font-bold text-gray-900 mb-1">Need Help Planning?</h4>
                <p className="text-gray-500 text-sm mb-4">Our Nepal-based experts are ready to help you plan the perfect trip.</p>
                <div className="space-y-2">
                  <a href="tel:+9779851234567" className="flex items-center gap-2 text-gray-700 text-sm hover:text-primary transition-colors">
                    <Phone className="w-3.5 h-3.5" /> +977 985 123 4567
                  </a>
                  <a href="mailto:info@zeotourism.com" className="flex items-center gap-2 text-gray-700 text-sm hover:text-primary transition-colors">
                    <Mail className="w-3.5 h-3.5" /> info@zeotourism.com
                  </a>
                  <a href="https://wa.me/9779851234567" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 text-sm hover:text-primary transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
