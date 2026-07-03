import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader/PageHeader';
import TourFilters from '../components/Tours/TourFilters';
import TourGrid from '../components/Tours/TourGrid';
import SkeletonCard from '../components/UI/SkeletonCard';
import ErrorMessage from '../components/UI/ErrorMessage';
import { usePaginatedTours, useDestinations } from '../hooks/useApi';
import SEO from '../components/SEO/SEO';
import { createBreadcrumbSchema } from '../utils/schema';
import type { Tour } from '../services/api';

const ToursPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    return {
      search: params.get('search') || '',
      destination: params.get('destination') || '',
      activity: params.get('activity') || '',
    };
  });

  // Use paginated API hook to fetch tours and destinations
  const { tours, loading, loadingMore, error, pagination, loadMore } = usePaginatedTours(filters);
  const { data: destinations } = useDestinations();

  const handleTourBook = (tour: Tour) => {
    // Navigate to tour detail page for booking
    navigate(`/tours/${tour.slug}`);
  };

  const handleTourView = (tour: Tour) => {
    // Navigate to tour detail page
    navigate(`/tours/${tour.slug}`);
  };

  const structuredData = [
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://www.zeotourism.com' },
      { name: 'Tours', url: 'https://www.zeotourism.com/tours' }
    ])
  ];

  return (
    <>
      <SEO
        title="Nepal Tour Packages & Experiences - Zeo Tourism"
        description="Browse our handcrafted Nepal tour packages. From classic Everest treks to spiritual Kailash journeys and cultural city tours."
        keywords="nepal tour packages, trek nepal, travel experiences, guided tours nepal"
        url="https://www.zeotourism.com/tours"
        structuredData={structuredData}
      />
      <div className="tours-page">
        <PageHeader
          title="Handcrafted Experiences"
          subtitle="Choose from our carefully curated collection of tours, each designed to create memories that last a lifetime"
          breadcrumb="Tours"
          backgroundImage="https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=2070"
        />

        {/* Floating Filter between sections */}
        <div className="relative -mt-16 mb-8 z-20">
          <div className="section-container">
            <TourFilters
              onFiltersChange={setFilters}
              totalTours={pagination.totalCount}
              filteredCount={tours.length}
            />
          </div>
        </div>

        <section className="pt-8 pb-12 bg-gray-50">
          <div className="section-container">
            {/* Loading State */}
            {loading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} type="tour" />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <ErrorMessage
                message={`Failed to load tours: ${error}`}
                className="py-20"
              />
            )}

            {/* Tours Grid */}
            {!loading && !error && (
              <TourGrid
                tours={tours}
                filters={filters}
                onTourBook={handleTourBook}
                onTourView={handleTourView}
                loadingMore={loadingMore}
                hasMore={pagination.hasNext}
                onLoadMore={loadMore}
                totalCount={pagination.totalCount}
                destinations={destinations || undefined}
              />
            )}
          </div>
        </section>

      </div>
    </>
  );
};

export default ToursPage;