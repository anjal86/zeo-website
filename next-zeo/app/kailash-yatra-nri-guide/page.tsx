"use client";


import { createOrganizationSchema, createBreadcrumbSchema , createArticleSchema, createFAQSchema} from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, AlertCircle, Globe, Star, Clock, CheckCircle, Phone, Sparkles } from 'lucide-react';


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } })
};

const NRI_FAQS = [
  {
    question: 'Can NRIs with foreign passports perform Kailash Yatra?',
    answer: 'Yes, absolutely. NRIs holding US, UK, Canadian, or other foreign passports are fully eligible. While the Chinese Group Visa fees vary for different nationalities (especially US/Canadian citizens), the spiritual journey and the Nepal-side logistics remain the same.'
  },
  {
    question: 'What is the "Group Visa" process for NRIs?',
    answer: 'Individual Chinese tourist visas are not valid for Tibet entry from Nepal. Zeo Tourism applies for a "Chinese Group Visa" in Kathmandu. You must arrive in Kathmandu at least 3 working days before the tour starts to submit your physical passport for processing.'
  },
  {
    question: 'How do international payments work?',
    answer: 'We accept secure international bank transfers (SWIFT/Wire), credit card payments via our online portal, and platforms like Wise. We provide a formal invoice for all transactions to ensure transparency and security.'
  },
  {
    question: 'Is travel insurance mandatory for NRIs?',
    answer: 'Yes, we strongly recommend a comprehensive travel insurance policy that specifically covers "emergency high-altitude evacuation" up to 6,000m. This is essential for your safety given the remote nature of the Tibet plateau.'
  },
  {
    question: 'What happens if the Tibet border closes suddenly?',
    answer: 'Tibet permits are subject to local government regulations. In the rare event of a sudden closure, Zeo Tourism offers either a full refund (minus permit processing fees) or the option to reschedule to the next available window or an alternative holy site like Muktinath.'
  },
];

const NRI_STEPS = [
  {
    name: 'Consultation & Planning',
    days: 'Step 1',
    best: 'International Support',
    desc: 'Speak with our NRI desk via WhatsApp or Zoom. We help you choose the best dates and route (Helicopter or Lhasa route) based on your global arrival schedule.',
    color: 'border-l-primary'
  },
  {
    name: 'Document Submission',
    days: 'Step 2',
    best: 'Remote Processing',
    desc: 'Email us your passport scans. We begin the Tibet Travel Permit (TTP) process, which takes 4-6 weeks. You dont need to be in Nepal for this stage.',
    color: 'border-l-secondary'
  },
  {
    name: 'Kathmandu Arrival',
    days: 'Step 3',
    best: '3 Days Early',
    desc: 'Arrive in Kathmandu 3 working days before the trip. We collect your physical passport for the Group Visa and conduct a final health & gear briefing.',
    color: 'border-l-green-600'
  },
];

const INCLUDES = [
  'Tibet Travel Permit (TTP) & Alien Travel Permit (ATP)',
  'Chinese Group Visa processing for foreign nationals',
  'All luxury accommodation in Kathmandu',
  'Best available guesthouses in Tibet',
  'All meals (Organic Veg) during the entire Yatra',
  'Emergency oxygen, Gamow bags & medical support',
  'Private transport for the entire group',
  'Hindi & English speaking specialized guides',
];

const WHY = [
  { icon: Shield, title: 'NRI Specialists', desc: 'Managing pilgrimage logistics for the Indian diaspora in USA, UK, UAE & Canada since 2000.' },
  { icon: Globe, title: 'Global Payments', desc: 'Secure, transparent international wire and card payment systems with formal invoicing.' },
  { icon: Star, title: 'Verified Success', desc: '500+ successful NRI Yatra completions with 4.9★ ratings on global review platforms.' },
  { icon: Clock, title: '24/7 Support', desc: 'Dedicated coordinators working across time zones to support your planning from abroad.' },
];

const NRIGuide: React.FC = () => {
  const pageUrl = 'https://www.zeotourism.com/kailash-yatra-nri-guide';

  const structuredData = [
    createArticleSchema({
      title: 'Kailash Mansarovar Yatra for NRIs 2026 — The Complete Global Guide',
      description: 'Comprehensive guide for NRIs and foreign citizens planning Kailash Mansarovar Yatra from abroad. Includes permit rules, booking steps, costs, and medical prep.',
      author: 'Zeo Tourism NRI Desk',
      publishDate: '2026-01-20',
      modifiedDate: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070',
      url: pageUrl,
      category: 'Pilgrimage Guides',
      tags: ['NRI Kailash Yatra', 'Kailash Yatra from USA', 'Kailash Yatra for foreign citizens', 'Tibet permits for foreigners', 'Mount Kailash guide'],
    }),
    createFAQSchema(NRI_FAQS),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://www.zeotourism.com' },
      { name: 'Kailash Mansarovar', url: 'https://www.zeotourism.com/kailash-mansarovar' },
      { name: 'NRI Guide', url: pageUrl },
    ]),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      

      <div className="bg-white">
        {/* Hero - Matching KailashGuide Template */}
        <section className="relative bg-slate-900 text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070')" }}
          />
          <div className="relative container mx-auto px-4 py-24 md:py-36 max-w-4xl">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="inline-block bg-secondary text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-6">
                Specialized Global Guide
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
                Kailash Mansarovar Yatra 2026 — Specialized Guide for NRIs & Foreign Citizens
              </h1>
              <p className="text-xl text-white/80 max-w-3xl leading-relaxed mb-8">
                Fulfilling the spiritual dreams of the global Indian diaspora. We handle the complex permit and visa requirements for foreign citizens so you can focus on the divine journey.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/kailash-mansarovar"
                  className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors"
                >
                  View NRI Packages <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 transition-colors"
                >
                  <Phone className="w-5 h-5" /> NRI Help Desk
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section className="bg-primary text-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
              {[
                { label: 'Pilgrims Served', value: '500+ NRIs' },
                { label: 'Visa Handling', value: '100% Success' },
                { label: 'Booking From', value: 'Global' },
                { label: 'Support', value: '24/7 Desk' },
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
          {/* AI Key Takeaways */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 border-l-4 border-primary p-6 md:p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Key Takeaways for NRIs
            </h3>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Groups of 4+ are required for foreign citizens.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Passport must be physically present in Kathmandu for 3 days.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Full medical insurance covering 6,000m is mandatory.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Best booking window is January to March for the May season.</span>
              </li>
            </ul>
          </motion.div>

          {/* Introduction */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              The NRI Journey to the Divine
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                For Non-Resident Indians (NRIs) and foreign citizens of Indian origin, the <strong>Kailash Mansarovar Yatra</strong> is more than just a trip—it is a reconnection with their roots and their faith. Whether you are living in the <strong>USA, UK, Canada, Australia, or the UAE</strong>, the call of Mahadev is universal.
              </p>
              <p>
                Zeo Tourism specializes in the unique logistical needs of global pilgrims. From managing <strong>foreign passport permits</strong> to providing secure <strong>international payment gateways</strong>, we ensure that the thousands of miles between you and Mount Kailash are bridged with professionalism and care.
              </p>
            </div>
          </motion.section>

          {/* Booking Steps */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              How to Plan Your Yatra from Abroad
            </h2>
            <div className="space-y-4">
              {NRI_STEPS.map((s) => (
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

          {/* Travel Prep */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              Crucial Preparation for Global Travelers
            </h2>
            <p className="text-gray-600 mb-8">Before you depart, ensure you have reviewed our <Link href="/kailash-packing-list" className="text-primary font-bold hover:underline">Complete Kailash Packing List</Link> and gear guide.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { month: 'Currency', tag: 'Chinese Yuan', desc: 'Only CNY is accepted in Tibet. Kathmandu is the best hub to convert your USD/GBP/EUR.' },
                { month: 'Connectivity', tag: 'VPN Required', desc: 'Google & WhatsApp are blocked in Tibet. Install a premium VPN before leaving home.' },
                { month: 'Insurance', tag: 'Mandatory', desc: 'Policy must cover high-altitude evacuation up to 6,000m. We can recommend specific NRI-friendly providers.' },
                { month: 'Physical Prep', tag: 'Crucial', desc: 'Most NRIs live at sea level. We recommend 4-6 weeks of cardio prep before departure.' },
              ].map((t, index) => (
                <div key={`${t.month}-${index}`} className="flex gap-4 p-5 border border-gray-100 bg-gray-50">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{t.month}</span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700">{t.tag}</span>
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
              Specialized NRI Service Inclusions
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

          {/* Visa Section */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Tibet Permit & Visa Requirements
            </h2>
            <div className="space-y-3">
              {[
                { name: 'Tibet Travel Permit (TTP)', desc: 'Mandatory for all foreign passport holders. We apply for this 45 days in advance using your passport copy.' },
                { name: 'Chinese Group Visa', desc: 'Processed in Kathmandu. Unlike a regular tourist visa, this is a specialized group paper visa issued for pilgrimage.' },
                { name: 'Biometric Requirement', desc: 'Depending on current embassy rules, some foreign citizens may need to appear in person in Kathmandu for biometrics.' },
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
              <p className="text-sm text-amber-800"><strong>Foreign Passport Holders:</strong> Chinese visa fees for US and Canadian citizens are significantly higher (approx. $200-$250 extra) due to reciprocity rules. We will provide a specific quote during your consultation.</p>
            </div>
          </motion.section>

          {/* Why Zeo */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              Why Global Pilgrims Trust Zeo Tourism
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
              NRI Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {NRI_FAQS.map((faq) => (
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to Begin Your Pilgrimage from Abroad?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Our NRI specialists are available for consultation across global time zones. Get a customized quote and permit assessment today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                Enquire as an NRI <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/kailash-mansarovar" className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 transition-colors">
                View Yatra Packages
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default NRIGuide;
