"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Mountain,
  Phone,
  Shield,
  Target,
} from "lucide-react";
import Hero from "@/components/Hero/Hero";
import FeaturedDestinations, {
  type FeaturedDestination,
} from "@/components/FeaturedDestinations/FeaturedDestinations";
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
    desc: "Kailash Mansarovar planning with route, permit, transport and support clarity from Kathmandu.",
    tag: "Signature Yatra",
    bestFor: "Pilgrimage and devotion",
    icon: Mountain,
    featured: true,
    image: "/uploads/kailash-gallery/kailash_1760250707733_1760250707729_Kailash-Mansarovar.jpg",
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
    bestFor: "Journeys beyond Nepal",
    icon: Target,
  },
  {
    label: "Activities",
    href: "/activities",
    desc: "Helicopter tours, sightseeing, trekking, aerial darshan and short add-on experiences.",
    tag: "Experiences",
    bestFor: "Shorter add-ons",
    icon: Clock3,
  },
  {
    label: "Custom / Private Trips",
    href: "/contact",
    desc: "Share your dates, group size and travel purpose. We will shape the route around you.",
    tag: "Tailor-made",
    bestFor: "Travellers who need flexibility",
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
    title: "Clarity before commitment",
    desc: "Understand permits, transport, altitude, hotel standards and realistic expectations before you book.",
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

function AnimatedCounter({
  end,
  suffix = "",
  label,
  duration = 2500,
}: {
  end: number;
  suffix?: string;
  label: string;
  duration?: number;
}) {
  const { count, ref } = useCountUp({ end, suffix, duration, start: 0 });

  return (
    <div ref={ref} className="border-l border-white/15 pl-5 first:border-l-0 first:pl-0">
      <div className="text-2xl font-bold text-white sm:text-3xl">{count}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
        {label}
      </div>
    </div>
  );
}

export default function HomeClient({
  sliders,
  featuredDestinations,
  testimonials,
  contactInfo,
}: HomeData) {
  const phone = contactInfo?.contact?.phone?.primary || "+9779813641003";
  const email = contactInfo?.contact?.email?.primary || "nepal@zeotourism.com";
  const support = contactInfo?.business?.support?.availability || "24/7 support available";

  return (
    <div className="home-page bg-white">
      <Hero initialSlides={sliders} />

      <section className="relative z-20 -mt-7 pb-14 sm:-mt-10 sm:pb-16 lg:-mt-14">
        <div className="container-xl">
          <div className="border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
            <div className="grid lg:grid-cols-[0.72fr_2.28fr]">
              <div className="border-b border-slate-200 bg-slate-950 p-6 text-white md:p-8 lg:border-b-0 lg:border-r">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Start here</p>
                <h2 className="mt-4 max-w-sm font-serif text-3xl font-bold leading-tight md:text-4xl">
                  Plan with less confusion.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
                  Choose a route, compare packages or ask our Kathmandu team directly.
                </p>
              </div>

              <div className="grid md:grid-cols-3">
                {planningSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <Link
                      key={step.href}
                      href={step.href}
                      className="group relative border-b border-slate-200 p-6 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset md:border-b-0 md:border-r md:last:border-r-0 lg:p-7"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50 text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-bold tracking-[0.16em] text-slate-300">0{index + 1}</span>
                      </div>
                      <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                        {step.eyebrow}
                      </p>
                      <h3 className="mt-2 font-serif text-xl font-bold text-slate-950">{step.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
                      <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-950 transition-colors group-hover:text-primary">
                        {step.action}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedDestinations featuredDestinations={featuredDestinations} />

      <section className="border-t border-slate-100 bg-white py-16 md:py-24">
        <div className="container-xl">
          <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Choose by travel style</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[1.02] tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                Start with the journey that feels closest.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600 lg:justify-self-end">
              From Kailash Yatra to Nepal tours, international travel and private planning, choose a starting point and refine the details with us.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[235px]">
            {packagePaths.map((item, index) => {
              const Icon = item.icon;
              const featured = Boolean(item.featured);
              const layoutClass = featured
                ? "lg:col-span-7 lg:row-span-2"
                : index <= 2
                  ? "lg:col-span-5"
                  : "lg:col-span-6";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex min-h-[235px] overflow-hidden border focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-4 ${layoutClass} ${
                    featured
                      ? "border-slate-950 bg-slate-950 text-white md:col-span-2"
                      : "border-slate-200 bg-slate-50 text-slate-950 transition-colors hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  {featured && item.image ? (
                    <>
                      <img
                        src={item.image}
                        alt="Mount Kailash and Mansarovar journey"
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
                    </>
                  ) : null}

                  <div className="relative z-10 flex w-full flex-col p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${featured ? "text-primary" : "text-secondary"}`}>
                          {item.tag}
                        </p>
                        <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.14em] ${featured ? "text-white/45" : "text-slate-400"}`}>
                          Best for {item.bestFor}
                        </p>
                      </div>
                      <span className={`flex h-10 w-10 items-center justify-center border ${featured ? "border-white/20 bg-black/20 text-white" : "border-slate-200 bg-white text-primary"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="mt-auto pt-10">
                      <h3 className={`font-serif font-bold leading-tight ${featured ? "max-w-lg text-4xl md:text-5xl" : "text-2xl"}`}>
                        {item.label}
                      </h3>
                      <p className={`mt-4 max-w-xl text-sm leading-6 ${featured ? "text-white/65" : "text-slate-600"}`}>
                        {item.desc}
                      </p>
                      <span className={`mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${featured ? "text-white" : "text-slate-950 group-hover:text-secondary"}`}>
                        Explore this path
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-9 flex flex-col gap-5 border-t border-slate-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-950">Kathmandu-based planning</span>
              <span aria-hidden="true" className="hidden h-4 w-px bg-slate-200 sm:block" />
              <span><strong className="text-slate-950">25+</strong> years of experience</span>
              <span aria-hidden="true" className="hidden h-4 w-px bg-slate-200 sm:block" />
              <span><strong className="text-slate-950">24/7</strong> trip support</span>
            </div>
            <Link
              href="/tours"
              className="inline-flex items-center justify-center border border-slate-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-950 transition-colors hover:border-slate-950 hover:bg-slate-950 hover:text-white"
            >
              Browse all tours <ArrowRight className="ml-3 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-16 text-white md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(5,95,172,0.28),transparent_38%)]" />
        <div className="container-xl relative">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Why Zeo Tourism</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[1.03] tracking-tight md:text-5xl lg:text-6xl">
                Local clarity for journeys that cannot afford guesswork.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/60">
                Nepal-based ground knowledge, practical planning and clear expectations before the journey begins.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-3 border-b border-white/30 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-primary hover:text-primary"
              >
                Learn about our team <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="border-t border-white/15">
              {whyFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="grid gap-5 border-b border-white/15 py-7 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                    <span className="flex h-12 w-12 items-center justify-center border border-white/15 bg-white/[0.04] text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-white">{feature.title}</h3>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">{feature.desc}</p>
                    </div>
                    <span className="text-xs font-bold tracking-[0.16em] text-white/25">0{index + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-y-7 border-t border-white/15 pt-8 sm:grid-cols-4">
            <AnimatedCounter end={1500} suffix="+" label="Happy travellers" duration={3000} />
            <AnimatedCounter end={14} label="Destinations" duration={1800} />
            <AnimatedCounter end={25} suffix="+" label="Years experience" />
            <AnimatedCounter end={98} suffix="%" label="Satisfaction" duration={2800} />
          </div>
        </div>
      </section>

      <TestimonialsSlider testimonials={testimonials} />

      <section className="relative overflow-hidden bg-primary py-16 text-white md:py-20">
        <div className="pointer-events-none absolute -right-20 -top-28 h-96 w-96 border border-white/10" />
        <div className="container-xl relative">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">Your next step</p>
              <h2 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-[1.02] tracking-tight md:text-5xl lg:text-6xl">
                Get a clear route plan before you book.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">
                Tell us your destination, dates and group size. We will help you understand the route, timing, support and practical next step.
              </p>

              <ol className="mt-8 grid gap-4 sm:grid-cols-3">
                {finalPlanningSteps.map((step, index) => (
                  <li key={step} className="border-t border-white/25 pt-4">
                    <span className="text-xs font-bold tracking-[0.16em] text-white/50">0{index + 1}</span>
                    <p className="mt-3 text-sm leading-6 text-white/85">{step}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-white px-7 py-4 text-xs font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-slate-950 hover:text-white"
                >
                  Start planning <ArrowRight className="ml-3 h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/tours"
                  className="inline-flex items-center justify-center border border-white/35 px-7 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white hover:text-primary"
                >
                  Browse packages
                </Link>
              </div>
            </div>

            <aside className="border border-white/20 bg-slate-950/20 p-6 md:p-8" aria-label="Direct support">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">Direct support</p>
              <h3 className="mt-3 font-serif text-3xl font-bold">Prefer to ask first?</h3>
              <p className="mt-4 text-sm leading-6 text-white/70">
                Reach the Kathmandu team for route advice, pilgrimage planning and custom itineraries.
              </p>

              <div className="mt-7 divide-y divide-white/15 border-y border-white/15">
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="group flex items-center gap-4 py-5">
                  <Phone className="h-4 w-4 text-white/60" />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Call</span>
                    <span className="mt-1 block text-sm font-semibold text-white group-hover:underline">{phone}</span>
                  </span>
                </a>
                <a href={`mailto:${email}`} className="group flex items-center gap-4 py-5">
                  <Mail className="h-4 w-4 text-white/60" />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Email</span>
                    <span className="mt-1 block break-all text-sm font-semibold text-white group-hover:underline">{email}</span>
                  </span>
                </a>
                <div className="flex items-center gap-4 py-5">
                  <Clock3 className="h-4 w-4 text-white/60" />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Support</span>
                    <span className="mt-1 block text-sm font-semibold text-white">{support}</span>
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
