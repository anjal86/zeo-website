import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader/PageHeader';
import TourCard from '../components/Tours/TourCard';
import Breadcrumb from '../components/UI/Breadcrumb';
import SEO from '../components/SEO/SEO';
import EmptyState from '../components/UI/EmptyState';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';
import { useDestinations, useTours } from '../hooks/useApi';
import { createTouristDestinationSchema, createBreadcrumbSchema } from '../utils/schema';

const destinationSeoContent: Record<string, {
  title: string;
  description: string;
  keywords: string;
  answer: string;
  sections: Array<{ heading: string; body: string }>;
  links: Array<{ label: string; href: string }>;
}> = {
  kathmandu: {
    title: 'Kathmandu Sightseeing Tour & Tour Package | Zeo Tourism',
    description: 'Plan a Kathmandu sightseeing tour with Zeo Tourism. Visit Pashupatinath, Boudhanath, Swayambhunath, Durbar Squares and cultural sites with local guides.',
    keywords: 'Kathmandu sightseeing tour, Kathmandu tour package, Kathmandu day tour, Kathmandu cultural tour, Nepal tour package',
    answer: 'Kathmandu sightseeing tours usually cover UNESCO heritage sites, Hindu and Buddhist temples, local markets and valley viewpoints. Zeo Tourism plans private and group Kathmandu tour packages with guide, transport, entrance coordination and Nepal add-ons.',
    sections: [
      { heading: 'Best for', body: 'First-time Nepal travelers, pilgrimage guests, family groups, short-stay visitors and travelers adding Kathmandu before Kailash, Muktinath, Everest or Annapurna trips.' },
      { heading: 'Top places', body: 'Pashupatinath, Boudhanath, Swayambhunath, Kathmandu Durbar Square, Patan, Bhaktapur and nearby Nagarkot or Chandragiri viewpoints.' },
      { heading: 'Planning notes', body: 'Kathmandu works year-round. Clear mornings are best for photography, while guided routes help reduce traffic delays and temple timing issues.' }
    ],
    links: [
      { label: 'Nepal tour packages', href: '/tours' },
      { label: 'Muktinath tour package', href: '/destinations/mustang-region' },
      { label: 'Contact Kathmandu travel agency', href: '/contact' }
    ]
  },
  'mustang-region': {
    title: 'Muktinath Tour Package from Kathmandu | Zeo Tourism',
    description: 'Book Muktinath tour packages from Kathmandu with Zeo Tourism. Plan flight, jeep, bike and pilgrimage routes through Pokhara, Jomsom and Mustang.',
    keywords: 'Muktinath tour package, Muktinath Yatra from Kathmandu, Muktinath package Nepal, Mustang region tour, Nepal pilgrimage tour',
    answer: 'Muktinath tour packages from Kathmandu usually travel via Pokhara and Jomsom by flight or road, then continue to Muktinath Temple in Mustang. Zeo Tourism handles transport, hotels, permits and pilgrimage logistics.',
    sections: [
      { heading: 'Route options', body: 'Common routes include Kathmandu-Pokhara-Jomsom-Muktinath by flight, overland jeep routes through Beni and Tatopani, and longer Mustang add-ons.' },
      { heading: 'Who should book', body: 'Pilgrims, family groups, Indian travelers, Nepali travelers and guests wanting a sacred Himalayan journey without a long trek.' },
      { heading: 'Travel notes', body: 'Weather affects Jomsom flights, so flexible planning and backup road coordination are important for reliable Muktinath Yatra handling.' }
    ],
    links: [
      { label: 'Kathmandu sightseeing tour', href: '/destinations/kathmandu' },
      { label: 'Nepal pilgrimage tour packages', href: '/tours' },
      { label: 'Plan Muktinath Yatra', href: '/contact' }
    ]
  },
  'everest-region': {
    title: 'Everest Region Tour, EBC Trek & Helicopter Tour | Zeo Tourism',
    description: 'Explore Everest region tours with Zeo Tourism, including Everest Base Camp trek, Namche Bazaar, Tengboche, Kala Patthar and Everest helicopter tour options.',
    keywords: 'Everest region tour, Everest Base Camp trek, Everest helicopter tour, Everest tour package Nepal, Nepal trekking packages',
    answer: 'Everest region tours include trekking routes to Namche, Tengboche, Everest Base Camp and Kala Patthar, plus scenic helicopter tour options for travelers with limited time. Zeo Tourism plans guides, permits, flights and safety support.',
    sections: [
      { heading: 'Main experiences', body: 'Everest Base Camp trek, Kala Patthar sunrise, Namche Bazaar, Tengboche Monastery, Sherpa culture, Lukla flights and Everest helicopter tours.' },
      { heading: 'Best time', body: 'March to May and September to November offer the clearest mountain views and most stable trekking conditions.' },
      { heading: 'Safety notes', body: 'Altitude acclimatization, flexible Lukla flight planning, licensed guides and realistic pacing are essential for Everest region trips.' }
    ],
    links: [
      { label: 'Everest Base Camp trek', href: '/tours/everest-base-camp-trek-13n-14d' },
      { label: 'Nepal helicopter tours', href: '/activities/helicopter-tours' },
      { label: 'Talk to Everest specialist', href: '/contact' }
    ]
  },
  'annapurna-region': {
    title: 'Annapurna Region Tour & Trekking Packages | Zeo Tourism',
    description: 'Plan Annapurna region tours and trekking packages with Zeo Tourism, including Annapurna Base Camp, Poon Hill, Pokhara and cultural village routes.',
    keywords: 'Annapurna region tour, Annapurna trekking packages, Annapurna Base Camp trek, Poon Hill trek, Nepal trekking packages',
    answer: 'Annapurna region tours combine Pokhara, Himalayan viewpoints, Gurung villages, rhododendron forests and trekking routes such as Annapurna Base Camp and Poon Hill. Zeo Tourism plans guide, permits, hotels and route pacing.',
    sections: [
      { heading: 'Popular routes', body: 'Annapurna Base Camp, Ghorepani-Poon Hill, Ghandruk village, Mardi Himal add-ons and Pokhara soft-adventure extensions.' },
      { heading: 'Best time', body: 'March to May brings rhododendron blooms, while September to November offers crisp skies and clear mountain views.' },
      { heading: 'Trip style', body: 'Choose gentle viewpoint tours, family-friendly village routes or multi-day trekking packages with guided logistics.' }
    ],
    links: [
      { label: 'Annapurna Base Camp trek', href: '/tours/annapurna-base-camp-trek-12-nights-13-days' },
      { label: 'Nepal tour packages', href: '/tours' },
      { label: 'Plan Annapurna trip', href: '/contact' }
    ]
  }
};

const DestinationDetail: React.FC = () => {
  const { destinationName } = useParams<{ destinationName: string }>();
  
  // Fetch destination data from regular destinations API (not content destinations)
  const { data: destinations } = useDestinations();
  const { data: allTours } = useTours();
  

  const normalizedDestinationName = destinationName?.toLowerCase();
  const destinationAliases: Record<string, string> = {
    'everest-region': 'everest',
    'annapurna-region': 'annapurna-'
  };
  const lookupDestinationName = normalizedDestinationName ? (destinationAliases[normalizedDestinationName] || normalizedDestinationName) : normalizedDestinationName;
  const isNepal = normalizedDestinationName === 'nepal';

  // Find the destination by name from the destinations list
  const destination = destinations?.find(dest => {
    const destName = dest.name.toLowerCase();
    const paramName = lookupDestinationName;
    
    return destName === paramName ||
           dest.href === `/destinations/${destinationName}` ||
           destName.includes(paramName || '') ||
           (paramName && destName.replace(/\s+/g, '-') === paramName);
  });
  
  const finalDestination = isNepal ? {
    id: 9999,
    name: 'Nepal',
    country: 'Nepal',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070',
    description: 'Explore the spectacular beauty, rich cultural heritage, and majestic peaks of Nepal, from the high Himalayas to lush valleys and historic temples.',
    href: '/destinations/nepal'
  } : normalizedDestinationName === 'everest-region' ? {
    id: 2,
    name: 'Everest Region',
    country: 'Nepal',
    image: '/uploads/destinations/everest/everest_1758268423519.webp',
    description: 'Explore the Everest region with Zeo Tourism, including Everest Base Camp, Namche Bazaar, Tengboche Monastery, Kala Patthar viewpoints, and guided Himalayan trekking packages.',
    href: '/destinations/everest-region',
    highlights: ['Everest Base Camp', 'Kala Patthar', 'Namche Bazaar', 'Tengboche Monastery']
  } : destination;

  // Get tours that are specifically assigned to this destination through relationships
  const relationshipTours = allTours?.filter(tour => {
    if (!finalDestination) return false;
    
    // Only show listed tours (not unlisted ones)
    if (tour.listed === false) return false;
    
    if (isNepal) {
      const primaryDest = destinations?.find(d => d.id === tour.primary_destination_id);
      const isNepalDest = primaryDest?.country?.toLowerCase() === 'nepal' || primaryDest?.type?.toLowerCase() === 'nepal';
      
      const hasNepalSecondary = tour.secondary_destination_ids?.some(id => {
        const d = destinations?.find(dest => dest.id === id);
        return d?.country?.toLowerCase() === 'nepal' || d?.type?.toLowerCase() === 'nepal';
      });

      const locationMatch = tour.location?.toLowerCase().includes('nepal');

      return isNepalDest || hasNepalSecondary || locationMatch;
    }
    
    // Check if this destination is the primary destination for the tour
    const isPrimaryDestination = (tour as any).primary_destination_id === finalDestination.id;
    
    // Check if this destination is in the secondary destinations for the tour
    const isSecondaryDestination = (tour as any).secondary_destination_ids?.includes(finalDestination.id);
    
    // Return tours that have this destination as primary or secondary
    return isPrimaryDestination || isSecondaryDestination;
  }) || [];

  // Fallback: Try location-based matching for legacy support (also filter for listed tours)
  const fallbackTours = allTours?.filter(tour => {
    if (isNepal) return false;
    if (!tour.location || !destinationName) return false;
    
    // Only show listed tours (not unlisted ones)
    if (tour.listed === false) return false;
    
    const tourLocation = tour.location.toLowerCase();
    const destName = lookupDestinationName || destinationName.toLowerCase();
    const destTitle = (finalDestination?.name || '').toLowerCase();
    
    // Match by various location patterns
    return tourLocation.includes(destName) ||
           tourLocation.includes(destTitle) ||
           (destName === 'annapurna' && (tourLocation.includes('annapurna') || tourLocation.includes('abc'))) ||
           (destName === 'everest' && (tourLocation.includes('everest') || tourLocation.includes('ebc'))) ||
           (destName === 'langtang' && tourLocation.includes('langtang')) ||
           (destName === 'chitwan' && tourLocation.includes('chitwan')) ||
           (destName === 'pokhara' && tourLocation.includes('pokhara')) ||
           (destName === 'kathmandu' && tourLocation.includes('kathmandu')) ||
           (destName === 'manaslu' && tourLocation.includes('manaslu'));
  }) || [];

  // Combine both relationship-based and location-based tours, removing duplicates
  const allRelatedTours = [...relationshipTours];
  
  // Add fallback tours that aren't already in the relationship tours
  fallbackTours.forEach(fallbackTour => {
    if (!allRelatedTours.find(tour => tour.id === fallbackTour.id)) {
      allRelatedTours.push(fallbackTour);
    }
  });

  const finalTours = allRelatedTours;
  const seoKey = normalizedDestinationName || '';
  const pageSeo = destinationSeoContent[seoKey];

  // Loading state
  if (!destinations || !allTours) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state - if destination not found
  if (!destination && !destinationName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message="Destination parameter is missing" />
      </div>
    );
  }


  if (!finalDestination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Destination not found</h1>
          <Link to="/destinations" className="text-blue-600 hover:underline">
            Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  const destinationSchema = createTouristDestinationSchema({
    name: finalDestination.name,
    description: finalDestination.description || '',
    country: (finalDestination as any).country || 'Nepal',
    image: finalDestination.image,
    url: `https://www.zeotourism.com/destinations/${destinationName}`,
    toursCount: finalTours.length
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: 'https://www.zeotourism.com' },
    { name: 'Destinations', url: 'https://www.zeotourism.com/destinations' },
    { name: finalDestination.name, url: `https://www.zeotourism.com/destinations/${destinationName}` }
  ]);

  return (
    <div className="destination-detail-page">
      <SEO
        title={pageSeo?.title || `${finalDestination.name} Tours & Travel | Zeo Tourism`}
        description={pageSeo?.description || finalDestination.description || `Explore ${finalDestination.name} with Zeo Tourism. Discover handpicked tours, trekking routes, and travel packages.`}
        keywords={pageSeo?.keywords || `${finalDestination.name} tours, ${finalDestination.name} trekking, ${finalDestination.country} travel, Nepal tours`}
        url={`https://www.zeotourism.com/destinations/${destinationName}`}
        structuredData={[destinationSchema, breadcrumbSchema]}
      />
      <PageHeader
        title={finalDestination.name}
        subtitle={`Discover the beauty and culture of ${finalDestination.name}`}
        breadcrumb={`Destinations > ${finalDestination.name}`}
        backgroundImage={finalDestination.image}
      />
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb
          items={[
            { name: 'Destinations', href: '/destinations' },
            { name: finalDestination.name }
          ]}
        />
      </div>


      {pageSeo && (
        <section className="py-14 bg-white">
          <div className="section-container">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-3">Quick Answer</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{pageSeo.title.replace(' | Zeo Tourism', '')}</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">{pageSeo.answer}</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {pageSeo.sections.map((section) => (
                    <div key={section.heading} className="border border-gray-200 p-5">
                      <h3 className="font-bold text-gray-900 mb-2">{section.heading}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="border border-gray-200 p-6 h-fit">
                <h3 className="font-bold text-gray-900 mb-4">Related planning links</h3>
                <div className="space-y-3">
                  {pageSeo.links.map((link) => (
                    <Link key={link.href} to={link.href} className="block text-primary hover:text-primary-dark font-medium">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* Available Tours */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Available Tours in {finalDestination.name}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated tours and experiences in this amazing destination
            </p>
          </div>
          
          {finalTours.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {finalTours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <TourCard tour={tour} destinations={destinations} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              type="tours"
              title={`No Tours Available in ${finalDestination.name}`}
              message={`We're currently working on adding amazing tours to ${finalDestination.name}. Check back soon or contact us to create a custom itinerary for this destination.`}
              actionText="Contact Us"
              onAction={() => window.location.href = '/contact'}
              className="py-12"
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default DestinationDetail;
