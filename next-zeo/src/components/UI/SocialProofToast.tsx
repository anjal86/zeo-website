"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plane, Flame, MapPinned, X } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    label: 'Trip Planning',
    headline: 'Custom Nepal Itineraries',
    subtext: 'Kailash, Muktinath, Kathmandu, Everest and Annapurna',
    icon: MapPinned,
    iconColor: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  {
    id: 2,
    label: 'Safety Certified',
    headline: 'Fully Licensed & Insured',
    subtext: 'Member of Nepal Tourism Board & TAAN',
    icon: Shield,
    iconColor: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  {
    id: 3,
    label: 'Season Note',
    headline: 'Plan Peak Months Early',
    subtext: 'Spring and autumn Himalayan departures need backup dates',
    icon: Flame,
    iconColor: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200'
  },
  {
    id: 4,
    label: 'Flight Support',
    headline: 'Helicopter Tours Available',
    subtext: 'Everest, Muktinath and Kailash Aerial Darshan planning',
    icon: Plane,
    iconColor: 'text-primary',
    bg: 'bg-primary/5',
    border: 'border-primary/20'
  }
];

const SocialProofToast: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start the cycle after 10 seconds
    const initialDelay = setTimeout(() => {
      showNextNotification();
    }, 10000);

    return () => clearTimeout(initialDelay);
  }, []);

  const showNextNotification = () => {
    // Pick a random notification
    const nextIndex = Math.floor(Math.random() * NOTIFICATIONS.length);
    setCurrentIndex(nextIndex);
    setIsVisible(true);

    // Hide after 6 seconds
    setTimeout(() => {
      setIsVisible(false);
      
      // Schedule next notification between 20-45 seconds
      const nextDelay = Math.floor(Math.random() * 25000) + 20000;
      setTimeout(() => {
        showNextNotification();
      }, nextDelay);
      
    }, 6000);
  };

  const notification = currentIndex >= 0 ? NOTIFICATIONS[currentIndex] : null;

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden md:block pointer-events-none">
      <AnimatePresence>
        {isVisible && notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`bg-white shadow-2xl border p-4 max-w-xs pointer-events-auto flex items-start gap-4 ${notification.border}`}
          >
            <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${notification.bg}`}>
              <notification.icon className={`w-5 h-5 ${notification.iconColor}`} />
            </div>
            
            <div className="flex-1 pr-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                {notification.label}
              </p>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {notification.headline}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">
                {notification.subtext}
              </p>
            </div>

            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-300 hover:text-gray-500 p-1 -m-1 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialProofToast;
