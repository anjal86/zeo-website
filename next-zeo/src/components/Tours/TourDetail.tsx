"use client";

import React, { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, Bed, Calendar, CheckCircle, ChevronDown, ChevronUp, Clock, Download, HelpCircle, Info, MapPin, Send, Users } from 'lucide-react';
import Breadcrumb from '@/components/UI/Breadcrumb';
import DownloadItineraryModal from '@/components/UI/DownloadItineraryModal';
import PriceAlertModal from '@/components/UI/PriceAlertModal';
import TourCard from '@/components/Tours/TourCard';
import TourEnquiryButton from '@/components/Tours/TourEnquiryButton';
import TourImageSlider from '@/components/Tours/TourImageSlider';
import TourTabs, { type ItineraryDay } from '@/components/Tours/TourTabs';
import { useDestinations, useTours } from '@/hooks/useApi';
import type { Tour } from '@/services/api';
import { formatDuration } from '@/utils/formatDuration';

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

type GoodToKnowCard = {
  key: string;
  title: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
};

type QuickFactProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | number | null;
};

const QuickFact: React.FC<QuickFactProps> = ({ icon: Icon, label, value }) => {
  if (!value) return null;

  return (
    <div className="border border-gray-200 bg-white p-3 sm:p-4">
      <Icon className="mb-2 h-4 w-4 text-primary sm:mb-3 sm:h-5 sm:w-5" />
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 sm:text-xs">{label}</p>
      <p className="mt-1 text-sm font-bold leading-snug text-gray-950 sm:text-base">{value}</p>
    </div>
  );
};

const SectionHeading: React.FC<{ eyebrow?: string; title: string; description?: string }> = ({ eyebrow, title, description }) => (
  <div className="border-b border-gray-200 pb-5">
    {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
    <h2 className="text-2xl font-extrabold text-gray-950 sm:text-3xl">{title}</h2>
    {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">{description}</p>}
  </div>
);

const TourDetail: React.FC<{ tour: TourDetails }> = ({ tour }) => {
  const router = useRouter();
  const { data: allTours, error } = useTours();
  const { data: destinations } = useDestinations();

  const mobileEnquiryRef = useRef<HTMLDivElement>(null);
  const desktopEnquiryRef = useRef<HTMLDivElement>(null);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(() => new Set((tour.faqs || []).slice(0, 2).map((_, index) => index)));
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);

  const primaryDestination = destinations?.find(dest => dest.id === tour.primary_destination_id);
  const secondaryDestinations = destinations?.filter(dest => tour.secondary_destination_ids?.includes(dest.id)) || [];
  const allTourDestinations = [primaryDestination, ...secondaryDestinations].filter(Boolean);
  const formattedDuration = formatDuration(tour.duration);
  const locationLabel = primaryDestination?.name
    ? `${primaryDestination.name}${secondaryDestinations.length > 0 ? ` + ${secondaryDestinations.length} more` : ''}`
    : allTourDestinations.map(destination => destination?.name).filter(Boolean).join(', ');

  const images = (tour.gallery && tour.gallery.length > 0 ? tour.gallery : tour.image ? [tour.image] : []).filter(Boolean);

  const relatedToursList = useMemo(() => {
    if (!allTours || !tour) return [];

    const currentTourDestIds = [tour.primary_destination_id, ...(tour.secondary_destination_ids || [])].filter(Boolean);
    const currentTourActivityIds = tour.activity_ids || [];
    const currentCategory = tour.category?.toLowerCase();

    return allTours
      .filter(candidate => candidate.id !== tour.id && candidate.listed !== false)
      .map(candidate => {
        let score = 0;
        const candidateDestIds = [(candidate as TourDetails).primary_destination_id, ...((candidate as TourDetails).secondary_destination_ids || [])].filter(Boolean);
        const candidateActivityIds = (candidate as TourDetails).activity_ids || [];
        const candidateCategory = candidate.category?.toLowerCase();

        if (currentCategory && candidateCategory === currentCategory) score += 10;
        if (tour.primary_destination_id && (candidate as TourDetails).primary_destination_id === tour.primary_destination_id) score += 15;
        score += currentTourDestIds.filter(id => candidateDestIds.includes(id)).length * 5;
        score += currentTourActivityIds.filter(id => candidateActivityIds.includes(id)).length * 4;

        ['helicopter', 'trek', 'yatra', 'luxury', 'overland'].forEach(keyword => {
          if (tour.title.toLowerCase().includes(keyword) && candidate.title.toLowerCase().includes(keyword)) score += 3;
        });

        return { tour: candidate, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.tour);
  }, [allTours, tour]);

  const goodToKnowCards: GoodToKnowCard[] = tour.good_to_know ? [
    { key: 'main_attractions', title: 'Main Attractions', text: tour.good_to_know.main_attractions, icon: MapPin },
    { key: 'travel_distances', title: 'Travel Distances', text: tour.good_to_know.travel_distances, icon: Activity },
    { key: 'accommodation_standards', title: 'Accommodation Standards', text: tour.good_to_know.accommodation_standards, icon: Bed },
    { key: 'additional_activities', title: 'Additional Activities', text: tour.good_to_know.additional_activities, icon: Info },
  ].filter(card => card.text) : [];

  const scrollToEnquiry = () => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const target = isDesktop ? desktopEnquiryRef.current : mobileEnquiryRef.current;
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleFAQ = (index: number) => {
    const next = new Set(expandedFAQs);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setExpandedFAQs(next);
  };

  if (error || !tour) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">{error ? 'Error loading tour' : 'Tour not found'}</h1>
          <p className="mb-6 text-gray-600">{error || 'The tour you are looking for does not exist.'}</p>
          <Link href="/tours" className="bg-primary px-6 py-3 font-bold text-white hover:bg-primary-dark">Back to Tours</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="tour-detail-page bg-gray-50 pb-32 lg:pb-0">
        <div className="border-b border-gray-200 bg-white py-3 sm:py-4">
          <div className="container mx-auto px-4">
            <Breadcrumb
              items={[
                { name: 'Tours', href: '/tours' },
                ...(primaryDestination ? [{ name: primaryDestination.name, href: `/destinations/${primaryDestination.slug}` }] : []),
                { name: tour.title }
              ]}
            />
          </div>
        </div>

        <section className="py-5 sm:py-8 md:py-10">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 lg:items-start">
              <main className="space-y-6 lg:space-y-8 min-w-0">
                <section className="border border-gray-200 bg-white p-4 sm:p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5 sm:gap-3">
                    {tour.category && <span className="border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs">{tour.category}</span>}
                    {locationLabel && <span className="inline-flex items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 sm:text-sm"><MapPin className="h-4 w-4 text-secondary" />{locationLabel}</span>}
                  </div>

                  <h1 className="max-w-5xl text-2xl font-extrabold leading-tight tracking-tight text-gray-950 sm:text-3xl md:text-5xl break-words">{tour.title}</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 sm:mt-4 sm:text-base sm:leading-8">
                    Review the trip route, full itinerary, inclusions and practical details before speaking with a Nepal travel expert.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 lg:grid-cols-4">
                    <QuickFact icon={Clock} label="Duration" value={formattedDuration} />
                    <QuickFact icon={Users} label="Group Size" value={tour.group_size} />
                    <QuickFact icon={Calendar} label="Best Time" value={tour.best_time} />
                    <QuickFact icon={Activity} label="Trip Type" value={tour.category} />
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <TourImageSlider images={images} title={tour.title} />
                  </div>
                </section>

                <section ref={mobileEnquiryRef} className="scroll-mt-24 lg:hidden">
                  <TourEnquiryButton
                    price={tour.price}
                    hasDiscount={tour.hasDiscount}
                    discountPercentage={tour.discountPercentage}
                    priceAvailable={tour.priceAvailable}
                    tourTitle={tour.title}
                  />

                  <div className="mt-3 border border-gray-200 bg-white p-4">
                    <button onClick={() => setShowDownloadModal(true)} className="flex w-full items-center justify-center gap-3 border-2 border-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-white">
                      <Download className="h-5 w-5" />
                      Download Itinerary
                    </button>
                    <button onClick={() => setShowPriceAlertModal(true)} className="mt-3 w-full text-center text-sm font-semibold text-gray-500 transition-colors hover:text-secondary">
                      Get price updates if this package changes
                    </button>
                  </div>
                </section>

                <TourTabs
                  description={tour.description}
                  highlights={tour.highlights}
                  inclusions={tour.inclusions}
                  exclusions={tour.exclusions}
                  itinerary={tour.itinerary}
                  title={tour.title}
                  goodToKnow={tour.good_to_know}
                  faqs={tour.faqs}
                />

                {goodToKnowCards.length > 0 && (
                  <section className="border border-gray-200 bg-white p-5 sm:p-8">
                    <SectionHeading
                      eyebrow="Before you go"
                      title="Good to Know"
                      description="Essential practical details for planning the journey with confidence."
                    />
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {goodToKnowCards.map(card => {
                        const Icon = card.icon;
                        return (
                          <div key={card.key} className="border border-slate-200 border-l-4 border-l-primary bg-slate-50 p-5">
                            <div className="flex items-start gap-4">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-primary">
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="mb-2 text-lg font-bold text-gray-950">{card.title}</h3>
                                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">{card.text}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {tour.faqs && tour.faqs.length > 0 && (
                  <section className="border border-gray-200 bg-white p-5 sm:p-8">
                    <SectionHeading
                      eyebrow="Questions"
                      title="Frequently Asked Questions"
                      description="The most useful answers are opened first. Tap any question to expand or collapse."
                    />
                    <div className="mt-6 divide-y divide-gray-100 border border-gray-200">
                      {tour.faqs.map((faq, index) => (
                        <div key={`faq-${tour.id}-${index}`} className="border-l-4 border-primary">
                          <button onClick={() => toggleFAQ(index)} className="w-full p-4 text-left transition-colors hover:bg-gray-50 sm:p-5">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-start gap-3 sm:gap-4">
                                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center bg-primary">
                                  <HelpCircle className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-950 sm:text-lg">{faq.question}</h3>
                              </div>
                              {expandedFAQs.has(index) ? <ChevronUp className="h-5 w-5 flex-shrink-0 text-gray-400" /> : <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400" />}
                            </div>
                          </button>
                          {expandedFAQs.has(index) && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="px-4 pb-4 sm:px-5 sm:pb-5">
                              <p className="ml-11 text-sm leading-7 text-gray-700 sm:ml-12">{faq.answer}</p>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </main>

              <aside ref={desktopEnquiryRef} className="hidden lg:sticky lg:top-24 lg:block min-w-0">
                <div className="space-y-4">
                  <TourEnquiryButton
                    price={tour.price}
                    hasDiscount={tour.hasDiscount}
                    discountPercentage={tour.discountPercentage}
                    priceAvailable={tour.priceAvailable}
                    tourTitle={tour.title}
                  />

                  <div className="border border-gray-200 bg-white p-4">
                    <button onClick={() => setShowDownloadModal(true)} className="flex w-full items-center justify-center gap-3 border-2 border-primary px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-white">
                      <Download className="h-5 w-5" />
                      Download Itinerary
                    </button>
                    <p className="mt-3 text-center text-xs leading-5 text-gray-500">Get the full day-by-day plan before speaking with our travel expert.</p>
                    <button onClick={() => setShowPriceAlertModal(true)} className="mt-3 w-full text-center text-sm font-semibold text-gray-500 transition-colors hover:text-secondary">
                      Get price updates if this package changes
                    </button>
                  </div>

                  <div className="border border-gray-200 bg-white p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Why enquire with Zeo?</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start gap-3"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" /><span>No payment required to ask questions</span></div>
                      <div className="flex items-start gap-3"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" /><span>Customize dates, hotels and transport</span></div>
                      <div className="flex items-start gap-3"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" /><span>Route, permit and preparation guidance included</span></div>
                      <div className="flex items-start gap-3"><CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" /><span>Fast response from Nepal travel experts</span></div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {relatedToursList.length > 0 && (
          <section className="border-t border-gray-200 bg-white py-12 sm:py-16">
            <div className="container mx-auto px-4">
              <div className="mb-8 max-w-2xl sm:mb-10">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">More options</p>
                <h2 className="text-2xl font-extrabold text-gray-950 sm:text-3xl">You Might Also Like</h2>
                <p className="mt-2 text-gray-600">Discover similar tours and experiences based on destination, activity and travel style.</p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {relatedToursList.map((relatedTour, index) => (
                  <motion.div key={`${relatedTour.id}-${index}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}>
                    <TourCard tour={relatedTour} onViewDetails={(selectedTour) => router.push(`/tours/${selectedTour.slug}`)} destinations={destinations || undefined} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={scrollToEnquiry} className="flex items-center justify-center gap-2 bg-primary px-3 py-3 text-sm font-bold uppercase tracking-wide text-white">
            <Send className="h-4 w-4" /> Enquire
          </button>
          <button type="button" onClick={() => setShowDownloadModal(true)} className="flex items-center justify-center gap-2 border border-primary bg-white px-3 py-3 text-sm font-bold uppercase tracking-wide text-primary">
            <Download className="h-4 w-4" /> Itinerary
          </button>
        </div>
      </div>

      <DownloadItineraryModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} tourTitle={tour.title} />
      <PriceAlertModal isOpen={showPriceAlertModal} onClose={() => setShowPriceAlertModal(false)} tourTitle={tour.title} currentPrice={tour.price} />
    </>
  );
};

export default TourDetail;
