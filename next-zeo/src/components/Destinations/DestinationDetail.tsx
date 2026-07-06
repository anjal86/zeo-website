'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Compass,
  DollarSign,
  MapPin,
  Plane,
  Route,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  Users,
} from 'lucide-react';
import PageHeader from '../PageHeader/PageHeader';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { useDestinations, useTours } from '../../hooks/useApi';
import TourGrid from '../Tours/TourGrid';

type DestinationSeoContent = {
  title: string;
  intro: string;
  bestFor: string;
  typicalLength: string;
  planningFocus: string;
  bestTime: string;
  planningNote: string;
  routeIdeas: string[];
  guideBlocks: { title: string; body: string; icon: string }[];
  faqs: { question: string; answer: string }[];
};

const destinationFallbacks: Record<string, string> = {
  nepal: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop',
  china: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2070&auto=format&fit=crop',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2070&auto=format&fit=crop',
  thailand: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2070&auto=format&fit=crop',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop',
  vietnam: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop',
  tibet: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=2070&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070&auto=format&fit=crop',
};

// Hardcoded seoContent removed. Now fetched from API.

const travelStyles = [
  { id: 'all', label: 'All routes' },
  { id: 'short', label: 'Short trips' },
  { id: 'family', label: 'Family friendly' },
  { id: 'private', label: 'Private / premium' },
];

function defaultContent(title: string): DestinationSeoContent {
  return {
    title: `${title} travel planning from Nepal`,
    intro: `Plan ${title} with practical guidance on route, timing, hotel area, transfers, support level and travel purpose.`,
    bestFor: 'Private, group, family and leisure travel.',
    typicalLength: 'Flexible by route',
    planningFocus: 'Route clarity, timing, transfers, hotel area and support level.',
    bestTime: 'Depends on destination, season and travel purpose.',
    planningNote: `The right ${title} itinerary depends on dates, group size, pace, budget and preferred travel style.`,
    routeIdeas: ['Private itinerary', 'Family-friendly route', 'Short holiday', 'Custom group plan'],
    guideBlocks: [
      { title: 'Understand the travel purpose', body: `A good ${title} plan starts with why you are travelling: leisure, family, culture, pilgrimage, adventure or a private celebration.`, icon: 'Users' },
      { title: 'Shape the route before booking', body: 'Hotel location, transfers, activity pace and travel days should be checked before choosing the final package.', icon: 'Route' },
      { title: 'Confirm support level', body: 'Clear communication, transfer timing and local assistance make the journey easier, especially for families and groups.', icon: 'Shield' },
    ],
    faqs: [
      { question: `How do I plan a ${title} trip from Nepal?`, answer: `Start with your travel dates, group size, preferred pace and budget. Then compare routes, hotel areas, transfers and required documents before booking.` },
      { question: `Can ${title} trips be customized?`, answer: 'Yes. The route can be adjusted around your travel purpose, available days, hotel preference and support needs.' },
    ],
  };
}

function normalizeSlug(slug?: string) {
  return String(slug || '').toLowerCase().trim();
}

function titleCase(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function slugFromName(name: string) {
  return name.toLowerCase().trim().split(' ').filter(Boolean).join('-');
}

function getDestinationFallback(slug: string, destination?: any) {
  const key = `${slug} ${destination?.name || ''} ${destination?.country || ''}`.toLowerCase();
  if (key.includes('nepal')) return destinationFallbacks.nepal;
  if (key.includes('china')) return destinationFallbacks.china;
  if (key.includes('bali')) return destinationFallbacks.bali;
  if (key.includes('thailand')) return destinationFallbacks.thailand;
  if (key.includes('dubai') || key.includes('uae')) return destinationFallbacks.dubai;
  if (key.includes('vietnam') || key.includes('viet')) return destinationFallbacks.vietnam;
  if (key.includes('tibet')) return destinationFallbacks.tibet;
  return destinationFallbacks.default;
}

function getDestinationImage(slug: string, destination?: any) {
  const image = destination?.image || destination?.image_url;
  if (!image || String(image).includes('undefined') || String(image).includes('null')) {
    return getDestinationFallback(slug, destination);
  }
  return image;
}

function getTourImage(tour: any, slug: string, destination: any) {
  const destinationImage = getDestinationFallback(slug, destination);
  const image = tour.image || tour.image_url;

  if (!image || String(image).includes('undefined') || String(image).includes('null')) {
    return destinationImage;
  }

  const looksLikeGenericNepal = [
    '1506905925346',
    '1544735716',
    'everest',
    'annapurna',
    'nepal',
    'placeholder',
  ].some((token) => String(image).toLowerCase().includes(token));

  if (slug !== 'nepal' && looksLikeGenericNepal) {
    return destinationImage;
  }

  return image;
}

function findDestination(destinations: any[] | null | undefined, slug: string) {
  if (slug === 'nepal') {
    return {
      id: 9999,
      name: 'Nepal',
      title: 'Nepal Tours',
      country: 'Nepal',
      type: 'nepal',
      image: destinationFallbacks.nepal,
      description: defaultContent('Nepal').intro,
      href: '/destinations/nepal',
    };
  }

  return destinations?.find((destination) => {
    const name = String(destination.name || '').toLowerCase();
    const destinationSlug = String(destination.slug || '').toLowerCase();
    const href = String(destination.href || '').toLowerCase();
    return destinationSlug === slug || href === `/destinations/${slug}` || name === slug || slugFromName(name) === slug;
  });
}

function isRelatedTour(tour: any, destination: any, slug: string, destinations: any[] | null | undefined) {
  if (tour.listed === false) return false;

  if (slug === 'nepal') {
    const relatedText = [
      tour.title,
      tour.location,
      tour.category,
      tour.description,
      ...(tour.destinations || []).map((item: any) => `${item.slug || ''} ${item.name || ''}`),
    ].filter(Boolean).join(' ').toLowerCase();

    return ['nepal', 'kathmandu', 'muktinath', 'everest', 'annapurna', 'gosaikunda', 'pokhara', 'lumbini', 'nagarkot', 'gandruk']
      .some((keyword) => relatedText.includes(keyword));
  }

  const destinationId = destination?.id;
  const primaryDestination = destinations?.find((item) => item.id === tour.primary_destination_id);
  const secondaryDestinations = tour.secondary_destination_ids?.map((id: number) => destinations?.find((item) => item.id === id)).filter(Boolean) || [];
  const relatedDestinations = [primaryDestination, ...secondaryDestinations, ...(tour.destinations || [])].filter(Boolean);

  const relationMatch = relatedDestinations.some((item: any) => {
    const itemSlug = String(item.slug || '').toLowerCase();
    const itemName = String(item.name || '').toLowerCase();
    const itemCountry = String(item.country || '').toLowerCase();
    return item.id === destinationId || itemSlug === slug || itemName === slug || slugFromName(itemName) === slug || itemCountry === slug;
  });

  if (relationMatch) return true;

  const text = [tour.title, tour.location, tour.category, tour.description].filter(Boolean).join(' ').toLowerCase();
  const destinationName = String(destination?.name || '').toLowerCase();
  const destinationCountry = String(destination?.country || '').toLowerCase();

  return text.includes(slug) || (!!destinationName && text.includes(destinationName)) || (!!destinationCountry && text.includes(destinationCountry));
}

function getTourText(tour: any) {
  return [tour.title, tour.location, tour.category, tour.description, tour.difficulty, tour.duration, tour.group_size]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchesTravelStyle(tour: any, style: string) {
  if (style === 'all') return true;

  const text = getTourText(tour);
  const duration = String(tour.duration || '').toLowerCase();
  const dayMatch = duration.match(/(\d+)\s*(d|day)/);
  const days = dayMatch ? Number(dayMatch[1]) : null;

  if (style === 'short') {
    return (!!days && days <= 5) || ['short', 'city', 'escape', 'weekend'].some((keyword) => text.includes(keyword));
  }

  if (style === 'family') {
    return ['family', 'easy', 'comfort', 'private', '2-8', 'group'].some((keyword) => text.includes(keyword));
  }

  if (style === 'private') {
    return ['private', 'luxury', 'premium', 'helicopter', 'aerial', 'custom'].some((keyword) => text.includes(keyword));
  }

  return true;
}

function getPriceLabel(tour: any) {
  const price = Number(tour.price || tour.price_usd || tour.starting_price || 0);
  const currency = tour.currency || 'USD';

  if (Number.isFinite(price) && price > 0) {
    return `From ${currency === 'USD' ? '$' : currency + ' '}${price.toLocaleString()}`;
  }

  return 'Custom quote';
}

function getRatingLabel(tour: any) {
  const rating = tour.rating || tour.ratingValue || tour.rating_value;
  if (rating) return String(rating);
  return 'Trusted route';
}

const DestinationDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const normalizedSlug = normalizeSlug(slug);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeStyle, setActiveStyle] = React.useState('all');
  const { data: destinations, loading: destinationsLoading, error: destinationsError } = useDestinations();
  const { data: allTours, loading: toursLoading, error: toursError } = useTours();

  const loading = destinationsLoading || toursLoading;
  const error = destinationsError || toursError;
  const destination = findDestination(destinations, normalizedSlug);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={`Failed to load destination details: ${error}`} className='py-20' />;
  }

  if (!destination) {
    return (
      <div className='flex min-h-screen items-center justify-center px-4'>
        <div className='max-w-md text-center'>
          <Compass className='mx-auto h-10 w-10 text-primary' />
          <h1 className='mt-5 text-3xl font-serif font-bold text-gray-950'>Destination not found</h1>
          <p className='mt-3 text-sm leading-6 text-gray-600'>This destination may have been moved or is currently being updated.</p>
          <Link href='/destinations' className='mt-6 inline-flex items-center justify-center bg-primary px-6 py-4 text-xs font-bold uppercase tracking-wider text-white'>
            Back to destinations <ArrowRight className='ml-2 h-3.5 w-3.5' />
          </Link>
        </div>
      </div>
    );
  }

  const title = destination.title || destination.name || titleCase(normalizedSlug);
  const displayTitle = destination.name || title;
  const defaultCopy = defaultContent(title);
  
  const parseJsonSafe = (data: any, fallback: any) => {
    if (!data) return fallback;
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch { return fallback; }
    }
    return data;
  };

  const pageCopy: DestinationSeoContent = {
    title: title,
    intro: destination.seo_intro || defaultCopy.intro,
    bestFor: defaultCopy.bestFor,
    typicalLength: defaultCopy.typicalLength,
    planningFocus: defaultCopy.planningFocus,
    routeIdeas: defaultCopy.routeIdeas,
    bestTime: destination.seo_best_time || defaultCopy.bestTime,
    planningNote: destination.seo_planning_note || defaultCopy.planningNote,
    guideBlocks: parseJsonSafe(destination.seo_guide_blocks, defaultCopy.guideBlocks),
    faqs: parseJsonSafe(destination.seo_faqs, defaultCopy.faqs)
  };
  const destinationImage = getDestinationImage(normalizedSlug, destination);
  const destinationCountry = destination.country || title;
  const relatedTours = (allTours || [])
    .filter((tour: any) => isRelatedTour(tour, destination, normalizedSlug, destinations))
    .slice(0, 12);
  const filteredTours = relatedTours.filter((tour: any) => {
    const matchesSearch = searchQuery.trim()
      ? getTourText(tour).includes(searchQuery.trim().toLowerCase())
      : true;
    return matchesSearch && matchesTravelStyle(tour, activeStyle);
  });

  return (
    <div className='destination-detail-page bg-white'>
      <PageHeader
        title={title}
        subtitle={pageCopy.intro}
        breadcrumb={`Destinations > ${title}`}
        backgroundImage={destinationImage}
      />

      <section className='bg-white py-14 md:py-20'>
        <div className='container-xl'>
          <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]'>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <span className='text-[#E37833] text-xs font-bold uppercase tracking-[0.22em]'>Destination guide</span>
              <h2 className='mt-4 max-w-5xl text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight text-gray-950'>
                {pageCopy.title}
              </h2>
              <p className='mt-6 max-w-4xl text-base md:text-lg leading-8 text-gray-600 mb-8'>
                {pageCopy.intro}
              </p>
              <div className='mt-8 p-6 bg-gray-50 border border-gray-100'>
                <div className='flex items-center gap-2 mb-3'>
                  <Calendar className='w-4 h-4 text-[#E37833]' />
                  <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400'>Season note & Best time to plan</span>
                </div>
                <p className='text-sm leading-7 text-gray-600'>{pageCopy.bestTime}</p>
              </div>

              <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
                {pageCopy.guideBlocks.map((block, index) => {
                  let Icon = Compass;
                  if (block.icon === 'Users') Icon = Users;
                  if (block.icon === 'Route') Icon = Route;
                  if (block.icon === 'Shield') Icon = Shield;
                  if (block.icon === 'Calendar') Icon = Calendar;
                  if (block.icon === 'MapPin') Icon = MapPin;
                  return (
                    <div
                      key={block.title}
                      className='group border border-gray-200 p-6 transition-colors hover:border-gray-300 bg-white'
                    >
                      <Icon className={`mb-4 h-5 w-5 ${index % 2 === 0 ? 'text-[#2B5C9C]' : 'text-[#E37833]'}`} />
                      <h3 className='text-lg font-serif font-bold text-gray-950'>{block.title}</h3>
                      <p className='mt-2 text-sm leading-6 text-gray-600'>{block.body}</p>
                    </div>
                  );
                })}
              </div>
            </motion.article>

            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className='border border-[#2B5C9C] bg-[#2B5C9C] p-6 lg:sticky lg:top-28 self-start h-fit'
            >
              <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200'>Need clarity?</span>
              <h3 className='mt-4 text-2xl font-serif font-bold text-white'>Ask before you book.</h3>
              <p className='mt-4 text-sm leading-7 text-blue-100/90'>{pageCopy.planningNote}</p>
              <div className='mt-5 space-y-3 border-y border-white/10 py-5'>
                <div className='flex gap-3 text-sm leading-6 text-blue-100/90'>
                  <Compass className='mt-0.5 h-4 w-4 shrink-0 text-[#E37833]' /> Compare route options first.
                </div>
                <div className='flex gap-3 text-sm leading-6 text-blue-100/90'>
                  <Shield className='mt-0.5 h-4 w-4 shrink-0 text-[#E37833]' /> Clarify support and timing early.
                </div>
              </div>
              <Link href='/contact' className='mt-5 inline-flex w-full items-center justify-center bg-[#E37833] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#c96a2d]'>
                Plan this route <ArrowRight className='ml-2 h-3.5 w-3.5' />
              </Link>
            </motion.aside>
          </div>
        </div>
      </section>

      <section id='destination-packages' className='border-y border-gray-100 bg-[#f7f9fc] py-14 md:py-20 scroll-mt-28'>
        <div className='container-xl'>
          <div className='mb-9 grid gap-6 lg:grid-cols-[0.42fr_0.58fr] lg:items-end'>
            <div>
              <span className='text-[#E37833] text-xs font-bold uppercase tracking-[0.22em] flex items-center justify-start gap-2'>
                <Route className="w-4 h-4" /> Browse packages
              </span>
              <h2 className='mt-4 text-3xl md:text-4xl font-serif font-bold leading-tight text-gray-950'>
                Find a {displayTitle} route that fits your trip.
              </h2>
            </div>
            <p className='text-sm md:text-base leading-7 text-gray-600 lg:max-w-xl lg:justify-self-end'>
              Search by route, trip style or keyword. Use the filters to narrow short breaks, family-friendly plans and private or premium options.
            </p>
          </div>

          <div className='mb-8 grid gap-3 border border-gray-200 bg-white p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center'>
            <label className='relative block'>
              <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                type='search'
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={`Search ${displayTitle} tours, routes, duration or style...`}
                className='h-12 w-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2B5C9C]'
              />
            </label>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='hidden items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-gray-400 sm:inline-flex'>
                <SlidersHorizontal className='h-3.5 w-3.5' /> Filter
              </span>
              {travelStyles.map((style) => (
                <button
                  key={style.id}
                  type='button'
                  onClick={() => setActiveStyle(style.id)}
                  className={`h-10 px-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeStyle === style.id
                      ? 'bg-[#2B5C9C] text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-[#2B5C9C] hover:text-[#2B5C9C]'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTours.length > 0 ? (
            <TourGrid
              tours={filteredTours}
              filters={{
                search: searchQuery,
                destination: normalizedSlug,
                activity: activeStyle !== 'all' ? activeStyle : ''
              }}
              totalCount={filteredTours.length}
              destinations={destinations || undefined}
            />
          ) : (
            <div className='border border-gray-200 bg-white p-8 text-center'>
              <Compass className='mx-auto h-8 w-8 text-[#2B5C9C]' />
              <h3 className='mt-4 text-2xl font-serif font-bold text-gray-950'>No matching package found</h3>
              <p className='mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600'>
                Try a different keyword or ask the team to shape a private route around your dates, group size and travel purpose.
              </p>
              <Link href='/contact' className='mt-6 inline-flex items-center justify-center bg-[#E37833] hover:bg-[#c96a2d] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors'>
                Request custom plan <ArrowRight className='ml-2 h-3.5 w-3.5' />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className='bg-white py-14 md:py-20'>
        <div className='container-xl'>
          <div className='grid gap-8 border-y border-gray-200 py-8 lg:grid-cols-[0.32fr_0.68fr]'>
            <div>
              <span className='text-secondary text-xs font-bold uppercase tracking-[0.22em]'>Common questions</span>
              <h2 className='mt-4 text-3xl font-serif font-bold text-gray-950'>Planning clarity before payment.</h2>
            </div>
            <div className='grid gap-5 md:grid-cols-2'>
              {pageCopy.faqs.map((faq) => (
                <div key={faq.question} className='border-l-2 border-primary/30 pl-5'>
                  <h3 className='text-lg font-serif font-bold text-gray-950'>{faq.question}</h3>
                  <p className='mt-3 text-sm leading-7 text-gray-600'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DestinationDetail;
