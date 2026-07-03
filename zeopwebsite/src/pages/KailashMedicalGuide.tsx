import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, HeartPulse, Wind, Footprints, Activity, Stethoscope } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { createArticleSchema, createFAQSchema, createBreadcrumbSchema } from '../utils/schema';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } })
};

const MEDICAL_FAQS = [
  {
    question: 'What is Acute Mountain Sickness (AMS)?',
    answer: 'AMS is the negative health effect of high altitude, caused by rapid exposure to low amounts of oxygen. Symptoms include headache, nausea, and dizziness. Our itineraries include gradual ascent and extra acclimatization days to minimize this risk.'
  },
  {
    question: 'How do I know if I am fit enough for the Yatra?',
    answer: 'If you can walk 5-7 km comfortably on flat ground and climb 3-4 flights of stairs without becoming severely breathless, you have the baseline fitness. We recommend 4-6 weeks of additional cardio training before the trip.'
  },
  {
    question: 'Is it safe for people with high blood pressure or diabetes?',
    answer: 'Many people with these conditions successfully complete the Yatra. However, you must consult your doctor and ensure your condition is well-controlled with medication. Our guides are trained to monitor vital signs daily.'
  },
  {
    question: 'Do you provide oxygen cylinders?',
    answer: 'Yes. We carry large oxygen cylinders in our vehicles and small portable cans during the trek. We also provide pulse oximeters to check your oxygen saturation (SpO2) levels twice daily.'
  }
];

const FITNESS_PHASES = [
  {
    name: 'Phase 1: Foundation',
    days: 'Weeks 1-2',
    best: 'Cardio focus',
    desc: 'Start with 30-minute brisk walks daily. Focus on building consistency. Incorporate light stretching and hydration habits.',
    color: 'border-l-primary'
  },
  {
    name: 'Phase 2: Endurance',
    days: 'Weeks 3-5',
    best: 'Intensity increase',
    desc: 'Increase walks to 60 minutes. Include inclines or stairs. Start carrying a light 5kg backpack to simulate the daypack you will carry in Tibet.',
    color: 'border-l-secondary'
  },
  {
    name: 'Phase 3: Final Prep',
    days: 'Week 6',
    best: 'Mental & Physical',
    desc: 'Focus on breathing exercises (Pranayama). Do one long 4-hour walk. Rest well in the final 3 days before departure to Nepal.',
    color: 'border-l-green-600'
  },
];

const HEALTH_TIPS = [
  { icon: Wind, title: 'Breathing Exercises', desc: 'Practice Anulom Vilom and Kapalbhati daily. This helps improve lung capacity for thin air.' },
  { icon: HeartPulse, title: 'Hydration Strategy', desc: 'Drink 3-4 liters of water daily in Tibet. Dehydration is a major trigger for altitude sickness.' },
  { icon: Footprints, title: 'The "Poli-Poli" Rule', desc: 'Tibetan for "slowly-slowly." Never rush. Maintain a steady, slow rhythm to keep your heart rate stable.' },
  { icon: Stethoscope, title: 'Daily Checkups', desc: 'Our team conducts pulse and oxygen checks every morning and evening to ensure your safety.' },
];

const KailashMedicalGuide: React.FC = () => {
  const pageUrl = 'https://www.zeotourism.com/kailash-fitness-medical-guide';

  const structuredData = [
    createArticleSchema({
      title: 'Kailash Mansarovar Fitness & Medical Guide 2026 — Safety, AMS & Prep',
      description: 'Comprehensive medical and fitness guide for Kailash Mansarovar Yatra. Learn about altitude sickness (AMS) prevention, breathing exercises, and fitness regimes.',
      author: 'Zeo Tourism Medical Safety Team',
      publishDate: '2026-01-28',
      modifiedDate: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070',
      url: pageUrl,
      category: 'Pilgrimage Guides',
      tags: ['Kailash fitness guide', 'altitude sickness prevention', 'AMS symptoms', 'Kailash Yatra health tips', 'breathing exercises for altitude'],
    }),
    createFAQSchema(MEDICAL_FAQS),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://www.zeotourism.com' },
      { name: 'Kailash Mansarovar', url: 'https://www.zeotourism.com/kailash-mansarovar' },
      { name: 'Fitness & Medical', url: pageUrl },
    ]),
  ];

  return (
    <>
      <SEO
        title="Kailash Mansarovar Fitness & Medical Guide 2026 | AMS & Safety"
        description="Your safety is our priority. Read the official fitness and medical guide for Kailash Mansarovar. AMS prevention, physical prep, and health tips for senior citizens."
        keywords="Kailash Yatra fitness, altitude sickness prevention, AMS symptoms Tibet, breathing exercises for trekking, health tips for pilgrims"
        url={pageUrl}
        image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070"
        type="article"
        structuredData={structuredData}
      />

      <div className="bg-white">
        {/* Hero */}
        <section className="relative bg-slate-900 text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070')" }}
          />
          <div className="relative container mx-auto px-4 py-24 md:py-36 max-w-4xl text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="inline-block bg-secondary text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-6">
                Safety & Wellbeing First
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
                Kailash Mansarovar: Fitness & Medical Preparation
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
                The Kailash Yatra is a test of spirit and body. Our medical guide helps you prepare your physical vessel for the thin air and high mountain passes of the Himalayas.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                  <Activity className="w-5 h-5" /> Get Personal Fitness Plan
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
                { label: 'Max Altitude', value: '5,630m' },
                { label: 'Oxygen Level', value: '50% of Sea' },
                { label: 'Avg Daily Walk', value: '12km' },
                { label: 'Success Rate', value: '98.5%' },
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
              Understanding Altitude
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                At the Dolma La Pass (5,630m), the highest point of the Yatra, there is roughly 50% less oxygen than at sea level. This puts significant stress on the heart and lungs. However, the human body is remarkably adaptable.
              </p>
              <p>
                Our itineraries are built on the principle of <strong>"Walk High, Sleep Low"</strong> and include mandatory acclimatization days in Saga and Darchen to allow your body to produce more red blood cells naturally.
              </p>
            </div>
          </motion.section>

          {/* Fitness Phases */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              The 6-Week Fitness Program
            </h2>
            <div className="space-y-4">
              {FITNESS_PHASES.map((p) => (
                <div key={p.name} className={`border-l-4 ${p.color} bg-gray-50 p-6`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold bg-white border border-gray-200 text-gray-600 px-3 py-1">{p.days}</span>
                      <span className="text-xs font-bold bg-primary text-white px-3 py-1">{p.best}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{p.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Health Tips */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-10">Crucial Health Tips for the Plateau</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {HEALTH_TIPS.map(({ icon: Icon, title, desc }) => (
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

          {/* AMS Warning */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="bg-red-50 border-2 border-red-100 p-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <h3 className="text-2xl font-bold text-red-900">Recognizing AMS Symptoms</h3>
              </div>
              <p className="text-red-800 mb-6 font-medium">
                If you experience any of the following, you MUST inform your guide immediately:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Severe Headache', 'Loss of Appetite', 'Extreme Fatigue', 'Difficulty Sleeping', 'Nausea/Vomiting', 'Tingling Sensation', 'Swelling of Face', 'Confusion'].map(s => (
                  <div key={s} className="bg-white p-3 text-xs font-bold text-red-700 border border-red-100 text-center uppercase">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {MEDICAL_FAQS.map((faq) => (
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Have a pre-existing medical condition?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Schedule a private call with our safety officer to discuss your health history and get a tailored preparation plan.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                Book Medical Consultation <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default KailashMedicalGuide;
