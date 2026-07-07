"use client";

import React, { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Send, MapPin, Activity, Bed, Info, HelpCircle, ChevronDown, ChevronUp, CheckCircle, Download } from 'lucide-react';
import TourCard from '@/components/Tours/TourCard';
import TourImageSlider from '@/components/Tours/TourImageSlider';
import TourEnquiryButton from '@/components/Tours/TourEnquiryButton';
import TourHeader from '@/components/Tours/TourHeader';
import TourTabs, { type ItineraryDay } from '@/components/Tours/TourTabs';
import { useTours, useDestinations } from '@/hooks/useApi';
import type { Tour } from '@/services/api';
import { formatDuration } from '@/utils/formatDuration';

import Breadcrumb from '@/components/UI/Breadcrumb';
import DownloadItineraryModal from '@/components/UI/DownloadItineraryModal';
import PriceAlertModal from '@/components/UI/PriceAlertModal';

interface TourDetails extends Tour {
  gallery?: string[];
  exclusions?: string[];
  itinerary?: ItineraryDay[];
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
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  primary_destination_id?: number;
  secondary_destination_ids?: number[];
  activity_ids?: number[];
  related_destinations?: string[];
  related_activities?: string[];
}

const TourDetail: React.FC<{ tour: TourDetails }> = ({ tour }) => {
  const router = useRouter();
  const { data: allTours, error } = useTours();
  const { data: destinations } = useDestinations();

  const tourDetails = tour;
  const enquirySectionRef = useRef<HTMLDivElement>(null);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(() => new Set((tour.faqs || []).slice(0, 2).map((_, index) => index)));
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);

  const scrollToEnquiry = () => {
    enquirySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleFAQ = (index: number) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFAQs(newExpanded);
  };

  const relatedToursList = useMemo(() => {
    if (!allTours || !tour) return [];

    const currentTourDestIds = [tourDetails?.primary_destination_id, ...(tourDetails?.secondary_destination_ids || [])].filter(Boolean);
    const currentTourActivityIds = tourDetails?.activity_ids || [];
    const currentCategory = tourDetails?.category?.toLowerCase();

    return allTours
      .filter(t => t.id !== tour.id && t.listed !== false)
      .map(t => {
        let score = 0;
        const otherDestIds = [(t as TourDetails).primary_destination_id, ...((t as TourDetails).secondary_destination_ids || [])].filter(Boolean);
        const otherActivityIds = (t as TourDetails).activity_ids || [];
        const otherCategory = t.category?.toLowerCase();

        if (currentCategory && otherCategory === currentCategory) score += 10;
        if (tourDetails?.primary_destination_id && (t as TourDetails).primary_destination_id === tourDetails.primary_destination_id) score += 15;

        const sharedDests = currentTourDestIds.filter(id => otherDestIds.includes(id)).length;
        score += sharedDests * 5;

        const sharedActs = currentTourActivityIds.filter(id => otherActivityIds.includes(id)).length;
        score += sharedActs * 4;

        const keywords = ['helicopter', 'trek', 'yatra', 'luxury', 'overland'];
        keywords.forEach(word => {
          if (tour.title.toLowerCase().includes(word) && t.title.toLowerCase().includes(word)) score += 3;
        });

        return { tour: t, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.tour);
  }, [allTours, tour, tourDetails]);

  const primaryDestination = destinations?.find(dest => dest.id === tourDetails?.primary_destination_id);
  const secondaryDestinations = destinations?.filter(dest => tourDetails?.secondary_destination_ids?.includes(dest.id)) || [];
  const allTourDestinations = [primaryDestination, ...secondaryDestinations].filter(Boolean);

  const images = tourDetails ? (
    tourDetails.gallery && tourDetails.gallery.length > 0
      ? tourDetails.gallery
      : tourDetails.image
        ? [tourDetails.image]
        : []
  ).filter(Boolean) : [];

  if (error || !tour || !tourDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error loading tour' : 'Tour not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The tour you are looking for does not exist.'}
          </p>
          <Link href="/tours" className="bg-green-600 text-white px-6 py-3 rounded-none hover:bg-green-700 transition-colors">
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  const goodToKnowCards = tourDetails.good_to_know ? [
    {
      key: 'main_attractions',
      title: 'Main Attractions',
      text: tourDetails.good_to_know.main_attractions,
      icon: MapPin,
    },
    {
      key: 'travel_distances',
      title: 'Travel Distances',
      text: tourDetails.good_to_know.travel_distances,
      icon: Activity,
    },
    {
      key: 'accommodation_standards',
      title: 'Accommodation Standards',
      text: tourDetails.good_to_know.accommodation_standards,
      icon: Bed,
    },
    {
      key: 'additional_activities',
      title: 'Additional Activities',
      text: tourDetails.good_to_know.additional_activities,
      icon: Info,
    },
  ].filter(card => card.text) : [];

  return (
    <>
      <div className="tour-detail-page pb-24 lg:pb-0">
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto px-4">
            <Breadcrumb
              items={[
                { name: 'Tours', href: '/tours' },
                ...(primaryDestination ? [{ name: primaryDestination.name, href: `/destinations/${primaryDestination.slug}` }] : []),
                { name: tourDetails.title }
              ]}
            />
          </div>
        </div>

        <section className="bg-gray-50">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TourImageSlider images={images} title={tourDetails.title} />

                <div className="mt-8">
                  <TourHeader
                    title={tourDetails.title}
                    duration={formatDuration(tourDetails.duration)}
                    groupSize={tourDetails.group_size}
                    bestTime={tourDetails.best_time}
                    destinations={allTourDestinations.filter(Boolean) as Array<{ id: number; name: string }>}
                    primaryDestination={primaryDestination}
                    secondaryDestinations={secondaryDestinations}
                  />
                </div>

                <div>
                  <TourTabs
                    description={tourDetails.description}
                    highlights={tourDetails.highlights}
                    inclusions={tourDetails.inclusions}
                    exclusions={tourDetails.exclusions}
                    itinerary={tourDetails.itinerary}
                    title={tourDetails.title}
                    goodToKnow={tourDetails.good_to_know}
                    faqs={tourDetails.faqs}
                  />
                </div>

                {goodToKnowCards.length > 0 && (
                  <div className="mt-8">
                    <div className="bg-white border border-gray-200 overflow-hidden">
                      <div className="text-center p-6 sm:p-8 border-b border-gray-100">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Good to Know</h3>
                        <p className="text-gray-600 max-w-2xl mx-auto">Essential details are shown upfront so you do not need to open multiple accordions while planning.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6">
                        {goodToKnowCards.map((card) => {
                          const Icon = card.icon;
                          return (
                            <div key={card.key} className="border border-slate-200 border-l-4 border-l-primary bg-slate-50 p-5">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h4>
                                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{card.text}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {tourDetails.faqs && tourDetails.faqs.length > 0 && (
                  <div className="mt-8">
                    <div className="bg-white border border-gray-200 overflow-hidden">
                      <div className="text-center p-6 sm:p-8 border-b border-gray-100">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h3>
                        <p className="text-gray-600">The most useful answers are opened first. Tap any question to expand or collapse.</p>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {tourDetails.faqs.map((faq, index) => (
                          <div key={`faq-${tourDetails.id}-${index}`} className="border-l-4 border-primary">
                            <button
                              onClick={() => toggleFAQ(index)}
                              className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                  <div className="w-8 h-8 bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                                    <HelpCircle className="w-4 h-4 text-white" />
                                  </div>
                                  <h4 className="text-lg font-semibold text-gray-900 text-left pr-4">{faq.question}</h4>
                                </div>
                                {expandedFAQs.has(index) ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                            {expandedFAQs.has(index) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="px-6 pb-6"
                              >
                                <div className="ml-12">
                                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1" ref={enquirySectionRef}>
                <div className="lg:sticky lg:top-24 space-y-4">
                  <TourEnquiryButton
                    price={tourDetails.price}
                    hasDiscount={tourDetails.hasDiscount}
                    discountPercentage={tourDetails.discountPercentage}
                    priceAvailable={tourDetails.priceAvailable}
                    tourTitle={tourDetails.title}
                  />

                  <div className="bg-white border border-gray-200 p-4 space-y-3">
                    <button
                      onClick={() => setShowDownloadModal(true)}
                      className="w-full flex items-center justify-center gap-3 border-2 border-primary text-primary hover:bg-primary hover:text-white py-3.5 px-4 transition-colors duration-200 font-bold text-sm uppercase tracking-wider"
                    >
                      <Download className="w-5 h-5" />
                      Download Itinerary
                    </button>
                    <p className="text-xs leading-5 text-gray-500 text-center">Get the full day-by-day plan before speaking with our travel expert.</p>
                    <button
                      onClick={() => setShowPriceAlertModal(true)}
                      className="w-full text-center text-sm font-semibold text-gray-500 hover:text-secondary transition-colors"
                    >
                      Get price updates if this package changes
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Why enquire with Zeo?</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>No payment required to ask questions</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Customize dates, hotels and transport</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Route, permit and preparation guidance included</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Fast response from Nepal travel experts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {relatedToursList.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
                <p className="text-gray-600">Discover more amazing tours and experiences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedToursList.map((relatedTour, index) => (
                  <motion.div
                    key={`${relatedTour.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <TourCard
                      tour={relatedTour}
                      onViewDetails={(tour) => router.push(`/tours/${tour.slug}`)}
                      destinations={destinations || undefined}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur lg:hidden px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.12)]">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={scrollToEnquiry}
            className="flex items-center justify-center gap-2 bg-primary text-white py-3 px-3 text-sm font-bold uppercase tracking-wide"
          >
            <Send className="w-4 h-4" /> Enquire
          </button>
          <button
            type="button"
            onClick={() => setShowDownloadModal(true)}
            className="flex items-center justify-center gap-2 border border-primary text-primary bg-white py-3 px-3 text-sm font-bold uppercase tracking-wide"
          >
            <Download className="w-4 h-4" /> Itinerary
          </button>
        </div>
      </div>

      <DownloadItineraryModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        tourTitle={tourDetails.title}
      />

      <PriceAlertModal
        isOpen={showPriceAlertModal}
        onClose={() => setShowPriceAlertModal(false)}
        tourTitle={tourDetails.title}
        currentPrice={tourDetails.price}
      />
    </>
  );
};

export default TourDetail;
