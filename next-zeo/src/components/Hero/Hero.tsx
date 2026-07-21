"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPinned,
  MessageCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';

const fallbackHeroImage =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop';

const fallbackSlides: HeroSlide[] = [
  {
    id: 'fallback',
    title: 'Kailash Mansarovar Yatra & Nepal Tours',
    subtitle: 'Plan sacred journeys, Himalayan adventures and cultural tours with a Kathmandu-based travel team.',
    location: 'Nepal',
    image: fallbackHeroImage,
    button_text: 'Explore Packages',
    button_url: '/tours',
    show_button: true,
  },
];

const trustPoints = [
  { icon: MapPinned, label: 'Kathmandu-based planning' },
  { icon: CheckCircle2, label: 'Clear routes and support' },
  { icon: MessageCircle, label: 'Talk to a local expert' },
];

type HeroSlide = {
  id?: string | number;
  title?: string | null;
  subtitle?: string | null;
  location?: string | null;
  image?: string | null;
  image_url?: string | null;
  video?: string | null;
  video_start_time?: number | string | null;
  button_text?: string | null;
  button_url?: string | null;
  show_button?: boolean | null;
};

type HeroProps = {
  initialSlides?: HeroSlide[];
};

function normalizeHeroMediaUrl(url?: string | null) {
  if (!url) return fallbackHeroImage;

  if (url.includes('blob.vercel-storage.com')) {
    try {
      const parsed = new URL(url);
      return parsed.pathname.startsWith('/uploads/') ? parsed.pathname : `/uploads${parsed.pathname}`;
    } catch {
      return fallbackHeroImage;
    }
  }

  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return url;
  return `/uploads/${url}`;
}

export default function Hero({ initialSlides = [] }: HeroProps) {
  const slides = initialSlides.length > 0 ? initialSlides : fallbackSlides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [allowVideo, setAllowVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const activeSlide = slides[currentSlide] || slides[0];
  const activeImage = normalizeHeroMediaUrl(activeSlide.image || activeSlide.image_url);
  const activeVideo = activeSlide.video ? normalizeHeroMediaUrl(activeSlide.video) : null;
  const canShowVideo = Boolean(activeVideo && allowVideo && !videoFailed);

  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [currentSlide, slides.length]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;

    const updateVideoPreference = () => {
      setAllowVideo(window.innerWidth >= 768 && !reducedMotion.matches && !connection?.saveData);
    };

    updateVideoPreference();
    window.addEventListener('resize', updateVideoPreference);
    reducedMotion.addEventListener?.('change', updateVideoPreference);

    return () => {
      window.removeEventListener('resize', updateVideoPreference);
      reducedMotion.removeEventListener?.('change', updateVideoPreference);
    };
  }, []);

  useEffect(() => {
    setVideoFailed(false);
  }, [currentSlide]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const duration = activeSlide.video ? 40000 : 10000;
    const timer = window.setTimeout(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [activeSlide.video, currentSlide, slides.length]);

  const goToSlide = (index: number) => setCurrentSlide((index + slides.length) % slides.length);
  const goToPrevious = () => goToSlide(currentSlide - 1);
  const goToNext = () => goToSlide(currentSlide + 1);

  const handleTouchEnd = () => {
    if (touchStart.current === null || touchEnd.current === null) return;
    const distance = touchStart.current - touchEnd.current;
    if (Math.abs(distance) >= 50) distance > 0 ? goToNext() : goToPrevious();
    touchStart.current = null;
    touchEnd.current = null;
  };

  const primaryHref = activeSlide.button_url || '/tours';
  const primaryLabel = activeSlide.button_text || 'Explore Packages';
  const showPrimaryButton = activeSlide.show_button !== false;

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative min-h-[88svh] w-full overflow-hidden bg-slate-950 pt-16 md:min-h-[92svh] md:pt-0"
      onTouchStart={(event) => {
        touchStart.current = event.targetTouches[0]?.clientX ?? null;
        touchEnd.current = null;
      }}
      onTouchMove={(event) => {
        touchEnd.current = event.targetTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0">
        {canShowVideo ? (
          <video
            ref={videoRef}
            key={`hero-video-${activeSlide.id ?? currentSlide}`}
            className="h-full w-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            onLoadedMetadata={(event) => {
              const start = Number(activeSlide.video_start_time || 0);
              if (Number.isFinite(start) && start > 0) event.currentTarget.currentTime = start;
            }}
            onError={() => setVideoFailed(true)}
          >
            <source src={activeVideo || undefined} type="video/mp4" />
          </video>
        ) : (
          <img
            key={`hero-image-${activeSlide.id ?? currentSlide}`}
            src={activeImage}
            alt={activeSlide.title || 'Himalayan journey with Zeo Tourism'}
            fetchPriority={currentSlide === 0 ? 'high' : 'low'}
            loading={currentSlide === 0 ? 'eager' : 'lazy'}
            className="h-full w-full object-cover"
            onError={(event) => {
              if (event.currentTarget.src !== fallbackHeroImage) event.currentTarget.src = fallbackHeroImage;
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/68 to-slate-950/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/25" />
        <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-20 right-0 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" aria-hidden="true" />
      </div>

      <div className="container-xl relative z-10 flex min-h-[88svh] items-center py-20 md:min-h-[92svh] md:py-24">
        <div
          className="max-w-3xl rounded-2xl border border-white/15 bg-slate-950/38 p-6 text-white shadow-2xl shadow-black/15 backdrop-blur-sm sm:p-8 md:p-10"
          aria-live="polite"
        >
          {activeSlide.location && (
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85">
              <MapPinned className="h-4 w-4 text-primary" aria-hidden="true" />
              {activeSlide.location}
            </p>
          )}

          <h1
            id="hero-title"
            className="mt-5 max-w-3xl font-serif text-4xl font-bold leading-[1.06] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {activeSlide.title || 'Kailash Mansarovar Yatra & Nepal Tours'}
          </h1>

          {activeSlide.subtitle && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg md:leading-8">
              {activeSlide.subtitle}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {showPrimaryButton && (
              <Link
                href={primaryHref}
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:border-white/70 hover:bg-white hover:text-slate-950"
            >
              Talk to an expert
            </Link>
          </div>

          <ul className="mt-7 grid gap-3 border-t border-white/15 pt-6 text-sm text-white/72 sm:grid-cols-3">
            {trustPoints.map((point) => {
              const Icon = point.icon;
              return (
                <li key={point.label} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{point.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-4 right-4 z-20 flex items-center justify-between gap-4 md:bottom-10 md:left-8 md:right-8">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-2 backdrop-blur-sm" aria-label="Hero slides">
            {slides.map((slide, index) => (
              <button
                key={slide.id ?? index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-200 ${index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-white/55 hover:bg-white'}`}
                aria-label={`Show slide ${index + 1}: ${slide.title || 'Journey'}`}
                aria-current={index === currentSlide ? 'true' : undefined}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeVideo && allowVideo && !videoFailed && (
              <button
                type="button"
                onClick={() => {
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  if (videoRef.current) videoRef.current.muted = nextMuted;
                }}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 bg-black/30 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white hover:bg-black/50"
                aria-label={isMuted ? 'Unmute hero video' : 'Mute hero video'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={goToPrevious}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 bg-black/30 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white hover:bg-black/50"
              aria-label="Previous hero slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 bg-black/30 text-white backdrop-blur-sm transition-colors duration-200 hover:border-white hover:bg-black/50"
              aria-label="Next hero slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <a
        href="#main-content"
        className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-semibold text-white/70 transition-colors hover:text-white md:flex"
        aria-label="Scroll to page content"
      >
        Discover more
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </a>
    </section>
  );
}
