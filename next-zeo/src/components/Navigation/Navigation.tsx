"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname as useLocation } from 'next/navigation';
import {
  Menu, X, Phone, MessageCircle, ArrowRight, ChevronDown, Globe, ShoppingBag, Activity, Mountain, Info
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useContact } from '../../hooks/useApi';
import { useLogos } from '../../hooks/useLogos';
import ContactModal from '../UI/ContactModal';
import { useDestinations, useTours } from '../../hooks/useApi';
import headerLogo from '../../assets/zeo-logo.png';
import GlobalSearch from './GlobalSearch';
import { Search as SearchIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
}

const Navigation: React.FC = () => {
  const { data: contactInfo } = useContact();
  const { logos } = useLogos();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMobileAccordion, setActiveMobileAccordion] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const { data: destinations } = useDestinations();
  const { data: allTours } = useTours();

  const location = useLocation();

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/'
    },
    {
      label: 'Destinations',
      href: '/destinations'
    },

    {
      label: 'Kailash Mansarovar',
      href: '/kailash-mansarovar'
    },
    {
      label: 'About',
      href: '/about'
    },
    {
      label: 'Blog',
      href: '/blog'
    },
    {
      label: 'Contact',
      href: '/contact'
    },
  ];


  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (href: string) => {
    if (href === '/' && location === '/') return true;
    if (href !== '/' && location === href) return true;
    return false;
  };



  return (
    <>
      {/* Simplified Main Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200"
      >
        <div className={`transition-all duration-300 ease-out ${isScrolled ? 'px-4 lg:px-8' : 'px-4 lg:px-6'
          }`}>
          <div className="flex items-center justify-between nav-bar">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" onClick={handleNavClick}>
                <img
                  src={logos?.header || (headerLogo as any).src || String(headerLogo)}
                  alt="Zeo Tourism Logo"
                  className="nav-logo hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = (headerLogo as any).src || String(headerLogo);
                  }}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center space-x-0">
              {navItems.map((item) => (
                <motion.div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => (item.label === 'Destinations' || item.label === 'Kailash Mansarovar') && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={`font-semibold transition-all duration-300 relative py-1.5 xl:px-2.5 rounded-2xl nav-link group whitespace-nowrap flex items-center gap-1 ${isActiveRoute(item.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50/80'
                      } ${item.label === 'Kailash Mansarovar' ? 'text-secondary-dark !bg-secondary/10 hover:!bg-secondary/20' : ''}`}
                  >
                    {item.label}
                    {(item.label === 'Destinations' || item.label === 'Kailash Mansarovar') && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                    )}
                    {isActiveRoute(item.href) && !(item.label === 'Kailash Mansarovar') && (
                      <motion.div
                        layoutId="activeSection"
                        className="absolute -bottom-0.5 left-4 right-4 h-0.5 bg-primary rounded-2xl"
                      />
                    )}
                  </Link>

                  {/* Desktop Mega Menus */}
                  <AnimatePresence>
                    {activeDropdown === item.label && item.label === 'Destinations' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-[750px] bg-white shadow-2xl border border-gray-100 flex p-0 z-[100]"
                      >
                        {/* Nepal Column */}
                        <div className="flex-1 p-6 border-r border-gray-50">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Nepal</h4>
                          <div className="space-y-3">
                            {destinations?.filter(d => d.type === 'nepal').slice(0, 8).map((d, idx) => (
                              <Link
                                key={`nepal-${d.id}-${idx}`}
                                href={`/destinations/${d.name.toLowerCase()}`}
                                className="block text-sm text-gray-600 hover:text-primary transition-colors font-medium"
                              >
                                {d.name}
                              </Link>
                            ))}
                            <Link href="/tours" className="block text-sm text-primary font-bold pt-2 border-t border-gray-50 mt-2">
                              All Nepal Tours →
                            </Link>
                          </div>
                        </div>

                        {/* International Column */}
                        <div className="flex-1 p-6 border-r border-gray-50">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-secondary-dark mb-4">International</h4>
                          <div className="space-y-3">
                            {destinations?.filter(d => d.type === 'international').slice(0, 8).map((d, idx) => (
                              <Link
                                key={`intl-${d.id}-${idx}`}
                                href={`/destinations/${d.name.toLowerCase()}`}
                                className="block text-sm text-gray-600 hover:text-primary transition-colors font-medium"
                              >
                                {d.name}
                              </Link>
                            ))}
                            <Link href="/destinations" className="block text-sm text-secondary-dark font-bold pt-2 border-t border-gray-50 mt-2">
                              All Destinations →
                            </Link>
                          </div>
                        </div>

                        {/* Travel Guides Column (New Side Panel) */}
                        <div className="flex-1 bg-gray-50/50 p-6">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Travel Resources</h4>
                          <div className="space-y-4">
                            <Link href="/everest-base-camp-guide" className="group block border-b border-gray-100 pb-3 last:border-0">
                              <span className="block text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Everest Base Camp</span>
                              <span className="block text-[10px] text-gray-500 italic uppercase">The Ultimate Trek</span>
                            </Link>
                            <Link href="/nepal-visa-guide" className="group block border-b border-gray-100 pb-3 last:border-0">
                              <span className="block text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Nepal Visa Guide</span>
                              <span className="block text-[10px] text-gray-500 uppercase tracking-tighter">On-Arrival Rules</span>
                            </Link>
                            <Link href="/best-time-to-visit-nepal" className="group block border-b border-gray-100 pb-3 last:border-0">
                              <span className="block text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Best Time to Visit</span>
                              <span className="block text-[10px] text-gray-500 uppercase tracking-tighter">Weather & Seasons</span>
                            </Link>
                            <Link href="/kailash-mansarovar-yatra-guide" className="group block border-b border-gray-100 pb-3 last:border-0">
                              <span className="block text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Kailash Guide</span>
                              <span className="block text-[10px] text-gray-500 uppercase tracking-tighter">Spiritual Pilgrimage</span>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeDropdown === item.label && item.label === 'Kailash Mansarovar' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-4 w-[500px] bg-white shadow-2xl overflow-hidden border-t-2 border-secondary flex z-[100]"
                      >
                        {/* Main List */}
                        <div className="w-3/5 p-6 border-r border-gray-50">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-secondary-dark mb-4">Yatra Packages</h4>
                          <div className="space-y-3">
                            {allTours?.filter(t => t.category?.toLowerCase().includes('kailash') || t.title?.toLowerCase().includes('kailash')).slice(0, 6).map(t => (
                              <Link
                                key={t.id}
                                href={`/tours/${t.slug}`}
                                className="block text-sm text-gray-600 hover:text-primary transition-colors font-medium line-clamp-1"
                                title={t.title}
                              >
                                {t.title}
                              </Link>
                            ))}
                            <Link href="/kailash-mansarovar" className="block text-[10px] font-bold text-primary uppercase tracking-tighter mt-2">
                              View All Packages →
                            </Link>
                          </div>
                        </div>

                        {/* Sidebar Resources */}
                        <div className="w-2/5 bg-gray-50/50 p-6 overflow-y-auto max-h-[450px]">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Resources</h4>
                          <div className="space-y-4">
                            <Link href="/kailash-yatra-nri-guide" className="group block border-b border-gray-100 pb-3 last:border-0">
                              <span className="block text-sm font-bold text-gray-900 group-hover:text-secondary transition-colors italic">NRI Special Guide</span>
                              <span className="block text-[10px] text-gray-500">Global Booking & Permits</span>
                            </Link>
                            <Link href="/kailash-packing-list" className="group block border-b border-gray-100 pb-3 last:border-0">
                              <span className="block text-sm font-bold text-gray-900 group-hover:text-secondary transition-colors">Yatra Packing List</span>
                              <span className="block text-[10px] text-gray-500">Essential Gear & Meds</span>
                            </Link>
                            <Link href="/kailash-fitness-medical-guide" className="group block border-b border-gray-100 pb-3 last:border-0">
                              <span className="block text-sm font-bold text-gray-900 group-hover:text-secondary transition-colors">Medical & Fitness</span>
                              <span className="block text-[10px] text-gray-500">AMS & Safety Prep</span>
                            </Link>
                            <Link href="/kailash-inner-kora-guide" className="group block border-b border-gray-100 pb-3 last:border-0">
                              <span className="block text-sm font-bold text-gray-900 group-hover:text-secondary transition-colors">Inner Kora Guide</span>
                              <span className="block text-[10px] text-gray-500">South Face & Nandi Parvat</span>
                            </Link>
                            <Link href="/kailash-mansarovar-yatra-guide" className="group block pt-2">
                              <span className="block text-sm font-bold text-primary group-hover:text-secondary transition-colors">Main Yatra Guide →</span>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons & WhatsApp */}
            <div className="hidden xl:flex items-center gap-2">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearchModal(true)}
                className="p-1.5 text-gray-600 hover:text-primary transition-colors"
                aria-label="Search"
              >
                <SearchIcon className="w-4 h-4" />
              </motion.button>
              {/* WhatsApp Link */}
              <motion.a
                href={`https://wa.me/${contactInfo?.contact?.phone?.whatsapp?.replace(/[^0-9]/g, '') || '9779705246799'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-green-100/50 hover:border-green-200/50 transition-all duration-300 group"
              >
                <div className="bg-green-500 p-1 text-white group-hover:scale-110 transition-all duration-300">
                  <FaWhatsapp className="w-3 h-3" />
                </div>
                <span className="font-semibold text-xs text-gray-700 group-hover:text-green-600 transition-colors whitespace-nowrap">
                  {contactInfo?.contact?.phone?.whatsapp || '+9779705246799'}
                </span>
              </motion.a>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowContactModal(true)}
                className="bg-secondary px-3.5 py-1.5 text-white font-bold text-xs transition-all duration-300 flex items-center gap-1.5 group"
              >
                <MessageCircle className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Enquire Now</span>
              </motion.button>
            </div>

            {/* Mobile Menu & Search Buttons */}
            <div className="xl:hidden flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearchModal(true)}
                className="flex p-2 rounded-2xl transition-all duration-300 text-gray-900 hover:bg-gray-100 flex-shrink-0"
              >
                <SearchIcon size={20} />
              </motion.button>
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex p-2 rounded-2xl transition-all duration-300 text-gray-900 hover:bg-gray-100 flex-shrink-0"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Full Screen Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[55] xl:hidden"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[60] xl:hidden shadow-2xl flex flex-col"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <img
                    src={logos?.header || (headerLogo as any).src || String(headerLogo)}
                    alt="Zeo Tourism"
                    className="h-8 w-auto"
                  />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-900" />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto py-8 px-6">
                  <div className="space-y-1">
                    {navItems.map((item, index) => {
                      const hasDropdown = item.label === 'Destinations' || item.label === 'Kailash Mansarovar';
                      const isAccordionOpen = activeMobileAccordion === item.label;

                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div
                            onClick={() => hasDropdown ? setActiveMobileAccordion(isAccordionOpen ? null : item.label) : handleNavClick()}
                            className={`flex items-center justify-between py-4 px-4 font-bold text-lg transition-all rounded-2xl cursor-pointer ${isActiveRoute(item.href)
                              ? 'text-primary bg-primary/5'
                              : 'text-gray-800 hover:text-primary hover:bg-gray-50'
                              } ${item.label === 'Kailash Mansarovar' ? 'text-secondary-dark !bg-secondary/10' : ''}`}
                          >
                            {hasDropdown ? <span>{item.label}</span> : <Link href={item.href} className="flex-1">{item.label}</Link>}
                            <div className="flex items-center gap-2">
                              {hasDropdown ? (
                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`} />
                              ) : (
                                <motion.div
                                  animate={{ x: isActiveRoute(item.href) ? 0 : -10, opacity: isActiveRoute(item.href) ? 1 : 0 }}
                                >
                                  <ArrowRight size={18} className="text-primary" />
                                </motion.div>
                              )}
                            </div>
                          </div>

                          {/* Mobile Accordion Content */}
                          <AnimatePresence>
                            {isAccordionOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-gray-50"
                              >
                                {item.label === 'Destinations' && (
                                  <div className="p-4 space-y-4">
                                    <div>
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 px-2">Nepal</div>
                                      <div className="grid grid-cols-1 gap-1">
                                        {destinations?.filter(d => d.type === 'nepal').map(d => (
                                          <Link
                                            key={d.id}
                                            href={`/destinations/${d.name.toLowerCase()}`}
                                            onClick={handleNavClick}
                                            className="block py-2 px-2 text-sm text-gray-600 hover:text-primary transition-colors font-medium"
                                          >
                                            {d.name}
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100">
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-secondary-dark mb-2 px-2">International</div>
                                      <div className="grid grid-cols-1 gap-1">
                                        {destinations?.filter(d => d.type === 'international').map(d => (
                                          <Link
                                            key={d.id}
                                            href={`/destinations/${d.name.toLowerCase()}`}
                                            onClick={handleNavClick}
                                            className="block py-2 px-2 text-sm text-gray-600 hover:text-primary transition-colors font-medium"
                                          >
                                            {d.name}
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {item.label === 'Kailash Mansarovar' && (
                                  <div className="p-4 space-y-4">
                                    <div className="space-y-2">
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-secondary-dark mb-2 opacity-50">Packages</div>
                                      {allTours?.filter(t => t.category?.toLowerCase().includes('kailash') || t.title?.toLowerCase().includes('kailash')).slice(0, 4).map(t => (
                                        <Link
                                          key={t.id}
                                          href={`/tours/${t.slug}`}
                                          onClick={handleNavClick}
                                          className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors font-medium border-b border-gray-50 last:border-0"
                                        >
                                          {t.title}
                                        </Link>
                                      ))}
                                    </div>

                                    <div className="pt-2 space-y-3 border-t border-gray-100">
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-secondary-dark mb-2 opacity-50">Guides & Support</div>
                                      <Link
                                        href="/kailash-yatra-nri-guide"
                                        onClick={handleNavClick}
                                        className="flex items-center gap-2 py-1 text-sm text-secondary-dark font-bold"
                                      >
                                        <Globe className="w-4 h-4 text-secondary" /> NRI Special Guide
                                      </Link>
                                      <Link
                                        href="/kailash-packing-list"
                                        onClick={handleNavClick}
                                        className="flex items-center gap-2 py-1 text-sm text-gray-700 font-bold"
                                      >
                                        <ShoppingBag className="w-4 h-4 text-primary" /> Packing List
                                      </Link>
                                      <Link
                                        href="/kailash-fitness-medical-guide"
                                        onClick={handleNavClick}
                                        className="flex items-center gap-2 py-1 text-sm text-gray-700 font-bold"
                                      >
                                        <Activity className="w-4 h-4 text-green-600" /> Medical & Fitness
                                      </Link>
                                      <Link
                                        href="/kailash-inner-kora-guide"
                                        onClick={handleNavClick}
                                        className="flex items-center gap-2 py-1 text-sm text-gray-700 font-bold"
                                      >
                                        <Mountain className="w-4 h-4 text-orange-600" /> Inner Kora Guide
                                      </Link>
                                      <Link
                                        href="/kailash-mansarovar-yatra-guide"
                                        onClick={handleNavClick}
                                        className="flex items-center gap-2 py-1 text-sm text-primary font-bold"
                                      >
                                        <Info className="w-4 h-4 text-primary" /> Main Yatra Guide
                                      </Link>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Mobile Stats/Social or Info could go here */}
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <motion.a
                      href={`tel:${contactInfo?.contact?.phone?.primary?.replace(/[^0-9+]/g, '') || '+9779851234567'}`}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center justify-center gap-1 py-4 rounded-2xl bg-white text-gray-700 shadow-sm border border-gray-100"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Call</span>
                    </motion.a>

                    <motion.a
                      href={`https://wa.me/${contactInfo?.contact?.phone?.whatsapp?.replace(/[^0-9]/g, '') || '9779705246799'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center justify-center gap-1 py-4 rounded-2xl bg-white text-green-700 shadow-sm border border-green-100"
                    >
                      <FaWhatsapp className="w-5 h-5 text-green-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">WhatsApp</span>
                    </motion.a>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowContactModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-primary py-4 text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Enquire Now
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </>
  );
};

export default Navigation;
