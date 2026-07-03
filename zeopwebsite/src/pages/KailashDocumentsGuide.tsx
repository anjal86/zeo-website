import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardCheck, FileCheck2, Phone, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO/SEO';
import { createArticleSchema, createBreadcrumbSchema, createFAQSchema } from '../utils/schema';

const pageUrl = 'https://www.zeotourism.com/kailash-mansarovar-yatra-documents-permits';

const faqs = [
  {
    question: 'What documents are needed for Kailash Mansarovar Yatra via Nepal?',
    answer: 'Common requirements include valid passport, passport-size photos, traveler details, China group visa or visa process documents, Tibet Travel Permit, Alien Travel Permit, medical or fitness documents if required, and route-specific operator forms.'
  },
  {
    question: 'Can pilgrims travel before China permits and visas are ready?',
    answer: 'No. Pilgrims should not start the trip until mandatory China/Tibet entry documents are confirmed for the chosen route. Starting without permits can cause denial, delays, or being stranded.'
  },
  {
    question: 'Who processes Tibet Travel Permit for Kailash Yatra?',
    answer: 'Tibet permits must be processed through qualified travel handling channels. Travelers cannot treat the Kailash region like a normal independent tourist route.'
  },
  {
    question: 'Do Indian government KMY rules apply to private Nepal route packages?',
    answer: 'Government KMY routes and private Nepal route packages are different. However, passport validity, accurate traveler information, health readiness, and confirmed permissions remain important for all routes.'
  }
];

const documentRows = [
  ['Passport', 'Check validity, spelling, date of birth, nationality, blank pages and scan quality.'],
  ['Photos and identity details', 'Provide clear passport-size photos and exact traveler details as requested by visa or permit process.'],
  ['China visa or group visa process', 'Requirement depends on route and current rule. Confirm before travel.'],
  ['Tibet Travel Permit', 'Mandatory Tibet-region permission handled before entry.'],
  ['Alien Travel Permit or restricted-area permission', 'Required for restricted areas linked to Kailash Mansarovar travel.'],
  ['Medical and fitness readiness', 'High altitude demands health screening, medication review, insurance and realistic fitness preparation.'],
  ['Emergency contacts and insurance', 'Carry family contact, insurance proof if available, and operator emergency process details.']
];

const KailashDocumentsGuide: React.FC = () => {
  const structuredData = [
    createArticleSchema({
      title: 'Kailash Mansarovar Yatra Documents and Permit Guide 2026',
      description: 'Document and permit checklist for Kailash Mansarovar Yatra via Nepal: passport, China visa, Tibet Travel Permit, Alien Travel Permit, medical readiness and safety checks.',
      author: 'Zeo Tourism Experts',
      publishDate: '2026-07-03',
      modifiedDate: new Date().toISOString().split('T')[0],
      image: 'https://www.zeotourism.com/images/kailash-mansarovar-yatra.jpg',
      url: pageUrl,
      category: 'Kailash Mansarovar Yatra',
      tags: ['Kailash Mansarovar documents', 'Kailash Yatra permits', 'Tibet Travel Permit', 'China visa Kailash Yatra']
    }),
    createFAQSchema(faqs),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://www.zeotourism.com' },
      { name: 'Kailash Mansarovar', url: 'https://www.zeotourism.com/kailash-mansarovar' },
      { name: 'Documents and Permits', url: pageUrl }
    ])
  ];

  return (
    <>
      <SEO
        title="Kailash Mansarovar Yatra Documents & Permit Guide 2026"
        description="Prepare for Kailash Mansarovar Yatra via Nepal with a clear documents and permit checklist: passport, China visa, Tibet permit, restricted-area permit and safety readiness."
        keywords="Kailash Mansarovar Yatra documents, Kailash Yatra permits, Tibet Travel Permit Kailash, China visa Kailash Mansarovar, Kailash Yatra from Nepal documents"
        url={pageUrl}
        image="https://www.zeotourism.com/images/kailash-mansarovar-yatra.jpg"
        type="article"
        structuredData={structuredData}
      />

      <div className="bg-white">
        <section className="bg-slate-950 text-white py-20">
          <div className="section-container max-w-5xl">
            <p className="text-orange-300 text-sm font-bold uppercase tracking-[0.2em] mb-4">Documents and permits</p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Kailash Mansarovar Yatra Permit Checklist
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-3xl">
              Kailash Mansarovar is not a normal tourist route. Passport details, China/Tibet permissions, fitness readiness and operator coordination must be confirmed before travel starts.
            </p>
          </div>
        </section>

        <section className="py-14 bg-amber-50 border-y border-amber-200">
          <div className="section-container max-w-5xl">
            <div className="flex gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Do not travel before permits are confirmed</h2>
                <p className="text-gray-700 leading-relaxed">
                  Recent public advisories and news reports show why documents matter: pilgrims can face delays or become stranded if China entry documents or Tibet permits are incomplete. The <a href="https://www.indembkathmandu.gov.in/kailash-mansorvar-yatra-via-nepal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Embassy of India in Kathmandu</a> also advises pilgrims to ensure appropriate Chinese visa and Tibet travel permit before commencing travel from India. Confirm written permit status before leaving for Kathmandu or the border route.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="section-container max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardCheck className="w-7 h-7 text-primary" />
              <h2 className="text-3xl font-bold text-gray-900">Document checklist</h2>
            </div>
            <div className="overflow-x-auto border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-900">
                  <tr>
                    <th className="p-4 font-bold">Item</th>
                    <th className="p-4 font-bold">What to verify</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documentRows.map(([item, detail]) => (
                    <tr key={item}>
                      <td className="p-4 font-semibold text-gray-900">{item}</td>
                      <td className="p-4 text-gray-700">{detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="section-container max-w-5xl">
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: FileCheck2, title: 'Before booking', body: 'Confirm passport validity, route eligibility, nationality-specific rules and realistic permit timeline.' },
                { icon: ShieldCheck, title: 'Before travel', body: 'Confirm written visa or permit status, final itinerary, emergency support, insurance and backup-day policy.' },
                { icon: ClipboardCheck, title: 'At departure', body: 'Carry printed and digital copies of passport, permit documents, hotel details, operator contacts and emergency contacts.' }
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-white border border-gray-200 p-6">
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-white">
          <div className="section-container max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Documents and permit FAQs</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="border border-gray-200 p-5">
                  <summary className="font-bold text-gray-900 cursor-pointer">{faq.question}</summary>
                  <p className="text-gray-700 mt-3 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-slate-950 text-white">
          <div className="section-container max-w-5xl">
            <h2 className="text-3xl font-bold mb-4">Ask Zeo Tourism to verify your route</h2>
            <p className="text-white/75 mb-6 max-w-3xl">Send passport nationality, preferred route, travel month and traveler age group. Our team will explain current document steps before you commit.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="bg-white text-gray-900 px-6 py-3 font-bold inline-flex items-center gap-2">Check documents <Phone className="w-4 h-4" /></Link>
              <Link to="/kailash-mansarovar-yatra-cost" className="border border-white/40 px-6 py-3 font-bold">Read cost guide</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default KailashDocumentsGuide;
