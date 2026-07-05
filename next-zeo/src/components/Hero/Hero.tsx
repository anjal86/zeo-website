"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { useSliders } from '../../hooks/useApi';

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Disable sound by default (required for autoplay)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set());
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch sliders from API
  const { data: slides, error } = useSliders();

  // Preload videos for faster loading (disabled on mobile to save bandwidth)
  useEffect(() => {
    if (!slides || slides.length === 0 || isMobile) return;

    const preloadVideos = async () => {
      slides.forEach((slide) => {
        if (slide.video && !preloadedVideos.has(slide.video)) {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.muted = true;
          video.playsInline = true;

          const videoUrl = slide.video;

          video.src = videoUrl;

          video.addEventListener('loadedmetadata', () => {
            const videoUrl = slide.video;
            if (videoUrl) {
              setPreloadedVideos(prev => new Set([...prev, videoUrl]));
            }
          });

          video.addEventListener('error', () => {
            const videoUrl = slide.video;
            if (videoUrl) {
              setVideoErrors(prev => new Set([...prev, videoUrl]));
            }
          });

          // Start preloading
          video.load();
        }
      });
    };

    // Start preloading after a short delay to not block initial render
    const timer = setTimeout(preloadVideos, 500);
    return () => clearTimeout(timer);
  }, [slides, preloadedVideos]);

  // Enhanced Parallax scroll effects - All hooks must be at the top level
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 800], [0, 200]);
  const contentY = useTransform(scrollY, [0, 600], [0, -100]);
  const overlayOpacity = useTransform(scrollY, [0, 400], [0.6, 0.95]);
  const cloud1Y = useTransform(scrollY, [0, 800], [0, -150]);
  const cloud2Y = useTransform(scrollY, [0, 700], [0, -120]);
  const cloud3Y = useTransform(scrollY, [0, 600], [0, -90]);
  const cloud4Y = useTransform(scrollY, [0, 500], [0, -60]);
  const titleY = useTransform(scrollY, [0, 400], [0, -80]);
  const subtitleY = useTransform(scrollY, [0, 400], [0, -60]);
  const buttonY = useTransform(scrollY, [0, 400], [0, -40]);
  const locationY = useTransform(scrollY, [0, 400], [0, -70]);
  const indicatorsY = useTransform(scrollY, [0, 300], [0, -30]);
  const scrollIndicatorY = useTransform(scrollY, [0, 200], [0, -20]);
  const patternOpacity = useTransform(scrollY, [0, 300], [0.2, 0.05]);
  const backgroundScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  // Pre-create particle transforms to avoid conditional hooks
  const particle1Y = useTransform(scrollY, [0, 800], [0, -50]);
  const particle2Y = useTransform(scrollY, [0, 800], [0, -60]);
  const particle3Y = useTransform(scrollY, [0, 800], [0, -70]);
  const particle4Y = useTransform(scrollY, [0, 800], [0, -80]);
  const particle5Y = useTransform(scrollY, [0, 800], [0, -90]);
  const particle6Y = useTransform(scrollY, [0, 800], [0, -100]);
  const particle7Y = useTransform(scrollY, [0, 800], [0, -110]);
  const particle8Y = useTransform(scrollY, [0, 800], [0, -120]);

  // Shape transform variables removed

  // Pre-create array of particle transforms
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

    const currentSlideData = slides[currentSlide];
    const duration = currentSlideData.video ? 40000 : 10000; // 40s for video, 10s for photos

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, duration);
    return () => clearInterval(interval);
  }, [slides, currentSlide]);

  // Handle video playback safely
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'AbortError') {
            console.warn("Video playback prevented:", error);
          }
        });
      }
    }
  }, [currentSlide, slides]);

  // Navigation functions
  const goToPrevSlide = () => {
    if (!slides || slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNextSlide = () => {
    if (!slides || slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
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

  // Handle mute/unmute functionality
  const toggleMute = () => {
    setIsMuted(!isMuted);
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      video.muted = !isMuted;
    });
  };

  // Update video mute state when isMuted changes
  useEffect(() => {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      video.muted = isMuted;
    });
  }, [isMuted]);

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.5
      }
    }
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };



  // Error state
  if (error || !slides || slides.length === 0) {
    return (
      <section id="home" className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-24 bg-black">
        <div className="text-center text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Experience Nepal</h1>
          <p className="text-lg sm:text-xl">Immerse yourself in the beauty of Nepal with our curated tours</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden bg-black pt-16 md:pt-0"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background Slider with Parallax */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isMobile ? 0.3 : 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ y: backgroundY }}
        >
          <motion.div
            className="relative w-full h-full"
            style={{ scale: backgroundScale }}
          >
            {slides[currentSlide].video && !isMobile && !videoErrors.has(slides[currentSlide].video) ? (
              <video
                key={`video-${currentSlide}-${slides[currentSlide].id}`}
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
                  if (slides[currentSlide].video_start_time) {
                    video.currentTime = slides[currentSlide].video_start_time;
                  }
                }}
                onError={() => {
                  const videoUrl = slides[currentSlide].video;
                  if (videoUrl) {
                    setVideoErrors(prev => new Set([...prev, videoUrl]));
                  }
                }}
              >
                <source
                  src={slides[currentSlide].video}
                  type="video/mp4"
                />
              </video>
            ) : (
              <img
                src={
                  !slides[currentSlide].image || slides[currentSlide].image === ''
                    ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop'
                    : slides[currentSlide].image.startsWith('blob:') || slides[currentSlide].image.startsWith('http')
                      ? slides[currentSlide].image
                      : `${window.location.protocol}//${window.location.host}${slides[currentSlide].image}`
                }
                alt={slides[currentSlide].title}
                fetchPriority={currentSlide === 0 ? 'high' : 'low'}
                loading={currentSlide === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to default image if current image fails
                  const img = e.target as HTMLImageElement;
                  if (img.src !== 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop') {
                    img.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop';
                  }
                }}
              />
            )}
            {/* Gradient Overlay with Parallax - Left Vignette */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
              style={{ opacity: overlayOpacity }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"
              style={{ opacity: overlayOpacity }}
            />

            {/* Pattern Overlay with Parallax */}
            <motion.div
              className="absolute inset-0 pattern-overlay"
              style={{ opacity: patternOpacity }}
            />
          </motion.div>
        </motion.div>

      </AnimatePresence>

      {/* Enhanced Floating Elements with Parallax - Disabled on mobile for performance */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 100, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-0 w-96 h-32 bg-white/5 rounded-full blur-3xl"
            style={{ y: cloud1Y }}
          />
          <motion.div
            animate={{ x: [0, -100, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 right-0 w-96 h-32 bg-white/5 rounded-full blur-3xl"
            style={{ y: cloud2Y }}
          />
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, -20, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-60 left-1/4 w-64 h-24 bg-white/3 rounded-full blur-2xl"
            style={{ y: cloud3Y }}
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 15, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-40 right-1/4 w-80 h-28 bg-white/4 rounded-full blur-3xl"
            style={{ y: cloud4Y }}
          />
        </div>
      )}

      {/* Hero Content - Clean Minimal */}
      <motion.div
        className="absolute inset-0 z-10 flex items-end justify-center pb-24 md:pb-32"
        style={{ y: contentY }}
      >
        <div className="w-full px-6 sm:px-12 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center max-w-3xl mx-auto"
            >
              {/* Location */}
              <motion.div
                variants={textVariants}
                className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-5"
                style={{ y: locationY }}
              >
                {slides[currentSlide].location || 'Nepal'}
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={textVariants}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-5 leading-tight"
                style={{ y: titleY }}
              >
                {slides[currentSlide].title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={textVariants}
                className="text-sm sm:text-base text-white/60 mb-8 max-w-lg mx-auto leading-relaxed"
                style={{ y: subtitleY }}
              >
                {slides[currentSlide].subtitle || ''}
              </motion.p>

              {/* CTA */}
              {slides[currentSlide].show_button && (
                <motion.div
                  variants={textVariants}
                  className="flex justify-center"
                  style={{ y: buttonY }}
                >
                  <motion.a
                    href={slides[currentSlide].button_url || '#tours'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-8 py-3.5 text-white font-bold text-xs tracking-wider uppercase transition-all duration-300 inline-flex items-center gap-2 ${slides[currentSlide].button_style === 'secondary'
                      ? 'bg-secondary hover:bg-secondary-dark'
                      : slides[currentSlide].button_style === 'outline'
                        ? 'border border-white/30 bg-transparent hover:bg-white hover:text-gray-900'
                        : 'bg-primary hover:bg-primary-dark'
                      }`}
                  >
                    {slides[currentSlide].button_text || 'Explore Adventures'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.a>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation Arrows */}
      {slides && slides.length > 1 && (
        <>
          <button
            onClick={goToPrevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      <motion.div
        className="absolute bottom-8 md:bottom-6 w-full z-20"
        style={{ y: indicatorsY }}
      >
        <div className="w-full flex justify-center items-center">
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 ${index === currentSlide
                  ? 'w-8 h-1.5 bg-primary'
                  : 'w-2 h-1.5 bg-white/30 hover:bg-white/50'
                  }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        style={{ y: scrollIndicatorY }}
      >
        <ChevronDown className="w-5 h-5 text-white/30" />
      </motion.div>

      {/* Mute/Unmute Button - Only show when there's a video and not on mobile */}
      {slides && slides[currentSlide]?.video && !isMobile && (
        <motion.div
          className="absolute bottom-4 left-4 z-30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={toggleMute}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="glass p-2 sm:p-3 rounded-full text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-md border border-white/20"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Additional Parallax Layers for Depth */}
      {!isMobile && (
        <>
          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  y: particleTransforms[i]
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.6, 0.2]
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            ))}
          </div>

          {/* Geometric Shapes section removed */}
        </>
      )}
    </section>
  );
};

export default Hero;