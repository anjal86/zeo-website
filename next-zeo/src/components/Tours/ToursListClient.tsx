"use client";

import React, { useState, useMemo } from 'react';
import TourFilters from './TourFilters';
import TourGrid from './TourGrid';
import type { Tour } from '../../services/api';

interface ToursListClientProps {
  initialTours: Tour[];
}

export default function ToursListClient({ initialTours }: ToursListClientProps) {
  const [filters, setFilters] = useState({ search: '', destination: '', activity: '' });

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

  return (
    <div className="container-xl pb-20">
      <TourFilters 
        onFiltersChange={setFilters} 
        totalTours={initialTours.length} 
        filteredCount={filteredTours.length} 
      />
      <TourGrid 
        tours={filteredTours} 
        filters={filters} 
      />
    </div>
  );
}
