"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import PageHeader from '../PageHeader/PageHeader';
import TourCard from '../Tours/TourCard';
import EmptyState from '../UI/EmptyState';
import type { Tour } from '../../services/api';
import SEO from '../seo/SEO';
import { createTouristAttractionSchema, createBreadcrumbSchema, createFAQSchema } from '../../utils/schema';

const activitySeoContent: Record<string, {
  title: string;
  description: string;
  keywords: string;
  answer: string;
  sections: Array<{ heading: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
}> = {
  'helicopter-tours': {
    title: 'Nepal Helicopter Tours, Everest & Kailash Aerial Darshan',
    description: 'Book Nepal helicopter tours with Zeo Tourism, including Everest helicopter tour, Muktinath helicopter tour, Annapurna flights and Kailash Aerial Darshan.',
    keywords: 'Nepal helicopter tours, Everest helicopter tour, Muktinath helicopter tour, Kailash Aerial Darshan, Annapurna helicopter tour',
    answer: 'Nepal helicopter tours help travelers see Everest, Annapurna, Muktinath and sacred Himalayan sites in less time. Zeo Tourism coordinates weather checks, permits, aircraft partners, airport transfers and backup planning for safe scenic flights.',
    sections: [
      { heading: 'Popular flights', body: 'Everest helicopter tour, Muktinath helicopter tour, Annapurna scenic flight, Gosaikunda flight and Kailash Aerial Darshan packages.' },
      { heading: 'Best time', body: 'March-May and September-November usually offer clearer skies. Winter flights can be crisp, but weather windows remain important.' },
      { heading: 'Safety planning', body: 'Flights depend on weather, landing rules, payload limits and permit requirements. Zeo Tourism confirms routing before departure.' }
    ],
    faqs: [
      { question: 'Which Nepal helicopter tours can Zeo Tourism arrange?', answer: 'Zeo Tourism can arrange Everest helicopter tour, Muktinath helicopter tour, Annapurna scenic flights, Gosaikunda flights and Kailash Aerial Darshan options based on season and aircraft availability.' },
      { question: 'Is Everest helicopter tour possible in one day?', answer: 'Yes, Everest helicopter tours usually operate as a same-day experience from Kathmandu when weather, flight permissions and landing conditions are suitable.' },
      { question: 'When is the best season for Nepal helicopter tours?', answer: 'March to May and September to November are usually best for clearer Himalayan visibility and more stable flight windows.' }
    ]
  }
};

const ActivityDetail: React.FC = () => {
  const { activityName } = useParams<{ activityName: string }>();
  
  // Activity data
  const activityData: Record<string, any> = {
    trekking: {
      name: 'Trekking',
      image: 'https://images.unsplash.com/photo-1523459178261-028135da2714?q=80&w=2068',
    },
    mountaineering: {
      name: 'Mountaineering',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070',
    },
    adventure: {
      name: 'Adventure Sports',
      image: 'https://images.unsplash.com/photo-1540882082344-b273b04e2c2f?q=80&w=2070',
    },
    'jungle-safari': {
      name: 'Jungle Safari',
      image: 'https://images.unsplash.com/photo-1558799401-1dcba79e728e?q=80&w=2072',
    },
    cultural: {
      name: 'Cultural Tours',
      image: 'https://images.unsplash.com/photo-1565537714828-9bbde8c42c3f?q=80&w=2070',
    },
    pilgrimage: {
      name: 'Pilgrimage',
      image: 'https://images.unsplash.com/photo-1601999109497-ba1c7b6e0cfb?q=80&w=2070',
    },
    'helicopter-tours': {
      name: 'Helicopter Tours',
      image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070',
      description: 'Book Nepal helicopter tours for Everest, Annapurna, Muktinath, Gosaikunda, and Kailash Aerial Darshan with Zeo Tourism. Flights are planned with weather checks, permits, safety briefing, and expert ground coordination.'
    },
    meditation: {
      name: 'Meditation & Healing',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070',
    },
    volunteering: {
      name: 'Volunteering',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070',
    }
  };

  // Sample tours for each activity
  const activityTours: Record<string, Tour[]> = {
    trekking: [
      {
        id: 101,
        title: 'Everest Base Camp Trek',
        category: 'Trekking',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070',
        price: 1899,
        duration: '16 days',
        group_size: '2-10',
        difficulty: 'Challenging',
        rating: 4.9,
        reviews: 324,
        highlights: ['Everest Base Camp', 'Kala Patthar', 'Sherpa Culture'],
        location: 'Everest, Nepal',
        description: 'Trek to the base of the world\'s highest mountain through Sherpa villages.',
        inclusions: ['Accommodation', 'Meals', 'Guide', 'Permits'],
        best_time: 'Oct-Dec, Mar-May'
      }
    ],
    mountaineering: [
      {
        id: 102,
        title: 'Island Peak Climbing',
        category: 'Mountaineering',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070',
        price: 2499,
        duration: '19 days',
        group_size: '2-6',
        difficulty: 'Challenging',
        rating: 4.7,
        reviews: 89,
        highlights: ['Island Peak Summit', 'Technical Climbing', 'Everest Views'],
        location: 'Everest, Nepal',
        description: 'Technical mountaineering expedition to Island Peak with stunning Himalayan views.',
        inclusions: ['Accommodation', 'Meals', 'Guide', 'Equipment', 'Permits'],
        best_time: 'Oct-Dec, Mar-May'
      }
    ],
    adventure: [
      {
        id: 103,
        title: 'Pokhara Adventure Package',
        category: 'Adventure',
        image: 'https://images.unsplash.com/photo-1540882082344-b273b04e2c2f?q=80&w=2070',
        price: 599,
        duration: '5 days',
        group_size: '2-12',
        difficulty: 'Moderate',
        rating: 4.8,
        reviews: 156,
        highlights: ['Paragliding', 'White Water Rafting', 'Bungee Jump'],
        location: 'Pokhara, Nepal',
        description: 'Ultimate adventure package with paragliding, rafting, and extreme sports.',
        inclusions: ['Accommodation', 'Activities', 'Guide', 'Equipment'],
        best_time: 'Oct-Apr'
      }
    ],
    'jungle-safari': [
      {
        id: 104,
        title: 'Chitwan Jungle Safari',
        category: 'Wildlife',
        image: 'https://images.unsplash.com/photo-1558799401-1dcba79e728e?q=80&w=2072',
        price: 399,
        duration: '3 days',
        group_size: '2-12',
        difficulty: 'Easy',
        rating: 4.6,
        reviews: 178,
        highlights: ['Rhino Spotting', 'Elephant Safari', 'Bird Watching'],
        location: 'Chitwan, Nepal',
        description: 'Wildlife safari adventure in Nepal\'s premier national park.',
        inclusions: ['Accommodation', 'Meals', 'Safari Activities', 'Guide'],
        best_time: 'Oct-Mar'
      }
    ],
    cultural: [
      {
        id: 105,
        title: 'Kathmandu Heritage Tour',
        category: 'Cultural',
        image: 'https://images.unsplash.com/photo-1565537714828-9bbde8c42c3f?q=80&w=2070',
        price: 199,
        duration: '2 days',
        group_size: '2-20',
        difficulty: 'Easy',
        rating: 4.5,
        reviews: 234,
        highlights: ['Durbar Square', 'Swayambhunath', 'Pashupatinath'],
        location: 'Kathmandu, Nepal',
        description: 'Discover the rich cultural heritage of Nepal\'s capital city.',
        inclusions: ['Guide', 'Entrance Fees', 'Transportation'],
        best_time: 'Year Round'
      }
    ],
    pilgrimage: [
      {
        id: 106,
        title: 'Kailash Mansarovar Pilgrimage',
        category: 'Pilgrimage',
        image: 'https://images.unsplash.com/photo-1601999109497-ba1c7b6e0cfb?q=80&w=2070',
        price: 2999,
        duration: '15 days',
        group_size: '2-15',
        difficulty: 'Moderate',
        rating: 4.9,
        reviews: 67,
        highlights: ['Mount Kailash', 'Lake Mansarovar', 'Sacred Kora'],
        location: 'Tibet',
        description: 'Sacred pilgrimage to the holy mountain and pristine lake.',
        inclusions: ['Accommodation', 'Meals', 'Guide', 'Permits', 'Transportation'],
        best_time: 'May-Sep'
      }
    ],
    'helicopter-tours': [
      {
        id: 401,
        title: 'Kailash Aerial Darshan',
        slug: 'kailash-aerial-darshan-02-nights-03-days',
        category: 'Helicopter Tours',
        image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070',
        price: 999,
        duration: '3 days',
        group_size: '2-12',
        difficulty: 'Easy',
        rating: 4.9,
        reviews: 42,
        highlights: ['Aerial Himalayan views', 'Short pilgrimage format', 'Weather-aware flight planning'],
        location: 'Nepal Himalayas',
        description: 'Short spiritual aerial darshan experience for travelers who want Himalayan views with less trekking.',
        inclusions: ['Flight coordination', 'Hotel', 'Airport transfers', 'Guide support'],
        best_time: 'Mar-May, Sep-Nov'
      },
      {
        id: 402,
        title: 'Everest Helicopter Tour',
        category: 'Helicopter Tours',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070',
        price: 1299,
        duration: '1 day',
        group_size: '2-5',
        difficulty: 'Easy',
        rating: 4.8,
        reviews: 76,
        highlights: ['Everest region flight', 'Landing viewpoint', 'Kathmandu departure'],
        location: 'Everest Region, Nepal',
        description: 'Scenic Everest region helicopter tour from Kathmandu with expert ground handling and weather-based scheduling.',
        inclusions: ['Helicopter flight', 'Airport transfers', 'Permit coordination'],
        best_time: 'Mar-May, Sep-Nov'
      }
    ],
    meditation: [
      {
        id: 107,
        title: 'Himalayan Meditation Retreat',
        category: 'Wellness',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070',
        price: 799,
        duration: '7 days',
        group_size: '2-10',
        difficulty: 'Easy',
        rating: 4.8,
        reviews: 92,
        highlights: ['Daily Meditation', 'Yoga Sessions', 'Mountain Views'],
        location: 'Pokhara, Nepal',
        description: 'Peaceful meditation and wellness retreat in the Himalayas.',
        inclusions: ['Accommodation', 'Meals', 'Meditation Sessions', 'Yoga'],
        best_time: 'Year Round'
      }
    ],
    volunteering: [
      {
        id: 108,
        title: 'Community Development Project',
        category: 'Volunteering',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070',
        price: 499,
        duration: '10 days',
        group_size: '2-8',
        difficulty: 'Easy',
        rating: 4.7,
        reviews: 45,
        highlights: ['School Building', 'Community Work', 'Cultural Exchange'],
        location: 'Rural Nepal',
        description: 'Meaningful volunteering experience helping local communities.',
        inclusions: ['Accommodation', 'Meals', 'Project Materials', 'Guide'],
        best_time: 'Oct-Apr'
      }
    ]
  };

  const activity = activityName ? activityData[activityName] : null;
  const tours = activityName ? activityTours[activityName] || [] : [];
  const pageSeo = activityName ? activitySeoContent[activityName] : undefined;

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Activity not found</h1>
        </div>
      </div>
    );
  }

  const activityDescription = pageSeo?.description || activity.description || `Explore the best ${activity.name.toLowerCase()} tours and packages with Zeo Tourism. Custom itineraries, experienced guides, and unforgettable experiences.`;

  const attractionSchema = createTouristAttractionSchema({
    name: activity.name,
    description: activityDescription,
    image: activity.image,
    url: `https://zeotourism.com/activities/${activityName}`,
    toursCount: tours.length
  });

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: 'https://zeotourism.com' },
    { name: 'Activities', url: 'https://zeotourism.com/activities' },
    { name: activity.name, url: `https://zeotourism.com/activities/${activityName}` }
  ]);

  const structuredData = pageSeo?.faqs?.length
    ? [attractionSchema, createFAQSchema(pageSeo.faqs), breadcrumbSchema]
    : [attractionSchema, breadcrumbSchema];

  return (
    <div className="activity-detail-page">
      <SEO
        title={pageSeo?.title || `${activity.name} Activities & Tours in Nepal`}
        description={activityDescription}
        keywords={pageSeo?.keywords || `Nepal ${activity.name.toLowerCase()}, ${activity.name.toLowerCase()} tours, ${activity.name.toLowerCase()} packages, Zeo Tourism`}
        url={`https://zeotourism.com/activities/${activityName}`}
        image={activity.image}
        structuredData={structuredData}
      />
      <PageHeader
        title={activity.name}
        subtitle={`Discover amazing ${activity.name.toLowerCase()} experiences`}
        breadcrumb={`Activities > ${activity.name}`}
        backgroundImage={activity.image}
      />

      {pageSeo && (
        <section className="py-14 bg-white">
          <div className="section-container">
            <div className="max-w-4xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-3">Quick Answer</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{pageSeo.title}</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">{pageSeo.answer}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {pageSeo.sections.map((section) => (
                <div key={section.heading} className="border border-gray-200 p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{section.heading}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {pageSeo.faqs.map((faq) => (
                <div key={faq.question} className="bg-gray-50 p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Available Tours */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="section-container">
          {tours.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {tours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <TourCard tour={tour} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              type="tours"
              title={`No ${activity.name} Tours Available`}
              message={`We're currently working on adding exciting ${activity.name.toLowerCase()} experiences. Check back soon or contact us to create a custom ${activity.name.toLowerCase()} adventure.`}
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

export default ActivityDetail;
