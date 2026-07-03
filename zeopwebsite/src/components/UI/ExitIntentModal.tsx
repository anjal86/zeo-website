import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { BookOpen, CheckCircle, X } from 'lucide-react';

const ExitIntentModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Check if the user is moving the mouse to the top of the browser window
      if (e.clientY <= 0) {
        const hasSeenPopup = localStorage.getItem('hasSeenExitPopup');
        
        // Only show if they haven't seen it, or if it's been more than 7 days
        const lastSeen = hasSeenPopup ? parseInt(hasSeenPopup) : 0;
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        
        if (!hasSeenPopup || Date.now() - lastSeen > sevenDaysMs) {
          setIsOpen(true);
          localStorage.setItem('hasSeenExitPopup', Date.now().toString());
        }
      }
    };

    // Delay attaching the listener so it doesn't trigger immediately on load
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'exit_popup', email })
      });
    } catch (_) { /* fail silently — don't block UX */ }
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset after animation
    setTimeout(() => {
      setIsSuccess(false);
      setEmail('');
    }, 300);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      className="max-w-lg overflow-hidden p-0"
      headerClassName="hidden" // Hide default header to make it flush
    >
      <div className="relative">
        {/* Custom close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 z-10 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Image Area */}
        <div className="bg-primary h-32 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-30" />
          <BookOpen className="w-16 h-16 text-white relative z-10" />
        </div>

        <div className="p-8 text-center">
          {!isSuccess ? (
            <>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                Wait! Before you go...
              </h2>
              <p className="text-gray-600 mb-6">
                Planning a trip to Nepal? Get our <strong className="text-gray-900">Ultimate 2024 Travel Guide PDF</strong> sent straight to your inbox. Packed with insider tips, packing lists, and hidden gems.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-center"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full uppercase tracking-wider text-sm font-bold"
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Sending Guide...' : 'Send Me The Free Guide'}
                </Button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-xs text-gray-400 hover:text-gray-600 underline mt-4"
                >
                  No thanks, I don't want free expert advice
                </button>
              </form>
            </>
          ) : (
            <div className="py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                Guide Sent Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Check your inbox for <strong>{email}</strong>. We've sent the Ultimate Nepal Travel Guide.
              </p>
              <Button onClick={handleClose} variant="ghost" className="w-full">
                Back to Browsing
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ExitIntentModal;
