"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSliders } from '../../hooks/useApi';

const fallbackHeroImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop';

function normalizeHeroMediaUrl(url?: string | null) {
  if (!url) return fallbackHeroImage;
  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return url;
  return `/uploads/${url}`;
}

type HeroProps = {
  initialSlides?: any[];
};

const Hero: React.FC<HeroProps> = ({ initialSlides = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set());
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: fetchedSlides, error: fetchedError } = useSliders();
  const slides = initialSlides.length > 0 ? initialSlides : fetchedSlides;
  const error = initialSlides.length > 0 ? null : fetchedError;

  useEffect(() => {
    if (!slides || slides.length === 0 || isMobile) return;

    const preloadVideos = async () => {
      slides.forEach((slide) => {
        const videoUrl = normalizeHeroMediaUrl(slide.video);
        if (slide.video && !preloadedVideos.has(videoUrl)) {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.muted = true;
          video.playsInline = true;
          video.src = videoUrl;

          video.addEventListener('loadedmetadata', () => {
            setPreloadedVideos(prev => new Set([...prev, videoUrl]));
          });

          video.addEventListener('error', () => {
            setVideoErrors(prev => new Set([...prev, videoUrl]));
          });

          video.load();
        }
      });
    };

    const timer = setTimeout(preloadVideos, 500);
    return () => clearTimeout(timer);
  }, [slides, preloadedVideos, isMobile]);

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 800], [0, 160]);
  const contentY = useTransform(scrollY, [0, 600], [0, -48]);
  const overlayOpacity = useTransform(scrollY, [0, 400], [0.72, 0.94]);
  const cloud1Y = useTransform(scrollY, [0, 800], [0, -150]);
  const cloud2Y = useTransform(scrollY, [0, 700], [0, -120]);
  const cloud3Y = useTransform(scrollY, [0, 600], [0, -90]);
  const cloud4Y = useTransform(scrollY, [0, 500], [0, -60]);
  const titleY = useTransform(scrollY, [0, 400], [0, -46]);
  const subtitleY = useTransform(scrollY, [0, 400], [0, -34]);
  const buttonY = useTransform(scrollY, [0, 400], [0, -24]);
  const locationY = useTransform(scrollY, [0, 400], [0, -36]);
  const indicatorsY = useTransform(scrollY, [0, 300], [0, -24]);
  const scrollIndicatorY = useTransform(scrollY, [0, 200], [0, -20]);
  const patternOpacity = useTransform(scrollY, [0, 300], [0.14, 0.04]);
  const backgroundScale = useTransform(scrollY, [0, 500], [1, 1.08]);

  const particle1Y = useTransform(scrollY, [0, 800], [0, -50]);
  const particle2Y = useTransform(scrollY, [0, 800], [0, -60]);
  const particle3Y = useTransform(scrollY, [0, 800], [0, -70]);
  const particle4Y = useTransform(scrollY, [0, 800], [0, -80]);
  const particle5Y = useTransform(scrollY, [0, 800], [0, -90]);
  const particle6Y = useTransform(scrollY, [0, 800], [0, -100]);
  const particle7Y = useTransform(scrollY, [0, 800], [0, -110]);
  const particle8Y = useTransform(scrollY, [0, 800], [0, -120]);
  const particleTransforms = [particle1Y, particle2Y, particle3Y, particle4Y, particle5Y, particle6Y, particle7Y, particle8Y];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile((typeof window !== 'undefined' ? window.innerWidth : 1024) < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!slides || slides.length === 0) return;

    const currentSlideData = slides[currentSlide] ?? slides[0];
    const duration = currentSlideData.video ? 40000 : 10000;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, duration);
    return () => clearInterval(interval);
  }, [slides, currentSlide]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'AbortError') {
            console.warn('Video playback prevented:', error);
          }
        });
      }
    }
  }, [currentSlide, slides]);

  const goToPrevSlide = () => {
    if (!slides || slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNextSlide = () => {
    if (!slides || slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      video.muted = !isMuted;
    });
  };

  useEffect(() => {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      video.muted = isMuted;
    });
  }, [isMuted]);

  const textVariants = {
    hidden: { opacity: 0, y: 26 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.66,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      y: -26,
      transition: {
        duration: 0.35,
      },
    },
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (error || !slides || slides.length === 0) {
    return (
      <section id="home" className="relative min-h-[92vh] w-full overflow-hidden flex items-center justify-center pt-24 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.9))]" />
        <div className="relative z-10 text-center text-white px-6 max-w-3xl translate-y-8 md:translate-y-12">
          <p className="text-primary text-xs font-bold tracking-[0.28em] uppercase mb-5">Nepal</p>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold mb-5 leading-tight">Kailash Mansarovar Yatra & Nepal Tours</h1>
          <p className="text-base sm:text-lg text-white/70 leading-relaxed">Plan your journey with local ground support.</p>
        </div>
      </section>
    );
  }

  const activeSlide = slides[currentSlide] ?? slides[0];
  const activeVideo = activeSlide.video ? normalizeHeroMediaUrl(activeSlide.video) : null;
  const activeImage = normalizeHeroMediaUrl(activeSlide.image || activeSlide.image_url);
  const primaryHref = activeSlide.button_url || '/tours';
  const primaryLabel = activeSlide.button_text || 'Explore Packages';
  const showPrimaryButton = activeSlide.show_button !== false;

  return (
    <section
      id="home"
      className="relative min-h-[92vh] md:min-h-screen w-full overflow-hidden bg-black pt-16 md:pt-0"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isMobile ? 0.3 : 0.75, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ y: backgroundY }}
        >
          <motion.div className="relative w-full h-full" style={{ scale: backgroundScale }}>
            {activeVideo && !isMobile && !videoErrors.has(activeVideo) ? (
              <video
                key={`video-${currentSlide}-${activeSlide.id}`}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted={isMuted}
                loop
                playsInline
                controls={false}
                preload="auto"
                ref={videoRef}
                onLoadedMetadata={(e) => {
                  const video = e.target as HTMLVideoElement;
                  if (activeSlide.video_start_time) video.currentTime = activeSlide.video_start_time;
                }}
                onError={() => setVideoErrors(prev => new Set([...prev, activeVideo]))}
              >
                <source src={activeVideo} type="video/mp4" />
              </video>
            ) : (
              <img
                src={activeImage}
                alt={activeSlide.title || 'Nepal tour hero image'}
                fetchPriority={currentSlide === 0 ? 'high' : 'low'}
                loading={currentSlide === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src !== fallbackHeroImage) img.src = fallbackHeroImage;
                }}
              />
            )}
            <motion.div className="absolute inset-0 bg-gradient-to-r from-black/86 via-black/52 to-black/15" style={{ opacity: overlayOpacity }} />
            <motion.div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/5 to-black/30" style={{ opacity: overlayOpacity }} />
            <motion.div className="absolute inset-0 pattern-overlay" style={{ opacity: patternOpacity }} />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ x: [0, 100, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute top-20 left-0 w-96 h-32 bg-white/5 rounded-full blur-3xl" style={{ y: cloud1Y }} />
          <motion.div animate={{ x: [0, -100, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute top-40 right-0 w-96 h-32 bg-primary/10 rounded-full blur-3xl" style={{ y: cloud2Y }} />
          <motion.div animate={{ x: [0, 50, 0], y: [0, -20, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute top-60 left-1/4 w-64 h-24 bg-white/3 rounded-full blur-2xl" style={{ y: cloud3Y }} />
          <motion.div animate={{ x: [0, -30, 0], y: [0, 15, 0] }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }} className="absolute bottom-40 right-1/4 w-80 h-28 bg-white/4 rounded-full blur-3xl" style={{ y: cloud4Y }} />
        </div>
      )}

      <motion.div className="absolute inset-0 z-10 flex items-end md:items-center justify-center pb-28 md:pb-0 md:pt-36 lg:pt-44" style={{ y: contentY }}>
        <div className="w-full px-5 sm:px-8 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide} variants={staggerChildren} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto text-center md:text-left md:mx-0">
              <motion.div variants={textVariants} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase text-white/85 backdrop-blur-md mb-5" style={{ y: locationY }}>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {activeSlide.location || 'Nepal'}
              </motion.div>

              <motion.h1 variants={textVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-5 leading-[0.95] tracking-[-0.04em] max-w-4xl" style={{ y: titleY }}>
                {activeSlide.title}
              </motion.h1>

              {activeSlide.subtitle && (
                <motion.p variants={textVariants} className="text-sm sm:text-base md:text-lg text-white/78 mb-8 max-w-2xl md:max-w-xl mx-auto md:mx-0 leading-relaxed" style={{ y: subtitleY }}>
                  {activeSlide.subtitle}
                </motion.p>
              )}

              {showPrimaryButton && (
                <motion.div variants={textVariants} className="flex justify-center md:justify-start" style={{ y: buttonY }}>
                  <Link href={primaryHref} className="bg-primary text-white px-7 py-4 text-xs font-bold tracking-wider uppercase hover:bg-white hover:text-gray-950 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-2xl shadow-black/20">
                    {primaryLabel}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {slides.length > 1 && (
        <>
          <button onClick={goToPrevSlide} className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/15 bg-black/25 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300" aria-label="Previous slide">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={goToNextSlide} className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/15 bg-black/25 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300" aria-label="Next slide">
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <motion.div className="absolute bottom-7 md:bottom-8 w-full z-20" style={{ y: indicatorsY }}>
          <div className="w-full flex justify-center items-center">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-md">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`transition-all duration-300 rounded-full ${index === currentSlide ? 'w-8 h-1.5 bg-primary' : 'w-2 h-1.5 bg-white/35 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-20" style={{ y: scrollIndicatorY }}>
        <ChevronDown className="w-5 h-5 text-white/30" />
      </motion.div>

      {activeVideo && !isMobile && (
        <motion.div className="absolute bottom-4 left-4 z-30" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
          <motion.button onClick={toggleMute} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="rounded-full border border-white/20 bg-black/30 p-3 text-white backdrop-blur-md hover:bg-white/20 transition-all duration-300" aria-label={isMuted ? 'Unmute video' : 'Mute video'}>
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </motion.button>
        </motion.div>
      )}

      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%`, y: particleTransforms[i] }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
