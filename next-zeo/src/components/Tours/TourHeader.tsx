import React from 'react';
import { MapPin, Clock, Users, Calendar, CheckCircle } from 'lucide-react';
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
  const locationLabel = primaryDestination?.name
    ? `${primaryDestination.name}${secondaryDestinations.length > 0 ? ` + ${secondaryDestinations.length} more` : ''}`
    : destinations.map(destination => destination.name).join(', ');

  return (
    <section className="bg-white border border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-600">
              {locationLabel && (
                <span className="inline-flex items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {locationLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-2 border border-green-200 bg-green-50 px-3 py-1.5 text-green-700">
                <CheckCircle className="w-4 h-4" />
                Customizable trip
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark leading-tight">{title}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600">
              Review the key trip facts, full day-by-day itinerary, inclusions and practical travel notes before sending an enquiry.
            </p>
          </div>

          <div className="border border-primary/15 bg-primary/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-3">Quick trip summary</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div><div className="text-gray-500">Duration</div><div className="font-bold text-brand-dark">{formatDuration(duration)}</div></div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div><div className="text-gray-500">Group Size</div><div className="font-bold text-brand-dark">{groupSize}</div></div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div><div className="text-gray-500">Best Time</div><div className="font-bold text-brand-dark">{bestTime}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourHeader;
