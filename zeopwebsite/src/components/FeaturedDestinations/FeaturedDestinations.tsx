import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mountain, ArrowRight, MapPin } from 'lucide-react';
import { useDestinations, useTourList } from '../../hooks/useApi';
import LoadingSpinner from '../UI/LoadingSpinner';

const FeaturedDestinations: React.FC = () => {
  const { data: allDestinations, loading, error, refetch } = useDestinations();
  const { data: allTours } = useTourList();
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());

  // Calculate tour count for each destination based on relationship system
  const getDestinationTourCount = (destinationId: number, destinationName: string) => {
    if (!allTours) return 0;

    // Count tours using relationship-based matching
    const relationshipTours = allTours.filter(tour => {
      if (tour.listed === false) return false; // Only count listed tours

      // Check if this destination is the primary destination for the tour
      const isPrimaryDestination = (tour as any).primary_destination_id === destinationId;

      // Check if this destination is in the secondary destinations for the tour
      const isSecondaryDestination = (tour as any).secondary_destination_ids?.includes(destinationId);

      return isPrimaryDestination || isSecondaryDestination;
    });

    // Fallback to location-based matching for legacy support
    const locationTours = allTours.filter(tour => {
      if (!tour.location || tour.listed === false) return false;

      const tourLocation = tour.location.toLowerCase();
      const destName = destinationName.toLowerCase();

      // Match by various location patterns
      return tourLocation.includes(destName) ||
        (destName === 'annapurna' && (tourLocation.includes('annapurna') || tourLocation.includes('abc'))) ||
        (destName === 'everest' && (tourLocation.includes('everest') || tourLocation.includes('ebc'))) ||
        (destName === 'langtang' && tourLocation.includes('langtang')) ||
        (destName === 'manaslu' && tourLocation.includes('manaslu')) ||
        (destName === 'kailash' && (tourLocation.includes('kailash') || tourLocation.includes('mansarovar'))) ||
        (destName === 'tibet' && (tourLocation.includes('tibet') || tourLocation.includes('lhasa'))) ||
        (destName === 'kathmandu' && tourLocation.includes('kathmandu')) ||
        (destName === 'pokhara' && tourLocation.includes('pokhara')) ||
        (destName === 'chitwan' && tourLocation.includes('chitwan')) ||
        (destName === 'lumbini' && tourLocation.includes('lumbini')) ||
        (destName === 'mustang' && tourLocation.includes('mustang')) ||
        (destName === 'dolpo' && tourLocation.includes('dolpo'));
    });

    // Combine and deduplicate tours
    const allRelatedTours = [...relationshipTours];
    locationTours.forEach(locationTour => {
      if (!allRelatedTours.find(tour => tour.id === locationTour.id)) {
        allRelatedTours.push(locationTour);
      }
    });

    return allRelatedTours.length;
  };

  // Filter destinations to only show those with tours and take first 6
  const featuredDestinations = allDestinations?.map(destination => ({
    ...destination,
    tourCount: getDestinationTourCount(destination.id, destination.name)
  })).filter(destination => destination.tourCount > 0).slice(0, 6) || [];

  // Listen for destination updates from admin interface
  useEffect(() => {
    const handleDestinationUpdate = () => {
      setImageRefreshKey(Date.now());
      refetch();
    };

    window.addEventListener('destinationUpdated', handleDestinationUpdate as EventListener);

    return () => {
      window.removeEventListener('destinationUpdated', handleDestinationUpdate as EventListener);
    };
  }, [refetch]);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="text-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="text-center">
            <p className="text-red-600">Failed to load destinations.</p>
          </div>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50 border-t border-gray-100">
      <div className="container-xl">
        {/* Minimal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16"
        >
          <span className="text-secondary text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
            Explore
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900">
            Popular Destinations
          </h2>
        </motion.div>

        {/* Minimal Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {featuredDestinations.map((destination) => (
            <motion.div
              key={destination.id}
              variants={itemVariants}
              className="group"
            >
              <Link to={destination.href || `/destinations/${destination.name.toLowerCase()}`} className="block">
                <div className="relative overflow-hidden aspect-[4/3] border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl">
                  <img
                    key={`${destination.id}-${imageRefreshKey}`}
                    src={`${destination.image}?t=${imageRefreshKey}`}
                    alt={`${destination.name} - ${destination.country} travel destination`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                    <div className="flex items-center mb-2 opacity-80">
                      <MapPin className="w-3 h-3 mr-1.5" />
                      <span className="text-xs uppercase tracking-wider font-medium">{destination.country}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold leading-tight">
                      {destination.name}
                    </h3>
                    <div className="flex items-center mt-2 opacity-70">
                      <Mountain className="w-3 h-3 mr-1.5" />
                      <span className="text-xs">
                        {destination.tourCount} {destination.tourCount === 1 ? 'Tour' : 'Tours'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        {featuredDestinations.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <Link
              to="/destinations"
              className="inline-flex items-center border border-gray-300 text-gray-950 px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-colors duration-300"
            >
              View All Destinations
              <ArrowRight className="w-4 h-4 ml-3" />
            </Link>
          </div>
        )}

        {featuredDestinations.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No destinations with tours available at the moment.
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedDestinations;
