"use client";

import React, { useState } from 'react';
import { Check, Info, FileText, Bed, Utensils, X, ChevronDown, ChevronUp } from 'lucide-react';

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

const TourTabs: React.FC<TourTabsProps> = ({
  description,
  highlights,
  inclusions,
  exclusions,
  itinerary,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  const toggleDay = (dayNumber: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayNumber)) {
      newExpanded.delete(dayNumber);
    } else {
      newExpanded.add(dayNumber);
    }
    setExpandedDays(newExpanded);
  };

  const expandAll = () => {
    const allDays = itinerary ? new Set(itinerary.map(day => day.day)) : new Set([1, 2, 3]);
    setExpandedDays(allDays);
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  // Scroll spy to update active tab
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'itinerary', 'inclusions'];
      const offset = 130; // Offset for nav (64px) + tab bar

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the top of the section is within the viewport (or close to top)
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

  // Scroll to section handler
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Offset for sticky header/nav if needed (approx 100px)
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
    { id: 'inclusions', label: 'Inclusions & Exclusions', icon: Check }
  ];


  return (
    <div className="space-y-8">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-[64px] z-40 bg-white border-b border-gray-200 shadow-sm -mx-6 sm:-mx-8 px-6 sm:px-8">
        <div className="p-1.5">
          <div className="grid grid-cols-3 gap-1 bg-gray-100/50 p-1 rounded-2xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 rounded-2xl text-center transition-all duration-300 ${isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02] font-semibold'
                    : 'text-gray-500 hover:text-brand-dark hover:bg-white/60 font-medium'
                    }`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-current'}`} />
                  <span className="text-xs sm:text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-soft p-6 sm:p-8 space-y-12">
        {/* Overview Section */}
        <section id="overview" className="scroll-mt-28 space-y-8">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
              <Info className="w-6 h-6 text-primary" />
              Overview
            </h3>
          </div>

          <div className="space-y-6">
            {/* About the Tour */}
            <div>
              <h4 className="text-lg font-bold text-brand-dark mb-3">About This Tour</h4>
              <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-brand-dark mb-3">Tour Highlights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start p-3 bg-slate-50 rounded-2xl">
                      <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* Itinerary Section */}
        <section id="itinerary" className="scroll-mt-28 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Itinerary
            </h3>

            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-xs sm:text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors font-medium"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-xs sm:text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors font-medium"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Timeline Container */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-3.5 sm:left-6 top-8 bottom-8 w-0.5 bg-gray-200 rounded-full"></div>

            <div className="space-y-2">
              {itinerary && itinerary.length > 0 ? (
                itinerary.map((day, index) => (
                  <div key={index} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute left-3.5 sm:left-6 w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 sm:border-4 border-primary rounded-full z-10 transform -translate-x-1/2 mt-5 sm:mt-5 ring-4 ring-gray-50/50"></div>

                    {/* Accordion Card */}
                    <div className="ml-8 sm:ml-12 bg-white rounded-2xl shadow-sm border border-slate-100 shadow-sm hover:border-primary/30 transition-all duration-300 overflow-hidden">
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleDay(day.day)}
                        className="w-full p-2 sm:p-3 flex items-start sm:items-center justify-between text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">

                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-brand-dark mb-0.5 sm:mb-1 leading-tight">{day.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-500">Day {day.day}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2 sm:ml-4 mt-1 sm:mt-0">
                          {expandedDays.has(day.day) ? (
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {expandedDays.has(day.day) && (
                        <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-gray-100 bg-slate-50/50">
                          <div className="pt-2 sm:pt-3">
                            <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{day.description}</p>

                            {/* Day Details Grid */}
                            {(day.accommodation || day.meals) && (
                              <div className="flex flex-wrap gap-3">
                                {day.accommodation && (
                                  <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-700 shadow-sm">
                                    <Bed className="w-4 h-4 text-blue-500" />
                                    <span>{day.accommodation}</span>
                                  </div>
                                )}
                                {day.meals && (
                                  <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-700 shadow-sm">
                                    <Utensils className="w-4 h-4 text-orange-500" />
                                    <span>{day.meals}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center italic py-8">No itinerary available for this tour.</p>
              )}
            </div>
          </div>
        </section>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* Inclusions Section */}
        <section id="inclusions" className="scroll-mt-28 space-y-8">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
              <Check className="w-6 h-6 text-primary" />
              Inclusions & Exclusions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inclusions */}
            {inclusions && inclusions.length > 0 && (
              <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                <h4 className="text-lg font-bold text-brand-dark mb-4 flex items-center text-green-700">
                  <span className="bg-green-100 p-1.5 rounded-full mr-2">
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

            {/* Exclusions */}
            {exclusions && exclusions.length > 0 && (
              <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                <h4 className="text-lg font-bold text-brand-dark mb-4 flex items-center text-red-700">
                  <span className="bg-red-100 p-1.5 rounded-full mr-2">
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