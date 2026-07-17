import React from 'react';
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useContact } from '../../hooks/useApi';
import Modal from './Modal';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ContactLocation = {
  maps_url?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
};

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { data: contactInfo } = useContact();
  const contact = contactInfo?.contact;
  const phone = contact?.phone?.primary || '+977 981 364 1003';
  const whatsapp = contact?.phone?.whatsapp || phone;
  const email = contact?.email?.primary || 'nepal@zeotourism.com';
  const address = contact?.address?.full || 'Kathmandu, Nepal';
  const location = contact?.location as ContactLocation | undefined;

  const openWhatsApp = () => {
    const number = whatsapp.replace(/[^0-9]/g, '');
    const message = 'Hi, I would like help planning a trip. My preferred dates and group size are:';
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const openMap = () => {
    const target = location?.maps_url ||
      `https://www.google.com/maps?q=${location?.coordinates?.latitude || 27.7172},${location?.coordinates?.longitude || 85.324}`;
    window.open(target, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plan your journey">
      <div className="p-6 md:p-7">
        <p className="ui-body">
          Choose the quickest way to reach the Kathmandu team. Share your dates, group size and travel purpose so we can give useful guidance from the first reply.
        </p>

        <div className="mt-6 grid gap-3">
          <a href={`tel:${phone.replace(/\s/g, '')}`} onClick={onClose} className="group ui-control flex items-center gap-4 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Phone className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <strong className="font-secondary block text-sm text-slate-950">Call the travel team</strong>
              <span className="block truncate text-xs text-slate-500">{phone}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
          </a>

          <button type="button" onClick={openWhatsApp} className="group ui-control flex w-full items-center gap-4 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <MessageCircle className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <strong className="font-secondary block text-sm text-slate-950">Continue on WhatsApp</strong>
              <span className="block truncate text-xs text-slate-500">Best for a quick planning question</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
          </button>

          <a
            href={`mailto:${email}?subject=${encodeURIComponent('Trip planning inquiry')}&body=${encodeURIComponent('Hi,\n\nPreferred dates:\nGroup size:\nDestination or travel purpose:\n\nThank you.')}`}
            onClick={onClose}
            className="group ui-control flex items-center gap-4 px-4 py-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary-dark">
              <Mail className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <strong className="font-secondary block text-sm text-slate-950">Send trip details by email</strong>
              <span className="block truncate text-xs text-slate-500">{email}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
          </a>

          <button type="button" onClick={openMap} className="group ui-control flex w-full items-center gap-4 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <strong className="font-secondary block text-sm text-slate-950">Visit the Kathmandu office</strong>
              <span className="block truncate text-xs text-slate-500">{address}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <p className="mt-5 border-t border-slate-200 pt-4 text-center text-xs leading-5 text-slate-500">
          No booking pressure. Get route, timing and support clarity first.
        </p>
      </div>
    </Modal>
  );
}
