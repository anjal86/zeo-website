import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  MessageCircle,
  Mountain,
  Shield,
  Target,
  ArrowRight,
  Phone,
  Mail,
  Clock3
} from 'lucide-react';
import SEO from '../components/SEO/SEO';
import Hero from '../components/Hero/Hero';
import FeaturedDestinations from '../components/FeaturedDestinations/FeaturedDestinations';
import TestimonialsSlider from '../components/Testimonials/TestimonialsSlider';
import { useCountUp } from '../hooks/useCountUp';
import { useContact, useTestimonials } from '../hooks/useApi';
import { createOrganizationSchema, createWebSiteSchema, createTravelAgencySchema } from '../utils/schema';

// Animated Counter Component
const AnimatedCounter: React.FC<{
  end: number;
  suffix?: string;
  label: string;
  duration?: number;
  dark?: boolean;
}> = ({ end, suffix = '', label, duration = 2500, dark = false }) => {
  const { count, ref } = useCountUp({
    end,
    suffix,
    duration,
    start: 0
  });

  return (
    <div ref={ref} className="group text-center">
      <div className={`text-2xl sm:text-3xl font-bold mb-1 transition-colors duration-300 ${dark ? 'text-white group-hover:text-primary' : 'text-gray-900 group-hover:text-primary'}`}>
        {count}
      </div>
      <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
    </div>
  );
};

const Home: React.FC = () => {
  const { data: contactInfo } = useContact();
  const { data: testimonials } = useTestimonials();

  // Compute live aggregate rating from real testimonial data
  const liveRating = useMemo(() => {
    const approved = (testimonials || []).filter((t: any) => t.is_approved && t.rating > 0);
    if (!approved.length) return undefined;
    const avg = approved.reduce((sum: number, t: any) => sum + t.rating, 0) / approved.length;
    return { ratingValue: Math.round(avg * 10) / 10, reviewCount: approved.length };
  }, [testimonials]);

  // Memoize structured data to prevent unnecessary SEO component updates
  const structuredData = useMemo(() => [
    createOrganizationSchema(),
    createWebSiteSchema(),
    createTravelAgencySchema(liveRating)
  ], [liveRating]);

  return (
    <>
      <SEO
        title="Kailash Mansarovar Yatra & Nepal Tour Packages | Zeo Tourism"
        description="Plan Kailash Mansarovar Yatra, Nepal tours, Kathmandu sightseeing, Muktinath, Everest and Annapurna journeys with Zeo Tourism, a trusted Nepal-based travel agency."
        keywords="Kailash Mansarovar Yatra, Kailash Mansarovar Yatra from Nepal, Nepal tour packages, Kathmandu sightseeing tour, Muktinath tour package, Everest region tour, Annapurna region tour, Nepal travel agency, Zeo Tourism Nepal"
        url="https://www.zeotourism.com"
        type="website"
        structuredData={structuredData}
        langUrls={{
          'en': 'https://www.zeotourism.com',
          'en-IN': 'https://www.zeotourism.com',
          'hi': 'https://www.zeotourism.com',
          'ne': 'https://www.zeotourism.com',
          'x-default': 'https://www.zeotourism.com'
        }}
      />

      <div className="home-page">
        <Hero />
        <h1 className="sr-only">Kailash Mansarovar Yatra & Nepal Tour Packages</h1>

        {/* Services Section - Editorial Design */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-16 md:py-24 bg-gray-950 relative overflow-hidden"
        >
          <div className="container-xl relative z-10">
            <div className="mb-12">
              <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
                01 — Our Expertise
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white max-w-2xl leading-tight">
                Curating Extraordinary <span className="text-primary italic font-light">Journeys</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-b border-gray-800">
              <div className="group relative p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-800 hover:bg-gray-900 transition-colors duration-500 overflow-hidden">
                <span className="absolute -bottom-6 -right-2 text-[8rem] font-serif font-bold text-gray-800/20 group-hover:text-primary/10 transition-colors duration-700 pointer-events-none select-none">
                  01
                </span>
                <div className="relative z-10 h-full flex flex-col">
                  <MapPin className="w-6 h-6 text-primary mb-6" />
                  <h3 className="text-xl font-serif font-bold text-white mb-3">Explore Destinations</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed flex-grow text-sm">
                    Discover breathtaking locations from the towering peaks of Everest to the sacred valleys of ancient Nepal.
                  </p>
                  <Link to="/destinations" className="inline-flex items-center text-white hover:text-primary transition-colors text-xs uppercase tracking-wider font-semibold group-hover:gap-3 gap-1.5 duration-300">
                    View Destinations <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="group relative p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-800 hover:bg-gray-900 transition-colors duration-500 overflow-hidden">
                <span className="absolute -bottom-6 -right-2 text-[8rem] font-serif font-bold text-gray-800/20 group-hover:text-primary/10 transition-colors duration-700 pointer-events-none select-none">
                  02
                </span>
                <div className="relative z-10 h-full flex flex-col">
                  <Clock className="w-6 h-6 text-primary mb-6" />
                  <h3 className="text-xl font-serif font-bold text-white mb-3">Book Tours</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed flex-grow text-sm">
                    Choose from expertly crafted tours and adventures designed to create memories that last a lifetime.
                  </p>
                  <Link to="/tours" className="inline-flex items-center text-white hover:text-primary transition-colors text-xs uppercase tracking-wider font-semibold group-hover:gap-3 gap-1.5 duration-300">
                    Browse Tours <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="group relative p-6 md:p-8 hover:bg-gray-900 transition-colors duration-500 overflow-hidden">
                <span className="absolute -bottom-6 -right-2 text-[8rem] font-serif font-bold text-gray-800/20 group-hover:text-primary/10 transition-colors duration-700 pointer-events-none select-none">
                  03
                </span>
                <div className="relative z-10 h-full flex flex-col">
                  <MessageCircle className="w-6 h-6 text-primary mb-6" />
                  <h3 className="text-xl font-serif font-bold text-white mb-3">Expert Consultation</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed flex-grow text-sm">
                    Connect with our travel experts for personalized planning and insider knowledge of Nepal's hidden gems.
                  </p>
                  <Link to="/contact" className="inline-flex items-center text-white hover:text-primary transition-colors text-xs uppercase tracking-wider font-semibold group-hover:gap-3 gap-1.5 duration-300">
                    Contact Us <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Featured Destinations Preview */}
        <FeaturedDestinations />

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="py-16 md:py-20 bg-white relative overflow-hidden border-t border-gray-100"
        >
          <div className="container-xl relative z-10">
            <div className="mb-10">
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
                Plan Your Trip
              </span>
              <div className="grid gap-6 xl:grid-cols-[1fr_1fr] xl:items-end">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-gray-900 max-w-2xl leading-tight">
                  Plan Nepal from a <span className="text-secondary italic font-light">Kathmandu-based</span> travel team.
                </h2>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl">
                  Kailash Mansarovar Yatra, Muktinath pilgrimage, Kathmandu heritage, Everest, Annapurna, helicopter tours and cultural trips — planned with local ground support.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {[
                { label: 'Kailash Mansarovar Yatra 2026', href: '/kailash-mansarovar', desc: 'Overland, helicopter and aerial darshan options from Kathmandu.', tag: 'Core Pilgrimage', icon: 'Mountain' },
                { label: 'Muktinath tour package', href: '/destinations/mustang-region', desc: 'Muktinath Yatra from Kathmandu with flight and road options.', tag: 'Pilgrimage', icon: 'MapPin' },
                { label: 'Nepal tour packages', href: '/tours', desc: 'Inbound Nepal holidays, pilgrimage, culture, wildlife and adventure tours.', tag: 'All Packages', icon: 'Compass' },
                { label: 'Kathmandu sightseeing tour', href: '/destinations/kathmandu', desc: 'UNESCO temples, heritage squares, day tours and cultural guides.', tag: 'Heritage', icon: 'Landmark' },
                { label: 'Everest region tour', href: '/destinations/everest-region', desc: 'Everest Base Camp trek, Namche, Tengboche and helicopter tours.', tag: 'Himalaya', icon: 'Mountain' },
                { label: 'Nepal helicopter tours', href: '/activities/helicopter-tours', desc: 'Everest, Muktinath, Annapurna and Kailash Aerial Darshan planning.', tag: 'Aerial Darshan', icon: 'Wind' }
              ].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group relative flex flex-col overflow-hidden border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                      {item.tag}
                    </span>
                    <span className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-colors group-hover:border-primary group-hover:bg-primary">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-950 mb-2 transition-colors group-hover:text-primary">
                    {item.label}
                  </h3>
                  <p className="text-sm leading-6 text-gray-600 flex-grow">
                    {item.desc}
                  </p>
                </Link>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-100">
                    <span className="text-xs font-bold text-gray-900">KTM</span>
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Based in Kathmandu</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-200" />
                <div className="text-xs text-gray-500">
                  <span className="font-bold text-gray-900">25+</span> Years
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-200" />
                <div className="text-xs text-gray-500">
                  <span className="font-bold text-gray-900">24/7</span> Support
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/tours"
                  className="bg-gray-950 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors duration-300 inline-flex items-center gap-2"
                >
                  Explore Packages <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/contact"
                  className="border border-gray-300 text-gray-950 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-950 hover:text-white hover:border-gray-950 transition-colors duration-300"
                >
                  Custom Plan
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
        {/* Why Choose Us - Split Layout */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="py-16 md:py-20 bg-gray-950 relative overflow-hidden"
        >
          <div className="container-xl relative z-10">
            <div className="mb-10">
              <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
                02 — Why Zeo
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left Column: Text & Features */}
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-6 leading-tight max-w-xl">
                  Born in the <span className="text-primary italic font-light">Mountains</span>
                </h2>
                <p className="text-sm md:text-base text-gray-400 mb-8 leading-relaxed max-w-lg">
                  With decades of experience and deep-rooted connections to Nepal's mountains and culture, we deliver authentic adventures that exceed expectations.
                </p>

                <div className="space-y-4 border-t border-gray-800 pt-6">
                  {[
                    { title: 'Local Expertise', desc: 'Generations of knowledge and authentic cultural connections.', icon: Mountain },
                    { title: 'Safety First', desc: 'Certified guides, 24/7 medical support, and advanced equipment.', icon: Shield },
                    { title: 'Personalized Journeys', desc: 'Customized itineraries tailored to your specific dreams.', icon: Target }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex gap-4 items-start group p-4 -mx-4 hover:bg-white/[0.03] transition-colors duration-300">
                      <div className="w-10 h-10 bg-white/[0.05] flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all duration-300">
                        <feature.icon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors duration-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{feature.title}</h4>
                        <p className="text-gray-500 leading-relaxed text-xs">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: 2x2 Stat Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white/[0.03] p-5 sm:p-6 text-center flex flex-col items-center justify-center border border-white/10 hover:border-primary/20 hover:bg-white/[0.06] transition-all duration-300">
                  <AnimatedCounter end={1500} suffix="+" label="Happy Travelers" duration={3000} dark />
                </div>
                <div className="bg-primary/10 p-5 sm:p-6 text-center flex flex-col items-center justify-center border border-primary/20 hover:bg-primary/20 transition-all duration-300 group">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">14</div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-gray-400 group-hover:text-white/80 transition-colors">Destinations</div>
                </div>
                <div className="bg-white/[0.03] p-5 sm:p-6 text-center flex flex-col items-center justify-center border border-white/10 hover:border-primary/20 hover:bg-white/[0.06] transition-all duration-300">
                  <AnimatedCounter end={25} suffix="+" label="Years Experience" duration={2500} dark />
                </div>
                <div className="bg-white/[0.03] p-5 sm:p-6 text-center flex flex-col items-center justify-center border border-white/10 hover:border-primary/20 hover:bg-white/[0.06] transition-all duration-300">
                  <AnimatedCounter end={98} suffix="%" label="Satisfaction Rate" duration={2800} dark />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Featured Testimonials Slider */}
        <TestimonialsSlider />

        {/* CTA Section - Typographic Design */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-16 md:py-20 bg-gray-950 relative overflow-hidden"
        >
          <div className="container-xl relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
                03 — Start Your Journey
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white leading-[1.1] mb-6">
                Ready for your next <span className="text-primary italic font-light">great adventure?</span>
              </h2>
              <p className="text-sm md:text-base text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
                Let our Kathmandu-based team craft a personalized itinerary that turns your travel dreams into reality.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link
                  to="/destinations"
                  className="bg-primary text-white px-8 py-3 font-bold text-xs tracking-wider uppercase hover:bg-white hover:text-gray-950 transition-colors duration-300 inline-flex items-center gap-2 group"
                >
                  Start Planning <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="border border-gray-700 text-gray-300 px-8 py-3 font-bold text-xs tracking-wider uppercase hover:border-white hover:text-white transition-colors duration-300"
                >
                  Get Consultation
                </Link>
              </div>
            </div>

            {/* Clean Contact Strip */}
            <div className="mt-10 pt-8 border-t border-gray-800">
              <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-400">{contactInfo?.contact.phone.primary || '+977-1-4123456'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-400">{contactInfo?.contact.email.primary || 'info@zeotourism.com'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock3 className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-400">{contactInfo?.business.support.availability || '24/7 Support Available'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default Home;