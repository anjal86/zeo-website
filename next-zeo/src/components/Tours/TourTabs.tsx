"use client";

import React, { useState } from 'react';
import { Check, Info, FileText, Bed, Utensils, X, CalendarDays, Mountain, SlidersHorizontal, WalletCards, ShieldCheck } from 'lucide-react';

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
  price?: number;
  priceAvailable?: boolean;
  bestTime?: string | null;
  difficulty?: string | null;
  fitnessRequirements?: string | string[] | null;
  altitudeProfile?: {
    max_altitude?: string;
    acclimatization_days?: number;
    difficulty_level?: string;
  } | null;
  travellerDecision?: TravellerDecisionCopy;
  onEnquire?: () => void;
}

type TravellerDecisionCopy = {
  document_safety_items?: string[];
  price_factors?: string[];
  date_options?: string[];
  customization_options?: string[];
};

const cleanRouteTitle = (title: string) => title
  .replace(/^day\s*\d+\s*[:.)-]?\s*/i, '')
  .split(/[–—|]/)[0]
  .trim();

const compactItems = (items: string[], limit = 3) => items.filter(Boolean).slice(0, limit);

const TourTabs: React.FC<TourTabsProps> = ({
  description,
  highlights,
  inclusions,
  exclusions,
  itinerary,
  title,
  price,
  priceAvailable = true,
  bestTime,
  difficulty,
  fitnessRequirements,
  altitudeProfile,
  travellerDecision,
  onEnquire,
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
    { id: 'inclusions', label: 'Plan', icon: Check }
  ];
  const packageHasLists = Boolean((inclusions && inclusions.length > 0) || (exclusions && exclusions.length > 0));
  const fitnessCopy = Array.isArray(fitnessRequirements)
    ? fitnessRequirements.filter(Boolean).join(', ')
    : fitnessRequirements;
  const preparationCards = [
    { label: 'Difficulty', value: altitudeProfile?.difficulty_level || difficulty || 'Ask for route-specific difficulty guidance' },
    { label: 'Highest altitude', value: altitudeProfile?.max_altitude || 'Ask for route-specific altitude guidance' },
    { label: 'Walking expectation', value: fitnessCopy || 'Ask for route-specific preparation guidance' },
    { label: 'Acclimatization', value: altitudeProfile?.acclimatization_days ? `${altitudeProfile.acclimatization_days} day${altitudeProfile.acclimatization_days === 1 ? '' : 's'} planned` : 'Extra acclimatization can be discussed' },
  ];
  const permitSensitive = /kailash|mansarovar|tibet|china|lhasa|yatra/i.test(`${title} ${description}`);
  const documentItems = travellerDecision?.document_safety_items?.filter(Boolean) || (permitSensitive
    ? ['China/Tibet visa and permit guidance before departure', 'Do not start travel until required documents are confirmed', 'Final document checklist shared before confirmation', 'Route-specific permit timing explained by our team']
    : ['Permit and entry-document guidance before departure', 'Final document checklist shared before confirmation', 'Route-specific safety notes available on request', 'Travel date confirmed only after practical requirements are clear']);
  const priceFactors = travellerDecision?.price_factors?.filter(Boolean) || ['Hotel level and room type', 'Permit, visa and document costs', 'Private date or transport upgrade', 'Single supplement', 'Group size changes', 'Flight or route changes'];
  const dateOptions = travellerDecision?.date_options?.filter(Boolean) || ['Private departures available', 'Group departures on request', `Best season: ${bestTime || 'Ask for the best travel window'}`, 'Ask for next available date'];
  const customizationOptions = travellerDecision?.customization_options?.filter(Boolean) || ['Change travel date', 'Upgrade hotel', 'Add extra acclimatization day', 'Add Kathmandu sightseeing', 'Choose private group'];

  const planCards = [
    {
      title: 'Documents & Permits',
      description: 'Confirm required documents before paying for flights or starting travel.',
      icon: ShieldCheck,
      items: compactItems(documentItems),
    },
    {
      title: 'Price Clarity',
      description: priceAvailable && price && price > 0
        ? `Guide price starts from $${price}. Confirm final route-specific costs before booking.`
        : 'Ask for a written quote before confirming your date.',
      icon: WalletCards,
      items: compactItems(priceFactors),
    },
    {
      title: 'Dates & Departures',
      description: 'Check the next practical travel window before planning flights.',
      icon: CalendarDays,
      items: compactItems(dateOptions),
    },
    {
      title: 'Customize This Trip',
      description: 'Change the parts that matter without reading another long list.',
      icon: SlidersHorizontal,
      items: compactItems(customizationOptions),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="sticky top-[64px] z-40 bg-white border-y sm:border sm:border-gray-200">
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

      <div className="bg-white border-y sm:border sm:border-gray-200 p-5 sm:p-8 space-y-12">
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

            {permitSensitive && (
              <div className="border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-gray-950">Document safety note</p>
                    <p className="mt-1 text-sm leading-6 text-gray-700">Permit and visa requirements can change by route, nationality and season. Confirm documents before booking flights or starting travel.</p>
                  </div>
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
              <WalletCards className="w-6 h-6 text-primary" />
              Value & Planning Details
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {priceAvailable && price && price > 0 ? `Guide price starts from $${price} per person. Confirm current pricing and route-specific costs before booking.` : 'Current price is available on request. Ask for a written quote before confirming your date.'}
            </p>
          </div>

          {packageHasLists ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inclusions && inclusions.length > 0 && (
                <div className="bg-primary/5 p-5 border border-primary/15">
                  <h4 className="text-lg font-bold text-brand-dark mb-4 flex items-center text-primary">
                    <span className="bg-primary p-1.5 mr-2">
                      <Check className="w-4 h-4 text-white" />
                    </span>
                    What is Included
                  </h4>
                  <ul className="space-y-3">
                    {inclusions.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exclusions && exclusions.length > 0 && (
                <div className="bg-gray-50 p-5 border border-gray-200">
                  <h4 className="text-lg font-bold text-brand-dark mb-4 flex items-center text-gray-800">
                    <span className="bg-gray-200 p-1.5 mr-2">
                      <X className="w-4 h-4 text-gray-600" />
                    </span>
                    What is Not Included
                  </h4>
                  <ul className="space-y-3">
                    {exclusions.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm leading-7 text-gray-700">A detailed inclusion and exclusion list is available from our team. Ask for a written package summary so flights, permits, hotels, meals and personal expenses are clear before you commit.</p>
            </div>
          )}

          <div className="border border-secondary/30 bg-secondary/5 p-4 text-sm leading-6 text-gray-700">
            Concerned about hidden costs? Ask for the current written quote and route-specific notes before paying a deposit.
          </div>

          <div className="space-y-5">
            <div>
              <h4 className="text-xl font-bold text-brand-dark">Plan With Confidence</h4>
              <p className="mt-2 text-sm leading-6 text-gray-500">The important decision details are grouped here so the page stays clear instead of becoming a long checklist.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {planCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="border border-gray-200 bg-white p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-base font-bold text-gray-950">{card.title}</h5>
                        <p className="mt-1 text-sm leading-6 text-gray-600">{card.description}</p>
                        <ul className="mt-4 space-y-2">
                          {card.items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm leading-6 text-gray-700">
                              <Check className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border border-gray-200 bg-gray-50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Mountain className="h-5 w-5 text-primary" />
                <h5 className="font-bold text-gray-950">Trip Readiness</h5>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {preparationCards.map((card) => (
                  <div key={card.label} className="border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{card.label}</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-gray-800">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <button type="button" onClick={onEnquire} className="inline-flex items-center justify-center bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-dark">
              Ask for full details
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TourTabs;
export type { ItineraryDay };
