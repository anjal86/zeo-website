"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  onClearFilters?: () => void;
  onTourBook?: (tour: Tour) => void;
  onTourView?: (tour: Tour) => void;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  destinations?: Array<{ id: number; name: string; country?: string }>;
}

export default function TourGrid({
  tours,
  onClearFilters,
  onTourBook,
  onTourView,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  destinations,
}: TourGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { threshold: 0.1, rootMargin: '160px' },
    );

    const element = loadMoreRef.current;
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  if (tours.length === 0) {
    return (
      <EmptyState
        type="tours"
        title="No matching journeys"
        message="Try a broader destination, remove a travel-style filter, or clear everything to see all available routes."
        actionText="View all journeys"
        onAction={onClearFilters || (() => window.location.assign('/tours'))}
        className="ui-surface py-16"
      />
    );
  }

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {tours.map((tour) => (
          <TourCard
            key={tour.id}
            tour={tour}
            variant="grid"
            onBookNow={onTourBook}
            onViewDetails={onTourView}
            destinations={destinations}
          />
        ))}
      </motion.div>

      {hasMore && (
        <div ref={loadMoreRef} className="flex min-h-24 items-center justify-center" aria-live="polite">
          {loadingMore ? (
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              Loading more journeys
            </div>
          ) : (
            <span className="text-sm text-slate-500">More journeys load as you continue.</span>
          )}
        </div>
      )}
    </div>
  );
}
