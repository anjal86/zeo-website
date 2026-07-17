"use client";

import React, { useMemo, useState } from 'react';
import TourFilters, { type FilterOptions } from './TourFilters';
import TourGrid from './TourGrid';
import type { Tour } from '../../services/api';

interface ToursListClientProps {
  initialTours: Tour[];
}

export type SortOption = 'price-low' | 'price-high' | 'rating' | 'duration' | 'popularity';

const EMPTY_FILTERS: FilterOptions = {
  search: '',
  destination: '',
  activity: '',
};

export default function ToursListClient({ initialTours }: ToursListClientProps) {
  const [filters, setFilters] = useState<FilterOptions>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  const filteredTours = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return initialTours.filter((tour) => {
      const searchMatch =
        !search ||
        (tour.title?.toLowerCase() || '').includes(search) ||
        (tour.location?.toLowerCase() || '').includes(search) ||
        (tour.category?.toLowerCase() || '').includes(search);

      const destinationMatch =
        !filters.destination ||
        (tour.location?.toLowerCase() || '').includes(filters.destination.toLowerCase()) ||
        (tour.country?.toLowerCase() || '').includes(filters.destination.toLowerCase());

      const activityMatch =
        !filters.activity ||
        (tour.category?.toLowerCase() || '').includes(filters.activity.toLowerCase());

      return searchMatch && destinationMatch && activityMatch;
    });
  }, [initialTours, filters]);

  const sortedTours = useMemo(() => {
    const sorted = [...filteredTours];

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
      case 'duration': {
        const getDays = (duration?: string) => Number.parseInt((duration || '0').match(/\d+/)?.[0] || '0', 10);
        sorted.sort((a, b) => getDays(a.duration) - getDays(b.duration));
        break;
      }
      case 'popularity':
      default:
        sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    }

    return sorted;
  }, [filteredTours, sortBy]);

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSortBy('popularity');
  };

  return (
    <section className="ui-section min-h-screen bg-slate-50" aria-labelledby="tour-discovery-heading">
      <div className="container-xl">
        <header className="mb-10 max-w-3xl">
          <p className="ui-eyebrow mb-3 text-primary">Find your journey</p>
          <h2 id="tour-discovery-heading" className="ui-heading text-4xl md:text-5xl">
            Compare routes without the clutter.
          </h2>
          <p className="ui-body mt-5 max-w-2xl text-base md:text-lg">
            Filter by destination or travel style, then compare the details that matter: duration, difficulty, group size and price.
          </p>
        </header>

        <TourFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalTours={initialTours.length}
          filteredCount={sortedTours.length}
        />

        <TourGrid
          tours={sortedTours}
          filters={filters}
          onClearFilters={clearFilters}
        />
      </div>
    </section>
  );
}
