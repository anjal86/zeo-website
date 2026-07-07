"use client";

import React, { useState } from 'react';
import { Check, Info, FileText, Bed, Utensils, X } from 'lucide-react';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string;
}

interface TourTabsProps {
  description: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: ItineraryDay[];
  title: string;
  goodToKnow?: {
    main_attractions: string;
    travel_distances: string;
    accommodation_standards: string;
    additional_activities: string;
  };
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

const cleanRouteTitle = (title: string) => title
  .replace(/^day\s*\d+\s*[:.)-]?\s*/i, '')
  .split(/[–—|]/)[0]
  .trim();

const TourTabs: React.FC<TourTabsProps> = ({
  description,
  highlights,
  inclusions,
  exclusions,
  itinerary,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const itineraryDays = itinerary?.length || 0;
  const routeStops = (itinerary || [])
    .map(day => cleanRouteTitle(day.title))
    .filter(Boolean)
    .filter((item, index, array) => index === 0 || item !== array[index - 1])
    .slice(0, 8);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'itinerary', 'inclusions'];
      const offset = 130;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= offset && rect.bottom >= offset) {
            setActiveTab(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 130;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveTab(sectionId);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'itinerary', label: 'Itinerary', icon: FileText },
    { id: 'inclusions', label: 'Inclusions', icon: Check }
  ];

  return (
    <div className="space-y-8">
      <div className="sticky top-[64px] z-40 bg-white border border-gray-200">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 px-1 sm:px-2 py-4 text-center text-[11px] sm:text-sm font-bold transition-colors min-w-0 ${isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-brand-dark'
                  }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 sm:p-8 space-y-12">
        <section id="overview" className="scroll-mt-28 space-y-8">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
              <Info className="w-6 h-6 text-primary" />
              Overview
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-brand-dark mb-3">About This Tour</h4>
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{description}</p>
            </div>

            {highlights && highlights.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-brand-dark mb-3">Tour Highlights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start border border-slate-200 bg-slate-50 p-3">
                      <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <hr className="border-gray-100" />

        <section id="itinerary" className="scroll-mt-28 space-y-8">
          <div className="border-b border-gray-100 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Itinerary
                </h3>
                <p className="mt-2 text-sm text-gray-500">All day details are shown by default for easier reading.</p>
              </div>
              {itineraryDays > 0 && (
                <div className="border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
                  {itineraryDays} {itineraryDays === 1 ? 'day' : 'days'} at a glance
                </div>
              )}
            </div>
          </div>

          {routeStops.length > 2 && (
            <div className="border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">Route overview</p>
              <div className="flex gap-2 overflow-x-auto pb-1 text-sm font-semibold text-slate-700 max-w-full">
                {routeStops.map((stop, index) => (
                  <React.Fragment key={`${stop}-${index}`}>
                    <span className="flex-shrink-0 border border-slate-200 bg-white px-3 py-2">{stop}</span>
                    {index < routeStops.length - 1 && <span className="flex-shrink-0 py-2 text-slate-400">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute left-3.5 sm:left-6 top-8 bottom-8 w-0.5 bg-gray-200 rounded-full"></div>

            <div className="space-y-4">
              {itinerary && itinerary.length > 0 ? (
                itinerary.map((day, index) => (
                  <div key={index} className="relative">
                    <div className="absolute left-3.5 sm:left-6 w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 sm:border-4 border-primary rounded-full z-10 transform -translate-x-1/2 mt-5 sm:mt-5 ring-4 ring-gray-50/50"></div>

                    <div className="ml-8 sm:ml-12 bg-white border border-slate-200 hover:border-primary/40 transition-colors overflow-hidden">
                      <div className="w-full p-3 sm:p-4 flex items-start justify-between gap-3 sm:gap-4 text-left bg-white">
                        <div className="min-w-0">
                          <h4 className="text-base sm:text-lg font-bold text-brand-dark mb-0.5 sm:mb-1 leading-tight">{day.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-500">Day {day.day} of {itineraryDays}</p>
                        </div>
                        <span className="flex-shrink-0 bg-primary text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
                          Day {day.day}
                        </span>
                      </div>

                      <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-gray-100 bg-slate-50/50">
                        <div className="pt-2 sm:pt-3">
                          <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap break-words">{day.description}</p>

                          {(day.accommodation || day.meals) && (
                            <div className="flex flex-wrap gap-3">
                              {day.accommodation && (
                                <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 text-sm text-gray-700">
                                  <Bed className="w-4 h-4 text-blue-500" />
                                  <span>{day.accommodation}</span>
                                </div>
                              )}
                              {day.meals && (
                                <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 text-sm text-gray-700">
                                  <Utensils className="w-4 h-4 text-orange-500" />
                                  <span>{day.meals}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center italic py-8">No itinerary available for this tour.</p>
              )}
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        <section id="inclusions" className="scroll-mt-28 space-y-8">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
              <Check className="w-6 h-6 text-primary" />
              Inclusions & Exclusions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {inclusions && inclusions.length > 0 && (
              <div className="bg-green-50/50 p-6 border border-green-100">
                <h4 className="text-lg font-bold text-brand-dark mb-4 flex items-center text-green-700">
                  <span className="bg-green-100 p-1.5 mr-2">
                    <Check className="w-4 h-4 text-green-600" />
                  </span>
                  What's Included
                </h4>
                <ul className="space-y-3">
                  {inclusions.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {exclusions && exclusions.length > 0 && (
              <div className="bg-red-50/50 p-6 border border-red-100">
                <h4 className="text-lg font-bold text-brand-dark mb-4 flex items-center text-red-700">
                  <span className="bg-red-100 p-1.5 mr-2">
                    <X className="w-4 h-4 text-red-600" />
                  </span>
                  What's Not Included
                </h4>
                <ul className="space-y-3">
                  {exclusions.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <X className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0 opacity-70" />
                      <span className="text-gray-600 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TourTabs;
export type { ItineraryDay };
