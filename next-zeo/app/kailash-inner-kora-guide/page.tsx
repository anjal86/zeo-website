"use client";


import { createOrganizationSchema, createBreadcrumbSchema , createArticleSchema, createFAQSchema} from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, Mountain, Compass, Map, Milestone } from 'lucide-react';


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } })
};

const KORA_FAQS = [
  {
    question: 'What is the difference between Outer and Inner Kora?',
    answer: 'The Outer Kora (52km) is the standard pilgrimage circuit around Mt. Kailash. The Inner Kora is an additional 22km circuit that goes much closer to the south face of Mt. Kailash, visiting Nandi Parvat and Astapad. It is much more demanding and requires special permits.'
  },
  {
    question: 'Can anyone perform the Inner Kora?',
    answer: 'Traditionally, it is said that one should complete 13 Outer Koras before attempting the Inner Kora. Physically, it requires exceptional fitness and experience in high-altitude scrambling, as the terrain is much steeper and more rugged.'
  },
  {
    question: 'Is a special permit needed for Inner Kora?',
    answer: 'Yes. The Inner Kora area is highly restricted. Zeo Tourism manages these specialized permits, but they are subject to strict approval by the local Tibet Military and Tourism bureaus.'
  },
  {
    question: 'How many extra days does Inner Kora take?',
    answer: 'A standard Inner Kora extension adds 2-3 days to the standard Yatra itinerary, allowing for the additional trek and necessary acclimatization.'
  }
];

const KORA_SITES = [
  {
    name: 'Astapad (The Eight Steps)',
    days: 'Site 1',
    best: 'Jain Significance',
    desc: 'The place where the first Jain Tirthankara, Rishabhanatha, attained Nirvana. Offers the most majestic view of the South Face of Kailash.',
    color: 'border-l-primary'
  },
  {
    name: 'Nandi Parvat',
    days: 'Site 2',
    best: 'Shiva Gateway',
    desc: 'A massive rock formation resembling Shivas bull, Nandi. Pilgrims perform a circuit around Nandi to reach the very base of Kailash.',
    color: 'border-l-secondary'
  },
  {
    name: 'Atmalingam & Sapta Rishi Cave',
    days: 'Site 3',
    best: 'Sacred Sanctum',
    desc: 'A naturally formed ice lingam and ancient meditation caves where great sages are said to have meditated for centuries.',
    color: 'border-l-green-600'
  },
];

const INNER_KORA_HIGHLIGHTS = [
  { icon: Mountain, title: 'South Face Proximity', desc: 'Get within "touching distance" of the sacred South Face, known as the "Face of Lapis Lazuli."' },
  { icon: Compass, title: 'Technical Trekking', desc: 'Experience true wilderness trekking with minimal crowds and challenging high passes.' },
  { icon: Milestone, title: 'Spiritual Milestone', desc: 'Complete the most advanced circuit in the Kailash pilgrimage tradition.' },
  { icon: Map, title: 'Khanda Sangam', desc: 'Visit the sacred confluence of rivers at the base of the mountain.' },
];

const KailashInnerKora: React.FC = () => {
  const pageUrl = 'https://www.zeotourism.com/kailash-inner-kora-guide';

  const structuredData = [
    createArticleSchema({
      title: 'Kailash Inner Kora Guide 2026 — Nandi Parvat, Astapad & Atmalingam',
      description: 'The ultimate guide to the sacred Inner Kora of Mount Kailash. Learn about the requirements, spiritual significance, and route details for Nandi Parvat and Astapad.',
      author: 'Zeo Tourism Spiritual Guides',
      publishDate: '2026-01-30',
      modifiedDate: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070',
      url: pageUrl,
      category: 'Pilgrimage Guides',
      tags: ['Inner Kora Kailash', 'Nandi Parvat trek', 'Astapad Kailash', 'Atmalingam Tibet', 'Kailash south face'],
    }),
    createFAQSchema(KORA_FAQS),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://www.zeotourism.com' },
      { name: 'Kailash Mansarovar', url: 'https://www.zeotourism.com/kailash-mansarovar' },
      { name: 'Inner Kora Guide', url: pageUrl },
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
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070')" }}
          />
          <div className="relative container mx-auto px-4 py-24 md:py-36 max-w-4xl text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="inline-block bg-secondary text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-6">
                The Advanced Pilgrimage
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
                Mount Kailash: The Sacred Inner Kora
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
                Beyond the standard path lies the "Inner Circle." A journey for the most dedicated pilgrims to the very heart of the Diamond Mountain.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                  <Mountain className="w-5 h-5" /> Inquire for Inner Kora
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
                { label: 'Circuits Required', value: '13 Outer' },
                { label: 'Inner Distance', value: '22 km' },
                { label: 'Altitude', value: '5,860m' },
                { label: 'Difficulty', value: 'Extreme' },
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

          {/* Intro */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              What is the Inner Kora?
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                While thousands complete the 52km Outer Kora (Parikrama) each year, very few attempt the <strong>Inner Kora</strong>. This sacred path brings the devotee to the base of the <strong>South Face</strong> of Mount Kailash—the face associated with the Lapis Lazuli color and the element of Earth.
              </p>
              <p>
                The Inner Kora is not a mere trek; it is a profound spiritual initiation. It involves visiting the "Face of the Bull" (Nandi Parvat) and the sacred "Eight Steps" (Astapad). It is physically grueling, often involving steep climbs over loose scree and ice, but the spiritual reward is considered incomparable.
              </p>
            </div>
          </motion.section>

          {/* Highlights */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-10">Inner Kora Highlights</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {INNER_KORA_HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Sites */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              Sacred Sites of the Inner Circle
            </h2>
            <div className="space-y-4">
              {KORA_SITES.map((s) => (
                <div key={s.name} className={`border-l-4 ${s.color} bg-gray-50 p-6`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{s.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold bg-white border border-gray-200 text-gray-600 px-3 py-1">{s.days}</span>
                      <span className="text-xs font-bold bg-primary text-white px-3 py-1">{s.best}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Warning */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="bg-amber-50 border-2 border-amber-100 p-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
                <h3 className="text-2xl font-bold text-amber-900">Important Considerations</h3>
              </div>
              <div className="space-y-4 text-amber-800 text-sm font-medium">
                <p>• The Inner Kora reaches altitudes above 5,800m. Excellent health is mandatory.</p>
                <p>• Permits are extremely difficult to obtain and are often denied at the last minute by military authorities.</p>
                <p>• We only recommend this for pilgrims who have previous high-altitude trekking experience.</p>
              </div>
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 text-center">Inner Kora FAQs</h2>
            <div className="space-y-4">
              {KORA_FAQS.map((faq) => (
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Call of the Inner Sanctum?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Inner Kora expeditions are only operated for small, private groups with expert Sherpas. Speak to us about organizing your advanced pilgrimage.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                Apply for Inner Kora <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default KailashInnerKora;
