"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TourImageSliderProps {
  images: string[];
  title: string;
}

const resolveImage = (image?: string) => {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  return image.startsWith('/') ? image : `/${image}`;
};

const TourImageSlider: React.FC<TourImageSliderProps> = ({ images, title }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="border border-gray-200 bg-gray-100">
        <div className="flex h-[260px] items-center justify-center sm:h-[360px] md:h-[520px]">
          <span className="text-gray-500">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 bg-white">
      <div className="relative h-[260px] overflow-hidden bg-slate-100 sm:h-[360px] md:h-[520px]">
        <img
          src={resolveImage(images[currentImageIndex])}
          alt={`${title} - View ${currentImageIndex + 1}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-gray-900 shadow-lg transition-colors hover:bg-white sm:left-4 sm:h-11 sm:w-11"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-gray-900 shadow-lg transition-colors hover:bg-white sm:right-4 sm:h-11 sm:w-11"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2.5 transition-all ${index === currentImageIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/60 hover:bg-white'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TourImageSlider;
