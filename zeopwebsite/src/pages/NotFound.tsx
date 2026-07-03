import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Compass, HelpCircle, MapPin, ArrowRight, Home } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { createBreadcrumbSchema } from '../utils/schema';

const NotFound: React.FC = () => {
  const structuredData = useMemo(() => [
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "Page Not Found", url: "https://www.zeotourism.com/404" }
    ])
  ], []);

  const quickLinks = [
    {
      name: "Kailash Mansarovar Yatra",
      desc: "Sacred pilgrimage packages & route maps",
      href: "/kailash-mansarovar",
      icon: MapPin,
    },
    {
      name: "Handcrafted Tours",
      desc: "Explore trekking & cultural packages in Nepal",
      href: "/tours",
      icon: Compass,
    },
    {
      name: "Nepal Visa Guide",
      desc: "Latest visa-on-arrival rules & document checklist",
      href: "/nepal-visa-guide",
      icon: HelpCircle,
    }
  ];

  return (
    <>
      <SEO
        title="Page Not Found - Zeo Tourism"
        description="The page you are looking for does not exist. Explore our top Kailash Mansarovar packages and trekking routes."
        robots="noindex, nofollow"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center relative overflow-hidden py-16 md:py-24">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-3xl relative z-10 text-center">
          {/* Main 404 Display */}
          <div className="inline-block border border-gray-800 bg-gray-900/40 backdrop-blur-md px-6 py-2 mb-6 font-serif text-sm uppercase tracking-[0.2em] text-primary">
            Error 404
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            Lost in the <span className="text-primary italic font-light">Mountains?</span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed">
            The page you are looking for has been moved, removed, or is temporarily offline. Let us help you get back on track.
          </p>

          {/* Quick Links Directory (Crawl-friendly mesh) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="group p-6 bg-gray-900/30 border border-gray-800 hover:border-primary/30 hover:bg-gray-900/60 transition-all duration-300 flex flex-col h-full rounded-none"
              >
                <link.icon className="w-6 h-6 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-bold text-white text-base mb-1 group-hover:text-primary transition-colors">
                  {link.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-grow">
                  {link.desc}
                </p>
                <div className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-primary group-hover:gap-2 duration-300 gap-1 mt-auto">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>

          {/* Home and Contact Triggers */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-primary hover:text-white font-bold text-sm tracking-wider uppercase px-8 py-4 transition-colors duration-300"
            >
              <Home className="w-4 h-4" /> Go back Home
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center border border-gray-800 text-white hover:bg-gray-900 px-8 py-4 font-bold text-sm tracking-wider uppercase transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;