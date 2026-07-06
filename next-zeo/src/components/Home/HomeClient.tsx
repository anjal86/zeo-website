"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  Clock,
  MessageCircle,
  Mountain,
  Shield,
  Target,
  ArrowRight,
  Phone,
  Mail,
  Clock3,
} from "lucide-react";
import Hero from "@/components/Hero/Hero";
import FeaturedDestinations, { type FeaturedDestination } from "@/components/FeaturedDestinations/FeaturedDestinations";
import TestimonialsSlider from "@/components/Testimonials/TestimonialsSlider";
import { useCountUp } from "@/hooks/useCountUp";

export type HomeData = {
  sliders: any[];
  featuredDestinations: FeaturedDestination[];
  testimonials: any[];
  contactInfo: any;
};

const planningSteps = [
  {
    href: "/destinations",
    icon: MapPin,
    eyebrow: "Find the right place",
    title: "Explore destinations",
    description: "See the main regions, routes and trip styles before choosing a package.",
    action: "View destinations",
  },
  {
    href: "/tours",
    icon: Clock,
    eyebrow: "Compare your options",
    title: "Browse tour packages",
    description: "Shortlist itineraries by duration, difficulty, budget and travel purpose.",
    action: "Browse tours",
  },
  {
    href: "/contact",
    icon: MessageCircle,
    eyebrow: "Need clarity first?",
    title: "Talk to a local expert",
    description: "Ask about timing, permits, transport and the practical details before booking.",
    action: "Get guidance",
  },
];

const packagePaths = [
  {
    label: "Kailash Yatra",
    href: "/kailash-mansarovar",
    desc: "Kailash Mansarovar Yatra planning with route, permit, transport and support clarity from Kathmandu.",
    tag: "Signature Yatra",
    bestFor: "Pilgrimage & devotion",
    icon: Mountain,
    featured: true,
    image: "/uploads/kailash-gallery/kailash_1760250707733_1760250707729_Kailash-Mansarovar.jpg"
  },
  {
    label: "Nepal Tours",
    href: "/tours",
    desc: "Culture, pilgrimage, trekking, wildlife and family-friendly journeys across Nepal.",
    tag: "Nepal",
    bestFor: "Nepal-focused travellers",
    icon: MapPin,
  },
  {
    label: "International Tours",
    href: "/destinations",
    desc: "Cross-border and overseas travel planning for travellers starting from Nepal.",
    tag: "International",
    bestFor: "Beyond Nepal",
    icon: Target,
  },
  {
    label: "Activities",
    href: "/activities",
    desc: "Helicopter tours, sightseeing, trekking, aerial darshan and add-on experiences.",
    tag: "Experiences",
    bestFor: "Short add-ons",
    icon: Clock3,
  },
  {
    label: "Custom / Private Trips",
    href: "/contact",
    desc: "Share your dates, group size and travel purpose — we will shape the right route for you.",
    tag: "Tailor-made",
    bestFor: "Unsure travellers",
    icon: MessageCircle,
  },
];

const whyFeatures = [
  {
    title: "Local planning intelligence",
    desc: "Routes, timing, weather windows and ground movement handled by people who know Nepal closely.",
    icon: Mountain,
  },
  {
    title: "Clear support before booking",
    desc: "Understand permits, transport, altitude, hotel standards and realistic expectations before you commit.",
    icon: Shield,
  },
  {
    title: "Flexible trip design",
    desc: "Private, group, pilgrimage, family and premium travel styles shaped around your actual needs.",
    icon: Target,
  },
];

const finalPlanningSteps = [
  "Share your dates, group size and travel purpose.",
  "Get route, timing and support clarity from our team.",
  "Confirm the journey only when the plan feels right.",
];

const AnimatedCounter: React.FC<{
  end: number;
  suffix?: string;
  label: string;
  duration?: number;
  dark?: boolean;
}> = ({ end, suffix = "", label, duration = 2500, dark = false }) => {
  const { count, ref } = useCountUp({
    end,
    suffix,
    duration,
    start: 0,
  });

  return (
    <div ref={ref} className="group text-center">
      <div className={`text-2xl sm:text-3xl font-bold mb-1 transition-colors duration-300 ${dark ? "text-white group-hover:text-primary" : "text-gray-900 group-hover:text-primary"}`}>
        {count}
      </div>
      <div className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>{label}</div>
    </div>
  );
};

export default function HomeClient({ sliders, featuredDestinations, testimonials, contactInfo }: HomeData) {
  const phone = contactInfo?.contact?.phone?.primary || "+9779813641003";
  const email = contactInfo?.contact?.email?.primary || "nepal@zeotourism.com";
  const support = contactInfo?.business?.support?.availability || "24/7 Support Available";

  return (
    <div className="home-page">
      <Hero initialSlides={sliders} />

      <motion.section
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="bg-gray-950 py-12 md:py-16 border-y border-white/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,119,204,0.12),transparent_32%)] pointer-events-none" />
        <div className="container-xl relative z-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.6fr] lg:items-end">
            <div>
              <span className="text-primary text-xs font-bold uppercase tracking-[0.22em] mb-3 block">
                Start here
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight max-w-xl">
                Plan with less confusion.
              </h2>
              <p className="mt-4 text-sm md:text-base text-gray-400 leading-relaxed max-w-lg">
                Choose your route, compare practical options, or ask us directly. Three simple paths instead of endless searching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {planningSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Link
                    key={step.href}
                    href={step.href}
                    className="group relative overflow-hidden border border-white/10 bg-white/[0.03] p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
                  >
                    <div className="flex items-start justify-between gap-4 mb-7">
                      <div className="w-10 h-10 border border-white/10 bg-black/20 flex items-center justify-center transition-colors group-hover:border-primary/50 group-hover:bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-white/20 tracking-wider">0{index + 1}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/90">
                      {step.eyebrow}
                    </span>
                    <h3 className="mt-3 text-lg font-serif font-bold text-white leading-tight">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-400">
                      {step.description}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white transition-colors group-hover:text-primary">
                      {step.action}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      <FeaturedDestinations featuredDestinations={featuredDestinations} />

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50/80 relative overflow-hidden border-t border-gray-100"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,96,20,0.06),transparent_30%)] pointer-events-none" />
        <div className="container-xl relative z-10">
          <div className="mb-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
            <div>
              <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em] mb-3 block">
                Choose by travel style
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-950 max-w-2xl leading-[1.05] tracking-tight">
                Start with the type of trip you need.
              </h2>
            </div>
            <div className="xl:max-w-xl xl:justify-self-end">
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                From Kailash Yatra to Nepal tours, international planning, activities and private trips — choose the closest path, then we help refine the details.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
            {packagePaths.map((item) => {
              const Icon = item.icon;
              const featured = Boolean(item.featured);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex min-h-[210px] flex-col overflow-hidden border p-6 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-4 ${featured
                    ? "border-transparent bg-gray-950 text-white shadow-lg lg:row-span-2 lg:min-h-[445px]"
                    : "border-gray-100 bg-white text-gray-950 shadow-sm hover:border-gray-200 hover:shadow-md"
                    }`}
                >
                  {featured && item.image && (
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <div className="absolute inset-0 bg-gray-950/70 z-10 transition-colors duration-300 group-hover:bg-gray-950/60" />
                      <img src={item.image} alt={item.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  )}
                  <span className={`absolute inset-x-0 top-0 h-1 z-10 transition-colors duration-300 ${featured ? "bg-primary" : "bg-transparent group-hover:bg-secondary"}`} />
                  <Icon className={`absolute bottom-5 right-5 h-20 w-20 transition-all duration-300 z-0 ${featured ? "text-white/[0.06] group-hover:text-white/10" : "text-gray-50 group-hover:text-gray-100"}`} />

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.22em] ${featured ? "text-primary" : "text-secondary"}`}>
                      {item.tag}
                    </span>
                    <span className={`h-9 w-9 flex items-center justify-center rounded-full border transition-all duration-300 ${featured ? "border-white/20 bg-white/10 text-white group-hover:bg-primary group-hover:border-primary" : "border-gray-200 bg-white text-gray-400 group-hover:bg-secondary group-hover:border-secondary group-hover:text-white"}`}>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  <div className="relative z-10 mt-auto pt-10">
                    <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.16em] ${featured ? "text-white/45" : "text-gray-400"}`}>
                      Best for {item.bestFor}
                    </p>
                    <h3 className={`font-serif font-bold leading-tight ${featured ? "text-3xl md:text-4xl" : "text-xl"}`}>
                      {item.label}
                    </h3>
                    <p className={`mt-4 text-sm leading-6 ${featured ? "text-white/65 max-w-md" : "text-gray-600"}`}>
                      {item.desc}
                    </p>
                    <div className={`mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${featured ? "text-white" : "text-gray-950 group-hover:text-secondary"}`}>
                      View details
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 grid gap-4 border-t border-gray-100 pt-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center border border-gray-200 bg-gray-50 font-bold text-gray-950">KTM</span>
                Based in Kathmandu
              </span>
              <span className="hidden h-5 w-px bg-gray-200 sm:block" />
              <span><strong className="text-gray-950">25+</strong> Years</span>
              <span className="hidden h-5 w-px bg-gray-200 sm:block" />
              <span><strong className="text-gray-950">24/7</strong> Support</span>
            </div>
            <Link
              href="/tours"
              className="inline-flex items-center justify-center border border-gray-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-950 transition-colors hover:border-gray-950 hover:bg-gray-950 hover:text-white"
            >
              Browse all tours <ArrowRight className="ml-3 w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-14 md:py-16 bg-gray-950 relative overflow-hidden border-y border-white/10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,119,204,0.16),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(255,255,255,0.06),transparent_28%)] pointer-events-none" />
        <div className="container-xl relative z-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-[0.22em] mb-4 block">
                  02 — Why Zeo
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-[1.05] tracking-tight max-w-2xl">
                  Local clarity for journeys that cannot afford guesswork.
                </h2>
                <p className="mt-5 text-sm md:text-base text-gray-400 leading-relaxed max-w-xl">
                  We combine Nepal-based ground knowledge with practical planning, so your route, support and expectations are clear before the trip begins.
                </p>
              </div>

              <div className="mt-8 grid gap-3">
                {whyFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="group flex gap-4 border border-white/10 bg-white/[0.035] p-4 transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.055]">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-white/10 bg-black/20 transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">{feature.title}</h4>
                        <p className="text-sm leading-6 text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden border border-white/10 bg-white/[0.035] p-5 md:p-6 lg:p-8">
              <Mountain className="absolute -right-8 -top-8 h-44 w-44 text-white/[0.035]" />
              <div className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="text-primary text-[10px] font-bold uppercase tracking-[0.22em]">Proof in numbers</span>
                  <p className="mt-2 text-sm text-gray-400">Experience, reach and traveller confidence at a glance.</p>
                </div>
                <Link
                  href="/contact"
                  className="hidden sm:inline-flex items-center border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-primary hover:bg-primary"
                >
                  Talk to us <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 md:gap-4">
                <div className="border border-white/10 bg-black/20 p-5 md:p-6 text-left transition-colors hover:border-primary/30 hover:bg-white/[0.04]">
                  <AnimatedCounter end={1500} suffix="+" label="Happy travelers" duration={3000} dark />
                </div>
                <div className="border border-primary/25 bg-primary/10 p-5 md:p-6 text-left transition-colors hover:bg-primary/15">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">14</div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-gray-400">Destinations</div>
                </div>
                <div className="border border-white/10 bg-black/20 p-5 md:p-6 text-left transition-colors hover:border-primary/30 hover:bg-white/[0.04]">
                  <AnimatedCounter end={25} suffix="+" label="Years experience" duration={2500} dark />
                </div>
                <div className="border border-white/10 bg-black/20 p-5 md:p-6 text-left transition-colors hover:border-primary/30 hover:bg-white/[0.04]">
                  <AnimatedCounter end={98} suffix="%" label="Satisfaction rate" duration={2800} dark />
                </div>
              </div>

              <div className="relative z-10 mt-5 border-t border-white/10 pt-5 text-sm leading-6 text-gray-400">
                <strong className="text-white">Planning promise:</strong> clear route advice, practical support and realistic guidance before you choose a package.
              </div>

              <Link
                href="/contact"
                className="mt-5 inline-flex w-full items-center justify-center border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-primary hover:bg-primary sm:hidden"
              >
                Talk to us <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      <TestimonialsSlider testimonials={testimonials} />

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-14 md:py-16 bg-gray-950 relative overflow-hidden border-t border-white/10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,119,204,0.14),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.08),transparent_26%)] pointer-events-none" />
        <div className="container-xl relative z-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="flex flex-col justify-between border border-white/10 bg-white/[0.035] p-6 md:p-8 lg:p-10">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-[0.22em] mb-4 block">
                  03 — Trip planning
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-[1.05] tracking-tight max-w-3xl">
                  Get a clear route plan before you book.
                </h2>
                <p className="mt-5 text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl">
                  Tell us your destination, dates and group size. We will help you understand the route, timing, support and practical next step.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {finalPlanningSteps.map((step, index) => (
                  <div key={step} className="border border-white/10 bg-black/20 p-4">
                    <span className="text-primary text-xs font-bold tracking-wider">0{index + 1}</span>
                    <p className="mt-3 text-sm leading-6 text-gray-300">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-primary px-7 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-gray-950"
                >
                  Start planning <ArrowRight className="ml-3 h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/tours"
                  className="inline-flex items-center justify-center border border-white/15 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white hover:text-gray-950"
                >
                  Browse packages
                </Link>
              </div>
            </div>

            <div className="border border-white/10 bg-black/20 p-6 md:p-8 lg:p-10">
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.22em]">Direct support</span>
              <h3 className="mt-4 text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
                Prefer to ask first?
              </h3>
              <p className="mt-4 text-sm leading-6 text-gray-400">
                Reach the Kathmandu team directly for route advice, pilgrimage planning, helicopter options and custom itineraries.
              </p>

              <div className="mt-8 grid gap-3">
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="group flex items-center gap-4 border border-white/10 bg-white/[0.035] p-4 transition-colors hover:border-primary/40 hover:bg-white/[0.055]"
                >
                  <span className="flex h-11 w-11 items-center justify-center border border-white/10 bg-black/20 text-primary">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Call</span>
                    <span className="mt-1 block text-sm font-semibold text-white">{phone}</span>
                  </span>
                </a>

                <a
                  href={`mailto:${email}`}
                  className="group flex items-center gap-4 border border-white/10 bg-white/[0.035] p-4 transition-colors hover:border-primary/40 hover:bg-white/[0.055]"
                >
                  <span className="flex h-11 w-11 items-center justify-center border border-white/10 bg-black/20 text-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Email</span>
                    <span className="mt-1 block text-sm font-semibold text-white">{email}</span>
                  </span>
                </a>

                <div className="flex items-center gap-4 border border-white/10 bg-white/[0.035] p-4">
                  <span className="flex h-11 w-11 items-center justify-center border border-white/10 bg-black/20 text-primary">
                    <Clock3 className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Support</span>
                    <span className="mt-1 block text-sm font-semibold text-white">{support}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
