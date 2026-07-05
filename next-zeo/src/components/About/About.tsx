"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  Compass,
  Globe,
  MapPin,
  Mountain,
  Plane,
  Quote,
  Route,
  Shield,
  Users,
} from 'lucide-react';
import api, { type DirectorMessage, type TeamMember } from '../../services/api';

const proofStats = [
  { value: '2018', label: 'Founded in Kathmandu', icon: MapPin, tone: 'primary' },
  { value: '24/7', label: 'Support mindset', icon: Clock, tone: 'secondary' },
  { value: 'Nepal', label: 'Local route knowledge', icon: Route, tone: 'primary' },
  { value: 'Global', label: 'Travel planning scope', icon: Globe, tone: 'secondary' },
];

const routeChips = [
  { label: 'Kathmandu', icon: MapPin },
  { label: 'Kailash', icon: Mountain },
  { label: 'Muktinath', icon: Compass },
  { label: 'Everest', icon: Route },
  { label: 'Private trips', icon: Users },
];

const journeyLanes = [
  {
    label: 'Pilgrimage Desk',
    title: 'Sacred journeys',
    description: 'Kailash Mansarovar, Muktinath, Gosaikunda and pilgrimage routes planned with permit, timing and support clarity.',
    href: '/kailash-mansarovar',
    icon: Mountain,
  },
  {
    label: 'Nepal Desk',
    title: 'Nepal tours',
    description: 'Culture, trekking, family holidays and private Nepal itineraries with local ground planning.',
    href: '/tours',
    icon: MapPin,
  },
  {
    label: 'Beyond Nepal',
    title: 'International travel',
    description: 'Selected outbound and cross-border journeys for travellers starting from Nepal, handled with practical essentials.',
    href: '/destinations',
    icon: Plane,
  },
  {
    label: 'Custom Desk',
    title: 'Private planning',
    description: 'Custom routes for families, groups and travellers who need advice before choosing a final package.',
    href: '/contact',
    icon: Compass,
  },
];

const processSteps = [
  {
    step: '01',
    title: 'Conversation first',
    description: 'We start with your reason for travelling, dates, group size, comfort level and what feels unclear.',
    icon: Users,
  },
  {
    step: '02',
    title: 'Route made simple',
    description: 'We translate timing, permits, transport, altitude, hotels and trade-offs into a plan you can understand.',
    icon: Route,
  },
  {
    step: '03',
    title: 'Support that stays close',
    description: 'Before and during the journey, the focus is fewer surprises, realistic preparation and dependable communication.',
    icon: Shield,
  },
];

const principles = [
  { text: 'No pressure before booking', icon: Compass },
  { text: 'Route clarity over generic packages', icon: Route },
  { text: 'Kathmandu-based accountability', icon: MapPin },
  { text: 'Realistic planning for pilgrimage and Himalayan travel', icon: Shield },
];

const SectionIcon = ({ className = '' }: { className?: string }) => (
  <span className={`inline-flex h-9 w-9 items-center justify-center border border-gray-200 bg-white text-primary ${className}`} aria-hidden="true">
    <Route className="h-4 w-4" />
  </span>
);

const About: React.FC = () => {
  const [directorMessage, setDirectorMessage] = useState<DirectorMessage | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [message, team] = await Promise.all([
          api.directorMessage.get(),
          api.team.getAll(),
        ]);

        if (message) setDirectorMessage(message);
        setTeamMembers((team || []).sort((a, b) => a.order_index - b.order_index));
      } catch (error) {
        console.error('Failed to fetch about page data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-t border-gray-100 bg-[#fbfcfe] py-14 md:py-20">
        <div className="absolute right-[-10%] top-10 h-80 w-80 bg-primary/[0.04] blur-3xl" />
        <div className="absolute left-[-8%] bottom-10 h-72 w-72 bg-secondary/[0.05] blur-3xl" />

        <div className="container-xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="grid gap-8 border-b border-gray-200 pb-10 lg:grid-cols-[0.34fr_0.66fr] lg:items-start"
          >
            <div>
              <div className="flex items-center gap-3">
                <SectionIcon />
                <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">Who we are</span>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-500">
                A Kathmandu-based planning team for travellers who want a clear route before making a commitment.
              </p>
            </div>

            <div>
              <h2 className="max-w-5xl text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-[1.02] tracking-tight text-gray-950">
                We turn travel ideas into routes people can understand.
              </h2>
              <div className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                <p className="text-lg leading-8 text-gray-700">
                  Zeo Tourism helps travellers plan sacred journeys, Nepal tours, international travel and private itineraries from Kathmandu.
                </p>
                <p className="text-sm md:text-base leading-7 text-gray-600">
                  We do not start by pushing packages. We listen first, then explain timing, permit logic, route options, support level and the practical decisions that matter before booking.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch"
          >
            <div className="relative min-h-[430px] overflow-hidden bg-gray-950 shadow-2xl shadow-gray-900/10">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop"
                alt="Himalayan travel planning"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
              <div className="absolute left-5 top-5 flex items-center gap-2 bg-white/90 px-4 py-3 backdrop-blur-sm">
                <Route className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-700">Kathmandu route desk</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">Route-first planning</span>
                <h3 className="mt-4 max-w-2xl text-3xl md:text-4xl font-serif font-bold leading-tight">
                  Bring the idea. We help shape the path.
                </h3>
              </div>
            </div>

            <div className="flex flex-col justify-between border border-gray-200 bg-white shadow-sm">
              <div className="p-5 md:p-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">How this helps you</span>
                <h3 className="mt-4 text-2xl md:text-3xl font-serif font-bold text-gray-950">
                  Less guessing before you book.
                </h3>
                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Most travellers arrive with questions: route, cost logic, permits, altitude, timing, hotels, transport and support. This section turns those concerns into a clearer promise.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {routeChips.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <span
                        key={item.label}
                        className="inline-flex items-center border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700"
                      >
                        <Icon className={`mr-2 h-3.5 w-3.5 ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}`} />
                        {item.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-px border-t border-gray-200 bg-gray-200 sm:grid-cols-2">
                {proofStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white p-5 transition-colors hover:bg-gray-50">
                      <Icon className={`h-5 w-5 ${stat.tone === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                      <div className="mt-5 text-3xl font-bold text-gray-950">{stat.value}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-500">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="container-xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 grid gap-6 lg:grid-cols-[0.42fr_0.58fr] lg:items-end"
          >
            <div>
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">What we plan</span>
              <h2 className="mt-4 max-w-xl text-3xl md:text-4xl font-serif font-bold text-gray-950 leading-tight">
                Four travel desks, one planning mindset.
              </h2>
            </div>
            <p className="text-sm md:text-base leading-7 text-gray-600 lg:max-w-xl lg:justify-self-end">
              The destination may change, but the principle stays the same: make the route practical, understandable and right for the traveller.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
            <div className="relative hidden min-h-[560px] overflow-hidden bg-gray-950 lg:block">
              <img
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop"
                alt="Kathmandu travel desk"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <span className="text-primary text-xs font-bold uppercase tracking-[0.22em]">Zeo approach</span>
                <p className="mt-4 text-2xl font-serif font-bold leading-tight">
                  Travel planning should feel less confusing after the first conversation.
                </p>
              </div>
            </div>

            <div className="border-y border-gray-200">
              {journeyLanes.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="group grid gap-5 border-b border-gray-200 px-1 py-7 last:border-b-0 transition-colors hover:bg-gray-50 md:grid-cols-[72px_0.38fr_1fr_auto] md:items-start md:px-5"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center border border-gray-200 bg-white transition-colors group-hover:border-primary/30">
                        <Icon className={`h-5 w-5 ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}`} />
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{item.label}</span>
                        <h3 className="mt-2 font-serif text-2xl font-bold text-gray-950 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-6 text-gray-600">{item.description}</p>
                      <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  </motion.div>
                );
              })}

              <div className="flex flex-col gap-3 border-t border-gray-200 px-1 py-7 sm:flex-row md:px-5">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-primary px-6 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark"
                >
                  Ask the team <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/tours"
                  className="inline-flex items-center justify-center border border-gray-300 px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-950 transition-colors hover:border-secondary hover:text-secondary-dark"
                >
                  Browse tours
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-14 md:py-20 border-y border-gray-100">
        <div className="container-xl">
          <div className="grid gap-10 lg:grid-cols-[0.35fr_0.65fr]">
            <div>
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">How we work</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-gray-950 leading-tight">
                A clearer path from idea to itinerary.
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-5 top-4 bottom-4 hidden w-px bg-gray-200 md:block" />
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    className={`relative grid gap-4 border-b border-gray-200 py-7 transition-colors hover:bg-white/70 md:grid-cols-[96px_0.38fr_1fr] md:items-start md:px-3 ${index === 0 ? 'border-t' : ''}`}
                  >
                    <span className="flex items-center gap-3 text-xs font-bold tracking-wider text-gray-400">
                      <span className="relative z-10 flex h-10 w-10 items-center justify-center border border-gray-200 bg-white">
                        <Icon className={`h-4 w-4 ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}`} />
                      </span>
                      {step.step}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-gray-950">{step.title}</h3>
                    <p className="text-sm md:text-base leading-7 text-gray-600">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {directorMessage && (
        <section className="bg-white py-14 md:py-20">
          <div className="container-xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr] lg:items-center"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 shadow-xl shadow-gray-900/10">
                <img
                  src={directorMessage.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=900&auto=format&fit=crop'}
                  alt={directorMessage.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>

              <div className="border-l border-gray-200 pl-6 md:pl-10">
                <Quote className="h-10 w-10 text-secondary/20" />
                <span className="mt-6 block text-primary text-xs font-bold uppercase tracking-[0.22em]">
                  Message from the Director
                </span>
                <div className="mt-5 whitespace-pre-line text-lg leading-8 text-gray-700">
                  {directorMessage.message}
                </div>
                <div className="mt-8 border-t border-gray-200 pt-5">
                  <h3 className="text-xl font-serif font-bold text-gray-950">{directorMessage.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{directorMessage.title}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="bg-gray-50 py-14 md:py-20 border-y border-gray-100">
        <div className="container-xl">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
            <div>
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">What we stand for</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-gray-950 leading-tight">
                Travel planning built on trust, not noise.
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden border border-gray-200 bg-gray-200 sm:grid-cols-2">
              {principles.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.text}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    className="bg-white p-6 transition-colors hover:bg-gray-50"
                  >
                    <Icon className={`mb-5 h-5 w-5 ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}`} />
                    <p className="text-base md:text-lg font-medium leading-7 text-gray-800">{value.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {teamMembers.length > 0 && (
        <section className="bg-white py-14 md:py-20">
          <div className="container-xl">
            <div className="mb-10 grid gap-5 lg:grid-cols-[0.42fr_0.58fr] lg:items-end">
              <div>
                <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">Our team</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-gray-950 leading-tight">
                  People behind the planning.
                </h2>
              </div>
              <p className="text-sm md:text-base leading-7 text-gray-600 lg:max-w-xl lg:justify-self-end">
                A simple look at the people connected to Zeo Tourism’s planning and support work.
              </p>
            </div>

            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className={`group ${index % 2 === 1 ? 'lg:mt-8' : ''}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 shadow-sm">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl font-bold text-gray-300">
                        {member.name?.slice(0, 1) || 'Z'}
                      </div>
                    )}
                  </div>
                  <div className="border-b border-gray-200 py-5">
                    <h3 className="text-lg font-bold text-gray-950">{member.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-primary">{member.role}</p>
                    {member.bio && <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{member.bio}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
