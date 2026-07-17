"use client";

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useActivities, useDestinations } from '../../hooks/useApi';
import type { SortOption } from './ToursListClient';

export interface FilterOptions {
  search: string;
  destination: string;
  activity: string;
}

interface TourFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalTours: number;
  filteredCount: number;
}

export default function TourFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  sortBy,
  onSortChange,
  totalTours,
  filteredCount,
}: TourFiltersProps) {
  const { data: destinationsData } = useDestinations();
  const { data: activitiesData } = useActivities();

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFilters = [
    filters.search && { key: 'search' as const, label: `Search: ${filters.search}` },
    filters.destination && { key: 'destination' as const, label: filters.destination },
    filters.activity && { key: 'activity' as const, label: filters.activity },
  ].filter(Boolean) as Array<{ key: keyof FilterOptions; label: string }>;

  return (
    <div className="ui-surface sticky top-[72px] z-30 mb-10 p-4 md:p-5" aria-label="Tour filters">
      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1.6fr)_1fr_1fr_1fr]">
        <label className="relative block">
          <span className="sr-only">Search tours</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Search tour, place or travel style"
            className="ui-control w-full pl-11 pr-4 text-sm"
          />
        </label>

        <label>
          <span className="sr-only">Filter by destination</span>
          <select
            value={filters.destination}
            onChange={(event) => updateFilter('destination', event.target.value)}
            className="ui-control w-full px-4 text-sm"
          >
            <option value="">All destinations</option>
            {(destinationsData || []).map((destination) => (
              <option key={destination.id} value={destination.name.toLowerCase()}>
                {destination.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Filter by travel style</span>
          <select
            value={filters.activity}
            onChange={(event) => updateFilter('activity', event.target.value)}
            className="ui-control w-full px-4 text-sm"
          >
            <option value="">All travel styles</option>
            {(activitiesData || []).map((activity) => (
              <option key={activity.id} value={activity.name.toLowerCase()}>
                {activity.name}
              </option>
            ))}
          </select>
        </label>

        <label className="relative">
          <span className="sr-only">Sort tours</span>
          <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="ui-control w-full pl-11 pr-4 text-sm font-semibold"
          >
            <option value="popularity">Most popular</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Highest rated</option>
            <option value="duration">Shortest duration</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-secondary text-sm font-semibold text-slate-600" aria-live="polite">
          {filteredCount} {filteredCount === 1 ? 'journey' : 'journeys'}
          {filteredCount !== totalTours ? ` from ${totalTours}` : ''}
        </p>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => updateFilter(filter.key, '')}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 text-xs font-bold text-primary"
                aria-label={`Remove ${filter.label} filter`}
              >
                <span className="max-w-40 truncate capitalize">{filter.label}</span>
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button type="button" onClick={onClearFilters} className="ui-button-quiet min-h-9 px-3 py-1.5">
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
