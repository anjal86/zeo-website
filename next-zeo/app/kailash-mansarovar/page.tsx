"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';


import { createOrganizationSchema, createBreadcrumbSchema } from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';

import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  Calendar,
  Shield,
  FileText,
  Activity,
  Map,
  Plane,
  Mountain,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import {
  GiWaterDrop
} from 'react-icons/gi';
import TourGrid from '../../src/components/Tours/TourGrid';
import LoadingSpinner from '../../src/components/UI/LoadingSpinner';
import ErrorMessage from '../../src/components/UI/ErrorMessage';
import { useDestinations } from '../../src/hooks/useApi';
import type { Tour } from '../../src/services/api';


interface GalleryPhoto {
  id: number;
  title: string;
  image: string;
  alt: string;
  gridSpan: string;
  order: number;
  isActive: boolean;
  uploadedAt: string;
}

interface GalleryMetadata {
  totalPhotos: number;
  lastUpdated: string;
  pageTitle: string;
  pageSubtitle: string;
}

const KailashMansarovarPage: React.FC = () => {
  const router = useRouter();
  const { data: destinations } = useDestinations();

  const [filters] = useState({
    search: '',
    destination: '',
    activity: ''
  });

  // State for API data
  const [kailashTours, setKailashTours] = useState<Tour[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [galleryMetadata, setGalleryMetadata] = useState<GalleryMetadata>({
    totalPhotos: 0,
    lastUpdated: '',
    pageTitle: 'Kailash Mansarovar',
    pageSubtitle: 'Sacred Journey Gallery'
  });
  const [loading, setLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  // Hero slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Parallax scroll effects
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 800], [0, 200]);
  const overlayOpacity = useTransform(scrollY, [0, 400], [0.6, 0.95]);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch Kailash gallery data
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setGalleryLoading(true);
        const response = await fetch('/api/kailash-gallery');
        if (!response.ok) {
          throw new Error('Failed to fetch gallery data');
        }
        const data = await response.json();
        setGalleryPhotos(data.gallery || []);
        setGalleryMetadata(data.metadata || galleryMetadata);
        setGalleryError(null);
      } catch (err) {
        setGalleryError(err instanceof Error ? err.message : 'Failed to load gallery');
        // Fallback to default photos if API fails
        setGalleryPhotos([
          {
            id: 1,
            title: "Sacred Kailash Peak",
            image: "https://images.unsplash.com/photo-1601999109497-ba1c7b6e0cfb?q=80&w=2070",
            alt: "Majestic view of Mount Kailash peak",
            gridSpan: "col-span-2 row-span-3",
            order: 1,
            isActive: true,
            uploadedAt: new Date().toISOString()
          },
          {
            id: 2,
            title: "Mansarovar Lake",
            image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070",
            alt: "Sacred waters of Lake Mansarovar",
            gridSpan: "col-span-1 row-span-2",
            order: 2,
            isActive: true,
            uploadedAt: new Date().toISOString()
          }
        ]);
      } finally {
        setGalleryLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!galleryPhotos || galleryPhotos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryPhotos.length);
    }, 8000); // 8 seconds per slide

    return () => clearInterval(interval);
  }, [galleryPhotos]);

  // Fetch Kailash packages from tours API
  useEffect(() => {
    const fetchKailashPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tours?search=kailash');
        if (!response.ok) {
          throw new Error('Failed to fetch tours');
        }
        const kailashTours = await response.json();

        // If no Kailash tours found with search, try broader search
        if (kailashTours.length === 0) {
          const fallbackResponse = await fetch('/api/tours');
          const allTours = await fallbackResponse.json();
          const filteredTours = allTours.filter((tour: Tour) =>
            tour.location?.toLowerCase().includes('kailash') ||
            tour.title?.toLowerCase().includes('kailash') ||
            tour.category?.toLowerCase().includes('pilgrimage') ||
            tour.location?.toLowerCase().includes('tibet')
          );
          setKailashTours(filteredTours.length > 0 ? filteredTours : allTours);
        } else {
          setKailashTours(kailashTours);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    fetchKailashPackages();
  }, []);

  const handleTourBook = (tour: Tour) => {
    router.push(`/tours/${tour.slug}`);
  };

  const handleTourView = (tour: Tour) => {
    router.push(`/tours/${tour.slug}`);
  };

  // Slider navigation functions
  const goToPrevSlide = () => {
    if (!galleryPhotos || galleryPhotos.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const goToNextSlide = () => {
    if (!galleryPhotos || galleryPhotos.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % galleryPhotos.length);
  };

  // Touch/swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextSlide();
    } else if (isRightSwipe) {
      goToPrevSlide();
    }
  };


  return (
    <>
      
      
      <div className="kailash-mansarovar-page bg-brand-light">
        {/* Hero Slider Gallery */}
        <section
          className="relative w-full overflow-hidden bg-brand-dark h-[70vh] md:h-[85vh]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {galleryLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-xl font-serif">Loading sacred gallery...</div>
            </div>
          ) : galleryError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-400 text-xl font-serif">Error loading gallery: {galleryError}</div>
            </div>
          ) : galleryPhotos.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-xl font-serif">No gallery photos available</div>
            </div>
          ) : (
            <>
              {/* Background Image Slider */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: isMobile ? 0.8 : 1.2, ease: "easeInOut" }}
                  className="absolute inset-0"
                  style={{ y: backgroundY }}
                >
                  <img
                    src={galleryPhotos[currentSlide]?.image}
                    alt={galleryPhotos[currentSlide]?.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop';
                    }}
                  />
                  {/* Rich Dark Gradient Overlay for Spiritual Atmosphere */}
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-dark/90" />
                </motion.div>
              </AnimatePresence>

              {/* Hero Content (Overlayed directly on image for better immersion) */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 md:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-400 text-sm font-semibold tracking-[0.2em] uppercase mb-6 shadow-glow">
                    <Mountain className="w-4 h-4" />
                    <span>Sacred Pilgrimage 2026</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                    Kailash Mansarovar <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Yatra</span>
                  </h1>
                  <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed mb-10 font-sans drop-shadow-lg">
                    A sacred Himalayan journey through devotion, altitude, and extraordinary landscapes.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => {
                        const toursSection = document.getElementById('yatra-packages');
                        toursSection?.scrollIntoView({ behavior: 'smooth' });
                      }} 
                      className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-orange-500/30 transition-all duration-300 flex items-center justify-center gap-2 group">
                      View 2026 Packages
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <Link href="/contact" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2">
                      <Phone className="w-5 h-5" />
                      Ask for Cost & Permits
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Navigation Arrows */}
              {galleryPhotos && galleryPhotos.length > 1 && (
                <>
                  <motion.button
                    onClick={goToPrevSlide}
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 bg-black/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/40 transition-all duration-300 border border-white/20"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </motion.button>

                  <motion.button
                    onClick={goToNextSlide}
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 bg-black/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/40 transition-all duration-300 border border-white/20"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </motion.button>
                </>
              )}

              {/* Slide Indicators */}
              <motion.div className="absolute bottom-8 md:bottom-12 w-full z-20">
                <div className="w-full flex justify-center items-center">
                  <div className="flex space-x-3 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    {galleryPhotos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-300 ${index === currentSlide
                          ? 'w-8 md:w-10 h-2 bg-orange-400'
                          : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                          } rounded-full`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </section>

        {/* Route Comparison Section */}
        <section className="py-24 bg-brand-light relative">
          <div className="section-container relative z-10">
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8">
                <div className="mb-12">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500 mb-3 flex items-center gap-2">
                    <Map className="w-4 h-4" /> Yatra Options
                  </p>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark mb-6 leading-tight max-w-2xl">
                    Compare Kailash Yatra Routes <br className="hidden md:block" />
                    <span className="text-gray-400 font-light">from Kathmandu</span>
                  </h2>
                  <div className="prose prose-lg text-gray-600 max-w-none">
                    <p className="lead">
                      The sacred journey to Mount Kailash can be undertaken through several distinct routes, each offering a different balance of acclimatization, travel style, and duration.
                    </p>
                    <p>
                      Depending on your fitness level, time constraints, and budget, choose between an overland adventure, a time-saving helicopter route, a cultural journey via Lhasa, or a swift aerial Darshan.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Route Card 1 */}
                  <div className="bg-white rounded-none p-6 md:p-8 transition-all duration-300 border border-gray-200 hover:border-gray-300 group relative">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6 flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-none text-xs font-bold uppercase tracking-wide mb-4 border border-gray-200">
                            <Activity className="w-3.5 h-3.5 text-orange-500" /> Overland
                          </div>
                          <h3 className="text-xl font-serif font-bold text-brand-dark mb-2">Kailash Overland Tour</h3>
                          <p className="text-sm text-gray-600 font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> 13-14 Days</p>
                          <p className="text-sm text-gray-600 font-medium mt-1">Difficulty: Strenuous</p>
                        </div>
                      </div>
                      <div className="md:w-2/3 flex flex-col">
                        <p className="text-gray-600 mb-6 leading-relaxed">The classic pilgrim's path. Offers gradual acclimatization and a complete overland experience through the rugged Tibetan plateau.</p>
                        <div className="bg-gray-50 border border-gray-100 rounded-none p-4 mb-6">
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> 
                              <span><span className="font-bold text-brand-dark">Best for:</span> Those wanting the full traditional route experience.</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                              <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> 
                              <span><span className="font-bold text-brand-dark">Permits:</span> Requires careful Tibet permit timing.</span>
                            </li>
                          </ul>
                        </div>
                        <div className="mt-auto flex justify-end">
                          <button onClick={() => {
                            const toursSection = document.getElementById('yatra-packages');
                            toursSection?.scrollIntoView({ behavior: 'smooth' });
                          }} className="text-sm font-bold text-brand-dark hover:text-orange-600 flex items-center gap-2 transition-colors group/btn">
                            View Itineraries <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform text-orange-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Card 2 */}
                  <div className="bg-white rounded-none p-6 md:p-8 transition-all duration-300 border border-gray-200 hover:border-gray-300 group relative">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6 flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-none text-xs font-bold uppercase tracking-wide mb-4 border border-gray-200">
                            <Plane className="w-3.5 h-3.5 text-orange-500" /> Heli-Assisted
                          </div>
                          <h3 className="text-xl font-serif font-bold text-brand-dark mb-2">Kailash Helicopter Tour</h3>
                          <p className="text-sm text-gray-600 font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> 9-11 Days</p>
                          <p className="text-sm text-gray-600 font-medium mt-1">Difficulty: Moderate</p>
                        </div>
                      </div>
                      <div className="md:w-2/3 flex flex-col">
                        <p className="text-gray-600 mb-6 leading-relaxed">A time-efficient journey skipping long drives using helicopters from Nepalgunj/Simikot to Hilsa, reducing physical strain.</p>
                        <div className="bg-gray-50 border border-gray-100 rounded-none p-4 mb-6">
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> 
                              <span><span className="font-bold text-brand-dark">Best for:</span> Senior pilgrims or those short on time.</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                              <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> 
                              <span><span className="font-bold text-brand-dark">Weather:</span> Highly dependent on mountain weather windows.</span>
                            </li>
                          </ul>
                        </div>
                        <div className="mt-auto flex justify-end">
                           <button onClick={() => {
                            const toursSection = document.getElementById('yatra-packages');
                            toursSection?.scrollIntoView({ behavior: 'smooth' });
                          }} className="text-sm font-bold text-brand-dark hover:text-orange-600 flex items-center gap-2 transition-colors group/btn">
                            View Itineraries <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform text-orange-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Card 3 */}
                  <div className="bg-white rounded-none p-6 md:p-8 transition-all duration-300 border border-gray-200 hover:border-gray-300 group relative">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6 flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-none text-xs font-bold uppercase tracking-wide mb-4 border border-gray-200">
                            <MapPin className="w-3.5 h-3.5 text-orange-500" /> Via Lhasa
                          </div>
                          <h3 className="text-xl font-serif font-bold text-brand-dark mb-2">Kathmandu-Lhasa-Kailash</h3>
                          <p className="text-sm text-gray-600 font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> 14-16 Days</p>
                          <p className="text-sm text-gray-600 font-medium mt-1">Difficulty: Moderate</p>
                        </div>
                      </div>
                      <div className="md:w-2/3 flex flex-col">
                        <p className="text-gray-600 mb-6 leading-relaxed">Combines the cultural highlights of Lhasa (Potala Palace) with the spiritual journey to Kailash. Excellent acclimatization.</p>
                        <div className="bg-gray-50 border border-gray-100 rounded-none p-4 mb-6">
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> 
                              <span><span className="font-bold text-brand-dark">Best for:</span> Cultural immersion and safe altitude gain.</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-700">
                              <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> 
                              <span><span className="font-bold text-brand-dark">Logistics:</span> Requires complex China visa & flight coordination.</span>
                            </li>
                          </ul>
                        </div>
                        <div className="mt-auto flex justify-end">
                           <button onClick={() => {
                            const toursSection = document.getElementById('yatra-packages');
                            toursSection?.scrollIntoView({ behavior: 'smooth' });
                          }} className="text-sm font-bold text-brand-dark hover:text-orange-600 flex items-center gap-2 transition-colors group/btn">
                            View Itineraries <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform text-orange-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar: Kailash Planning Toolkit */}
              <div className="lg:col-span-4 mt-12 lg:mt-0">
                <div className="bg-[#2B5C9C] rounded-none p-8 sticky top-24 border border-[#2B5C9C]">
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                        <Phone className="w-5 h-5 text-[#E37833]" />
                      </div>
                      <div>
                        <p className="text-[#E37833] text-xs font-bold uppercase tracking-wider mb-1">Expert Support</p>
                        <h3 className="text-2xl font-serif font-bold text-white leading-tight">Yatra Planning Assistant</h3>
                      </div>
                    </div>
                    
                    <p className="text-blue-100 text-sm mb-8 leading-relaxed">
                      Need help choosing the right route? Get free guidance on altitude safety, Tibet permits, and 2026 pricing.
                    </p>

                    <Link href="/contact" className="w-full flex items-center justify-between gap-2 bg-[#E37833] text-white px-6 py-4 rounded-none font-bold hover:bg-[#c96a2d] transition-colors group mb-10 shadow-md">
                      <span>Ask for Cost & Permits</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    <div className="pt-8 border-t border-white/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-6 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-300" /> Essential Guides
                      </h4>
                      <div className="space-y-3">
                        <Link href="/kailash-mansarovar-yatra-cost" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-none hover:border-[#E37833]/50 hover:bg-white/10 transition-colors group">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
                            <span className="text-sm font-bold text-blue-50 group-hover:text-white transition-colors">Yatra Cost Breakdown</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#E37833] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </Link>
                        
                        <Link href="/kailash-mansarovar-yatra-documents-permits" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-none hover:border-[#E37833]/50 hover:bg-white/10 transition-colors group">
                          <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
                            <span className="text-sm font-bold text-blue-50 group-hover:text-white transition-colors">Permits & Visas</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#E37833] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </Link>

                        <Link href="/kailash-fitness-medical-guide" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-none hover:border-[#E37833]/50 hover:bg-white/10 transition-colors group">
                          <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
                            <span className="text-sm font-bold text-blue-50 group-hover:text-white transition-colors">Altitude Safety & Prep</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#E37833] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </Link>
                        
                        <Link href="/kailash-packing-list" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-none hover:border-[#E37833]/50 hover:bg-white/10 transition-colors group">
                          <div className="flex items-center gap-3">
                            <Map className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors" />
                            <span className="text-sm font-bold text-blue-50 group-hover:text-white transition-colors">Packing Checklist</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#E37833] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tours Section */}
        <section id="yatra-packages" className="py-24 bg-brand-light relative">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-white z-0 pointer-events-none"></div>
          <div className="section-container relative z-10">
            <div className="text-center mb-16">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500 mb-3 flex items-center justify-center gap-2">
                <Mountain className="w-4 h-4" /> 2026 Departures
              </p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark mb-6">
                Featured Yatra Packages
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Carefully crafted itineraries for a safe and spiritually fulfilling journey to Mount Kailash.
              </p>
            </div>
            
            {/* Loading State */}
            {loading && (
              <LoadingSpinner className="py-20" size="lg" />
            )}

            {/* Error State */}
            {error && (
              <ErrorMessage
                message={`Failed to load Kailash packages: ${error}`}
                className="py-20"
              />
            )}

            {/* Tours Grid */}
            {!loading && !error && (
              <TourGrid
                tours={kailashTours}
                filters={filters}
                onTourBook={handleTourBook}
                onTourView={handleTourView}
                destinations={destinations || undefined}
              />
            )}
          </div>
        </section>

        {/* Final CTA */}
        {/* Final CTA */}
        <section className="py-16 bg-[#2B5C9C] relative">
          <div className="section-container text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-center mb-6">
                <Mountain className="text-5xl text-[#E37833] w-14 h-14" />
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
                Your Sacred Journey Awaits
              </h2>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
                The sacred mountain awaits. Begin your pilgrimage with expert guidance, reliable support, and deep reverence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/contact"
                  className="bg-[#E37833] hover:bg-[#c96a2d] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg"
                >
                  <Mail className="w-5 h-5" />
                  Request 2026 Information
                </Link>

                <a
                  href="tel:+9779851000000"
                  className="border-2 border-white/40 bg-transparent text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Phone className="w-5 h-5" />
                  Speak to an Expert
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default KailashMansarovarPage;
