import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Filter, TrendingUp, BookOpen, Bell, LogOut, Zap } from 'lucide-react';

type LeadType = 'exit_popup' | 'trip_planner' | 'pdf_download' | 'price_alert';
type LeadStatus = 'new' | 'contacted' | 'converted';

interface Lead {
  id: number;
  type: LeadType;
  name: string | null;
  email: string;
  meta: Record<string, string | number | null>;
  status: LeadStatus;
  created_at: string;
}

const TYPE_CONFIG: Record<LeadType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  trip_planner: { label: 'Trip Planner', color: 'text-blue-700', bg: 'bg-blue-100', icon: TrendingUp },
  pdf_download: { label: 'PDF Download', color: 'text-green-700', bg: 'bg-green-100', icon: BookOpen },
  price_alert: { label: 'Price Alert', color: 'text-orange-700', bg: 'bg-orange-100', icon: Bell },
  exit_popup: { label: 'Exit Popup', color: 'text-purple-700', bg: 'bg-purple-100', icon: LogOut },
};

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  contacted: { label: 'Contacted', color: 'text-blue-700', bg: 'bg-blue-100' },
  converted: { label: 'Converted', color: 'text-purple-700', bg: 'bg-purple-100' },
};

const LeadsManager: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<LeadType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = localStorage.getItem('adminToken');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('type', filterType);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const res = await fetch(`/api/admin/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filterType, filterStatus]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lead?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(prev => prev.filter(l => l.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: number, status: LeadStatus) => {
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch { /* ignore */ }
  };

  // Stats
  const stats = {
    total: leads.length,
    trip_planner: leads.filter(l => l.type === 'trip_planner').length,
    pdf_download: leads.filter(l => l.type === 'pdf_download').length,
    price_alert: leads.filter(l => l.type === 'price_alert').length,
    exit_popup: leads.filter(l => l.type === 'exit_popup').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Conversion Leads</h2>
          <p className="text-slate-500 text-sm mt-1">Leads captured via conversion tools across the site</p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, color: 'bg-slate-800', text: 'text-white', icon: Zap },
          { label: 'Trip Planner', value: stats.trip_planner, color: 'bg-blue-50 border border-blue-100', text: 'text-blue-900', icon: TrendingUp },
          { label: 'PDF Download', value: stats.pdf_download, color: 'bg-green-50 border border-green-100', text: 'text-green-900', icon: BookOpen },
          { label: 'Price Alert', value: stats.price_alert, color: 'bg-orange-50 border border-orange-100', text: 'text-orange-900', icon: Bell },
          { label: 'Exit Popup', value: stats.exit_popup, color: 'bg-purple-50 border border-purple-100', text: 'text-purple-900', icon: LogOut },
        ].map(({ label, value, color, text, icon: Icon }) => (
          <div key={label} className={`p-4 ${color}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold uppercase tracking-widest ${text} opacity-70`}>{label}</span>
              <Icon className={`w-4 h-4 ${text} opacity-50`} />
            </div>
            <p className={`text-3xl font-bold ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as LeadType | 'all')}
          className="text-sm border border-slate-200 px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Types</option>
          <option value="trip_planner">Trip Planner</option>
          <option value="pdf_download">PDF Download</option>
          <option value="price_alert">Price Alert</option>
          <option value="exit_popup">Exit Popup</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as LeadStatus | 'all')}
          className="text-sm border border-slate-200 px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No leads yet</p>
            <p className="text-slate-400 text-sm mt-1">Leads will appear here when users interact with conversion tools</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Details</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map(lead => {
                  const typeConfig = TYPE_CONFIG[lead.type];
                  const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                  const TypeIcon = typeConfig.icon;
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold ${typeConfig.bg} ${typeConfig.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{lead.name || '—'}</td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {lead.meta?.tour && <div><span className="font-medium text-slate-700">Tour:</span> {lead.meta.tour as string}</div>}
                        {lead.meta?.experience && <div><span className="font-medium text-slate-700">Style:</span> {lead.meta.experience as string}</div>}
                        {lead.meta?.companions && <div><span className="font-medium text-slate-700">Group:</span> {lead.meta.companions as string}</div>}
                        {lead.meta?.fitness && <div><span className="font-medium text-slate-700">Fitness:</span> {lead.meta.fitness as string}</div>}
                        {lead.meta?.duration && <div><span className="font-medium text-slate-700">Duration:</span> {lead.meta.duration as string}</div>}
                        {!lead.meta?.tour && !lead.meta?.experience && <span className="italic text-slate-400">No details</span>}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={e => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`text-xs font-bold px-2 py-1 border-0 focus:ring-1 focus:ring-primary cursor-pointer ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <div className="text-slate-400">
                          {new Date(lead.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={deletingId === lead.id}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsManager;
