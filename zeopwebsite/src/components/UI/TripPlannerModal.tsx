import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { 
  Compass, Mountain, Tent, Building2, 
  User, Users, Baby, UsersRound,
  CalendarDays, Calendar, CalendarClock, CalendarCheck,
  Activity, HeartPulse, Zap, Flame,
  CheckCircle, ArrowRight, ArrowLeft
} from 'lucide-react';

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const DRAFT_KEY = 'zeo_trip_planner_draft';

const TripPlannerModal: React.FC<TripPlannerModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [formData, setFormData] = useState({
    experience: '',
    companions: '',
    duration: '',
    fitness: '',
    name: '',
    email: '',
  });

  // Restore draft from localStorage when component mounts
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const { step: savedStep, formData: savedData } = JSON.parse(saved);
        // Only restore if they had made meaningful progress (past step 1)
        if (savedStep > 1 && savedData.experience) {
          setHasDraft(true);
        }
      } catch (_) { /* ignore */ }
    }
  }, []);

  // Open modal with restored draft if user chooses to resume
  const handleResumeDraft = () => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const { step: savedStep, formData: savedData } = JSON.parse(saved);
        setStep(savedStep);
        setFormData(savedData);
        setHasDraft(false);
      } catch (_) { /* ignore */ }
    }
  };

  const handleStartFresh = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  // Save progress to localStorage whenever formData or step changes
  useEffect(() => {
    if (isOpen && (step > 1 || formData.experience)) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, formData }));
    }
  }, [step, formData, isOpen]);

  const handleNext = () => {
    if (step < 6) setStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as Step);
  };

  const handleSelect = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    handleNext();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'trip_planner',
          name: formData.name,
          email: formData.email,
          meta: {
            experience: formData.experience,
            companions: formData.companions,
            duration: formData.duration,
            fitness: formData.fitness
          }
        })
      });
    } catch (_) { /* fail silently */ }
    setIsSubmitting(false);
    setStep(6);
    // Clear draft on successful submission
    localStorage.removeItem(DRAFT_KEY);
  };

  const resetAndClose = () => {
    onClose();
    // Delay reset slightly to allow exit animation to complete smoothly
    setTimeout(() => {
      setStep(1);
      setHasDraft(false);
      setFormData({
        experience: '',
        companions: '',
        duration: '',
        fitness: '',
        name: '',
        email: '',
      });
      // Clear draft from localStorage on successful completion or explicit close
      localStorage.removeItem(DRAFT_KEY);
    }, 300);
  };

  const renderStepProgressBar = () => {
    if (step >= 5) return null;
    return (
      <div className="w-full bg-gray-100 h-1 mb-6">
        <div 
          className="bg-primary h-1 transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>
    );
  };

  // Selection Card Component
  const SelectCard = ({ 
    icon: Icon, 
    title, 
    value, 
    field 
  }: { 
    icon: React.ElementType, 
    title: string, 
    value: string, 
    field: keyof typeof formData 
  }) => (
    <button
      onClick={() => handleSelect(field, value)}
      className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all duration-200 group w-full aspect-square"
    >
      <Icon className="w-10 h-10 text-gray-400 group-hover:text-primary mb-4 transition-colors" />
      <span className="font-bold text-gray-900 group-hover:text-primary transition-colors text-sm">{title}</span>
    </button>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={resetAndClose}
      className="max-w-2xl"
    >
      <div className="p-6 md:p-10">

        {/* Abandoned Form Recovery Banner */}
        {hasDraft && step === 1 && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">You have an unfinished trip plan!</p>
              <p className="text-gray-600 text-xs mt-0.5">Would you like to continue where you left off?</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleResumeDraft}
                className="bg-primary text-white text-xs font-bold px-4 py-2 uppercase tracking-wider hover:bg-primary-dark transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleStartFresh}
                className="text-gray-500 hover:text-gray-700 text-xs font-bold px-2 py-2 uppercase tracking-wider transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
        
        {step < 5 && (
          <div className="flex items-center mb-6">
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="text-sm font-bold text-secondary uppercase tracking-widest ml-auto">
              Step {step} of 4
            </div>
          </div>
        )}

        {renderStepProgressBar()}

        {/* Step 1: Experience */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">What kind of experience?</h2>
            <p className="text-gray-500 mb-8">Select the style of travel that best fits your dream journey.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SelectCard icon={Mountain} title="Trekking" value="trekking" field="experience" />
              <SelectCard icon={Building2} title="Cultural" value="cultural" field="experience" />
              <SelectCard icon={Tent} title="Wildlife" value="wildlife" field="experience" />
              <SelectCard icon={Compass} title="Spiritual" value="spiritual" field="experience" />
            </div>
          </div>
        )}

        {/* Step 2: Companions */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Who's traveling?</h2>
            <p className="text-gray-500 mb-8">Tell us who will be joining you on this adventure.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SelectCard icon={User} title="Solo" value="solo" field="companions" />
              <SelectCard icon={Users} title="Couple" value="couple" field="companions" />
              <SelectCard icon={Baby} title="Family" value="family" field="companions" />
              <SelectCard icon={UsersRound} title="Group" value="group" field="companions" />
            </div>
          </div>
        )}

        {/* Step 3: Duration */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">How long?</h2>
            <p className="text-gray-500 mb-8">Select your ideal trip duration.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SelectCard icon={CalendarDays} title="< 1 Week" value="short" field="duration" />
              <SelectCard icon={Calendar} title="1-2 Weeks" value="medium" field="duration" />
              <SelectCard icon={CalendarClock} title="2-3 Weeks" value="long" field="duration" />
              <SelectCard icon={CalendarCheck} title="3+ Weeks" value="extended" field="duration" />
            </div>
          </div>
        )}

        {/* Step 4: Fitness */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Fitness level?</h2>
            <p className="text-gray-500 mb-8">Help us match you with the right intensity level.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SelectCard icon={Activity} title="Easy" value="easy" field="fitness" />
              <SelectCard icon={HeartPulse} title="Moderate" value="moderate" field="fitness" />
              <SelectCard icon={Zap} title="Active" value="active" field="fitness" />
              <SelectCard icon={Flame} title="Challenging" value="challenging" field="fitness" />
            </div>
          </div>
        )}

        {/* Step 5: Lead Capture */}
        {step === 5 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto text-center py-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Compass className="w-10 h-10 text-primary animate-spin-slow" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">We found your perfect match!</h2>
            <p className="text-gray-600 mb-8">
              Based on your answers, we've curated the top 3 itineraries for your dream Nepal trip. Enter your details to unlock them.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <Input
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full mt-4"
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Analyzing Matches...' : (
                  <span className="flex items-center justify-center">
                    Unlock My Itineraries <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Step 6: Success */}
        {step === 6 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">You're all set!</h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              We've sent your personalized top 3 itineraries to <strong>{formData.email}</strong>. Our travel experts will be in touch shortly to offer a free consultation.
            </p>
            <Button
              onClick={resetAndClose}
              variant="ghost"
            >
              Back to Website
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TripPlannerModal;
