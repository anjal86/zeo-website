"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { useDestinations, useActivities } from '../../hooks/useApi';

interface FilterOptions {
  search: string;
  destination: string;
  activity: string;
}

interface TourFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  totalTours: number;
  filteredCount: number;
}

const TourFilters: React.FC<TourFiltersProps> = ({
  onFiltersChange,
  totalTours,
  filteredCount
}) => {
  const { data: destinationsData } = useDestinations();
  const { data: activitiesData } = useActivities();

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    destination: '',
    activity: ''
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const destinations = [
    { value: '', label: 'All Destinations' },
    ...(destinationsData || []).map(dest => ({
      value: dest.name.toLowerCase(),
      label: dest.name
    }))
  ];

  const activities = [
    { value: '', label: 'All Activities' },
    ...(activitiesData || []).map(activity => ({
      value: activity.name.toLowerCase(),
      label: activity.name
    }))
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-none shadow-lg border border-gray-100 p-6 mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Tours</h3>
        </div>
        <span className="text-sm text-gray-600">
          {filteredCount} of {totalTours} tours
        </span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search tours..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          />
        </div>

        {/* Destination */}
        <select
          value={filters.destination}
          onChange={(e) => handleFilterChange('destination', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
        >
          {destinations.map((dest) => (
            <option key={dest.value} value={dest.value}>
              {dest.label}
            </option>
          ))}
        </select>

        {/* Activity */}
        <select
          value={filters.activity}
          onChange={(e) => handleFilterChange('activity', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
        >
          {activities.map((activity) => (
            <option key={activity.value} value={activity.value}>
              {activity.label}
            </option>
          ))}
        </select>
      </div>

    </motion.div>
  );
};

export default TourFilters;