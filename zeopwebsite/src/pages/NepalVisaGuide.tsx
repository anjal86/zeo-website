import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ArrowRight, Shield, Globe, CreditCard, ClipboardCheck, Info, Sparkles } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { createArticleSchema, createFAQSchema, createBreadcrumbSchema } from '../utils/schema';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } })
};

const VISA_FAQS = [
  {
    question: 'How much does the Nepal tourist visa cost?',
    answer: 'The current fees are: $30 for 15 days, $50 for 30 days, and $125 for 90 days. Fees are payable in USD or major currencies at the airport.'
  },
  {
    question: 'Can I get a visa on arrival at Kathmandu airport?',
    answer: 'Yes, citizens of most countries can get a visa on arrival at Tribhuvan International Airport (TIA). However, some nationalities must apply in advance at a Nepal embassy.'
  },
  {
    question: 'What documents do I need for the visa?',
    answer: 'You need a passport with at least 6 months validity, at least one blank page, and a digital or physical passport-sized photo (though most airports now use digital capture).'
  },
  {
    question: 'Is the Indian passport holder visa-free?',
    answer: 'Yes, Indian citizens do not need a visa to enter Nepal. They can travel with a valid Passport or a Voter ID card.'
  }
];

const VISA_TYPES = [
  {
    name: 'Tourist Visa on Arrival',
    days: '15/30/90 Days',
    best: 'Most Popular',
    desc: 'Available at TIA airport and all land border points. Fast and convenient for most nationalities.',
    color: 'border-l-primary'
  },
  {
    name: 'Online Pre-Approval',
    days: '15 Days Prior',
    best: 'Recommended',
    desc: 'Fill out the online form before you fly to save time at the airport. It generates a barcode for the visa counter.',
    color: 'border-l-secondary'
  },
  {
    name: 'Gratis Visa (Free)',
    days: '30 Days',
    best: 'Specific Groups',
    desc: 'Available for SAARC citizens (except Afghanistan) for the first 30 days of their stay in a calendar year.',
    color: 'border-l-green-600'
  },
];

const ENTRY_STATS = [
  { label: 'Visa Duration', value: '15-90 Days' },
  { label: 'Entry Points', value: '11 Points' },
  { label: 'Wait Time', value: '15-30 Mins' },
  { label: 'Payment', value: 'USD / Cash' },
];

const NepalVisaGuide: React.FC = () => {
  const pageUrl = 'https://www.zeotourism.com/nepal-visa-guide';

  const structuredData = [
    createArticleSchema({
      title: 'Nepal Tourist Visa & Entry Guide 2026 — Costs, Rules & Documents',
      description: 'Comprehensive guide to Nepal tourist visas. Learn about visa on arrival, costs for different durations, document requirements, and specific rules for Indian citizens.',
      author: 'Zeo Tourism Logistics Team',
      publishDate: '2026-02-05',
      modifiedDate: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070',
      url: pageUrl,
      category: 'Travel Guides',
      tags: ['Nepal visa guide', 'tourist visa on arrival', 'Nepal entry rules', 'visa costs Nepal', 'travel to Nepal'],
    }),
    createFAQSchema(VISA_FAQS),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://www.zeotourism.com' },
      { name: 'Nepal', url: 'https://www.zeotourism.com/destinations/nepal' },
      { name: 'Visa Guide', url: pageUrl },
    ]),
  ];

  return (
    <>
      <SEO
        title="Nepal Tourist Visa Guide 2026 | Costs & Requirements"
        description="Everything you need to know about getting your Nepal visa. Visa on arrival fees, online application links, and entry rules for US, UK, and Indian citizens."
        keywords="Nepal visa guide, tourist visa Nepal cost, visa on arrival Kathmandu, Nepal entry requirements, SAARC gratis visa"
        url={pageUrl}
        image="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070"
        type="article"
        structuredData={structuredData}
      />

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
                Official Entry Information
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
                Nepal Tourist Visa & Entry Guide 2026
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
                Hassle-free entry to the land of the Himalayas. Our guide covers everything you need to know about visas, costs, and documentation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://nepaliport.immigration.gov.np/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                  <ClipboardCheck className="w-5 h-5" /> Online Visa Portal
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="bg-primary text-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
              {ENTRY_STATS.map(s => (
                <div key={s.label} className="text-center py-6 px-4">
                  <p className="text-2xl md:text-3xl font-bold">{s.value}</p>
                  <p className="text-white/70 text-sm mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
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
              <Sparkles className="w-5 h-5 text-primary" /> Visa & Entry Essentials
             </h3>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Tourist visas are available on arrival for most nations.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Fees: $30 (15d), $50 (30d), $125 (90d). USD cash is best.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Indian citizens do not require a visa (Passport or Voter ID only).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Apply online up to 15 days before travel to save time.</span>
              </li>
            </ul>
          </motion.div>

          {/* Intro */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Welcome to Nepal
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                Nepal is one of the most tourist-friendly countries in Asia when it comes to visas. For most nationalities, the process is as simple as filling out a form and paying a fee at the airport upon arrival.
              </p>
              <p>
                Whether you are planning a trek to Everest or a cultural tour of Kathmandu, having your visa sorted is the first step. This guide is updated for the 2026 regulations to ensure you have a smooth start to your journey.
              </p>
            </div>
          </motion.section>

          {/* Visa Types */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              Visa Categories & Fees
            </h2>
            <div className="space-y-4">
              {VISA_TYPES.map((t) => (
                <div key={t.name} className={`border-l-4 ${t.color} bg-gray-50 p-6 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{t.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold bg-white border border-gray-200 text-gray-600 px-3 py-1">{t.days}</span>
                      <span className="text-xs font-bold bg-primary text-white px-3 py-1">{t.best}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{t.desc}</p>
                </div>
              ))}
            </div>

            {/* Visa Extension Info */}
            <div className="mt-8 p-6 bg-secondary/5 border border-secondary/10">
              <h3 className="text-xl font-bold text-secondary-dark mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Need more time? (Visa Extension)
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Tourist visas can be extended for a maximum of 150 days in a calendar year. You can apply for an extension at the Department of Immigration in Kathmandu or Pokhara.
              </p>
              <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                <li><strong>Minimum Extension:</strong> 15 days ($45)</li>
                <li><strong>Per Day Cost:</strong> $3 per day after the first 15 days</li>
                <li><strong>Process:</strong> Online application followed by passport submission at the immigration office.</li>
              </ul>
            </div>
          </motion.section>

          {/* Border Points */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 text-center">
              Major Land Border Entry Points
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Kakarbhitta', state: 'Eastern Nepal', desc: 'Main entry point from West Bengal (Darjeeling/Siliguri).' },
                { name: 'Birgunj', state: 'Central Nepal', desc: 'The most popular trade and passenger route from Bihar (Patna).' },
                { name: 'Sunauli', state: 'Western Nepal', desc: 'Primary gateway from Uttar Pradesh (Varanasi/Gorakhpur).' },
              ].map(point => (
                <div key={point.name} className="bg-white border border-gray-100 p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-1">{point.name}</h4>
                  <p className="text-xs text-primary font-bold uppercase mb-3">{point.state}</p>
                  <p className="text-sm text-gray-600">{point.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Requirements */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-10">Mandatory Documents</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: Shield, title: 'Valid Passport', desc: 'Must have at least 6 months of validity remaining from your date of entry.' },
                { icon: Globe, title: 'Passport Photos', desc: 'Bring 2 physical photos as backup, though digital photos are now taken at the airport.' },
                { icon: CreditCard, title: 'Visa Fee in Cash', desc: 'While cards are sometimes accepted, USD cash is the most reliable way to pay your fee.' },
                { icon: Info, title: 'Indian Citizens', desc: 'No visa needed. Must carry a valid Passport or Voter ID Card for entry.' },
              ].map((req) => (
                <div key={req.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <req.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{req.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 text-center">Visa FAQs</h2>
            <div className="space-y-4">
              {VISA_FAQS.map((faq) => (
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Still have questions about your trip?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Our travel consultants are experts in Nepal logistics. Book a tour with us, and we handle all the permit complexities for you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                Speak to an Expert <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/tours" className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 transition-colors">
                Browse All Tours
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default NepalVisaGuide;
