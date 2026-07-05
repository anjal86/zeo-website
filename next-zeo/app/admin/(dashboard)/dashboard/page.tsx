import React from 'react';
import Link from 'next/link';
import { Mountain, Backpack, Mail, MessageSquare, Zap, Image as ImageIcon } from 'lucide-react';
import { listDestinations } from '@/server/repositories/catalog';
import { listTours } from '@/server/repositories/tours';
import { listEnquiries, listLeads } from '@/server/repositories/admin';
import { listTestimonials } from '@/server/repositories/content';

export const metadata = {
  title: 'Dashboard - Admin Portal',
};

export default async function DashboardPage() {
  const limitOne = { limit: '1', includeUnlisted: 'true' };
  const [
    { total: destCount },
    { total: tourCount },
    { total: enquiryCount },
    { total: leadCount },
    reviewList
  ] = await Promise.all([
    listDestinations(limitOne, true),
    listTours(limitOne, true),
    listEnquiries(limitOne),
    listLeads(limitOne),
    listTestimonials(true)
  ]);

  const reviewCount = reviewList.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Destinations</p>
              <p className="text-2xl font-bold text-slate-900">{destCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mountain className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Tours</p>
              <p className="text-2xl font-bold text-slate-900">{tourCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Backpack className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Contact Enquiries</p>
              <p className="text-2xl font-bold text-slate-900">{enquiryCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Testimonials</p>
              <p className="text-2xl font-bold text-slate-900">{reviewCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Conversion Leads</p>
              <p className="text-2xl font-bold text-slate-900">{leadCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/destinations" className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group flex flex-col">
            <div className="mb-2">
              <Mountain className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-medium text-slate-900">Manage Destinations</h4>
            <p className="text-sm text-slate-600">Add or edit travel destinations</p>
          </Link>

          <Link href="/admin/tours" className="p-4 border border-slate-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left group flex flex-col">
            <div className="mb-2">
              <Backpack className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-medium text-slate-900">Manage Tours</h4>
            <p className="text-sm text-slate-600">Add or edit tour packages</p>
          </Link>

          <Link href="/admin/sliders" className="p-4 border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left group flex flex-col">
            <div className="mb-2">
              <ImageIcon className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-medium text-slate-900">Manage Sliders</h4>
            <p className="text-sm text-slate-600">Update hero section sliders</p>
          </Link>

          <Link href="/admin/leads" className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group flex flex-col">
            <div className="mb-2">
              <Zap className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-medium text-slate-900">View Leads</h4>
            <p className="text-sm text-slate-600">Conversion tool lead captures</p>
          </Link>

          <Link href="/admin/enquiries" className="p-4 border border-slate-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-left group flex flex-col">
            <div className="mb-2">
              <Mail className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-medium text-slate-900">View Enquiries</h4>
            <p className="text-sm text-slate-600">Check customer enquiries</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
