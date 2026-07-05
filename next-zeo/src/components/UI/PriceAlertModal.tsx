"use client";

import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { Bell, CheckCircle, TrendingDown } from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourTitle: string;
  currentPrice?: number | null;
}

const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  tourTitle,
  currentPrice
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'price_alert',
          email,
          meta: { tour: tourTitle, currentPrice }
        })
      });
    } catch (_) { /* fail silently */ }
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setEmail('');
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-md"
    >
      <div className="p-8">
        {!isSuccess ? (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 leading-tight">
                  Price Drop Alert
                </h2>
                <p className="text-sm text-gray-500 mt-1">Be the first to know when price drops</p>
              </div>
            </div>

            <div className="bg-secondary/5 border border-secondary/10 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Watching</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{tourTitle}</p>
                </div>
                {currentPrice && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Current Price</p>
                    <p className="text-xl font-bold text-gray-900">${currentPrice.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-secondary/10">
                <TrendingDown className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  We'll notify you instantly if the price drops or a promotional discount becomes available.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-gray-400">
                You can unsubscribe at any time. We only send relevant price alerts.
              </p>
              <Button
                type="submit"
                variant="secondary"
                className="w-full uppercase tracking-wider text-sm font-bold"
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Setting Up Alert...' : '🔔 Alert Me of Price Drops'}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">Alert Set!</h2>
            <p className="text-gray-600 mb-6">
              We'll email <strong className="text-gray-900">{email}</strong> the moment the price drops on{' '}
              <strong className="text-gray-900">{tourTitle}</strong>.
            </p>
            <Button onClick={handleClose} variant="ghost" className="w-full">
              Back to Tour
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PriceAlertModal;
