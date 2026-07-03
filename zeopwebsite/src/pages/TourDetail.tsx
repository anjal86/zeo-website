import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Mail, MapPin, Activity, Bed, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import TourCard from '../components/Tours/TourCard';
import TourImageSlider from '../components/Tours/TourImageSlider';
import TourEnquiryButton from '../components/Tours/TourEnquiryButton';
import TourHeader from '../components/Tours/TourHeader';
import TourTabs, { type ItineraryDay } from '../components/Tours/TourTabs';
import { useTours, useDestinations, useContact } from '../hooks/useApi';
import type { Tour } from '../services/api';
import { formatDuration } from '../utils/formatDuration';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import SEO from '../components/SEO/SEO';
import Breadcrumb from '../components/UI/Breadcrumb';
import DownloadItineraryModal from '../components/UI/DownloadItineraryModal';
import PriceAlertModal from '../components/UI/PriceAlertModal';
import { createTouristTripSchema, createBreadcrumbSchema, createFAQSchema } from '../utils/schema';

// API base URL helper function
const getApiBaseUrl = (): string => {
  // Check if we're in production (deployed)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Use the same domain as the frontend for production
    return `${window.location.protocol}//${window.location.host}/api`;
  }

  // Development environment - use relative URL to leverage Vite proxy
  return '/api';
};

// Extended tour interface for detailed data
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
  // Relationship fields - Primary + Secondary Destinations
  primary_destination_id?: number;
  secondary_destination_ids?: number[];
  activity_ids?: number[];
  related_destinations?: string[];
  related_activities?: string[];
}

const TourDetail: React.FC = () => {
  const { tourSlug } = useParams<{ tourSlug: string }>();
  const navigate = useNavigate();
  const { data: allTours, loading, error } = useTours();
  const { data: destinations } = useDestinations();
  const { data: contactInfo } = useContact();

  const [tourDetails, setTourDetails] = useState<TourDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [expandedGoodToKnow, setExpandedGoodToKnow] = useState<Set<string>>(new Set(['main_attractions'])); // First item expanded by default
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set([0])); // First FAQ expanded by default
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const enquirySectionRef = useRef<HTMLDivElement>(null);

  // Find the tour by slug
  const tour = allTours?.find(t => t.slug === tourSlug);

  // Fetch detailed tour data when tour is found
  useEffect(() => {
    const fetchTourDetails = async () => {
      if (!tour) return;

      setDetailsLoading(true);
      try {
        const response = await fetch(`${getApiBaseUrl()}/tours/slug/${tour.slug}`);
        if (response.ok) {
          const details = await response.json();
          setTourDetails(details);
        } else {
          setTourDetails(tour as TourDetails);
        }
      } catch (error) {
        setTourDetails(tour as TourDetails);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchTourDetails();
  }, [tour]);

  // Toggle functions for accordions
  const toggleGoodToKnow = (section: string) => {
    const newExpanded = new Set(expandedGoodToKnow);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedGoodToKnow(newExpanded);
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

  // Get related tours based on a weighted relevance score
  const relatedToursList = useMemo(() => {
    if (!allTours || !tour) return [];

    const currentTourDestIds = [tourDetails?.primary_destination_id, ...(tourDetails?.secondary_destination_ids || [])].filter(Boolean);
    const currentTourActivityIds = tourDetails?.activity_ids || [];
    const currentCategory = tourDetails?.category?.toLowerCase();

    return allTours
      .filter(t => t.id !== tour.id && t.listed !== false)
      .map(t => {
        let score = 0;
        const otherDestIds = [(t as any).primary_destination_id, ...((t as any).secondary_destination_ids || [])].filter(Boolean);
        const otherActivityIds = (t as any).activity_ids || [];
        const otherCategory = t.category?.toLowerCase();

        // 1. Shared Category (Strong signal)
        if (currentCategory && otherCategory === currentCategory) score += 10;
        
        // 2. Primary Destination Match (Strongest signal)
        if (tourDetails?.primary_destination_id && (t as any).primary_destination_id === tourDetails.primary_destination_id) score += 15;

        // 3. Shared Secondary Destinations
        const sharedDests = currentTourDestIds.filter(id => otherDestIds.includes(id)).length;
        score += sharedDests * 5;

        // 4. Shared Activities
        const sharedActs = currentTourActivityIds.filter(id => otherActivityIds.includes(id)).length;
        score += sharedActs * 4;

        // 5. Title Keyword Match (e.g. "Helicopter", "Trek")
        const keywords = ['helicopter', 'trek', 'yatra', 'luxury', 'overland'];
        keywords.forEach(word => {
          if (tour.title.toLowerCase().includes(word) && t.title.toLowerCase().includes(word)) {
            score += 3;
          }
        });

        return { tour: t, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || Math.random() - 0.5) // Sort by score, random tie-breaker
      .slice(0, 3)
      .map(item => item.tour);
  }, [allTours, tour?.id, tourDetails]);

  // Get primary destination for this tour
  const primaryDestination = destinations?.find(dest =>
    dest.id === tourDetails?.primary_destination_id
  );

  // Get secondary destinations for this tour
  const secondaryDestinations = destinations?.filter(dest =>
    tourDetails?.secondary_destination_ids?.includes(dest.id)
  ) || [];

  // Get all destinations for this tour
  const allTourDestinations = [primaryDestination, ...secondaryDestinations].filter(Boolean);

  // Create image gallery using detailed tour data
  const images = tourDetails ? (
    tourDetails.gallery && tourDetails.gallery.length > 0
      ? tourDetails.gallery
      : tourDetails.image
        ? [tourDetails.image]
        : []
  ).filter(Boolean) : [];


  // Handle floating button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!enquirySectionRef.current) return;

      const enquirySection = enquirySectionRef.current;
      const enquiryRect = enquirySection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Check if we're near the bottom of the page (footer area)
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeightFull = window.innerHeight;
      const distanceFromBottom = documentHeight - (scrollTop + windowHeightFull);

      // Hide floating button when enquiry section is visible, passed, or near footer (bottom 200px)
      if ((enquiryRect.top <= windowHeight && enquiryRect.bottom >= 0) || distanceFromBottom < 200) {
        setShowFloatingButton(false);
      } else {
        setShowFloatingButton(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // WhatsApp and Email handlers for floating button
  const handleFloatingWhatsApp = () => {
    const message = `Hi! I'm interested in the ${tourDetails?.title || 'tour'}. Could you please provide more details?`;
    const whatsappUrl = `https://wa.me/${contactInfo?.contact?.phone?.whatsapp?.replace(/[^0-9]/g, '') || '9779851234567'}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFloatingEmail = () => {
    const subject = `Enquiry about ${tourDetails?.title || 'Tour'}`;
    const body = `Hi,\n\nI'm interested in the ${tourDetails?.title || 'tour'}. Could you please provide more details?\n\nThank you!`;
    const emailUrl = `mailto:${contactInfo?.contact?.email?.primary || 'info@zeotourism.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  };

  const handleFloatingEnquiry = () => {
    // Scroll to enquiry section
    enquirySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Memoize structured data to prevent unnecessary SEO component updates
  const structuredData = useMemo(() => {
    if (!tourDetails) return [];

    const breadcrumbItems = [
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "Tours", url: "https://www.zeotourism.com/tours" }
    ];

    if (primaryDestination) {
      breadcrumbItems.push({
        name: primaryDestination.name,
        url: `https://www.zeotourism.com/destinations/${primaryDestination.slug}`
      });
    }

    breadcrumbItems.push({
      name: tourDetails.title,
      url: `https://www.zeotourism.com/tours/${tourDetails.slug}`
    });

    const schemas: object[] = [
      createTouristTripSchema({
        name: tourDetails.title,
        description: tourDetails.description,
        image: tourDetails.image,
        url: `https://www.zeotourism.com/tours/${tourDetails.slug}`,
        price: tourDetails.price,
        currency: "USD",
        category: tourDetails.category || "Tours",
        duration: tourDetails.duration || undefined,
        location: tourDetails.location || undefined,
        difficulty: tourDetails.difficulty || undefined,
        highlights: tourDetails.highlights?.slice(0, 6) || []
      }),
      createBreadcrumbSchema(breadcrumbItems)
    ];

    if (tourDetails.faqs && tourDetails.faqs.length > 0) {
      schemas.push(createFAQSchema(tourDetails.faqs));
    }

    return schemas;
  }, [tourDetails, primaryDestination]);

  if (loading || detailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600 font-medium">Loading tour details...</span>
      </div>
    );
  }

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
          <Link
            to="/tours"
            className="bg-green-600 text-white px-6 py-3 rounded-none hover:bg-green-700 transition-colors"
          >
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${tourDetails.title} - Zeo Tourism`}
        description={tourDetails.description}
        keywords={`${tourDetails.title}, ${tourDetails.location}, ${tourDetails.category}, Nepal tours, trekking nepal, ${tourDetails.highlights?.[0] || ''}`}
        image={tourDetails.image}
        url={`https://www.zeotourism.com/tours/${tourSlug}`}
        type="article"
        structuredData={structuredData}
      />
      <div className="tour-detail-page">
        {/* Breadcrumb Navigation */}
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

        {/* Slider and Tour Details Section - Side by Side */}
        <section className="bg-gray-50">
          <div className="container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Image Slider */}
              <div className="lg:col-span-2">
                <TourImageSlider images={images} title={tourDetails.title} />

                {/* Tour Header - Title and Stats - Right below slider */}
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

                {/* Tour Details - Below title and stats */}
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

                {/* Good to Know Section - Accordion Style */}
                {tourDetails.good_to_know && (
                  <div className="mt-8">
                    <div className="bg-white rounded-none shadow-sm overflow-hidden">
                      <div className="text-center p-6 sm:p-8 border-b border-gray-100">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Good to Know</h3>
                        <p className="text-gray-600">Essential information for your journey, including cultural insights and <a href="https://whc.unesco.org/en/statesparties/np" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">World Heritage</a> context.</p>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {/* Main Attractions */}
                        <div className="border-l-4 border-blue-500">
                          <button
                            onClick={() => toggleGoodToKnow('main_attractions')}
                            className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-600 rounded-none flex items-center justify-center mr-4">
                                  <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">Main Attractions</h4>
                              </div>
                              {expandedGoodToKnow.has('main_attractions') ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </button>
                          {expandedGoodToKnow.has('main_attractions') && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="px-6 pb-6"
                            >
                              <div className="ml-14">
                                <p className="text-gray-700 leading-relaxed">{tourDetails.good_to_know.main_attractions}</p>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Travel Distances */}
                        <div className="border-l-4 border-green-500">
                          <button
                            onClick={() => toggleGoodToKnow('travel_distances')}
                            className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-600 rounded-none flex items-center justify-center mr-4">
                                  <Activity className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">Travel Distances</h4>
                              </div>
                              {expandedGoodToKnow.has('travel_distances') ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </button>
                          {expandedGoodToKnow.has('travel_distances') && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="px-6 pb-6"
                            >
                              <div className="ml-14">
                                <p className="text-gray-700 leading-relaxed">{tourDetails.good_to_know.travel_distances}</p>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Accommodation Standards */}
                        <div className="border-l-4 border-purple-500">
                          <button
                            onClick={() => toggleGoodToKnow('accommodation_standards')}
                            className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-purple-600 rounded-none flex items-center justify-center mr-4">
                                  <Bed className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">Accommodation Standards</h4>
                              </div>
                              {expandedGoodToKnow.has('accommodation_standards') ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </button>
                          {expandedGoodToKnow.has('accommodation_standards') && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="px-6 pb-6"
                            >
                              <div className="ml-14">
                                <p className="text-gray-700 leading-relaxed">{tourDetails.good_to_know.accommodation_standards}</p>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Additional Activities */}
                        <div className="border-l-4 border-orange-500">
                          <button
                            onClick={() => toggleGoodToKnow('additional_activities')}
                            className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-orange-600 rounded-none flex items-center justify-center mr-4">
                                  <Info className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">Additional Activities</h4>
                              </div>
                              {expandedGoodToKnow.has('additional_activities') ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </button>
                          {expandedGoodToKnow.has('additional_activities') && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="px-6 pb-6"
                            >
                              <div className="ml-14">
                                <p className="text-gray-700 leading-relaxed">{tourDetails.good_to_know.additional_activities}</p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQs Section - Accordion Style */}
                {tourDetails.faqs && tourDetails.faqs.length > 0 && (
                  <div className="mt-8">
                    <div className="bg-white rounded-none shadow-sm overflow-hidden">
                      <div className="text-center p-6 sm:p-8 border-b border-gray-100">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h3>
                        <p className="text-gray-600">Your questions, answered</p>
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
                                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-none flex items-center justify-center flex-shrink-0 mt-1">
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

              {/* Right Column - Enquiry + Lead Capture Widgets */}
              <div className="lg:col-span-1" ref={enquirySectionRef}>
                <TourEnquiryButton
                  price={tourDetails.price}
                  hasDiscount={tourDetails.hasDiscount}
                  discountPercentage={tourDetails.discountPercentage}
                  priceAvailable={tourDetails.priceAvailable}
                  tourTitle={tourDetails.title}
                />

                {/* Lead Capture Widgets */}
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => setShowDownloadModal(true)}
                    className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-primary text-gray-700 hover:text-primary py-3.5 px-4 transition-colors duration-200 font-semibold text-sm uppercase tracking-wider"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download Full Itinerary PDF
                  </button>
                  <button
                    onClick={() => setShowPriceAlertModal(true)}
                    className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-secondary text-gray-700 hover:text-secondary py-3.5 px-4 transition-colors duration-200 font-semibold text-sm uppercase tracking-wider"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    🔔 Alert Me of Price Drops
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Related Tours */}
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
                      onViewDetails={(tour) => navigate(`/tours/${tour.slug}`)}
                      destinations={destinations || undefined}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Floating Enquiry Button Bar for Mobile */}
        {showFloatingButton && (
          <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white border-t border-gray-200 shadow-lg"
            >
              <div className="grid grid-cols-3 gap-0">
                {/* Main Enquiry Button */}
                <button
                  onClick={handleFloatingEnquiry}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white py-4 px-4 flex flex-col items-center justify-center hover:opacity-90 transition-all duration-300"
                >
                  <Send className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Enquiry</span>
                </button>

                {/* WhatsApp Button */}
                <button
                  onClick={handleFloatingWhatsApp}
                  className="bg-green-500 text-white py-4 px-4 flex flex-col items-center justify-center hover:opacity-90 transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </button>

                {/* Email Button */}
                <button
                  onClick={handleFloatingEmail}
                  className="bg-gray-600 text-white py-4 px-4 flex flex-col items-center justify-center hover:opacity-90 transition-all duration-300"
                >
                  <Mail className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Email</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Download Itinerary Modal */}
      <DownloadItineraryModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        tourTitle={tourDetails.title}
      />

      {/* Price Alert Modal */}
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
