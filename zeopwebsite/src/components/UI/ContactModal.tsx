import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { useContact } from '../../hooks/useApi';
import Modal from './Modal';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { data: contactInfo } = useContact();

  const handleContactAction = (type: 'phone' | 'email' | 'whatsapp' | 'visit' | 'maps') => {
    const contact = contactInfo?.contact;

    switch (type) {
      case 'phone':
        window.location.href = `tel:${contact?.phone.primary || '+9779851234567'}`;
        break;
      case 'email':
        const subject = 'Trip Planning Inquiry';
        const body = 'Hi,\n\nI would like to discuss my trip planning requirements.\n\nThank you!';
        window.location.href = `mailto:${contact?.email.primary || 'info@zeotourism.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
      case 'whatsapp':
        const message = 'Hi! I would like to discuss my trip planning requirements. Could you please help me?';
        const whatsappNumber = contact?.phone.whatsapp?.replace('+', '') || '9779851234567';
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'visit':
        const address = contact?.address.full || 'Baluwatar-4, Kathmandu, Nepal';
        window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
        break;
      case 'maps':
        if (contact?.location && (contact.location as any)?.maps_url) {
          window.open((contact.location as any).maps_url, '_blank');
        } else {
          const lat = contact?.location?.coordinates?.latitude || 27.725415;
          const lng = contact?.location?.coordinates?.longitude || 85.3314607;
          window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
        }
        break;
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Us">
      <div className="p-6">
        <p className="text-gray-600 mb-6">
          Ready to plan your perfect trip? Get in touch with our travel experts!
        </p>

        <div className="space-y-3">
          {/* Phone */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleContactAction('phone')}
            className="w-full flex items-center p-4 bg-blue-50 hover:bg-blue-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-500 flex items-center justify-center mr-4">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Call Us</h4>
              <p className="text-sm text-gray-600">
                {contactInfo?.contact.phone.primary || '+977 985 123 4567'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" />
          </motion.button>

          {/* WhatsApp */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleContactAction('whatsapp')}
            className="w-full flex items-center p-4 bg-green-50 hover:bg-green-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-green-500 flex items-center justify-center mr-4">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">WhatsApp</h4>
              <p className="text-sm text-gray-600">
                {contactInfo?.contact.phone.whatsapp || '+977 970 524 6799'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-green-500 transition-colors" />
          </motion.button>

          {/* Email */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleContactAction('email')}
            className="w-full flex items-center p-4 bg-orange-50 hover:bg-orange-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-orange-500 flex items-center justify-center mr-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Email Us</h4>
              <p className="text-sm text-gray-600">
                {contactInfo?.contact.email.primary || 'info@zeotourism.com'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-orange-500 transition-colors" />
          </motion.button>

          {/* Visit Us */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleContactAction('maps')}
            className="w-full flex items-center p-4 bg-purple-50 hover:bg-purple-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-purple-500 flex items-center justify-center mr-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Find Us on Maps</h4>
              <p className="text-sm text-gray-600">
                {contactInfo?.contact.address.full || 'Baluwatar-4, Kathmandu, Nepal'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-purple-500 transition-colors" />
          </motion.button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Our travel experts are available 24/7 to help you plan your perfect trip
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ContactModal;