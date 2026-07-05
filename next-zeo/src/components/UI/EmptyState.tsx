import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Phone, Mail } from 'lucide-react';

interface EmptyStateProps {
  type: 'tours' | 'destinations' | 'activities';
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  actionText,
  onAction,
  className = ""
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'tours':
        return {
          icon: <Calendar className="w-16 h-16 text-gray-400" />,
          title: title || 'No Tours Available',
          message: message || 'We currently don\'t have any tours available for this destination or activity. But don\'t worry, we\'re always adding new adventures!',
          actionText: actionText || 'Contact Us for Custom Tours'
        };
      case 'destinations':
        return {
          icon: <MapPin className="w-16 h-16 text-gray-400" />,
          title: title || 'No Destinations Found',
          message: message || 'We couldn\'t find any destinations matching your criteria. Try adjusting your search or explore our popular destinations.',
          actionText: actionText || 'View All Destinations'
        };
      case 'activities':
        return {
          icon: <Calendar className="w-16 h-16 text-gray-400" />,
          title: title || 'No Activities Available',
          message: message || 'We don\'t have any activities available for this destination yet. Contact us to learn about upcoming activities or custom experiences.',
          actionText: actionText || 'Contact Us'
        };
      default:
        return {
          icon: <Calendar className="w-16 h-16 text-gray-400" />,
          title: 'Nothing Found',
          message: 'We couldn\'t find what you\'re looking for.',
          actionText: 'Go Back'
        };
    }
  };

  const content = getDefaultContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`text-center py-16 px-6 ${className}`}
    >
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {content.icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {content.title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {content.message}
        </p>

        {/* Action Button */}
        {(onAction || type === 'tours') && (
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAction || (() => window.location.href = '/contact')}
              className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              {content.actionText}
            </motion.button>

            {type === 'tours' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-none">
                <h4 className="font-semibold text-gray-900 mb-2">Get in Touch</h4>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>+977 985-123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>info@zeotourism.com</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We can create custom tours tailored to your preferences
                </p>
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        {type === 'tours' && (
          <div className="mt-8 text-left">
            <h4 className="font-semibold text-gray-900 mb-3">You might also like:</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Explore our <a href="/tours" className="text-primary hover:underline">featured tours</a></li>
              <li>• Browse tours by <a href="/destinations" className="text-primary hover:underline">destination</a></li>
              <li>• Discover tours by <a href="/activities" className="text-primary hover:underline">activity type</a></li>
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;