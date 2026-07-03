import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Shield, Wind, Footprints, HeartPulse, Camera, Sparkles } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { createArticleSchema, createFAQSchema, createBreadcrumbSchema } from '../utils/schema';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } })
};

const EBC_FAQS = [
  {
    question: 'How difficult is the Everest Base Camp trek?',
    answer: 'It is considered a "moderate to challenging" trek. You don\'t need technical climbing skills, but you do need good cardiovascular fitness and the ability to walk 5-7 hours a day on uneven terrain.'
  },
  {
    question: 'What is the highest point of the trek?',
    answer: 'While Base Camp is at 5,364m, most trekkers also climb Kala Patthar at 5,545m for the best panoramic views of Mount Everest.'
  },
  {
    question: 'Can I do this trek solo?',
    answer: 'As of 2023, the Nepal government has made it mandatory to have a licensed guide for trekking in most regions, including the Khumbu. This ensures your safety and supports the local economy.'
  },
  {
    question: 'Is there electricity and WiFi on the trail?',
    answer: 'Yes, most teahouses have solar charging and WiFi (like Everest Link). However, these services usually come with an additional fee of $3-$5 per day.'
  }
];

const ITINERARY_HIGHLIGHTS = [
  {
    name: 'Lukla Flight & Namche Bazaar',
    days: 'Days 1-3',
    best: 'The Gateway',
    desc: 'The journey starts with a thrilling flight to Lukla, followed by a trek to Namche Bazaar, the vibrant Sherpa capital at 3,440m.',
    color: 'border-l-primary'
  },
  {
    name: 'Tengboche Monastery',
    days: 'Day 5',
    best: 'Spiritual Heart',
    desc: 'Visit the famous Tengboche Monastery, set against the stunning backdrop of Ama Dablam, Everest, and Lhotse.',
    color: 'border-l-secondary'
  },
  {
    name: 'The Final Push: Base Camp',
    days: 'Day 9',
    best: 'The Goal',
    desc: 'Walk through the Khumbu Glacier to reach Everest Base Camp. Stand at the base of the world\'s highest peak.',
    color: 'border-l-green-600'
  },
];

const EBC_STATS = [
  { label: 'Total Distance', value: '130 km' },
  { label: 'Max Altitude', value: '5,545 m' },
  { label: 'Avg Duration', value: '12-14 Days' },
  { label: 'Difficulty', value: 'Moderate' },
];

const EverestGuide: React.FC = () => {
  const pageUrl = 'https://www.zeotourism.com/everest-base-camp-guide';

  const structuredData = [
    createArticleSchema({
      title: 'Everest Base Camp Trek Ultimate Guide 2026 — Routes, Costs & Safety',
      description: 'The definitive guide to trekking to Everest Base Camp. Includes training tips, detailed itinerary, cost breakdown, and best time to visit.',
      author: 'Zeo Tourism Trekking Experts',
      publishDate: '2026-02-01',
      modifiedDate: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070',
      url: pageUrl,
      category: 'Trekking Guides',
      tags: ['Everest Base Camp trek', 'EBC guide 2026', 'trekking in Nepal', 'Everest Base Camp cost', 'Lukla flight guide'],
    }),
    createFAQSchema(EBC_FAQS),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://www.zeotourism.com' },
      { name: 'Nepal', url: 'https://www.zeotourism.com/destinations/nepal' },
      { name: 'Everest Guide', url: pageUrl },
    ]),
  ];

  return (
    <>
      <SEO
        title="Everest Base Camp Trek Ultimate Guide 2026 | Routes & Prep"
        description="Planning to trek to Everest Base Camp? Our 2026 guide covers everything: Lukla flights, acclimatization, teahouse life, and essential gear list."
        keywords="Everest Base Camp trek guide, EBC itinerary, Nepal trekking guide, Everest Base Camp difficulty, best time for EBC"
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
                The Ultimate Nepal Trek
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
                Everest Base Camp: The Definitive Trekking Guide
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
                Walk in the footsteps of legends. Our comprehensive guide helps you navigate the journey to the base of the world's highest mountain.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/tours/everest-base-camp-trek-13n-14d" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                  View EBC Packages <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="bg-primary text-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
              {EBC_STATS.map(s => (
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
              <Sparkles className="w-5 h-5 text-primary" /> Everest Trek Essentials
            </h3>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Best seasons: Autumn (Oct-Nov) and Spring (Mar-May).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Difficulty: Moderate to Challenging (No technical skills needed).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Max Altitude: 5,545m (Kala Patthar).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Licensed guides are mandatory for all foreign trekkers.</span>
              </li>
            </ul>
          </motion.div>

          {/* Intro */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Why Everest Base Camp?
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>
                The Everest Base Camp (EBC) trek is more than just a hike; it is a pilgrimage for lovers of the mountains. Starting from the legendary airstrip at Lukla, the trail winds through lush forests, suspension bridges, and Sherpa villages, eventually reaching the stark, beautiful Khumbu Glacier.
              </p>
              <p>
                You'll walk through the Sagarmatha National Park, a UNESCO World Heritage site, home to rare wildlife like the snow leopard and red panda. The culture of the Sherpa people, their monasteries (like Tengboche), and their hospitality add a spiritual dimension to the physical challenge of the altitude.
              </p>
              <p>
                Whether you are a seasoned trekker or an adventurous first-timer, EBC offers a unique blend of cultural immersion and physical challenge. At <strong>Zeo Tourism</strong>, we ensure your journey is safe, responsible, and unforgettable.
              </p>
            </div>
          </motion.section>

          {/* Training & Prep */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-gray-50 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Training & Preparation
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <HeartPulse className="w-5 h-5" /> Cardiovascular Fitness
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Start training at least 3 months before your trek. Focus on hiking, running, or cycling to build endurance. Aim for 45-60 minutes of cardio 4 days a week.
                </p>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                  <li>Stair climbing with a 5kg pack</li>
                  <li>Long weekend hikes (4-6 hours)</li>
                  <li>Leg strengthening (Squats, Lunges)</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Mental Resilience
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Trekking at high altitude is as much a mental game as a physical one. Be prepared for cold nights, basic teahouse accommodation, and variable weather.
                </p>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                  <li>Practice deep breathing techniques</li>
                  <li>Stay positive during tough uphill sections</li>
                  <li>Focus on "One Step at a Time"</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Itinerary Highlights */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              Trek Highlights & Milestones
            </h2>
            <div className="space-y-4">
              {ITINERARY_HIGHLIGHTS.map((h) => (
                <div key={h.name} className={`border-l-4 ${h.color} bg-gray-50 p-6 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{h.name}</h3>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold bg-white border border-gray-200 text-gray-600 px-3 py-1">{h.days}</span>
                      <span className="text-xs font-bold bg-primary text-white px-3 py-1">{h.best}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{h.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Cost Breakdown */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 text-center">
              Estimated Cost Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="p-4 font-bold border border-primary/20">Item</th>
                    <th className="p-4 font-bold border border-primary/20">Est. Price (USD)</th>
                    <th className="p-4 font-bold border border-primary/20">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr>
                    <td className="p-4 border border-gray-100 font-bold">Trek Package</td>
                    <td className="p-4 border border-gray-100">$1,200 - $1,800</td>
                    <td className="p-4 border border-gray-100 text-gray-500">Includes guides, permits, & teahouses</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 border border-gray-100 font-bold">Lukla Flights</td>
                    <td className="p-4 border border-gray-100">$360 - $400</td>
                    <td className="p-4 border border-gray-100 text-gray-500">Round trip from Kathmandu/Ramechhap</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-gray-100 font-bold">Permits</td>
                    <td className="p-4 border border-gray-100">$50 - $60</td>
                    <td className="p-4 border border-gray-100 text-gray-500">Sagarmatha NP & Khumbu Entry</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 border border-gray-100 font-bold">Meals & Water</td>
                    <td className="p-4 border border-gray-100">$25 - $40 / day</td>
                    <td className="p-4 border border-gray-100 text-gray-500">Prices increase with altitude</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-4 text-xs text-gray-400 italic">* Prices are subject to seasonal variation and group size.</p>
            </div>
          </motion.section>

          {/* Pro Tips */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-10">Pro Tips for EBC Trekkers</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: Wind, title: 'Acclimatization is Key', desc: 'Never skip your rest days in Namche and Dingboche. They are vital for your body to adjust to the altitude.' },
                { icon: Footprints, title: 'Gear for All Seasons', desc: 'The Khumbu weather is unpredictable. Layering is essential. See our <a href="/kailash-packing-list" class="text-primary font-bold hover:underline">universal packing guide</a> for details.' },
                { icon: HeartPulse, title: 'Stay Hydrated', desc: 'Drink at least 4 liters of water a day. Dehydration increases the risk of altitude sickness.' },
                { icon: Camera, title: 'The Kala Patthar View', desc: 'Don\'t miss the sunrise trek to Kala Patthar. It\'s a tough climb but offers the absolute best view of Everest.' },
              ].map((tip) => (
                <div key={tip.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <tip.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{tip.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tip.desc }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {EBC_FAQS.map((faq) => (
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to reach the Base of the World?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Our EBC experts are ready to help you plan the adventure of a lifetime. Personalized itineraries and small group departures available for 2026.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 transition-colors">
                Enquire for EBC 2026 <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/destinations/nepal" className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 transition-colors">
                Explore Nepal Tours
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default EverestGuide;
