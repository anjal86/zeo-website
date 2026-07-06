"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useDestinations, useActivities } from '../../hooks/useApi';
import type { SortOption } from './ToursListClient';

interface FilterOptions {
  search: string;
  destination: string;
  activity: string;
}

interface TourFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalTours: number;
  filteredCount: number;
}

// Custom Dropdown Component
const CustomDropdown = ({ 
  value, 
  options, 
  onChange, 
  placeholder,
  icon
}: { 
  value: string; 
  options: {value: string, label: string}[]; 
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center pl-4 pr-10 py-3.5 bg-transparent border-none focus:outline-none text-gray-700 font-medium text-sm text-left relative"
      >
        {icon && <span className="absolute left-4">{icon}</span>}
        <span className={`${icon ? 'ml-7 font-semibold text-gray-900' : ''} truncate block pr-2`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="absolute right-4 flex items-center text-gray-400 group-hover:text-gray-600 transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-60 overflow-y-auto"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                value === opt.value ? 'bg-primary/5 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const TourFilters: React.FC<TourFiltersProps> = ({
  onFiltersChange,
  sortBy,
  onSortChange,
  totalTours,
  filteredCount
}) => {
  const { data: destinationsData } = useDestinations();
  const { data: activitiesData } = useActivities();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'duration', label: 'Duration' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl p-2 mb-10 sticky top-[64px] z-40 transition-all duration-300 border ${
        isScrolled 
          ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-gray-100' 
          : 'bg-white shadow-sm border-gray-100'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center p-1">
        {/* Search */}
        <div className="relative flex-1 group hover:bg-gray-50/50 rounded-xl transition-colors">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search experiences..."
            className="w-full pl-11 pr-4 py-3.5 bg-transparent border-none rounded-xl focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400 font-medium text-sm transition-all"
          />
        </div>
        
        {/* Desktop Divider */}
        <div className="hidden lg:block w-px h-8 bg-gray-200/60 mx-1"></div>

        {/* Destination Dropdown */}
        <div className="relative lg:w-48 flex-shrink-0 group hover:bg-gray-50/50 rounded-xl transition-colors">
          <CustomDropdown 
            value={filters.destination}
            options={destinations}
            onChange={(val) => handleFilterChange('destination', val)}
            placeholder="All Destinations"
          />
        </div>

        {/* Desktop Divider */}
        <div className="hidden lg:block w-px h-8 bg-gray-200/60 mx-1"></div>

        {/* Activity Dropdown */}
        <div className="relative lg:w-48 flex-shrink-0 group hover:bg-gray-50/50 rounded-xl transition-colors">
          <CustomDropdown 
            value={filters.activity}
            options={activities}
            onChange={(val) => handleFilterChange('activity', val)}
            placeholder="All Activities"
          />
        </div>

        {/* Desktop Divider */}
        <div className="hidden lg:block w-px h-8 bg-gray-200/60 mx-1"></div>

        {/* Sort Dropdown */}
        <div className="relative lg:w-56 flex-shrink-0 flex items-center bg-gray-50/80 rounded-xl ml-1 border border-gray-100/50 hover:bg-gray-100 transition-colors">
          <CustomDropdown 
            value={sortBy}
            options={sortOptions}
            onChange={(val) => onSortChange(val as SortOption)}
            icon={<SlidersHorizontal className="w-4 h-4 text-primary" />}
          />
        </div>
      </div>
      
      {/* Results Count Line */}
      <div className="px-4 pb-1.5 pt-2 mt-1 border-t border-gray-100/60 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
        <span>Showing {filteredCount} {filteredCount === 1 ? 'experience' : 'experiences'}</span>
        {totalTours > filteredCount && (
          <span className="text-gray-400/80">Filtered from {totalTours} total</span>
        )}
      </div>
    </motion.div>
  );
};

export default TourFilters;