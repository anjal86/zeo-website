"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Mail,
  Map,
  MapPin,
  Mountain,
  Phone,
  Plane,
  Shield,
  Sparkles,
} from "lucide-react";
import TourGrid from "@/components/Tours/TourGrid";
import type { Tour } from "@/services/api";

export type KailashGalleryPhoto = {
  id: number | string;
  title?: string | null;
  image: string;
  alt?: string | null;
};

type DestinationOption = {
  id: number;
  name: string;
  country?: string;
};

type ContactInfo = {
  contact?: {
    phone?: {
      primary?: string;
    };
    email?: {
      primary?: string;
    };
  };
  business?: {
    support?: {
      availability?: string;
    };
  };
};

type KailashMansarovarClientProps = {
  galleryPhotos: KailashGalleryPhoto[];
  tours: Tour[];
  destinations: DestinationOption[];
  contactInfo?: ContactInfo;
};

const fallbackGallery: KailashGalleryPhoto[] = [
  {
    id: "fallback-kailash",
    title: "Mount Kailash",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop",
    alt: "Himalayan mountain landscape representing the Kailash Mansarovar journey",
  },
];

const routeOptions = [
  {
    label: "Overland",
    title: "Kailash Overland Tour",
    duration: "13–14 days",
    difficulty: "Strenuous",
    description:
      "The classic pilgrim route with gradual road-based acclimatization and a complete journey across the Tibetan plateau.",
    bestFor: "Travellers seeking the traditional route and a slower altitude gain.",
    planningNote: "Tibet permit timing must be coordinated well before departure.",
    icon: Activity,
  },
  {
    label: "Heli-assisted",
    title: "Kailash Helicopter Tour",
    duration: "9–11 days",
    difficulty: "Moderate",
    description:
      "A shorter route using flights and helicopters through Nepalgunj, Simikot and Hilsa to reduce long overland travel.",
    bestFor: "Senior pilgrims and travellers working with limited time.",
    planningNote: "Mountain weather can affect flight and helicopter schedules.",
    icon: Plane,
  },
  {
    label: "Via Lhasa",
    title: "Kathmandu–Lhasa–Kailash",
    duration: "14–16 days",
    difficulty: "Moderate",
    description:
      "A culture-rich route combining Lhasa highlights with a measured approach toward Mansarovar and Mount Kailash.",
    bestFor: "Travellers prioritising acclimatization and Tibetan cultural context.",
    planningNote: "China visa, Tibet permit and flight coordination require extra lead time.",
    icon: MapPin,
  },
];

const planningGuides = [
  {
    href: "/kailash-mansarovar-yatra-cost",
    title: "Yatra cost breakdown",
    description: "Understand route, transport and support cost factors.",
    icon: FileText,
  },
  {
    href: "/kailash-mansarovar-yatra-documents-permits",
    title: "Permits and visas",
    description: "Review the documentation and application process.",
    icon: Shield,
  },
  {
    href: "/kailash-fitness-medical-guide",
    title: "Altitude safety and preparation",
    description: "Prepare for the physical and medical demands of the route.",
    icon: Activity,
  },
  {
    href: "/kailash-packing-list",
    title: "Packing checklist",
    description: "Plan clothing, essentials and high-altitude equipment.",
    icon: Map,
  },
];

const filters = {
  search: "",
  destination: "",
  activity: "",
};

export default function KailashMansarovarClient({
  galleryPhotos,
  tours,
  destinations,
  contactInfo,
}: KailashMansarovarClientProps) {
  const router = useRouter();
  const gallery = galleryPhotos.length > 0 ? galleryPhotos : fallbackGallery;
  const [currentSlide, setCurrentSlide] = useState(0);
  const activePhoto = gallery[currentSlide] ?? gallery[0];

  const phone = contactInfo?.contact?.phone?.primary || "+9779813641003";
  const email = contactInfo?.contact?.email?.primary || "nepal@zeotourism.com";
  const support =
    contactInfo?.business?.support?.availability || "Support throughout the planning process";
  const phoneHref = useMemo(() => phone.replace(/[^\d+]/g, ""), [phone]);

  useEffect(() => {
    if (gallery.length <= 1) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setCurrentSlide((current) => (current + 1) % gallery.length);
      }
    }, 8000);

    return () => window.clearInterval(timer);
  }, [gallery.length]);

  useEffect(() => {
    if (currentSlide >= gallery.length) setCurrentSlide(0);
  }, [currentSlide, gallery.length]);

  const goToPrevious = () =>
    setCurrentSlide((current) => (current - 1 + gallery.length) % gallery.length);
  const goToNext = () =>
    setCurrentSlide((current) => (current + 1) % gallery.length);

  const scrollToPackages = () => {
    document.getElementById("yatra-packages")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  const handleTourOpen = (tour: Tour) => {
    if (tour.slug) router.push(`/tours/${tour.slug}`);
  };

  return (
    <main className="kailash-mansarovar-page overflow-hidden bg-slate-50 text-slate-900">
      <section
        className="relative isolate min-h-[640px] overflow-hidden bg-slate-950 pt-20 md:min-h-[720px] md:pt-24"
        aria-labelledby="kailash-title"
      >
        <img
          key={activePhoto.id}
          src={activePhoto.image}
          alt={activePhoto.alt || activePhoto.title || "Mount Kailash and Lake Mansarovar"}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            if (event.currentTarget.src !== fallbackGallery[0].image) {
              event.currentTarget.src = fallbackGallery[0].image;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/72 to-slate-950/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        <div className="pointer-events-none absolute -left-24 top-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />

        <div className="container-xl relative z-10 flex min-h-[560px] items-center py-14 md:min-h-[620px] md:py-20">
          <div className="max-w-3xl rounded-[var(--panel-radius)] border border-white/15 bg-slate-950/65 p-6 text-white shadow-2xl backdrop-blur-md md:p-10">
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/60">
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-white/85">Kailash Mansarovar</span>
            </nav>

            <div className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-secondary/35 bg-secondary/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-200">
              <Mountain className="h-4 w-4" aria-hidden="true" />
              Sacred pilgrimage planning
            </div>

            <h1
              id="kailash-title"
              className="mt-5 max-w-3xl font-serif text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl md:text-6xl"
            >
              Kailash Mansarovar Yatra
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 md:text-lg md:leading-8">
              Compare the main routes, understand permits and altitude demands, and choose a journey that matches your time, fitness and travel style.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToPackages}
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-secondary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary-dark focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white"
              >
                View yatra packages
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </button>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-slate-950"
              >
                <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                Ask about cost and permits
              </Link>
            </div>

            <div className="mt-8 grid gap-3 border-t border-white/15 pt-6 sm:grid-cols-3">
              {[
                "Kathmandu-based coordination",
                "Route and permit guidance",
                support,
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm leading-6 text-white/70">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-orange-300" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {gallery.length > 1 ? (
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4" aria-label="Kailash gallery controls">
                <div className="flex items-center gap-2">
                  {gallery.map((photo, index) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-[width,background-color] duration-200 ${
                        index === currentSlide
                          ? "w-9 bg-secondary"
                          : "w-4 bg-white/35 hover:bg-white/70"
                      }`}
                      aria-label={`Show image ${index + 1}: ${photo.title || "Kailash journey"}`}
                      aria-current={index === currentSlide ? "true" : undefined}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white transition-colors hover:border-white hover:bg-white hover:text-slate-950"
                    aria-label="Previous gallery image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white transition-colors hover:border-white hover:bg-white hover:text-slate-950"
                    aria-label="Next gallery image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-8" aria-label="Yatra planning overview">
        <div className="container-xl">
          <div className="grid overflow-hidden rounded-[var(--panel-radius)] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.12)] sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "3", label: "Main route options", icon: Map },
              { value: "9–16", label: "Typical journey days", icon: Calendar },
              { value: "High altitude", label: "Preparation required", icon: Mountain },
              { value: "Permit-led", label: "Advance coordination", icon: Shield },
            ].map((fact) => {
              const Icon = fact.icon;
              return (
                <div key={fact.label} className="flex items-center gap-4 border-b border-slate-200 p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-serif text-xl font-bold text-slate-950">{fact.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{fact.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="route-comparison" className="scroll-mt-28 py-16 md:py-24">
        <div className="container-xl">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Compare your route</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
                Choose by time, altitude approach and travel style.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end">
              Every route reaches the same sacred region, but the pace, transport, acclimatization and weather exposure are different. Use this comparison as a starting point, then confirm the practical fit with our team.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {routeOptions.map((route, index) => {
              const Icon = route.icon;
              return (
                <article
                  key={route.title}
                  className="flex h-full flex-col rounded-[var(--card-radius)] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] md:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-bold tracking-[0.14em] text-slate-300">0{index + 1}</span>
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-secondary">{route.label}</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-slate-950">{route.title}</h3>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {route.duration}
                    </span>
                    <span className="inline-flex min-h-9 items-center rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800">
                      {route.difficulty}
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-600">{route.description}</p>

                  <div className="mt-6 space-y-4 border-t border-slate-200 pt-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Best for</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{route.bestFor}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Planning note</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{route.planningNote}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={scrollToPackages}
                    className="mt-auto inline-flex min-h-12 items-center justify-between rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:border-primary hover:bg-primary hover:text-white"
                  >
                    View matching itineraries
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24" aria-labelledby="planning-title">
        <div className="container-xl">
          <div className="grid overflow-hidden rounded-[var(--panel-radius)] border border-slate-200 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="bg-primary p-7 text-white md:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/12 text-orange-200">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-orange-200">Plan with clarity</p>
              <h2 id="planning-title" className="mt-3 font-serif text-3xl font-bold leading-tight md:text-4xl">
                Important decisions happen before the booking.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100">
                Route choice, permit lead time, health preparation and realistic expectations matter more on Kailash than on an ordinary holiday.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-secondary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary-dark"
              >
                Speak with a yatra planner
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              {planningGuides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="group min-h-48 bg-white p-6 transition-colors hover:bg-slate-50 md:p-8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/8 text-primary">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="mt-6 font-serif text-xl font-bold text-slate-950">{guide.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{guide.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="yatra-packages" className="scroll-mt-24 bg-slate-50 py-16 md:py-24">
        <div className="container-xl">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Current journeys</p>
              <h2 className="mt-4 font-serif text-4xl font-bold text-slate-950 md:text-5xl">Kailash Yatra packages</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Compare itinerary length, travel method, inclusions and support before selecting a departure.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <strong className="text-slate-950">{tours.length}</strong> {tours.length === 1 ? "package" : "packages"} available
            </div>
          </div>

          <div className="mt-10">
            <TourGrid
              tours={tours}
              filters={filters}
              onTourBook={handleTourOpen}
              onTourView={handleTourOpen}
              destinations={destinations}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container-xl">
          <div className="relative overflow-hidden rounded-[var(--panel-radius)] bg-primary p-7 text-white md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">Your next step</p>
                <h2 className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight md:text-5xl">
                  Confirm the right route before committing.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100">
                  Share your dates, passport situation, group size and preferred route. Our Kathmandu team will explain the realistic timing and next actions.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-secondary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary-dark"
                >
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                  Request yatra information
                </Link>
                <a
                  href={`tel:${phoneHref}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-primary"
                >
                  <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                  {phone}
                </a>
              </div>
            </div>
            <p className="relative mt-8 text-sm text-blue-100">
              Email: <a className="font-semibold text-white underline underline-offset-4" href={`mailto:${email}`}>{email}</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
