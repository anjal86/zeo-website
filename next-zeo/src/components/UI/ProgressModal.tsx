"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface ProgressModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  progress: number; // 0-100
  status: 'loading' | 'success' | 'error';
  onClose?: () => void;
  showCloseButton?: boolean;
  actionButtons?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  title,
  message,
  progress,
  status,
  onClose,
  showCloseButton = false,
  actionButtons = []
}) => {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <LoadingSpinner size="lg" className="text-primary" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      default:
        return <LoadingSpinner size="lg" className="text-primary" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-600';
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-none shadow-2xl max-w-md w-full p-8"
      >
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Progress Bar */}
        {status === 'loading' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className={`h-full ${getStatusColor()} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Animated Steps */}
        {status === 'loading' && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${progress >= 25 ? 'bg-green-500' : 'bg-gray-300'} transition-colors`} />
              <span className={`text-sm ${progress >= 25 ? 'text-green-700' : 'text-gray-500'}`}>
                Validating tour data...
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${progress >= 50 ? 'bg-green-500' : 'bg-gray-300'} transition-colors`} />
              <span className={`text-sm ${progress >= 50 ? 'text-green-700' : 'text-gray-500'}`}>
                Updating tour information...
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${progress >= 75 ? 'bg-green-500' : 'bg-gray-300'} transition-colors`} />
              <span className={`text-sm ${progress >= 75 ? 'text-green-700' : 'text-gray-500'}`}>
                Generating tour details...
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gray-300'} transition-colors`} />
              <span className={`text-sm ${progress >= 100 ? 'text-green-700' : 'text-gray-500'}`}>
                Finalizing changes...
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(showCloseButton || actionButtons.length > 0) && (
          <div className="flex justify-center gap-3">
            {actionButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className={`px-6 py-2 rounded-none transition-colors ${button.variant === 'primary'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
              >
                {button.label}
              </button>
            ))}
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-6 py-2 rounded-none hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProgressModal;