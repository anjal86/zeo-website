"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';


interface TourImageSliderProps {
  images: string[];
  title: string;
}

const TourImageSlider: React.FC<TourImageSliderProps> = ({ images, title }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
        <div className="relative h-[250px] md:h-[350px] bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
      <div className="relative h-[400px] bg-gray-100 flex items-center justify-center">
        {/* Simple image display without complex animations */}
        <img
          src={images[currentImageIndex]?.startsWith('http')
            ? images[currentImageIndex]
            : (images[currentImageIndex]?.startsWith('/') ? images[currentImageIndex] : `/${images[currentImageIndex]}`)}
          alt={`${title} - View ${currentImageIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400';
          }}
        />

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
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