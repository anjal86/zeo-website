"use client";


import { createOrganizationSchema, createBreadcrumbSchema , createArticleSchema, createFAQSchema} from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Calendar, MapPin, Users, Star, Phone, ArrowRight, Shield, AlertCircle } from 'lucide-react';


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } })
};

const FAQS = [
  {
    question: 'How do I go to Kailash Mansarovar from India?',
    answer: 'The most popular route for Indian pilgrims is via Kathmandu, Nepal. You fly to Kathmandu and Zeo Tourism handles all Tibet travel permits, Chinese group visa, accommodation, transport, and a Hindi-speaking guide for the full journey (12–21 days).'
  },
  {
    question: 'Can NRIs (Non-Resident Indians) do Kailash Mansarovar Yatra?',
    answer: 'Yes. NRIs holding a valid Indian passport are fully eligible for Kailash Mansarovar Yatra. Zeo Tourism specialises in NRI Yatra packages — we handle all Chinese group visa processing and Tibet permits from Kathmandu on your behalf.'
  },
  {
    question: 'What is the best time for Kailash Mansarovar Yatra?',
    answer: 'May to September is the open season. June–August is peak with warm weather but more pilgrims. May and September offer clearer skies and fewer crowds. The route is completely closed October to April due to heavy snowfall.'
  },
  {
    question: 'Is a helicopter option available for Kailash Mansarovar Yatra?',
    answer: 'Yes. Zeo Tourism offers a helicopter-assisted Yatra for senior citizens or those with limited mobility. The helicopter covers the most demanding trekking sections. The full Yatra still takes 12–14 days including the sacred Parikrama on foot.'
  },
  {
    question: 'What permits are required for Kailash Mansarovar Yatra?',
    answer: 'You need: (1) Chinese Group Visa, (2) Tibet Travel Permit (TTP), and (3) Alien Travel Permit (ATP). Zeo Tourism processes all three on your behalf from Kathmandu — you just need to provide your passport copies.'
  },
  {
    question: 'How much does Kailash Mansarovar Yatra cost from Nepal?',
    answer: 'Zeo Tourism packages start from USD 2,499 per person for the standard 13-day itinerary from Kathmandu. This includes Tibet permits, accommodation, meals, transport, and a licensed guide. Helicopter and luxury upgrades are available at higher price points.'
  },
  {
    question: 'How physically fit do I need to be for Kailash Mansarovar Yatra?',
    answer: 'The Yatra reaches 5,630m (Dolma La Pass) — the highest point of the Parikrama. A moderate level of fitness is essential. Zeo Tourism recommends 4–6 weeks of walking practice before departure. Our team provides detailed pre-trip fitness guidance.'
  },
  {
    question: 'What is the Parikrama of Mount Kailash?',
    answer: 'The Parikrama (or Kora) is a 52 km circumambulation of Mount Kailash completed over 3 days. It is the central spiritual act of the entire Yatra — Hindus, Buddhists, Jains and Bonpos all consider it the holiest circuit on Earth. Zeo Tourism guides you through every step.'
  },
];

const ROUTES = [
  {
    name: 'Kathmandu – Lhasa – Kailash',
    days: '13–16 Days',
    best: 'Most Popular',
    desc: 'Fly Kathmandu–Lhasa, drive to Kailash via Gyantse & Shigatse. Best acclimatisation profile. Recommended for Indian pilgrims and NRIs.',
    color: 'border-l-primary'
  },
  {
    name: 'Helicopter (Simikot – Hilsa)',
    days: '12–14 Days',
    best: 'Senior Friendly',
    desc: 'Helicopter from Simikot bypasses the most demanding trek. Ideal for elderly pilgrims or those with limited mobility.',
    color: 'border-l-secondary'
  },
  {
    name: 'Lipulekh Pass (India Route)',
    days: '21–24 Days',
    best: 'India Departure',
    desc: 'Operated by KMVN via Ministry of External Affairs quota. Starts in India (Dharchula). Limited seats via government lottery system.',
    color: 'border-l-green-600'
  },
];

const INCLUDES = [
  'Tibet Travel Permit (TTP) & Alien Travel Permit (ATP)',
  'Chinese Group Visa processing',
  'All accommodation (hotels + guesthouses)',
  'All meals during the Yatra',
  'Private transport Kathmandu–Kailash–Kathmandu',
  'Licensed English & Hindi-speaking guide',
  'Emergency oxygen cylinders',
  'Pre-trip Yatra briefing & support',
];

const WHY = [
  { icon: Star, title: 'Review-led planning', desc: 'Traveler feedback and common pilgrim questions shape the route, document and briefing process.' },
  { icon: Shield, title: 'Permit-focused support', desc: 'Planning emphasizes passport checks, China visa timing, Tibet permits and pre-trip document review.' },
  { icon: Users, title: 'Hindi-Speaking Guides', desc: 'All guides fluent in Hindi. Communication is never a barrier for Indian and NRI clients.' },
  { icon: Clock, title: 'Altitude-aware pacing', desc: 'Itineraries account for acclimatization, weather windows and backup coordination around the Tibet route.' },
];

const KailashGuide: React.FC = () => {
  const pageUrl = 'https://zeotourism.com/kailash-mansarovar-yatra-guide';

  const structuredData = [
    createArticleSchema({
      title: 'Complete Kailash Mansarovar Yatra Guide 2026 — For Indian Pilgrims & NRIs',
      description: 'Everything Indian pilgrims and NRIs need to know about planning Kailash Mansarovar Yatra: routes, permits, costs, best time, fitness requirements, and how to book with Nepal\'s top-rated operator Zeo Tourism.',
      author: 'Zeo Tourism Experts',
      publishDate: '2026-01-01',
      image: 'https://zeotourism.com/images/kailash-mansarovar-yatra.jpg',
      url: pageUrl,
      category: 'Pilgrimage Guides',
      tags: ['Kailash Mansarovar Yatra', 'Kailash Yatra from India', 'NRI Kailash tour', 'Mount Kailash pilgrimage', 'Tibet pilgrimage Nepal'],
    }),
    createFAQSchema(FAQS),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://zeotourism.com' },
      { name: 'Kailash Mansarovar', url: 'https://zeotourism.com/kailash-mansarovar' },
      { name: 'Complete Yatra Guide', url: pageUrl },
    ]),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      

      <div className="bg-white">
        {/* Hero */}
        <section className="relative bg-slate-900 text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601999109497-ba1c7b6e0cfb?q=80&w=2070')" }}
          />
          <div className="relative container mx-auto px-4 py-24 md:py-36 max-w-4xl">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="inline-block bg-secondary text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-6">
                Complete Pilgrimage Guide
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
                Kailash Mansarovar Yatra 2026 — The Complete Guide for Indian Pilgrims & NRIs
              </h1>
              <p className="text-xl text-white/80 max-w-3xl leading-relaxed mb-8">
                This Zeo Tourism guide answers the key questions Indian travelers and NRIs ask before planning Mount Kailash: routes, permits, cost, documents, altitude safety, packing and booking support from Nepal.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/kailash-mansarovar"
                  className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors"
                >
                  View Yatra Packages <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Free Consultation
                </Link>
                <Link
                  href="/kailash-mansarovar-yatra-cost"
                  className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 transition-colors"
                >
                  Cost Guide <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="bg-primary text-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
              {[
                { label: 'Duration', value: '12–21 Days' },
                { label: 'Best Season', value: 'May – Sep' },
                { label: 'Starting From', value: 'USD 2,499' },
                { label: 'Max Altitude', value: '5,630 m' },
              ].map(s => (
                <div key={s.label} className="text-center py-6 px-4">
                  <p className="text-2xl md:text-3xl font-bold">{s.value}</p>
                  <p className="text-white/70 text-sm mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl py-16 space-y-20">

          {/* What is it */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              What is Kailash Mansarovar Yatra?
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong>Kailash Mansarovar Yatra</strong> is a sacred pilgrimage to <strong>Mount Kailash</strong> (6,638 m) and <strong>Lake Mansarovar</strong> in the Tibet Autonomous Region of China. It is considered the holiest pilgrimage in Hinduism, Buddhism, Jainism, and the Bon tradition.
              </p>
              <p>
                For Hindus, Mount Kailash is the abode of Lord Shiva. Taking a holy dip in Lake Mansarovar and completing the 52 km <strong>Parikrama (Kora)</strong> around Mount Kailash is believed to wash away the sins of a lifetime and break the cycle of rebirth.
              </p>
              <p>
                The Yatra is physically demanding — the route crosses <strong>Dolma La Pass at 5,630 m</strong> — but with proper preparation and an experienced operator like Zeo Tourism, it is achievable for most healthy adults.
              </p>
            </div>
          </motion.section>

          {/* Routes */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              Routes to Kailash Mansarovar
            </h2>
            <div className="space-y-4">
              {ROUTES.map((r) => (
                <div key={r.name} className={`border-l-4 ${r.color} bg-gray-50 p-6`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{r.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold bg-white border border-gray-200 text-gray-600 px-3 py-1">{r.days}</span>
                      <span className="text-xs font-bold bg-primary text-white px-3 py-1">{r.best}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{r.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              * Zeo Tourism primarily operates the <strong>Kathmandu–Lhasa–Kailash route</strong> and the <strong>helicopter-assisted Simikot route</strong>.
            </p>
          </motion.section>

          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Cost, documents and route planning
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/kailash-mansarovar-yatra-cost" className="border border-gray-200 p-6 hover:border-primary transition-colors">
                <h3 className="font-bold text-gray-900 mb-2">Kailash Mansarovar Yatra Cost 2026</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Understand route, season, group size, permit and backup factors before requesting a current quote.</p>
              </Link>
              <Link href="/kailash-mansarovar-yatra-documents-permits" className="border border-gray-200 p-6 hover:border-primary transition-colors">
                <h3 className="font-bold text-gray-900 mb-2">Documents and Permit Guide</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Check passport, China visa, Tibet Travel Permit, restricted-area permit and safety-readiness steps.</p>
              </Link>
            </div>
          </motion.section>

          {/* Best Time */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Best Time for Kailash Mansarovar Yatra
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { month: 'May', tag: 'Ideal', desc: 'Fewer pilgrims, stable weather, good visibility. Highly recommended.' },
                { month: 'June – August', tag: 'Peak Season', desc: 'Warm and accessible. Most popular time. Book early.' },
                { month: 'September', tag: 'Ideal', desc: 'Post-monsoon clarity. Excellent mountain views. Less crowded.' },
                { month: 'Oct – Apr', tag: 'Closed', desc: 'Route closed due to snow. No Yatra possible during these months.' },
              ].map((t) => (
                <div key={t.month} className="flex gap-4 p-5 border border-gray-100 bg-gray-50">
                  <Calendar className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{t.month}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 ${t.tag === 'Closed' ? 'bg-red-100 text-red-700' : t.tag === 'Peak Season' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{t.tag}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Includes */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              What's Included in a Zeo Tourism Yatra Package
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {INCLUDES.map(item => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* NRI Section */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="bg-primary/5 border border-primary/20 p-8 md:p-10">
            <div className="flex items-start gap-4 mb-5">
              <MapPin className="w-7 h-7 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                  Kailash Mansarovar Yatra for NRIs — What You Need to Know
                </h2>
              </div>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>NRIs (Non-Resident Indians) holding a <strong>valid Indian passport</strong> can complete the Kailash Mansarovar Yatra through Nepal without any special government quota.</p>
              <p>Unlike the Indian government's KMVN route (which operates via lottery), <strong>Zeo Tourism's Nepal-based packages have no quota restrictions</strong> — you choose your dates and we confirm availability.</p>
              <p><strong>OCI cardholders</strong> should contact us to verify eligibility as Chinese visa rules for OCI holders may differ.</p>
              <div className="mt-4">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 hover:bg-primary-dark transition-colors">
                  Enquire as an NRI <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Permits */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Permits Required for Kailash Mansarovar Yatra
            </h2>
            <div className="space-y-3">
              {[
                { name: 'Chinese Group Visa', desc: 'Individual tourist visas are not issued for Tibet. A group visa arranged through a licensed operator (like Zeo Tourism) is mandatory.' },
                { name: 'Tibet Travel Permit (TTP)', desc: 'Issued by the Tibet Tourism Bureau. Required for all foreign nationals entering Tibet. Zeo Tourism applies on your behalf.' },
                { name: 'Alien Travel Permit (ATP)', desc: 'Required to access restricted areas including the Kailash Mansarovar region. Processed in Lhasa by our team.' },
              ].map((p, i) => (
                <div key={p.name} className="flex gap-4 p-5 border border-gray-200">
                  <div className="w-8 h-8 bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{p.name}</h3>
                    <p className="text-gray-600 text-sm">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 p-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800"><strong>Important:</strong> Permit processing takes 4–6 weeks. Do not book flights until permits are confirmed. Zeo Tourism guides you through the entire process with dedicated support.</p>
            </div>
          </motion.section>

          {/* Why Zeo */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              Why Indian Pilgrims & NRIs Choose Zeo Tourism
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {WHY.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group border border-gray-200">
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition-colors list-none">
                    {faq.question}
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </motion.section>

          {/* Final CTA */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="bg-slate-900 text-white p-10 md:p-14 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to Begin Your Sacred Journey?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Our Yatra specialists are available to answer every question and build a personalised itinerary for you or your family.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/kailash-mansarovar" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                View All Yatra Packages <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 transition-colors">
                <Phone className="w-5 h-5" /> Speak to an Expert
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default KailashGuide;
