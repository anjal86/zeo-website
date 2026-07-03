import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Thermometer, Briefcase, Pill, ScrollText, Star, ShoppingBag, MapPin, Shield } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { createArticleSchema, createFAQSchema, createBreadcrumbSchema } from '../utils/schema';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } })
};

const PACKING_FAQS = [
  {
    question: 'How much luggage can I carry on the Kailash Yatra?',
    answer: 'We recommend one large duffel bag (max 15kg) which our porters/yaks will carry, and one small daypack (20-30L) for your essentials like water, camera, and snacks that you will carry yourself.'
  },
  {
    question: 'Do I need to bring my own sleeping bag?',
    answer: 'While we provide clean blankets in guesthouses, we strongly recommend bringing your own high-quality sleeping bag (rated for -10°C to -15°C) for hygiene and extra warmth during the cold Tibet nights.'
  },
  {
    question: 'Are specialized trekking boots necessary?',
    answer: 'Yes. You need sturdy, waterproof trekking boots with good ankle support. Make sure to "break them in" by walking at least 50-100km in them before the trip to avoid blisters.'
  },
  {
    question: 'Can I buy gear in Kathmandu?',
    answer: 'Yes! Kathmandu\'s Thamel district is a hub for trekking gear. You can find everything from North Face originals to high-quality local brands at very reasonable prices.'
  }
];

const GEAR_CATEGORIES = [
  {
    name: 'Upper Body Layering',
    items: ['Thermal base layers (Moisture-wicking)', 'Fleece or mid-layer jacket', 'Heavy down jacket (must be rated for -15°C)', 'Waterproof shell/Rain jacket'],
    icon: Thermometer
  },
  {
    name: 'Footwear & Legwear',
    items: ['Waterproof trekking boots (Broken-in)', 'Trekking trousers (convertible preferred)', 'Woolen trekking socks (4-5 pairs)', 'Thermal leggings'],
    icon: MapPin
  },
  {
    name: 'Head & Hand Gear',
    items: ['Warm woolen hat/beanie', 'Sun hat or baseball cap', 'Polarized sunglasses (UV protection)', 'Waterproof thermal gloves'],
    icon: Shield
  },
  {
    name: 'Spiritual & Personal',
    items: ['Rudraksha Mala / Prayer items', 'Personal water bottle (2 Liters)', 'Power bank (20,000mAh+)', 'Headlamp with extra batteries'],
    icon: Star
  }
];

const MEDICAL_KIT = [
  'Diamox (Acetazolamide) for altitude sickness',
  'Broad-spectrum antibiotics',
  'Painkillers (Ibuprofen/Paracetamol)',
  'Anti-diarrheal medication (Imodium)',
  'Multi-vitamins and Electrolyte powders',
  'Personal prescription medicines (enough for 20 days)',
];

const KailashPackingList: React.FC = () => {
  const pageUrl = 'https://www.zeotourism.com/kailash-packing-list';

  const structuredData = [
    createArticleSchema({
      title: 'Ultimate Kailash Mansarovar Packing List 2026 — Gear, Meds & Spiritual Essentials',
      description: 'Comprehensive packing guide for Kailash Mansarovar Yatra. Includes layering tips, medical kit essentials, spiritual items, and gear recommendations for the high-altitude trek.',
      author: 'Zeo Tourism Gear Experts',
      publishDate: '2026-01-25',
      modifiedDate: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070',
      url: pageUrl,
      category: 'Pilgrimage Guides',
      tags: ['Kailash packing list', 'Tibet trekking gear', 'Kailash Yatra medicines', 'spiritual items for Kailash', 'high altitude clothing'],
    }),
    createFAQSchema(PACKING_FAQS),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://www.zeotourism.com' },
      { name: 'Kailash Mansarovar', url: 'https://www.zeotourism.com/kailash-mansarovar' },
      { name: 'Packing List', url: pageUrl },
    ]),
  ];

  return (
    <>
      <SEO
        title="Kailash Mansarovar Packing List 2026 | Gear & Medicine Guide"
        description="Don't overpack or under-prepare! See the official Zeo Tourism packing list for Kailash Mansarovar. Clothing, boots, spiritual items, and emergency medicine kit."
        keywords="Kailash Mansarovar packing list, Yatra gear guide, Tibet trekking boots, cold weather clothing for Kailash, pilgrimage essentials"
        url={pageUrl}
        image="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070"
        type="article"
        structuredData={structuredData}
      />

      <div className="bg-white">
        {/* Hero */}
        <section className="relative bg-slate-900 text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070')" }}
          />
          <div className="relative container mx-auto px-4 py-24 md:py-36 max-w-4xl text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="inline-block bg-secondary text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-6">
                Official Preparation Guide
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
                Kailash Mansarovar Yatra: The Ultimate Packing List
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
                Preparation is the key to a successful pilgrimage. Our guide ensures you have exactly what you need for the extreme temperatures and high altitude of the Tibetan plateau.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                  <Briefcase className="w-5 h-5" /> Get Printable PDF List
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
                { label: 'Max Temp', value: '15°C' },
                { label: 'Min Temp', value: '-15°C' },
                { label: 'Bag Limit', value: '15kg + 5kg' },
                { label: 'Gear Focus', value: 'Layers' },
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
              The "Three Bag" System
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                Packing for Mount Kailash is a balancing act between warmth and weight. We recommend a "Three Bag" system to keep your journey organized and comfortable:
              </p>
              <div className="grid md:grid-cols-3 gap-6 not-prose mt-8">
                {[
                  { title: 'The Duffel', desc: 'Large 80L-100L waterproof bag. Carried by our team/yaks. Holds all your main clothing and gear.' },
                  { title: 'The Daypack', desc: 'Small 20L-30L backpack you carry. Holds water, snacks, camera, and rain gear.' },
                  { title: 'The Sacred Bag', desc: 'Small pouch or waist bag for passport, permits, currency, and spiritual items.' },
                ].map(bag => (
                  <div key={bag.title} className="p-6 bg-gray-50 border border-gray-100 rounded-none">
                    <h3 className="font-bold text-gray-900 mb-2">{bag.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{bag.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Gear Categories */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              Essential Clothing & Gear
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {GEAR_CATEGORIES.map((cat) => (
                <div key={cat.name} className="p-8 border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                      <cat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                  </div>
                  <ul className="space-y-3">
                    {cat.items.map(item => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Medical Kit */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-slate-900 text-white p-8 md:p-12">
            <div className="flex items-center gap-4 mb-4">
              <Pill className="w-10 h-10 text-secondary" />
              <h2 className="text-3xl font-serif font-bold text-white">Your Emergency Medical Kit</h2>
            </div>
            <p className="text-white/60 mb-8">Having the right gear is only half the battle. Read our <Link to="/kailash-fitness-medical-guide" className="text-secondary font-bold hover:underline">Fitness & Medical Safety Guide</Link> for detailed AMS prevention tips.</p>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
              {MEDICAL_KIT.map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                  <span className="text-white/80">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-white/50 italic border-t border-white/10 pt-4">
              * Always consult your physician before taking Diamox or any antibiotics. Our guides carry primary medical supplies, but personal kits are mandatory.
            </p>
          </motion.section>

          {/* Spiritual Items */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="flex items-center gap-4 mb-6">
              <ScrollText className="w-10 h-10 text-primary" />
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Spiritual Essentials</h2>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-8">
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "The Yatra is a journey inward as much as outward. Carrying items that focus your intention can deepen the spiritual experience."
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Holy water container (for Mansarovar Jal)',
                  'Saffron or Camphor (for Puja)',
                  'Personal Prayer Book / Chalisa',
                  'Light shawl for temple visits',
                  'Dry fruits & Misri (as Prasad)',
                  'Small portrait of your Ishta Devata',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-800 font-medium text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Why buy in KTM */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="flex items-start gap-4 p-8 border-2 border-dashed border-gray-200 bg-gray-50/50">
              <ShoppingBag className="w-10 h-10 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Shopping in Kathmandu (Thamel)</h3>
                <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                  Don't worry if you're missing something! Thamel is one of the best places in Asia to buy or rent trekking gear. You can find high-quality down jackets, sleeping bags, and trekking poles at a fraction of Western prices.
                </p>
                <div className="flex gap-4">
                  <span className="text-xs font-bold text-primary bg-white border border-primary/20 px-3 py-1 uppercase">Rentals Available</span>
                  <span className="text-xs font-bold text-primary bg-white border border-primary/20 px-3 py-1 uppercase">Expert Fitting</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">Packing FAQs</h2>
            <div className="space-y-4">
              {PACKING_FAQS.map((faq) => (
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Unsure about your gear?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Our experts offer free gear reviews for all booked pilgrims. We can even accompany you to the Thamel gear markets for expert advice.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                Speak to a Gear Expert <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/kailash-mansarovar" className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 transition-colors">
                Book Your Journey
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default KailashPackingList;
