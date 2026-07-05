'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Compass, MapPin, Plane, Route, Shield, Users } from 'lucide-react';
import PageHeader from '../PageHeader/PageHeader';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { useDestinations, useTours } from '../../hooks/useApi';

type IconType = typeof Route;

type DestinationSeoContent = {
  title: string;
  intro: string;
  bestFor: string;
  typicalLength: string;
  planningFocus: string;
  bestTime: string;
  planningNote: string;
  routeIdeas: string[];
  guideBlocks: { title: string; body: string; icon: IconType }[];
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

const seoContent: Record<string, DestinationSeoContent> = {
  nepal: {
    title: 'Nepal tours from Kathmandu: pilgrimage, trekking, culture and private routes',
    intro: 'Explore Nepal pilgrimage, cultural tours, Himalayan routes, helicopter options, family trips and private itineraries planned from Kathmandu with route clarity and local support.',
    bestFor: 'Pilgrimage guests, families, trekkers, cultural travellers and private groups.',
    typicalLength: '1 day to 2+ weeks',
    planningFocus: 'Season, road access, altitude, permits, vehicle choice, hotel standard and local support.',
    bestTime: 'Spring and autumn are popular for Himalayan routes; cultural and pilgrimage tours can be planned across more months depending on destination.',
    planningNote: 'Nepal routes depend heavily on season, road condition, altitude, permits and local support planning. The right route changes with age group, travel purpose, walking ability and available days.',
    routeIdeas: ['Kathmandu heritage tour', 'Muktinath pilgrimage', 'Everest or Annapurna region', 'Pokhara, Chitwan and Lumbini', 'Helicopter and private family tours'],
    guideBlocks: [
      { title: 'Match the route to the traveller', body: 'A Nepal tour should not be chosen only by destination name. Pilgrimage groups, families, senior travellers, trekkers and private groups need different pacing, hotel standards, transport choices and support levels.', icon: Users },
      { title: 'Check timing and access first', body: 'Road condition, flight reliability, altitude, weather and festival demand can change the best route. We help compare what is realistic before the itinerary is finalized.', icon: Calendar },
      { title: 'Plan permits and ground support', body: 'Some Nepal routes need permits, local coordination, vehicle planning, guide support or altitude preparation. These details are easier to solve before booking than during the journey.', icon: Shield },
    ],
    faqs: [
      { question: 'Which Nepal tour is best for first-time visitors?', answer: 'Kathmandu, Pokhara, Nagarkot, Chitwan, Lumbini and Muktinath are common choices, but the best route depends on travel days, group age, budget and whether the purpose is culture, pilgrimage or nature.' },
      { question: 'Can Nepal tours be customized for families or senior travellers?', answer: 'Yes. Nepal tours can be customized with slower pacing, easier road sectors, private vehicles, selected hotels and support based on the traveller profile.' },
    ],
  },
  thailand: {
    title: 'Thailand tour planning from Nepal: Bangkok, beaches and multi-country routes',
    intro: 'Plan Thailand with clarity around Bangkok city stays, island holidays, family trips, honeymoon-style travel and Thailand–Malaysia–Singapore combinations from Nepal.',
    bestFor: 'Beach holidays, family trips, city breaks and first-time international travellers.',
    typicalLength: '4 to 10 days',
    planningFocus: 'Flights, hotel area, transfers, activity pace and visa or travel document guidance.',
    bestTime: 'November to March is the most popular period; beach routes can vary by coast and season.',
    planningNote: 'Thailand works well for short holidays, honeymoon-style travel and add-on routes with Malaysia or Singapore. The biggest planning mistake is choosing hotels and transfers before understanding the travel pace.',
    routeIdeas: ['Bangkok city break', 'Pattaya and beach escape', 'Phuket or Krabi island stay', 'Thailand–Malaysia–Singapore combo'],
    guideBlocks: [
      { title: 'Choose the right base', body: 'Bangkok, Pattaya, Phuket, Krabi and island routes offer different travel experiences. The best choice depends on budget, group type, transfer tolerance and whether the trip is for leisure, family or celebration.', icon: MapPin },
      { title: 'Balance pace and transfers', body: 'A short Thailand tour should avoid too many hotel changes. We help structure days so sightseeing, airport transfers, beach time and optional activities feel smooth instead of rushed.', icon: Route },
      { title: 'Plan support before booking', body: 'Travellers from Nepal often need clarity on documents, hotel area, pickup timing, local support and how to combine Thailand with nearby destinations. These details should be solved before payment.', icon: Shield },
    ],
    faqs: [
      { question: 'How many days are enough for Thailand from Nepal?', answer: 'A short Bangkok or Pattaya trip can work in 4–5 days, while beach routes or multi-country combinations usually need 7–10 days for a better pace.' },
      { question: 'Can Thailand be combined with Malaysia or Singapore?', answer: 'Yes. Thailand, Malaysia and Singapore can be combined, but the route should be planned around flight timing, transfers, hotel locations and total travel days.' },
    ],
  },
  china: {
    title: 'China and cross-border travel planning from Nepal',
    intro: 'Plan China, Tibet and connected routes with practical timing, documentation, permit coordination and route clarity for travellers starting from Nepal.',
    bestFor: 'Cultural travel, cross-border routes, Tibet planning and guided group itineraries.',
    typicalLength: '5 to 12+ days',
    planningFocus: 'Documentation, permits, routing, border timing and guided support.',
    bestTime: 'Spring and autumn are generally preferred for comfortable travel and clearer route planning.',
    planningNote: 'China-related routes often need stronger document, timing and permit coordination before booking. The route should be confirmed only after checking travel requirements.',
    routeIdeas: ['China cultural route', 'Tibet route planning', 'Cross-border travel', 'Private guided itinerary'],
    guideBlocks: [
      { title: 'Start with documents', body: 'China and Tibet-related travel needs document clarity before hotel or flight commitment. Requirements can affect route, timing and group planning.', icon: Shield },
      { title: 'Plan route feasibility', body: 'Long-distance sectors, border timing and guided-route rules should be understood early. This prevents unrealistic itinerary promises.', icon: Route },
      { title: 'Choose support level', body: 'Guided support, transfers and communication matter more on cross-border routes than simple city breaks.', icon: Users },
    ],
    faqs: [
      { question: 'Can China routes be planned from Nepal?', answer: 'Yes, but document requirements, timing and route feasibility should be checked before confirming a package.' },
      { question: 'Is Tibet planning different from normal China travel?', answer: 'Yes. Tibet-related travel usually requires more careful permit, route and support planning.' },
    ],
  },
};

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
      { title: 'Understand the travel purpose', body: `A good ${title} plan starts with why you are travelling: leisure, family, culture, pilgrimage, adventure or a private celebration.`, icon: Users },
      { title: 'Shape the route before booking', body: 'Hotel location, transfers, activity pace and travel days should be checked before choosing the final package.', icon: Route },
      { title: 'Confirm support level', body: 'Clear communication, transfer timing and local assistance make the journey easier, especially for families and groups.', icon: Shield },
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

function findDestination(destinations: any[] | undefined, slug: string) {
  if (slug === 'nepal') {
    return {
      id: 9999,
      name: 'Nepal',
      title: 'Nepal Tours',
      country: 'Nepal',
      type: 'nepal',
      image: destinationFallbacks.nepal,
      description: seoContent.nepal.intro,
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

function isRelatedTour(tour: any, destination: any, slug: string, destinations: any[] | undefined) {
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

const DestinationDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const normalizedSlug = normalizeSlug(slug);
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
  const pageCopy = seoContent[normalizedSlug] || defaultContent(title);
  const destinationImage = getDestinationImage(normalizedSlug, destination);
  const destinationCountry = destination.country || title;
  const relatedTours = (allTours || [])
    .filter((tour: any) => isRelatedTour(tour, destination, normalizedSlug, destinations))
    .slice(0, 6);

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
          <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-stretch'>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className='flex h-full flex-col'
            >
              <span className='text-secondary text-xs font-bold uppercase tracking-[0.22em]'>Destination guide</span>
              <h2 className='mt-4 max-w-5xl text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight text-gray-950'>
                {pageCopy.title}
              </h2>
              <p className='mt-6 max-w-4xl text-base md:text-lg leading-8 text-gray-600'>
                {pageCopy.intro}
              </p>

              <div className='mt-8 grid gap-px overflow-hidden border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='bg-white p-5'>
                  <MapPin className='mb-4 h-5 w-5 text-primary' />
                  <div className='text-xs font-bold uppercase tracking-[0.16em] text-gray-400'>Region</div>
                  <div className='mt-2 text-sm font-semibold leading-6 text-gray-800'>{destinationCountry}</div>
                </div>
                <div className='bg-white p-5'>
                  <Users className='mb-4 h-5 w-5 text-secondary' />
                  <div className='text-xs font-bold uppercase tracking-[0.16em] text-gray-400'>Best for</div>
                  <div className='mt-2 text-sm font-semibold leading-6 text-gray-800'>{pageCopy.bestFor}</div>
                </div>
                <div className='bg-white p-5'>
                  <Calendar className='mb-4 h-5 w-5 text-primary' />
                  <div className='text-xs font-bold uppercase tracking-[0.16em] text-gray-400'>Ideal duration</div>
                  <div className='mt-2 text-sm font-semibold leading-6 text-gray-800'>{pageCopy.typicalLength}</div>
                </div>
                <div className='bg-white p-5'>
                  <Shield className='mb-4 h-5 w-5 text-secondary' />
                  <div className='text-xs font-bold uppercase tracking-[0.16em] text-gray-400'>Planning focus</div>
                  <div className='mt-2 text-sm font-semibold leading-6 text-gray-800'>{pageCopy.planningFocus}</div>
                </div>
              </div>

              <div className='mt-6 grid gap-5 lg:grid-cols-[0.54fr_0.46fr]'>
                <div className='border border-gray-200 bg-gray-50 p-5 md:p-6'>
                  <h3 className='text-xl font-serif font-bold text-gray-950'>Popular route ideas</h3>
                  <div className='mt-5 flex flex-wrap gap-2'>
                    {pageCopy.routeIdeas.map((idea) => (
                      <span key={idea} className='inline-flex items-center border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700'>
                        <Route className='mr-2 h-3.5 w-3.5 text-primary' /> {idea}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='border border-gray-200 bg-white p-5 md:p-6'>
                  <h3 className='text-xl font-serif font-bold text-gray-950'>Best time to plan</h3>
                  <p className='mt-3 text-sm leading-7 text-gray-600'>{pageCopy.bestTime}</p>
                </div>
              </div>
            </motion.article>

            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className='flex h-full flex-col border border-gray-200 bg-gray-50 p-6 md:p-7'
            >
              <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400'>Planning note</span>
              <h3 className='mt-4 text-2xl md:text-3xl font-serif font-bold text-gray-950'>Ask before you book.</h3>
              <p className='mt-4 text-sm leading-7 text-gray-600'>{pageCopy.planningNote}</p>

              <div className='mt-6 space-y-4 border-y border-gray-200 py-5'>
                <div className='flex gap-3'>
                  <Compass className='mt-0.5 h-5 w-5 text-primary' />
                  <p className='text-sm leading-6 text-gray-600'>Compare routes before choosing a package.</p>
                </div>
                <div className='flex gap-3'>
                  <Users className='mt-0.5 h-5 w-5 text-secondary' />
                  <p className='text-sm leading-6 text-gray-600'>Adjust the plan around age group, comfort level and travel purpose.</p>
                </div>
                <div className='flex gap-3'>
                  <Shield className='mt-0.5 h-5 w-5 text-primary' />
                  <p className='text-sm leading-6 text-gray-600'>Clarify support, permits, timing and practical risks early.</p>
                </div>
              </div>

              <Link href='/contact' className='mt-auto inline-flex w-full items-center justify-center bg-primary px-6 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark'>
                Plan this route <ArrowRight className='ml-2 h-3.5 w-3.5' />
              </Link>
            </motion.aside>
          </div>

          <div className='mt-10 grid gap-5 md:grid-cols-3'>
            {pageCopy.guideBlocks.map((block, index) => {
              const Icon = block.icon;
              return (
                <motion.article
                  key={block.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className='border border-gray-200 bg-white p-6 shadow-sm'
                >
                  <Icon className={`mb-5 h-5 w-5 ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}`} />
                  <h3 className='text-xl font-serif font-bold text-gray-950'>{block.title}</h3>
                  <p className='mt-3 text-sm leading-7 text-gray-600'>{block.body}</p>
                </motion.article>
              );
            })}
          </div>

          <div className='mt-10 border border-gray-200 bg-gray-50 p-6 md:p-8'>
            <span className='text-secondary text-xs font-bold uppercase tracking-[0.22em]'>Common questions</span>
            <div className='mt-6 grid gap-5 md:grid-cols-2'>
              {pageCopy.faqs.map((faq) => (
                <div key={faq.question} className='border border-gray-200 bg-white p-5'>
                  <h3 className='text-lg font-serif font-bold text-gray-950'>{faq.question}</h3>
                  <p className='mt-3 text-sm leading-7 text-gray-600'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className='border-y border-gray-100 bg-gray-50 py-14 md:py-20'>
        <div className='container-xl'>
          <div className='mb-9 grid gap-5 lg:grid-cols-[0.42fr_0.58fr] lg:items-end'>
            <div>
              <span className='text-secondary text-xs font-bold uppercase tracking-[0.22em]'>Available packages</span>
              <h2 className='mt-4 text-3xl md:text-4xl font-serif font-bold leading-tight text-gray-950'>
                Routes connected to {title}
              </h2>
            </div>
            <p className='text-sm md:text-base leading-7 text-gray-600 lg:max-w-xl lg:justify-self-end'>
              Browse relevant packages, or contact us for a custom route if your dates, group size or travel purpose needs a different plan.
            </p>
          </div>

          {relatedTours.length > 0 ? (
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {relatedTours.map((tour: any, index: number) => (
                <motion.article
                  key={tour.slug || tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className='group h-full border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/5'
                >
                  <Link href={`/tours/${tour.slug}`} className='flex h-full flex-col'>
                    <div className='relative h-64 overflow-hidden bg-gray-200'>
                      <img
                        src={getTourImage(tour, normalizedSlug, destination)}
                        alt={tour.title}
                        loading='lazy'
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = getDestinationFallback(normalizedSlug, destination);
                        }}
                        className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/20 to-transparent' />
                      <div className='absolute left-4 top-4 bg-white/90 px-3 py-2 backdrop-blur-sm'>
                        <span className='inline-flex items-center text-[10px] font-bold uppercase tracking-[0.16em] text-gray-700'>
                          <Plane className='mr-2 h-3.5 w-3.5 text-secondary' /> {destinationCountry}
                        </span>
                      </div>
                    </div>

                    <div className='flex flex-1 flex-col p-5'>
                      <h3 className='text-xl font-serif font-bold leading-tight text-gray-950 transition-colors group-hover:text-primary'>
                        {tour.title}
                      </h3>
                      <p className='mt-3 line-clamp-2 text-sm leading-6 text-gray-600'>{tour.description}</p>

                      <div className='mt-5 flex flex-wrap gap-3 text-xs font-semibold text-gray-500'>
                        {tour.duration && (
                          <span className='inline-flex items-center gap-1.5'>
                            <Calendar className='h-3.5 w-3.5 text-primary' /> {tour.duration}
                          </span>
                        )}
                        {tour.group_size && (
                          <span className='inline-flex items-center gap-1.5'>
                            <Users className='h-3.5 w-3.5 text-primary' /> {tour.group_size}
                          </span>
                        )}
                      </div>

                      <div className='mt-auto flex items-center justify-between border-t border-gray-100 pt-5'>
                        <span className='text-xs font-bold uppercase tracking-wider text-gray-400'>View details</span>
                        <ArrowRight className='h-4 w-4 text-primary transition-transform group-hover:translate-x-1' />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className='border border-gray-200 bg-white p-8 text-center'>
              <Compass className='mx-auto h-8 w-8 text-primary' />
              <h3 className='mt-4 text-2xl font-serif font-bold text-gray-950'>No listed package found yet</h3>
              <p className='mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600'>
                This destination can still be planned privately. Share your dates, group size and travel purpose so we can suggest the right route.
              </p>
              <Link href='/contact' className='mt-6 inline-flex items-center justify-center bg-primary px-6 py-4 text-xs font-bold uppercase tracking-wider text-white'>
                Request custom plan <ArrowRight className='ml-2 h-3.5 w-3.5' />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DestinationDetail;
