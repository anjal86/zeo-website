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
                    ? "border-gray-950 bg-gray-950 text-white hover:shadow-2xl hover:shadow-gray-950/20 lg:row-span-2 lg:min-h-[445px]"
                    : "border-gray-200 bg-gradient-to-br from-white via-white to-gray-50/70 text-gray-950 shadow-sm hover:border-secondary hover:shadow-xl hover:shadow-gray-900/5"
                    }`}
                >
                  <span className={`absolute inset-x-0 top-0 h-1 ${featured ? "bg-primary" : "bg-secondary/70"}`} />
                  <Icon className={`absolute bottom-5 right-5 h-20 w-20 transition-all duration-300 ${featured ? "text-white/[0.06] group-hover:text-primary/10" : "text-gray-100 group-hover:text-secondary/10"}`} />

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
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="py-16 md:py-20 bg-gray-950 relative overflow-hidden"
      >
        <div className="container-xl relative z-10">
          <div className="mb-10">
            <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
              02 — Why Zeo
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-6 leading-tight max-w-xl">
                Born in the <span className="text-primary italic font-light">Mountains</span>
              </h2>
              <p className="text-sm md:text-base text-gray-400 mb-8 leading-relaxed max-w-lg">
                With decades of experience and deep-rooted connections to Nepal&apos;s mountains and culture, we deliver authentic adventures that exceed expectations.
              </p>

              <div className="space-y-4 border-t border-gray-800 pt-6">
                {[
                  { title: "Local Expertise", desc: "Generations of knowledge and authentic cultural connections.", icon: Mountain },
                  { title: "Safety First", desc: "Certified guides, 24/7 medical support, and advanced equipment.", icon: Shield },
                  { title: "Personalized Journeys", desc: "Customized itineraries tailored to your specific dreams.", icon: Target },
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4 items-start group p-4 -mx-4 hover:bg-white/[0.03] transition-colors duration-300">
                    <div className="w-10 h-10 bg-white/[0.05] flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all duration-300">
                      <feature.icon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{feature.title}</h4>
                      <p className="text-gray-500 leading-relaxed text-xs">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/[0.03] p-5 sm:p-6 text-center flex flex-col items-center justify-center border border-white/10 hover:border-primary/20 hover:bg-white/[0.06] transition-all duration-300">
                <AnimatedCounter end={1500} suffix="+" label="Happy Travelers" duration={3000} dark />
              </div>
              <div className="bg-primary/10 p-5 sm:p-6 text-center flex flex-col items-center justify-center border border-primary/20 hover:bg-primary/20 transition-all duration-300 group">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">14</div>
                <div className="text-xs uppercase tracking-wider font-semibold text-gray-400 group-hover:text-white/80 transition-colors">Destinations</div>
              </div>
              <div className="bg-white/[0.03] p-5 sm:p-6 text-center flex flex-col items-center justify-center border border-white/10 hover:border-primary/20 hover:bg-white/[0.06] transition-all duration-300">
                <AnimatedCounter end={25} suffix="+" label="Years Experience" duration={2500} dark />
              </div>
              <div className="bg-white/[0.03] p-5 sm:p-6 text-center flex flex-col items-center justify-center border border-white/10 hover:border-primary/20 hover:bg-white/[0.06] transition-all duration-300">
                <AnimatedCounter end={98} suffix="%" label="Satisfaction Rate" duration={2800} dark />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <TestimonialsSlider testimonials={testimonials} />

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-20 bg-gray-950 relative overflow-hidden"
      >
        <div className="container-xl relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
              03 — Start Your Journey
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white leading-[1.1] mb-6">
              Ready for your next <span className="text-primary italic font-light">great adventure?</span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Let our Kathmandu-based team craft a personalized itinerary that turns your travel dreams into reality.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                href="/destinations"
                className="bg-primary text-white px-8 py-3 font-bold text-xs tracking-wider uppercase hover:bg-white hover:text-gray-950 transition-colors duration-300 inline-flex items-center gap-2 group"
              >
                Start Planning <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="border border-gray-700 text-gray-300 px-8 py-3 font-bold text-xs tracking-wider uppercase hover:border-white hover:text-white transition-colors duration-300"
              >
                Get Consultation
              </Link>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-800">
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-400">{contactInfo?.contact?.phone?.primary || "+977-1-4123456"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-400">{contactInfo?.contact?.email?.primary || "info@zeotourism.com"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock3 className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-400">{contactInfo?.business?.support?.availability || "24/7 Support Available"}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
