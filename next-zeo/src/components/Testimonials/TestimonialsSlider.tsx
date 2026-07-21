"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Quote, Star } from "lucide-react";

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

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={`h-4 w-4 ${index < rating ? "fill-current text-amber-400" : "text-slate-300"}`}
        />
      ))}
    </span>
  );
}

export default function TestimonialsSlider({ testimonials }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!testimonials || testimonials.length <= 1 || !isAutoPlaying) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % testimonials.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [testimonials, isAutoPlaying]);

  if (!testimonials || testimonials.length === 0) return null;

  const averageRating = testimonials.reduce(
    (sum, testimonial) => sum + Number(testimonial.rating || 0),
    0,
  ) / testimonials.length;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    goToSlide(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    goToSlide((currentIndex + 1) % testimonials.length);
  };

  return (
    <section className="border-t border-slate-100 bg-white py-16 md:py-24">
      <div className="container-xl">
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Traveler stories</p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[1.02] tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
              What good planning feels like after the journey.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-600 lg:justify-self-end">
            Real feedback about guides, route timing, accommodation, permits and support on the ground.
          </p>
        </div>

        <div className="mt-12 grid overflow-hidden border border-slate-200 lg:grid-cols-[0.32fr_0.68fr]">
          <aside className="flex flex-col justify-between bg-slate-950 p-7 text-white md:p-9" aria-label="Traveler review summary">
            <div>
              <Quote className="h-10 w-10 text-primary" aria-hidden="true" />
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-white/45">Verified travel stories</p>
              <p className="mt-3 font-serif text-3xl font-bold leading-tight">
                The details matter when the journey is important.
              </p>
            </div>

            <div className="mt-10 border-t border-white/15 pt-6">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold leading-none">{averageRating.toFixed(1)}</span>
                <span className="pb-1 text-sm text-white/50">out of 5</span>
              </div>
              <div className="mt-3"><Stars rating={Math.round(averageRating)} /></div>
              <p className="mt-4 text-sm text-white/50">Based on {testimonials.length} published traveler {testimonials.length === 1 ? "story" : "stories"}.</p>
            </div>
          </aside>

          <div className="min-w-0 bg-slate-50">
            <div className="overflow-hidden" aria-live="polite">
              <div
                className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <article key={testimonial.id} className="w-full flex-shrink-0 p-7 md:p-10 lg:p-12">
                    <div className="flex items-start justify-between gap-5">
                      <Stars rating={testimonial.rating} />
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                        {String(testimonials.indexOf(testimonial) + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <blockquote className="mt-8 max-w-4xl font-serif text-2xl leading-relaxed text-slate-900 md:text-3xl lg:text-[2.15rem]">
                      “{testimonial.message}”
                    </blockquote>

                    <div className="mt-10 flex flex-col gap-5 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        {testimonial.image ? (
                          <img
                            src={testimonial.image}
                            alt=""
                            loading="lazy"
                            className="h-12 w-12 rounded-full border border-slate-200 bg-slate-100 object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-500" aria-hidden="true">
                            {testimonial.name?.slice(0, 1) || "T"}
                          </span>
                        )}
                        <div>
                          <cite className="not-italic font-bold text-slate-950">{testimonial.name}</cite>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                            {testimonial.country}
                          </p>
                        </div>
                      </div>

                      {testimonial.tour ? (
                        <p className="border-l-2 border-secondary pl-4 text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                          {testimonial.tour}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {testimonials.length > 1 ? (
              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4 md:px-10">
                <div className="flex items-center gap-2" aria-label="Choose a testimonial">
                  {testimonials.map((testimonial, index) => (
                    <button
                      key={testimonial.id}
                      type="button"
                      onClick={() => goToSlide(index)}
                      className={`h-1.5 transition-all ${index === currentIndex ? "w-9 bg-primary" : "w-3 bg-slate-300 hover:bg-slate-400"}`}
                      aria-label={`Show testimonial ${index + 1}`}
                      aria-current={index === currentIndex ? "true" : undefined}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary hover:text-primary"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary hover:text-primary"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
