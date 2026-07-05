import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ExternalLink, MessageCircle } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { useContact } from '../../hooks/useApi';
import { useLogos } from '../../hooks/useLogos';
import footerLogo from '../../assets/zeo-logo-white.png';

const Footer: React.FC = () => {
  const { data: contactInfo } = useContact();
  const { logos } = useLogos();
  const footerLinks = {
    destinations: [
      { name: 'Kailash Mansarovar Yatra 2026', href: '/kailash-mansarovar' },
      { name: 'Nepal Tour Packages', href: '/tours' },
      { name: 'Everest Region Tour', href: '/destinations/everest-region' },
      { name: 'Annapurna Region Tour', href: '/destinations/annapurna-region' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Tours', href: '/tours' },
      { name: 'Contact', href: '/contact' }
    ],
    support: [
      { name: 'Kathmandu Sightseeing Tour', href: '/destinations/kathmandu' },
      { name: 'Muktinath Tour Package', href: '/destinations/mustang-region' },
      { name: 'Nepal Helicopter Tours', href: '/activities/helicopter-tours' },
      { name: 'Contact Travel Agency', href: '/contact' }
    ]
  };

  const socialLinks = [
    { icon: FaFacebook, href: contactInfo?.social?.facebook || 'https://www.facebook.com/zeotourism', label: 'Facebook' },
    { icon: FaInstagram, href: contactInfo?.social?.instagram || 'https://www.instagram.com/zeotourism', label: 'Instagram' },
    { icon: FaTwitter, href: contactInfo?.social?.twitter || 'https://x.com/zeotourism', label: 'X (Twitter)' },
    { icon: FaYoutube, href: contactInfo?.social?.youtube || 'https://www.youtube.com/@zeotourism', label: 'YouTube' },
    { icon: FaLinkedin, href: contactInfo?.social?.linkedin || 'https://www.linkedin.com/company/zeotourism', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gray-950 text-white border-t border-gray-800">
      <div className="container-xl">
        {/* Main Footer Content */}
        <div className="py-16 md:py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-flex items-center mb-5 hover:opacity-80 transition-opacity">
                <img
                  src={logos?.footer || (footerLogo as any).src || String(footerLogo)}
                  alt="Zeo Tourism Logo"
                  className="h-9 w-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = (footerLogo as any).src || String(footerLogo);
                  }}
                />
              </Link>
              <p className="text-gray-500 mb-7 text-sm leading-relaxed max-w-sm">
                Your trusted partner for Nepal tours and spiritual journeys since 2000.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-7">
                <a href={`tel:${contactInfo?.contact?.phone?.primary || '+9779851234567'}`} className="flex items-center text-gray-400 hover:text-primary transition-colors text-sm">
                  <Phone className="w-3.5 h-3.5 mr-3 text-gray-600" />
                  {contactInfo?.contact?.phone?.primary || '+977 985 123 4567'}
                </a>
                <a href={`mailto:${contactInfo?.contact?.email?.primary || 'info@zeotourism.com'}`} className="flex items-center text-gray-400 hover:text-primary transition-colors text-sm">
                  <Mail className="w-3.5 h-3.5 mr-3 text-gray-600" />
                  {contactInfo?.contact?.email?.primary || 'info@zeotourism.com'}
                </a>
                <div className="flex items-center text-gray-400 text-sm">
                  <MapPin className="w-3.5 h-3.5 mr-3 text-gray-600 flex-shrink-0" />
                  {contactInfo?.contact?.address?.full || 'Thamel, Kathmandu, Nepal'}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    rel="nofollow noopener noreferrer"
                    target="_blank"
                    className="w-8 h-8 bg-white/5 flex items-center justify-center hover:bg-primary transition-all duration-300 border border-white/10"
                  >
                    <social.icon className="w-3.5 h-3.5 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Popular Destinations */}
            <div className="lg:col-span-2 lg:col-start-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-5">Popular Tours</h4>
              <ul className="space-y-3">
                {footerLinks.destinations.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-white transition-colors duration-300 text-sm flex items-center"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-5">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-5">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} {contactInfo?.company?.name || 'Zeo Tourism'}. All rights reserved.
            <span className="mx-2 text-gray-700">|</span>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </p>
          <div className="flex items-center text-gray-500 text-xs">
            <span>Developed by</span>
            <a
              href="https://brandspire.com.np/"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="flex items-center ml-2 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="font-medium">Brandspire Creatives</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;