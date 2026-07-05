"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Compass,
  Globe,
  MapPin,
  MessageCircle,
  Mountain,
  Quote,
  Shield,
  Target,
  Users,
} from 'lucide-react';
import api, { type DirectorMessage, type TeamMember } from '../../services/api';

const proofStats = [
  { value: '2018', label: 'Founded in Kathmandu', icon: Calendar },
  { value: '24/7', label: 'Travel support', icon: Shield },
  { value: 'Nepal', label: 'Local ground knowledge', icon: MapPin },
  { value: 'Global', label: 'Trip planning scope', icon: Globe },
];

const servicePillars = [
  {
    title: 'Sacred journeys',
    description: 'Kailash Mansarovar, Muktinath, Gosaikunda and pilgrimage travel planned with practical route clarity.',
    icon: Mountain,
    href: '/kailash-mansarovar',
  },
  {
    title: 'Nepal tours',
    description: 'Culture, heritage, trekking, family holidays, helicopter trips and customized Nepal itineraries.',
    icon: Compass,
    href: '/tours',
  },
  {
    title: 'International travel',
    description: 'Selected international trips and travel essentials for clients starting from Nepal.',
    icon: Globe,
    href: '/destinations',
  },
  {
    title: 'Private planning',
    description: 'Custom route advice for families, groups, corporate teams and travelers who need a clearer starting point.',
    icon: Target,
    href: '/contact',
  },
];

const processSteps = [
  {
    title: 'Understand the purpose',
    description: 'We start with why you are travelling: pilgrimage, family, trekking, culture, business or private holiday.',
  },
  {
    title: 'Clarify the route',
    description: 'We explain timing, route options, permits, transport, altitude, hotel standards and realistic expectations.',
  },
  {
    title: 'Support the journey',
    description: 'From booking to ground coordination, the goal is simple: fewer surprises and clearer support.',
  },
];

const values = [
  {
    title: 'Clarity before commitment',
    description: 'Travelers should understand the route, cost logic and practical challenges before they book.',
    icon: CheckCircle,
  },
  {
    title: 'Local accountability',
    description: 'A Kathmandu-based team gives travelers local context, direct communication and ground-level support.',
    icon: MapPin,
  },
  {
    title: 'Safety-minded planning',
    description: 'Pilgrimage and Himalayan travel need realistic timing, altitude awareness and practical preparation.',
    icon: Shield,
  },
];

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
      <section className="py-14 md:py-16 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="container-xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end"
          >
            <div>
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em] mb-3 block">
                Who we are
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-950 leading-[1.05] tracking-tight max-w-3xl">
                A Kathmandu-based travel team built around clearer planning.
              </h2>
            </div>
            <div className="lg:max-w-xl lg:justify-self-end">
              <p className="text-sm md:text-base leading-7 text-gray-600">
                Zeo Tourism helps travelers plan sacred journeys, Nepal tours, international trips and private itineraries with practical route advice, local context and direct support before the journey begins.
              </p>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {proofStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <Icon className="h-5 w-5 text-primary mb-5" />
                  <div className="text-2xl md:text-3xl font-bold text-gray-950">{stat.value}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-500">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-white">
        <div className="container-xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden border border-gray-200 bg-gray-950 p-6 md:p-8 text-white"
            >
              <Mountain className="absolute -right-8 -top-8 h-40 w-40 text-white/[0.04]" />
              <div className="relative z-10">
                <span className="text-primary text-xs font-bold uppercase tracking-[0.22em] mb-4 block">
                  Our role
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-bold leading-tight">
                  We turn travel confusion into a practical route plan.
                </h3>
                <p className="mt-5 text-sm md:text-base leading-7 text-gray-400">
                  Many travelers know the destination but not the practical path: when to go, how many days to keep, what route is realistic, what support is needed, and what to avoid. Our work starts there.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark"
                  >
                    Ask the team <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/tours"
                    className="inline-flex items-center justify-center border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white hover:text-gray-950"
                  >
                    Browse tours
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {servicePillars.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.title}
                    href={service.href}
                    className="group border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-gray-900/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Icon className="h-5 w-5 text-primary" />
                      <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <h4 className="mt-7 text-xl font-serif font-bold text-gray-950">{service.title}</h4>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{service.description}</p>
                  </Link>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-gray-50 border-y border-gray-100">
        <div className="container-xl">
          <div className="mb-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em] mb-3 block">
                How we work
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-950 leading-tight max-w-2xl">
                Simple planning, fewer unknowns.
              </h2>
            </div>
            <p className="text-sm md:text-base leading-7 text-gray-600 lg:max-w-xl lg:justify-self-end">
              Our process is designed to reduce hesitation. You do not need to know every detail before asking for help.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="border border-gray-200 bg-white p-6"
              >
                <span className="text-primary text-xs font-bold tracking-wider">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-serif font-bold text-gray-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {directorMessage && (
        <section className="py-14 md:py-16 bg-white">
          <div className="container-xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid overflow-hidden border border-gray-200 bg-white shadow-sm lg:grid-cols-[0.42fr_0.58fr]"
            >
              <div className="relative min-h-[340px] bg-gray-100">
                <img
                  src={directorMessage.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=900&auto=format&fit=crop'}
                  alt={directorMessage.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-serif font-bold">{directorMessage.name}</h3>
                  <p className="mt-1 text-sm text-white/80">{directorMessage.title}</p>
                </div>
              </div>
              <div className="p-6 md:p-8 lg:p-10">
                <Quote className="h-10 w-10 text-primary/20" />
                <span className="mt-6 block text-secondary text-xs font-bold uppercase tracking-[0.22em]">
                  Message from the Director
                </span>
                <div className="mt-5 whitespace-pre-line text-sm md:text-base leading-7 text-gray-600">
                  {directorMessage.message}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-14 md:py-16 bg-white">
        <div className="container-xl">
          <div className="mb-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em] mb-3 block">
                What we stand for
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-950 leading-tight max-w-2xl">
                Travel planning built on trust.
              </h2>
            </div>
            <p className="text-sm md:text-base leading-7 text-gray-600 lg:max-w-xl lg:justify-self-end">
              The best travel agency is not the one that gives the longest package list. It is the one that helps you choose correctly.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-6 text-xl font-serif font-bold text-gray-950">{value.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {teamMembers.length > 0 && (
        <section className="py-14 md:py-16 bg-gray-50 border-y border-gray-100">
          <div className="container-xl">
            <div className="mb-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em] mb-3 block">
                  Our team
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-950 leading-tight max-w-2xl">
                  People behind the planning.
                </h2>
              </div>
              <p className="text-sm md:text-base leading-7 text-gray-600 lg:max-w-xl lg:justify-self-end">
                The team section is connected to the admin panel, so the people shown here can be updated as the company grows.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="border border-gray-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl font-bold text-gray-300">
                        {member.name?.slice(0, 1) || 'Z'}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-950">{member.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-primary">{member.role}</p>
                    {member.bio && <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{member.bio}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-14 md:py-16 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(5,95,172,0.22),transparent_32%)] pointer-events-none" />
        <div className="container-xl relative z-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="text-primary text-xs font-bold uppercase tracking-[0.22em] mb-3 block">
                Start with clarity
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight max-w-3xl">
                Not sure which route is right? Ask before you book.
              </h2>
              <p className="mt-4 text-sm md:text-base leading-7 text-gray-400 max-w-2xl">
                Share your dates, group size and travel purpose. We will help you understand the practical next step.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-primary px-7 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark"
              >
                Contact team <MessageCircle className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/tours"
                className="inline-flex items-center justify-center border border-white/15 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white hover:text-gray-950"
              >
                View tours <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
