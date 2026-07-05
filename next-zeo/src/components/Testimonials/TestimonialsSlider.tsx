"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, MapPin } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  country: string;
  tour: string;
  rating: number;
  message: string;
  image?: string;
}

interface Props {
  testimonials: Testimonial[];
}

const TestimonialsSlider: React.FC<Props> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!testimonials || testimonials.length <= 1 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    if (!testimonials) return;
    const newIndex = currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    if (!testimonials) return;
    const newIndex = currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const averageRating = testimonials.length
    ? testimonials.reduce((sum, item) => sum + Number(item.rating || 0), 0) / testimonials.length
    : 5;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden border-t border-gray-100">
      <div className="container-xl relative z-10">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em] mb-3 block">
              Traveler stories
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-950 leading-[1.05] tracking-tight max-w-2xl">
              What travelers say after the journey.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:max-w-xl lg:justify-self-end">
            <div className="border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xl font-bold text-gray-950">{averageRating.toFixed(1)}</div>
              <div className="mt-1 flex gap-0.5">{renderStars(Math.round(averageRating))}</div>
            </div>
            <div className="border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xl font-bold text-gray-950">{testimonials.length}+</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">Reviewed trips</div>
            </div>
            <div className="border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xl font-bold text-gray-950">Local</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">Ground support</div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
          <div className="hidden lg:flex flex-col justify-between border border-gray-200 bg-white p-8 shadow-sm">
            <Quote className="w-12 h-12 text-primary/20" />
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-secondary font-bold mb-4">Real experience</p>
              <p className="text-2xl font-serif font-bold leading-tight text-gray-950">
                Good planning shows up in the small details travelers remember.
              </p>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Read how travelers experienced permits, guides, accommodation, timing and support during their trip.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden border border-gray-200 bg-white shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <article key={testimonial.id} className="w-full flex-shrink-0 p-6 md:p-10 lg:p-12">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-1">{renderStars(testimonial.rating)}</div>
                      <Quote className="w-10 h-10 text-gray-200" />
                    </div>

                    <p className="mt-8 text-xl md:text-2xl lg:text-3xl font-serif leading-relaxed text-gray-900 max-w-4xl">
                      “{testimonial.message}”
                    </p>

                    <div className="mt-10 flex flex-col gap-5 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        {testimonial.image ? (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            loading="lazy"
                            className="w-14 h-14 rounded-full object-cover border border-gray-200 bg-gray-100"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                            {testimonial.name?.slice(0, 1) || 'T'}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-950 text-base">{testimonial.name}</h4>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {testimonial.country}
                          </p>
                        </div>
                      </div>

                      {testimonial.tour && (
                        <div className="inline-flex max-w-full items-center border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-secondary">
                          {testimonial.tour}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {testimonials.length > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 md:px-10">
                <div className="flex items-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 transition-all duration-300 ${index === currentIndex
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevious}
                    className="h-10 w-10 border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="h-10 w-10 border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
