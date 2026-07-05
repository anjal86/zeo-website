"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import api, { type DirectorMessage, type TeamMember } from '../../services/api';

const proofStats = [
  { value: '2018', label: 'Founded in Kathmandu', tone: 'primary' },
  { value: '24/7', label: 'Support mindset', tone: 'secondary' },
  { value: 'Nepal', label: 'Local route knowledge', tone: 'primary' },
  { value: 'Global', label: 'Travel planning scope', tone: 'secondary' },
];

const servicePillars = [
  {
    title: 'Sacred journeys',
    description: 'Kailash Mansarovar, Muktinath, Gosaikunda and pilgrimage travel planned with route, permit, timing and support clarity.',
    href: '/kailash-mansarovar',
    label: 'Pilgrimage',
  },
  {
    title: 'Nepal tours',
    description: 'Culture, heritage, trekking, family holidays, helicopter trips and private Nepal itineraries with local ground planning.',
    href: '/tours',
    label: 'Nepal',
  },
  {
    title: 'International travel',
    description: 'Selected outbound and cross-border journeys for travellers starting from Nepal, handled with practical travel essentials.',
    href: '/destinations',
    label: 'Beyond Nepal',
  },
  {
    title: 'Custom planning',
    description: 'Private routes for families, groups and travellers who need advice before choosing a final package.',
    href: '/contact',
    label: 'Tailor-made',
  },
];

const processSteps = [
  {
    title: 'We listen first',
    description: 'Purpose, dates, group size, comfort level and travel expectations come before package suggestions.',
  },
  {
    title: 'We simplify the route',
    description: 'Timing, permits, transport, altitude, hotels and practical trade-offs are explained clearly.',
  },
  {
    title: 'We support the journey',
    description: 'The aim is fewer surprises, realistic preparation and dependable communication before and during travel.',
  },
];

const values = [
  'No pressure before booking',
  'Clear route advice over generic packages',
  'Kathmandu-based accountability',
  'Realistic planning for pilgrimage and Himalayan travel',
];

const BrandMark = () => (
  <div className="flex items-center gap-2" aria-hidden="true">
    <span className="h-5 w-5 rotate-45 bg-primary" />
    <span className="h-8 w-px bg-gradient-to-b from-primary via-gray-300 to-secondary" />
    <span className="h-5 w-5 rotate-45 bg-secondary" />
  </div>
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
      <section className="relative overflow-hidden bg-white py-16 md:py-20 border-t border-gray-100">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-br from-primary/[0.04] via-transparent to-secondary/[0.06] pointer-events-none" />
        <div className="container-xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start"
          >
            <div className="border-t border-gray-950 pt-5">
              <BrandMark />
              <span className="mt-6 block text-secondary text-xs font-bold uppercase tracking-[0.22em]">
                Who we are
              </span>
              <p className="mt-5 max-w-xs text-sm leading-7 text-gray-500">
                Blue for trust. Orange for movement. A planning style built around clarity and action.
              </p>
            </div>

            <div>
              <h2 className="max-w-5xl text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-950 leading-[1.02] tracking-tight">
                A Kathmandu travel team focused on <span className="text-primary">clarity</span> before <span className="text-secondary">commitment</span>.
              </h2>
              <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <p className="text-lg leading-8 text-gray-700">
                  Zeo Tourism helps travellers plan sacred journeys, Nepal tours, international trips and private itineraries with practical route advice and local context.
                </p>
                <p className="text-sm md:text-base leading-7 text-gray-600">
                  We do not treat travel planning as a list of packages. We help people understand the route, timing, support level and decisions that matter before they choose a journey.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 border-t border-gray-100 pt-5">
                {['Route clarity', 'Local support', 'Sacred journeys', 'Private planning'].map((item, index) => (
                  <span
                    key={item}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ${index % 2 === 0 ? 'bg-primary/5 text-primary' : 'bg-secondary/10 text-secondary-dark'}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="mt-14 grid border-y border-gray-200 md:grid-cols-4">
            {proofStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="relative border-b border-gray-200 py-6 md:border-b-0 md:border-r md:last:border-r-0 md:px-6 first:md:pl-0"
              >
                <span className={`mb-5 block h-1 w-12 ${stat.tone === 'primary' ? 'bg-primary' : 'bg-secondary'}`} />
                <div className="text-3xl md:text-4xl font-bold text-gray-950">{stat.value}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gray-50 py-16 md:py-20 border-y border-gray-100">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary to-secondary" />
        <div className="container-xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative min-h-[460px] overflow-hidden bg-gray-950 shadow-2xl shadow-gray-900/10"
            >
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1400&auto=format&fit=crop"
                alt="Himalayan route planning"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/45 to-transparent" />
              <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary to-secondary" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">Our role</span>
                <h3 className="mt-4 max-w-xl text-3xl md:text-4xl font-serif font-bold leading-tight">
                  Turning uncertainty into a route you can understand.
                </h3>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-between"
            >
              <div>
                <p className="text-lg leading-8 text-gray-700">
                  Many travellers know where they want to go, but not how to plan it properly. That is where our work begins.
                </p>
                <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200 bg-white/70">
                  {servicePillars.map((service, index) => (
                    <Link
                      key={service.title}
                      href={service.href}
                      className="group grid gap-4 px-4 py-6 transition-colors hover:bg-white md:grid-cols-[0.26fr_0.36fr_1fr_auto] md:items-start"
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${index % 2 === 0 ? 'text-primary' : 'text-secondary-dark'}`}>
                        {service.label}
                      </span>
                      <h4 className="font-serif text-2xl font-bold text-gray-950 group-hover:text-primary transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-sm leading-6 text-gray-600">{service.description}</p>
                      <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-primary px-6 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark"
                >
                  Ask the team <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/tours"
                  className="inline-flex items-center justify-center border border-secondary/30 bg-secondary/5 px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-dark transition-colors hover:bg-secondary hover:text-white"
                >
                  Browse tours
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container-xl">
          <div className="grid gap-10 lg:grid-cols-[0.35fr_0.65fr]">
            <div>
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">How we work</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-gray-950 leading-tight">
                A quieter, clearer way to plan.
              </h2>
            </div>

            <div className="border-t border-gray-200">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="grid gap-4 border-b border-gray-200 py-7 md:grid-cols-[96px_0.42fr_1fr] md:items-start"
                >
                  <span className={`text-xs font-bold tracking-wider ${index % 2 === 0 ? 'text-primary' : 'text-secondary'}`}>0{index + 1}</span>
                  <h3 className="text-xl font-serif font-bold text-gray-950">{step.title}</h3>
                  <p className="text-sm md:text-base leading-7 text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {directorMessage && (
        <section className="py-16 md:py-20 bg-gray-50 border-y border-gray-100">
          <div className="container-xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-center"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 shadow-xl shadow-gray-900/10">
                <img
                  src={directorMessage.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=900&auto=format&fit=crop'}
                  alt={directorMessage.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute bottom-0 left-0 h-1.5 w-1/2 bg-primary" />
                <span className="absolute bottom-0 right-0 h-1.5 w-1/2 bg-secondary" />
              </div>
              <div className="border-l border-gray-200 pl-6 md:pl-10">
                <Quote className="h-10 w-10 text-secondary/30" />
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

      <section className="py-16 md:py-20 bg-white">
        <div className="container-xl">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
            <div>
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em]">What we stand for</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-gray-950 leading-tight">
                Travel planning built on trust, not noise.
              </h2>
            </div>
            <div className="divide-y divide-gray-200 border-y border-gray-200">
              {values.map((value, index) => (
                <motion.div
                  key={value}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="group flex items-center gap-5 py-5"
                >
                  <span className={`h-2.5 w-2.5 rotate-45 ${index % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`} />
                  <span className="text-xs font-bold tracking-wider text-gray-400">0{index + 1}</span>
                  <p className="text-base md:text-lg font-medium text-gray-800 group-hover:text-gray-950">{value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {teamMembers.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50 border-y border-gray-100">
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
                  className="group"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
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
                    <span className={`absolute bottom-0 left-0 h-1 w-full ${index % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`} />
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
