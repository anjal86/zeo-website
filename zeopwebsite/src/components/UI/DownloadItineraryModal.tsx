import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { FileDown, CheckCircle, BookOpen } from 'lucide-react';

interface DownloadItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourTitle: string;
}

const DownloadItineraryModal: React.FC<DownloadItineraryModalProps> = ({
  isOpen,
  onClose,
  tourTitle
}) => {
  const [name, setName] = useState('');
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
          type: 'pdf_download',
          name,
          email,
          meta: { tour: tourTitle }
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
      setName('');
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
              <div className="w-14 h-14 bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileDown className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 leading-tight">
                  Download Full Itinerary
                </h2>
                <p className="text-sm text-gray-500 mt-1">PDF brochure with day-by-day details</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 p-4 mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm text-gray-700 font-medium leading-tight">
                  "{tourTitle}" — Detailed Itinerary PDF
                </p>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600 pl-8">
                <li>✓ Complete day-by-day itinerary</li>
                <li>✓ Inclusions & exclusions</li>
                <li>✓ Packing list & preparation tips</li>
                <li>✓ Pricing & booking details</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-gray-400">
                We'll send the PDF to your inbox. We respect your privacy and won't spam you.
              </p>
              <Button
                type="submit"
                variant="primary"
                className="w-full uppercase tracking-wider text-sm font-bold"
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Preparing PDF...' : 'Download Free PDF'}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">PDF Sent!</h2>
            <p className="text-gray-600 mb-6">
              We've sent the full itinerary PDF to <strong className="text-gray-900">{email}</strong>.
              Check your inbox in the next few minutes.
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

export default DownloadItineraryModal;
