import React from 'react';
import { MapPin, Clock, Users, Calendar } from 'lucide-react';
import { formatDuration } from '../../utils/formatDuration';

interface TourHeaderProps {
  title: string;
  duration: string;
  groupSize: string;
  bestTime: string;

  destinations: Array<{ id: number; name: string }>;
  primaryDestination?: { name: string };
  secondaryDestinations: Array<{ name: string }>;
}

const TourHeader: React.FC<TourHeaderProps> = ({
  title,
  duration,
  groupSize,
  bestTime,
  destinations,
  primaryDestination,
  secondaryDestinations
}) => {
  return (
    <section className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-8">
        {/* Activity Badges */}


        {/* Tour Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">{title}</h1>

        {/* Location and Activity Info */}
        <div className="flex flex-wrap items-center gap-6 mb-6">
          {/* Destinations */}
          {destinations.length > 0 && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              <span>
                {primaryDestination?.name}
                {secondaryDestinations.length > 0 && (
                  <span className="text-gray-500"> + {secondaryDestinations.length} more</span>
                )}
              </span>
            </div>
          )}

        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-primary/5 p-4 rounded-2xl text-center shadow-sm">
            <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Duration</div>
            <div className="font-semibold text-brand-dark">{formatDuration(duration)}</div>
          </div>
          <div className="bg-primary/5 p-4 rounded-2xl text-center shadow-sm">
            <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Group Size</div>
            <div className="font-semibold text-brand-dark">{groupSize}</div>
          </div>
          <div className="bg-primary/5 p-4 rounded-2xl text-center shadow-sm">
            <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Best Time</div>
            <div className="font-semibold text-brand-dark">{bestTime}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourHeader;