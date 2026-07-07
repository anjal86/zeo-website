const SITE_URL = (process.env.APP_URL || 'https://www.zeotourism.com').replace(/\/$/, '');
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const LOGO_URL = `${SITE_URL}/logo/zeo-logo.png`;

type ItineraryDay = {
  day?: number;
  title?: string;
  description?: string;
  accommodation?: string;
  meals?: string;
};

type TourDetailSchemaInput = {
  name: string;
  description: string;
  url: string;
  images?: unknown[];
  price?: number;
  priceAvailable?: boolean;
  currency?: string;
  category?: string | null;
  duration?: string | null;
  durationDays?: number | null;
  groupSize?: string | null;
  bestTime?: string | null;
  location?: string | null;
  difficulty?: string | null;
  ratingValue?: number | null;
  reviewCount?: number | null;
  highlights?: unknown[];
  inclusions?: unknown[];
  exclusions?: unknown[];
  itinerary?: unknown[];
  faqs?: unknown[];
};

const absoluteUrl = (value?: string | null) => {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return `${SITE_URL}${value}`;
  return `${SITE_URL}/${value}`;
};

const cleanText = (value?: string | null) => (value || '').replace(/\s+/g, ' ').trim();

const cleanList = (items?: unknown[]) => (items || [])
  .map(item => cleanText(String(item || '')))
  .filter(Boolean);

const cleanItinerary = (items?: unknown[]): ItineraryDay[] => (items || []).flatMap((item) => {
  if (!item || typeof item !== 'object') return [];
  const record = item as Record<string, unknown>;
  const day = {
    day: typeof record.day === 'number' ? record.day : undefined,
    title: typeof record.title === 'string' ? cleanText(record.title) : undefined,
    description: typeof record.description === 'string' ? cleanText(record.description) : undefined,
    accommodation: typeof record.accommodation === 'string' ? cleanText(record.accommodation) : undefined,
    meals: typeof record.meals === 'string' ? cleanText(record.meals) : undefined,
  };
  return day.title || day.description ? [day] : [];
});

const cleanFaqs = (items?: unknown[]) => (items || []).flatMap((item) => {
  if (!item || typeof item !== 'object') return [];
  const record = item as Record<string, unknown>;
  const question = typeof record.question === 'string' ? cleanText(record.question) : '';
  const answer = typeof record.answer === 'string' ? cleanText(record.answer) : '';
  return question && answer ? [{ question, answer }] : [];
});

const createDuration = (days?: number | null, fallback?: string | null) => {
  if (typeof days === 'number' && days > 0) return `P${days}D`;
  return cleanText(fallback) || undefined;
};

const createCountryName = (location?: string | null) => {
  const value = (location || '').toLowerCase();
  if (value.includes('tibet') || value.includes('china')) return 'China';
  if (value.includes('dubai') || value.includes('uae')) return 'United Arab Emirates';
  if (value.includes('vietnam')) return 'Vietnam';
  if (value.includes('thailand')) return 'Thailand';
  if (value.includes('bali') || value.includes('indonesia')) return 'Indonesia';
  if (value.includes('bhutan')) return 'Bhutan';
  if (value.includes('india')) return 'India';
  return 'Nepal';
};

export const createTourDetailSchema = (tour: TourDetailSchemaInput) => {
  const url = tour.url;
  const description = cleanText(tour.description) || `${tour.name} travel package by Zeo Tourism.`;
  const imageList = cleanList(tour.images).map(absoluteUrl).filter(Boolean);
  const images = imageList.length ? imageList : [LOGO_URL];
  const price = Number(tour.price || 0);
  const hasPrice = Boolean(tour.priceAvailable !== false && price > 0);
  const availability = hasPrice ? 'https://schema.org/InStock' : 'https://schema.org/LimitedAvailability';
  const duration = createDuration(tour.durationDays, tour.duration);
  const highlights = cleanList(tour.highlights);
  const inclusions = cleanList(tour.inclusions);
  const exclusions = cleanList(tour.exclusions);
  const itinerary = cleanItinerary(tour.itinerary);
  const ratingValue = Number(tour.ratingValue || 0);
  const reviewCount = Number(tour.reviewCount || 0);
  const hasRating = ratingValue > 0 && reviewCount > 0;

  const offer = {
    '@type': 'Offer',
    '@id': `${url}#offer`,
    url,
    priceCurrency: tour.currency || 'USD',
    ...(hasPrice ? { price } : {}),
    availability,
    itemCondition: 'https://schema.org/NewCondition',
    seller: {
      '@type': 'TravelAgency',
      '@id': ORGANIZATION_ID,
      name: 'Zeo Tourism',
    },
  };

  const tripItinerary = itinerary.length > 0 ? {
    '@type': 'ItemList',
    name: `${tour.name} Day-by-Day Itinerary`,
    itemListElement: itinerary.map((day, index) => ({
      '@type': 'ListItem',
      position: day.day || index + 1,
      name: day.title || `Day ${day.day || index + 1}`,
      description: day.description,
    })),
  } : highlights.length > 0 ? {
    '@type': 'ItemList',
    name: `${tour.name} Highlights`,
    itemListElement: highlights.map((highlight, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: highlight,
    })),
  } : undefined;

  const additionalProperties = [
    tour.groupSize && { '@type': 'PropertyValue', name: 'Group Size', value: tour.groupSize },
    tour.bestTime && { '@type': 'PropertyValue', name: 'Best Time', value: tour.bestTime },
    tour.difficulty && { '@type': 'PropertyValue', name: 'Difficulty', value: tour.difficulty },
    duration && { '@type': 'PropertyValue', name: 'Duration', value: duration },
  ].filter(Boolean);

  const graph: unknown[] = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: tour.name,
      description,
      isPartOf: { '@id': WEBSITE_ID },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      mainEntity: { '@id': `${url}#trip` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tours', item: `${SITE_URL}/tours` },
        { '@type': 'ListItem', position: 3, name: tour.name, item: url },
      ],
    },
    {
      '@type': 'TouristTrip',
      '@id': `${url}#trip`,
      name: tour.name,
      description,
      image: images,
      url,
      touristType: ['Adventure Traveler', 'Cultural Traveler', 'Pilgrim', 'Family Traveler'],
      provider: { '@id': ORGANIZATION_ID },
      offers: { '@id': `${url}#offer` },
      ...(duration ? { duration } : {}),
      ...(tour.location ? {
        location: {
          '@type': 'Place',
          name: tour.location,
          containedInPlace: {
            '@type': 'Country',
            name: createCountryName(tour.location),
          },
        },
      } : {}),
      ...(tripItinerary ? { itinerary: tripItinerary } : {}),
      ...(highlights.length > 0 ? { subjectOf: highlights.map(highlight => ({ '@type': 'Thing', name: highlight })) } : {}),
    },
    {
      '@type': 'Product',
      '@id': `${url}#product`,
      name: tour.name,
      description,
      image: images,
      category: tour.category || 'Tour Package',
      brand: { '@id': ORGANIZATION_ID },
      offers: { '@id': `${url}#offer` },
      ...(hasRating ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue,
          reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      } : {}),
      ...(additionalProperties.length > 0 ? { additionalProperty: additionalProperties } : {}),
    },
    offer,
  ];

  if (inclusions.length || exclusions.length) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${url}#value-summary`,
      name: `${tour.name} Package Value Summary`,
      itemListElement: [
        ...inclusions.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: `Included: ${item}` })),
        ...exclusions.map((item, index) => ({ '@type': 'ListItem', position: inclusions.length + index + 1, name: `Not included: ${item}` })),
      ],
    });
  }

  const validFaqs = cleanFaqs(tour.faqs);
  if (validFaqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: validFaqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
};
