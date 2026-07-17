
export const metadata = {
  title: "Kailash Mansarovar Yatra Cost 2026 from Nepal",
  description: "Compare Kailash Mansarovar Yatra cost factors for 2026 Nepal routes. Learn what affects overland, helicopter and aerial darshan prices before requesting a quote.",
  alternates: {
    canonical: "https://zeotourism.com/kailash-mansarovar-yatra-cost"
  }
};

import { createOrganizationSchema, createBreadcrumbSchema , createArticleSchema, createFAQSchema} from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';

import Link from 'next/link';
import { Calculator, FileText, MapPinned, Phone, ShieldCheck } from 'lucide-react';


const pageUrl = 'https://zeotourism.com/kailash-mansarovar-yatra-cost';

const faqs = [
  {
    question: 'How much does Kailash Mansarovar Yatra from Nepal cost in 2026?',
    answer: 'The final Kailash Mansarovar Yatra cost from Nepal depends on route, season, group size, hotel standard, transport, China/Tibet permit status, guide support, emergency backup, and whether the trip is overland, helicopter-assisted, or aerial darshan only.'
  },
  {
    question: 'Why do Kailash Yatra prices change?',
    answer: 'Prices change because airfares, fuel, Tibet-side transport, hotel availability, permit rules, currency movement, and border or weather logistics can change during the season.'
  },
  {
    question: 'Is the government Kailash Yatra cost the same as private Nepal route cost?',
    answer: 'No. India government routes, private Nepal overland routes, helicopter routes, and aerial darshan packages use different itineraries, permits, inclusions, and operators, so costs are not directly comparable.'
  },
  {
    question: 'What should be included in a Kailash Yatra quote?',
    answer: 'A reliable quote should clearly list route, hotel nights, meals, guide, transport, China visa or group visa support, Tibet permits, oxygen support, exclusions, cancellation rules, and backup-day policy.'
  }
];

const costFactors = [
  ['Route type', 'Overland, helicopter-assisted, Lhasa route, or aerial darshan change transport cost and trip length.'],
  ['Group size', 'Small private groups cost more per person than fixed-date group departures.'],
  ['Permit and visa handling', 'China group visa, Tibet Travel Permit, Alien Travel Permit, and route permissions affect timing and cost.'],
  ['Accommodation level', 'Kathmandu hotel category and Tibet guesthouse availability affect final quote.'],
  ['Backup planning', 'Weather, altitude, border changes, and flight delays may require extra buffer nights or rerouting.'],
  ['Season and availability', 'Peak yatra months can increase airfare, vehicle, room, and guide costs.']
];

const KailashCostGuide: React.FC = () => {
  const structuredData = [
    createArticleSchema({
      title: 'Kailash Mansarovar Yatra Cost 2026 - Nepal Route Planning Guide',
      description: 'Understand Kailash Mansarovar Yatra cost from Nepal in 2026: route options, cost factors, inclusions, exclusions, permits, helicopter vs overland planning, and quote checklist.',
      author: 'Zeo Tourism Experts',
      publishDate: '2026-07-03',
      image: 'https://zeotourism.com/images/kailash-mansarovar-yatra.jpg',
      url: pageUrl,
      category: 'Kailash Mansarovar Yatra',
      tags: ['Kailash Mansarovar Yatra cost', 'Kailash Yatra cost from Nepal', 'Kailash Mansarovar Yatra 2026', 'Mount Kailash tour package']
    }),
    createFAQSchema(faqs),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://zeotourism.com' },
      { name: 'Kailash Mansarovar', url: 'https://zeotourism.com/kailash-mansarovar' },
      { name: 'Yatra Cost Guide', url: pageUrl }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      

      <div className="bg-white">
        <section className="bg-slate-950 text-white py-20">
          <div className="section-container max-w-5xl">
            <p className="text-orange-300 text-sm font-bold uppercase tracking-[0.2em] mb-4">Cost Guide 2026</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Kailash Mansarovar Yatra Cost from Nepal
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-3xl">
              Kailash Mansarovar Yatra cost is not one fixed number. Route, permits, transport, hotels, group size, season, altitude support, and backup planning all affect final price.
            </p>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="section-container max-w-5xl">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <Calculator className="w-7 h-7 text-primary" />
                  <h2 className="text-3xl font-bold text-gray-900">Quick answer</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  For a 2026 Kailash Mansarovar Yatra from Kathmandu, ask for a route-specific quote rather than trusting a generic price. Overland, helicopter, Lhasa and aerial darshan options use different permits, transport, hotels, backup days and risk planning. Government India route costs are published separately on the <a href="https://kmy.gov.in/?lang=en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">official KMY website</a> and are not the same as private Nepal route packages.
                </p>
              </div>
              <aside className="border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Need exact current quote?</h3>
                <p className="text-sm text-gray-600 mb-5">Send traveler count, passport nationality, preferred month and route type. Zeo Tourism will confirm current inclusions and exclusions.</p>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 font-bold hover:bg-primary-dark">
                  Ask for quote <Phone className="w-4 h-4" />
                </Link>
              </aside>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="section-container max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What affects Kailash Yatra cost?</h2>
            <div className="overflow-x-auto border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-900">
                  <tr>
                    <th className="p-4 font-bold">Cost factor</th>
                    <th className="p-4 font-bold">Why it matters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {costFactors.map(([factor, detail]) => (
                    <tr key={factor}>
                      <td className="p-4 font-semibold text-gray-900">{factor}</td>
                      <td className="p-4 text-gray-700">{detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="section-container max-w-5xl">
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: MapPinned, title: 'Compare routes', body: 'Overland is route-rich, helicopter reduces difficult road or walking sections, aerial darshan is shortest but depends heavily on visibility.' },
                { icon: FileText, title: 'Check inclusions', body: 'A low price can exclude visa, permits, meals, oxygen, porter support, backup hotel nights, or cancellation protection.' },
                { icon: ShieldCheck, title: 'Plan safety buffer', body: 'Altitude, weather, border rules and flights can shift. Serious operators explain backup days and emergency process.' }
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="border border-gray-200 p-6">
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="section-container max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Cost FAQs</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="bg-white border border-gray-200 p-5">
                  <summary className="font-bold text-gray-900 cursor-pointer">{faq.question}</summary>
                  <p className="text-gray-700 mt-3 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-slate-950 text-white">
          <div className="section-container max-w-5xl">
            <h2 className="text-3xl font-bold mb-4">Next step</h2>
            <p className="text-white/75 mb-6 max-w-3xl">Use this guide with the documents guide before paying any deposit. Confirm route, permits, inclusions, exclusions, backup plan and cancellation terms in writing.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/kailash-mansarovar" className="bg-white text-gray-900 px-6 py-3 font-bold">View Kailash packages</Link>
              <Link href="/kailash-mansarovar-yatra-documents-permits" className="border border-white/40 px-6 py-3 font-bold">Documents and permits guide</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default KailashCostGuide;
