"use client";


import { createOrganizationSchema, createBreadcrumbSchema , createArticleSchema, createFAQSchema} from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, CloudSun, Umbrella, Snowflake, Sun, Sparkles } from 'lucide-react';


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } })
};

const SEASON_FAQS = [
  {
    question: 'When is the best time for trekking in Nepal?',
    answer: 'The peak trekking seasons are Autumn (October - November) and Spring (March - May). These months offer the clearest skies and most stable weather.'
  },
  {
    question: 'Is it possible to visit Nepal during the monsoon (June - August)?',
    answer: 'Yes, but it is better for cultural tours in cities like Kathmandu or treks in "rain-shadow" areas like Upper Mustang and Dolpo which remain dry.'
  },
  {
    question: 'How cold does it get in Winter (December - February)?',
    answer: 'In Kathmandu, it is chilly (2-18°C), but at high altitudes (above 4,000m), temperatures can drop to -20°C. Winter is great for lower altitude treks.'
  }
];

const SEASONS = [
  {
    name: 'Autumn (Peak)',
    months: 'October - November',
    status: 'Best for Trekking',
    desc: 'Post-monsoon air is crystal clear, offering the best mountain views. Trails are busy but the atmosphere is festive.',
    color: 'border-l-primary',
    icon: Sun
  },
  {
    name: 'Spring',
    months: 'March - May',
    status: 'Best for Nature',
    desc: 'Wildflowers and rhododendrons bloom across the hills. Temperatures are warmer, making it ideal for high passes.',
    color: 'border-l-secondary',
    icon: CloudSun
  },
  {
    name: 'Winter',
    months: 'December - February',
    status: 'Best for Value',
    desc: 'Clear blue skies but very cold at night. Perfect for photography and those wanting to avoid crowds.',
    color: 'border-l-blue-400',
    icon: Snowflake
  },
  {
    name: 'Monsoon',
    months: 'June - September',
    status: 'Best for Culture',
    desc: 'Lush green landscapes and fewer tourists. Great for visiting monasteries and Mustang region.',
    color: 'border-l-green-600',
    icon: Umbrella
  },
];

const BestTimeToVisitNepal: React.FC = () => {
  const pageUrl = 'https://zeotourism.com/best-time-to-visit-nepal';

  const structuredData = [
    createArticleSchema({
      title: 'Best Time to Visit Nepal 2026 — Monthly Weather & Festival Guide',
      description: 'Find the perfect time for your Nepal adventure. Detailed breakdown of trekking seasons, monthly weather patterns, and major festivals.',
      author: 'Zeo Tourism Travel Experts',
      publishDate: '2026-02-10',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070',
      url: pageUrl,
      category: 'Travel Guides',
      tags: ['best time to visit Nepal', 'Nepal weather by month', 'trekking season Nepal', 'Nepal festivals', 'winter in Nepal'],
    }),
    createFAQSchema(SEASON_FAQS),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://zeotourism.com' },
      { name: 'Nepal', url: 'https://zeotourism.com/destinations/nepal' },
      { name: 'Best Time to Visit', url: pageUrl },
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
                Planning Your Journey
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
                Best Time to Visit Nepal: A Seasonal Guide
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
                From clear mountain views to vibrant cultural festivals, find the perfect window for your Himalayan adventure.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Summary */}
        <section className="bg-primary text-white py-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Peak Season: Oct - Nov</h2>
                <p className="text-white/80">Crystal clear skies, moderate temperatures, and the best visibility for Everest and Annapurna.</p>
              </div>
              <div className="md:border-l md:border-white/20 md:pl-8">
                <h2 className="text-2xl font-bold mb-2">Shoulder Season: Mar - May</h2>
                <p className="text-white/80">Rhododendrons in bloom, warmer weather for high passes, and great for wildlife spotting.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl py-16 space-y-20">
          {/* AI Key Takeaways */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 border-l-4 border-primary p-6 md:p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Seasonal Quick Guide
            </h3>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Peak Seasons: October-November (Autumn) and March-May (Spring).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Best for Views: Autumn offers the clearest mountain visibility.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Low Season: Monsoon (Jun-Aug) brings rain but lush green hills.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Festivals: October is the month of Dashain and Tihar.</span>
              </li>
            </ul>
          </motion.div>

          {/* Detailed Seasons */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-10 text-center">
              Understanding Nepal's Four Seasons
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {SEASONS.map((s) => (
                <div key={s.name} className={`border-l-4 ${s.color} bg-gray-50 p-6 shadow-sm`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center shadow-sm">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{s.name}</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase">{s.months}</p>
                    </div>
                  </div>
                  <span className="inline-block text-[10px] font-bold bg-white border border-gray-200 text-gray-600 px-2 py-0.5 mb-3">{s.status}</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Month by Month Table */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 text-center">
              Month-by-Month Weather & Festivals
            </h2>
            <div className="overflow-x-auto shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-sm">
                    <th className="p-4">Month</th>
                    <th className="p-4">Trekking Conditions</th>
                    <th className="p-4">Key Festivals</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-bold">January</td>
                    <td className="p-4 text-gray-600">Very Cold, Clear Skies</td>
                    <td className="p-4 text-gray-500">Lhosar (Tibetan New Year)</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="p-4 font-bold">March</td>
                    <td className="p-4 text-gray-600">Excellent, Rhododendrons</td>
                    <td className="p-4 text-gray-500">Holi, Maha Shivaratri</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-bold">May</td>
                    <td className="p-4 text-gray-600">Hot, Pre-monsoon clouds</td>
                    <td className="p-4 text-gray-500">Buddha Jayanti</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="p-4 font-bold">October</td>
                    <td className="p-4 text-gray-600">Perfect, Clear Views</td>
                    <td className="p-4 text-gray-500">Dashain & Tihar</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {SEASON_FAQS.map((faq) => (
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Plan Your Adventure with the Experts</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Our team knows every season's secrets. Let us help you pick the perfect month for your dream Himalayan trip.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                Ask a Travel Expert <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/tours" className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 transition-colors">
                Explore All Tours
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default BestTimeToVisitNepal;
