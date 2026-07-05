"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

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

  // Auto-play functionality
  useEffect(() => {
    if (!testimonials || testimonials.length <= 1 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
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
        className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!testimonials || testimonials.length === 0) {
    return null; // Don't render section if no testimonials
  }

  // If only one testimonial, show it without slider controls
  if (testimonials.length === 1) {
    const testimonial = testimonials[0];
    return (
      <section className="py-20 md:py-32 bg-white relative overflow-hidden border-t border-gray-100">
        <div className="container-xl relative z-10">
          <div className="mb-16">
            <span className="text-secondary text-sm font-bold uppercase tracking-[0.2em] mb-4 block text-center">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 max-w-3xl mx-auto text-center leading-tight">
              What Our Travelers Say
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="border border-gray-100 bg-gray-50/50 p-10 md:p-14 text-center">
              <Quote className="w-12 h-12 text-gray-200 mx-auto mb-8" />

              <div className="flex justify-center mb-6">
                {renderStars(testimonial.rating)}
              </div>

              <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto italic font-light">
                "{testimonial.message}"
              </p>

              <div className="h-px w-16 bg-gray-200 mx-auto mb-8" />

              <div className="flex items-center justify-center gap-4">
                {testimonial.image && (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    loading="lazy"
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                  />
                )}
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-base">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.country}</p>
                  <p className="text-xs text-secondary font-medium mt-0.5">{testimonial.tour}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Multiple testimonials - show slider
  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden border-t border-gray-100">
      <div className="container-xl relative z-10">
        <div className="mb-16">
          <span className="text-secondary text-sm font-bold uppercase tracking-[0.2em] mb-4 block text-center">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 max-w-3xl mx-auto text-center leading-tight">
            What Our Travelers Say
          </h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Slider Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="border border-gray-100 bg-gray-50/50 p-10 md:p-14 mx-auto max-w-3xl text-center">
                    <Quote className="w-12 h-12 text-gray-200 mx-auto mb-8" />

                    <div className="flex justify-center mb-6">
                      {renderStars(testimonial.rating)}
                    </div>

                    <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto italic font-light">
                      "{testimonial.message}"
                    </p>

                    <div className="h-px w-16 bg-gray-200 mx-auto mb-8" />

                    <div className="flex items-center justify-center gap-4">
                      {testimonial.image && (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                        />
                      )}
                      <div className="text-left">
                        <h4 className="font-bold text-gray-900 text-base">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.country}</p>
                        <p className="text-xs text-secondary font-medium mt-0.5">{testimonial.tour}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white p-3 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white p-3 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
              </button>
            </>
          )}

          {/* Dots Navigation */}
          {testimonials.length > 1 && (
            <div className="flex justify-center space-x-2 mt-10">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 transition-all duration-300 ${index === currentIndex
                    ? 'bg-primary w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;