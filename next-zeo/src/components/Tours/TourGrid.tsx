"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List } from 'lucide-react';
import TourCard from './TourCard';
import EmptyState from '../UI/EmptyState';
import type { Tour } from '../../services/api';

interface TourGridProps {
  tours: Tour[];
  filters: {
    search: string;
    destination: string;
    activity: string;
  };
  onTourBook?: (tour: Tour) => void;
  onTourView?: (tour: Tour) => void;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
  destinations?: Array<{ id: number; name: string; country?: string }>;
}

type SortOption = 'price-low' | 'price-high' | 'rating' | 'duration' | 'popularity';
type ViewMode = 'grid' | 'list';

const TourGrid: React.FC<TourGridProps> = ({
  tours,
  filters,
  onTourBook,
  onTourView,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  totalCount = 0,
  destinations
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for automatic infinite scrolling
  useEffect(() => {
    if (!hasMore || loadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Start loading 100px before the element comes into view
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loadingMore, onLoadMore]);

  // Since filtering is now handled by the API, we use tours directly
  const filteredTours = tours;

  // Use tours as-is since API handles sorting and pagination
  // Sort tours: Featured first, then by existing order
  const sortedTours = [...filteredTours].sort((a, b) => {
    // If one is featured and the other isn't, featured comes first
    if ((a.featured || false) !== (b.featured || false)) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
    return 0; // Keep original order for same featured status
  });

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'duration', label: 'Duration' }
  ];

  const handleSortChange = (newSort: SortOption) => {
    setIsLoading(true);
    setSortBy(newSort);
    // Simulate loading delay for smooth transition
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-none shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {totalCount} tour{totalCount !== 1 ? 's' : ''} found
          </span>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-none p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-none transition-all ${viewMode === 'grid'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-none transition-all ${viewMode === 'list'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="bg-white border border-gray-300 rounded-none px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && sortedTours.length === 0 && (
        <EmptyState
          type="tours"
          title="No Tours Found"
          message="We couldn't find any tours matching your criteria. Try adjusting your filters or search terms, or contact us for custom tour options."
          actionText="Clear All Filters"
          onAction={() => window.location.reload()}
          className="py-12"
        />
      )}

      {/* Tours Grid/List */}
      {!isLoading && sortedTours.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${sortBy}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6'
                : 'space-y-6'
            }
          >
            {sortedTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TourCard
                  tour={tour}
                  variant={viewMode}
                  onBookNow={onTourBook}
                  onViewDetails={onTourView}
                  destinations={destinations}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {loadingMore ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading more tours...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              Scroll down to load more tours
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && sortedTours.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
          Showing {sortedTours.length} of {totalCount} tours
          {Object.values(filters).some(f => f !== '') && (
            <span> • Filters applied</span>
          )}
          {!hasMore && (
            <div className="mt-2 text-xs text-gray-400">
              All tours loaded
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TourGrid;