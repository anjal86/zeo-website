"use client";

import React, { useState, useMemo } from 'react';
import TourFilters from './TourFilters';
import TourGrid from './TourGrid';
import type { Tour } from '../../services/api';

interface ToursListClientProps {
  initialTours: Tour[];
}

export type SortOption = 'price-low' | 'price-high' | 'rating' | 'duration' | 'popularity';

export default function ToursListClient({ initialTours }: ToursListClientProps) {
  const [filters, setFilters] = useState({ search: '', destination: '', activity: '' });
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  const filteredTours = useMemo(() => {
    return initialTours.filter(tour => {
      // Search matches title or location
      const searchMatch = !filters.search || 
        (tour.title?.toLowerCase() || '').includes(filters.search.toLowerCase()) || 
        (tour.location?.toLowerCase() || '').includes(filters.search.toLowerCase());
      
      // Destination match
      const destMatch = !filters.destination || 
        (tour.location?.toLowerCase() || '').includes(filters.destination.toLowerCase());
      
      // Activity match
      const activityMatch = !filters.activity || 
        (tour.category?.toLowerCase() || '') === filters.activity.toLowerCase();
      
      return searchMatch && destMatch && activityMatch;
    });
  }, [initialTours, filters]);

  // Sort logic moved here from TourGrid so it applies to the filtered list centrally
  const sortedTours = useMemo(() => {
    let sorted = [...filteredTours];
    
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'duration':
        // Extremely simple duration sort (assuming format like "X days")
        const getDays = (d?: string) => parseInt((d || '0').match(/\d+/)?.[0] || '0');
        sorted.sort((a, b) => getDays(a.duration) - getDays(b.duration));
        break;
      case 'popularity':
      default:
        // Default sort by featured first, then original order
        sorted.sort((a, b) => {
          if ((a.featured || false) !== (b.featured || false)) {
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
          }
          return 0;
        });
        break;
    }
    return sorted;
  }, [filteredTours, sortBy]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 pt-12">
      <div className="container-xl">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
            Curated Experiences
          </h2>
          <p className="text-lg text-gray-600">
            Discover our handpicked selection of premium tours. Whether you seek spiritual awakening or high-altitude adventure, find your perfect route below.
          </p>
        </div>

        <TourFilters 
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalTours={initialTours.length} 
          filteredCount={sortedTours.length} 
        />
        <TourGrid 
          tours={sortedTours} 
          filters={filters} 
        />
      </div>
    </div>
  );
}
