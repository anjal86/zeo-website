import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ExternalLink, MessageCircle, ArrowRight } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { useContact } from '../../hooks/useApi';
import { useLogos } from '../../hooks/useLogos';
import footerLogo from '../../assets/zeo-logo-white.png';

const Footer: React.FC = () => {
  const { data: contactInfo } = useContact();
  const { logos } = useLogos();

  const phone = contactInfo?.contact?.phone?.primary || '+977 985 123 4567';
  const email = contactInfo?.contact?.email?.primary || 'info@zeotourism.com';
  const address = contactInfo?.contact?.address?.full || 'Thamel, Kathmandu, Nepal';
  const companyName = contactInfo?.company?.name || 'Zeo Tourism';
  const supportAvailability = contactInfo?.business?.support?.availability || '24/7 Support Available';
  const cleanPhone = phone.replace(/\s/g, '');

  const footerLinks = {
    trips: [
      { name: 'Kailash Yatra', href: '/kailash-mansarovar' },
      { name: 'Nepal Tours', href: '/tours' },
      { name: 'Activities', href: '/activities' },
      { name: 'Destinations', href: '/destinations' }
    ],
    company: [
      { name: 'About Zeo', href: '/about' },
      { name: 'Tour Packages', href: '/tours' },
      { name: 'Contact Team', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy-policy' }
    ],
    support: [
      { name: 'Call Kathmandu Office', href: `tel:${cleanPhone}` },
      { name: 'Email Travel Team', href: `mailto:${email}` },
      { name: 'Plan a Custom Trip', href: '/contact' },
      { name: 'Ask on WhatsApp', href: `https://wa.me/${cleanPhone.replace(/[^0-9]/g, '')}` }
    ]
  };

  const socialLinks = [
    { icon: FaFacebook, href: contactInfo?.social?.facebook || 'https://www.facebook.com/zeotourism', label: 'Facebook' },
    { icon: FaInstagram, href: contactInfo?.social?.instagram || 'https://www.instagram.com/zeotourism', label: 'Instagram' },
    { icon: FaTwitter, href: contactInfo?.social?.twitter || 'https://x.com/zeotourism', label: 'X (Twitter)' },
    { icon: FaYoutube, href: contactInfo?.social?.youtube || 'https://www.youtube.com/@zeotourism', label: 'YouTube' },
    { icon: FaLinkedin, href: contactInfo?.social?.linkedin || 'https://www.linkedin.com/company/zeotourism', label: 'LinkedIn' }
  ];

  const renderFooterLink = (link: { name: string; href: string }) => {
    const isExternal = link.href.startsWith('http');
    const isAction = link.href.startsWith('tel:') || link.href.startsWith('mailto:');
    const className = 'text-gray-400 hover:text-white transition-colors duration-300 text-sm inline-flex items-center gap-1.5';

    if (isExternal || isAction) {
      return (
        <a
          href={link.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'nofollow noopener noreferrer' : undefined}
          className={className}
        >
          {link.name}
          {isExternal && <ExternalLink className="w-3 h-3 opacity-60" />}
        </a>
      );
    }

    return (
      <Link href={link.href} className={className}>
        {link.name}
      </Link>
    );
  };

  return (
    <footer className="bg-gray-950 text-white border-t border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(0,119,204,0.12),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.05),transparent_26%)] pointer-events-none" />
      <div className="container-xl relative z-10">
        <div className="py-8 md:py-10 border-b border-white/10">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.24em] block mb-3">
                Kathmandu-based travel support
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight max-w-2xl">
                Need help choosing the right route?
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-400 max-w-2xl">
                Ask about Kailash Yatra, Nepal tours, helicopter options, private trips, timing, permits and ground support before you book.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-gray-950"
              >
                Plan your trip <ArrowRight className="ml-3 h-3.5 w-3.5" />
              </Link>
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white hover:text-gray-950"
              >
                Call office
              </a>
            </div>
          </div>
        </div>

        <div className="py-10 md:py-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Link href="/" className="inline-flex items-center mb-5 hover:opacity-80 transition-opacity">
                <img
                  src={logos?.footer || (footerLogo as any).src || String(footerLogo)}
                  alt="Zeo Tourism Logo"
                  className="h-10 w-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = (footerLogo as any).src || String(footerLogo);
                  }}
                />
              </Link>
              <p className="text-gray-400 text-sm leading-7 max-w-md">
                Trusted Nepal travel planning for sacred journeys, cultural tours, Himalayan routes and custom trips since 2000.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
                <a href={`tel:${cleanPhone}`} className="group border border-white/10 bg-white/[0.03] p-4 hover:border-primary/40 hover:bg-white/[0.055] transition-colors">
                  <Phone className="w-4 h-4 text-primary mb-3" />
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Call</span>
                  <span className="mt-1 block text-sm text-gray-300 group-hover:text-white transition-colors">{phone}</span>
                </a>
                <a href={`mailto:${email}`} className="group border border-white/10 bg-white/[0.03] p-4 hover:border-primary/40 hover:bg-white/[0.055] transition-colors">
                  <Mail className="w-4 h-4 text-primary mb-3" />
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Email</span>
                  <span className="mt-1 block text-sm text-gray-300 group-hover:text-white transition-colors break-all">{email}</span>
                </a>
                <div className="border border-white/10 bg-white/[0.03] p-4">
                  <MapPin className="w-4 h-4 text-primary mb-3" />
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Office</span>
                  <span className="mt-1 block text-sm text-gray-300">{address}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    rel="nofollow noopener noreferrer"
                    target="_blank"
                    className="w-9 h-9 bg-white/[0.04] flex items-center justify-center hover:bg-primary transition-all duration-300 border border-white/10"
                  >
                    <social.icon className="w-3.5 h-3.5 text-gray-300" />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid gap-8 sm:grid-cols-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-5">Plan Trips</h4>
                <ul className="space-y-3">
                  {footerLinks.trips.map((link, index) => (
                    <li key={index}>{renderFooterLink(link)}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-5">Company</h4>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>{renderFooterLink(link)}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-5">Support</h4>
                <ul className="space-y-3">
                  {footerLinks.support.map((link, index) => (
                    <li key={index}>{renderFooterLink(link)}</li>
                  ))}
                </ul>
                <div className="mt-6 border border-primary/20 bg-primary/10 p-4">
                  <MessageCircle className="w-4 h-4 text-primary mb-3" />
                  <p className="text-sm font-semibold text-white">{supportAvailability}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-400">For urgent trip questions, call or message the team directly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
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
