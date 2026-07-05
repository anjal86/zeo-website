"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '../PageHeader/PageHeader';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { useActivities } from '../../hooks/useApi';
import SEO from '../seo/SEO';
import { createBreadcrumbSchema } from '../../utils/schema';

const ActivitiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'adventure' | 'cultural'>('adventure');

  // Use API hook to fetch activities
  const { data: activities, loading, error } = useActivities();

  // Filter activities based on name since SQLite data doesn't have 'type' field
  const filteredActivities = activities?.filter(activity => {
    if (activeTab === 'adventure') {
      // Adventure activities: Trekking, Mountaineering, Adventure Sports, Jungle Safari
      return ['Trekking', 'Mountaineering', 'Adventure Sports', 'Jungle Safari'].includes(activity.name);
    } else {
      // Cultural activities: Cultural Tours, Pilgrimage, Meditation & Healing, Volunteering
      return ['Cultural Tours', 'Pilgrimage', 'Meditation & Healing', 'Volunteering'].includes(activity.name);
    }
  }) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      <SEO
        title="Nepal Travel Activities - Adventure & Culture | Zeo Tourism"
        description="Experience the best of Nepal with our curated activities. From heart-pounding adventure sports and trekking to serene cultural and spiritual tours."
        keywords="nepal activities, trekking nepal, adventure sports, cultural tours nepal, spiritual tourism"
        url="https://www.zeotourism.com/activities"
        structuredData={[
          createBreadcrumbSchema([
            { name: "Home", url: "https://www.zeotourism.com" },
            { name: "Activities", url: "https://www.zeotourism.com/activities" }
          ])
        ]}
      />
      <div className="activities-page">
        <PageHeader
          title="Activities"
          subtitle="Discover your next adventure"
          breadcrumb="Activities"
          backgroundImage="https://images.unsplash.com/photo-1540882082344-b273b04e2c2f?q=80&w=2070"
        />

        <section className="py-20 bg-white">
          <div className="section-container">
            {/* Simple Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="flex justify-center mb-12">
                <div className="bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => setActiveTab('adventure')}
                    className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'adventure'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    Adventure
                  </button>
                  <button
                    onClick={() => setActiveTab('cultural')}
                    className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'cultural'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    Cultural
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
              <LoadingSpinner className="py-20" size="lg" />
            )}

            {/* Error State */}
            {error && (
              <ErrorMessage
                message={`Failed to load activities: ${error}`}
                className="py-20"
              />
            )}

            {/* Activities Grid */}
            {!loading && !error && (
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    className="group cursor-pointer"
                  >
                    <Link href={`/tours?activity=${activity.name}`} className="block">
                      <div className="relative rounded-2xl overflow-hidden aspect-[3/2] shadow-lg hover:shadow-2xl transition-all duration-500">
                        <img
                          src={activity.image}
                          alt={`${activity.name} activity in Nepal`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Tour Count Badge */}
                        {activity.tourCount && (
                          <div className="absolute top-6 right-6">
                            <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                              {activity.tourCount}
                            </span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                          <h3 className="text-2xl font-bold">
                            {activity.name}
                          </h3>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default ActivitiesPage;