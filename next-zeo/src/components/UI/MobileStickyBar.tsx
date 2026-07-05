import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useContact } from '../../hooks/useApi';

const MobileStickyBar: React.FC = () => {
  const { data: contactInfo } = useContact();
  const pathname = usePathname();

  const isTourDetailPage = pathname.startsWith('/tours/') && pathname !== '/tours';

  if (isTourDetailPage) {
    return null;
  }

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const whatsappNumber = contactInfo?.contact?.phone?.whatsapp?.replace(/[^0-9]/g, '') || '9779851234567';
    const message = "Hi, I'm interested in planning a trip to Nepal. Can you help me?";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const phoneNumber = contactInfo?.contact?.phone?.primary?.replace(/[^0-9+]/g, '') || '+97714123456';
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-stretch h-16">
        {/* Call Button */}
        <button
          onClick={handleCallClick}
          className="flex-1 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
        >
          <Phone className="w-5 h-5 mb-1 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Call</span>
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppClick}
          className="flex-1 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
        >
          <MessageCircle className="w-5 h-5 mb-1 text-green-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
        </button>

        {/* Enquire Button */}
        <Link
          href="/contact"
          className="flex-1 flex flex-col items-center justify-center bg-primary text-white hover:bg-primary-dark transition-colors"
        >
          <Mail className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Enquire</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileStickyBar;
