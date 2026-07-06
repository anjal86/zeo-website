"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  destinations?: Array<{ id: number; name: string; country?: string }>;
}

const TourGrid: React.FC<TourGridProps> = ({
  tours,
  onTourBook,
  onTourView,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  destinations
}) => {
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

  if (tours.length === 0) {
    return (
      <EmptyState
        type="tours"
        title="No Experiences Found"
        message="We couldn't find any tours matching your criteria. Try adjusting your filters or search terms, or contact us for custom tour options."
        actionText="Clear All Filters"
        onAction={() => window.location.reload()}
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-12">
      <AnimatePresence mode="wait">
        <motion.div
          key="tours-layout"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Tours Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
              >
                <TourCard
                  tour={tour}
                  variant="grid"
                  onBookNow={onTourBook}
                  onViewDetails={onTourView}
                  destinations={destinations}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {loadingMore ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-gray-500 font-medium text-sm">Discovering more...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              Scroll down to view more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TourGrid;