"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Search, AlertCircle, ChevronLeft, ChevronRight, X, Eye, XCircle, CheckCircle } from 'lucide-react';
import DeleteModal from '@/components/UI/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import Modal from '@/components/UI/Modal';
import { adminFetch } from '@/lib/adminFetch';
const api = '/api';

interface Lead { id: number; name: string; email?: string; phone?: string; type?: string; status?: string; meta?: any; created_at?: string; }

const LeadsManager: React.FC = () => {
    const [items, setItems] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;
    const [total, setTotal] = useState(0);
    const [viewing, setViewing] = useState<Lead | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const p = new URLSearchParams({ page: String(page), limit: String(limit), ...(search ? { search } : {}), ...(statusFilter ? { status: statusFilter } : {}) });
            const data = await adminFetch<{ leads: Lead[]; pagination?: { totalItems: number } }>(`${api}/admin/leads?${p}`);
            const list = data.leads || []; setItems(list); setTotal(data.pagination?.totalItems ?? list.length);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    }, [page, search, statusFilter]);
    useEffect(() => { fetch(); }, [fetch]);

    const handleDelete = async (l: Lead) => { await adminFetch(`${api}/admin/leads/${l.id}`, { method: 'DELETE' }); await fetch(); };
    const delModal = useDeleteModal<Lead>({ onDelete: handleDelete, getItemName: l => l.name, getItemId: l => l.id });

    const updateStatus = async (id: number, status: string) => { await adminFetch(`${api}/admin/leads/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); await fetch(); };

    const tp = Math.ceil(total / limit);
    if (loading && items.length === 0) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div><h3 className="text-xl font-semibold">Leads</h3><p className="text-slate-600 text-sm">Manage inbound leads</p></div>

            <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search by name, email, phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm" />
                        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="w-full px-4 py-3 border rounded-lg text-sm bg-white">
                        <option value="">All Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span><button onClick={fetch} className="ml-auto text-sm underline">Retry</button></div>}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium uppercase">Name</th><th className="px-3 py-3 text-xs font-medium uppercase">Email</th><th className="px-3 py-3 text-xs font-medium uppercase">Phone</th><th className="px-3 py-3 text-xs font-medium uppercase">Type</th><th className="px-3 py-3 text-xs font-medium uppercase">Status</th><th className="px-3 py-3 text-xs font-medium uppercase">Date</th><th className="px-3 py-3 text-right text-xs font-medium uppercase">Actions</th></tr></thead>
                    <tbody>{items.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No leads found.</td></tr>
                        : items.map(l => (
                            <tr key={l.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 font-medium">{l.name}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{l.email || '-'}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{l.phone || '-'}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{l.type || '-'}</td>
                                <td className="px-3 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.status === 'new' ? 'bg-blue-100 text-blue-800' : l.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' : l.status === 'qualified' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{l.status || 'new'}</span></td>
                                <td className="px-3 py-4 text-sm text-gray-500">{l.created_at ? new Date(l.created_at).toLocaleDateString() : '-'}</td>
                                <td className="px-3 py-4 text-right"><div className="flex justify-end gap-1">
                                    <button onClick={() => setViewing(l)} className="text-blue-600 p-1" title="View"><Eye className="w-4 h-4" /></button>
                                    <select value={l.status || 'new'} onChange={e => updateStatus(l.id, e.target.value)} className="text-xs border rounded px-1 py-0.5" onClick={e => e.stopPropagation()}>
                                        <option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option>
                                    </select>
                                    <button onClick={() => delModal.openModal(l)} className="text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                                </div></td>
                            </tr>
                        ))}</tbody>
                </table>
                {total > limit && <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-700">Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}</div>
                    <div className="flex space-x-2"><button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button><button disabled={page === tp} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button></div>
                </div>}
            </div>

            <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title="Lead Details">
                {viewing && <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-500">Name</label><p className="font-medium">{viewing.name}</p></div>
                        <div><label className="text-xs text-gray-500">Email</label><p className="font-medium">{viewing.email || '-'}</p></div>
                        <div><label className="text-xs text-gray-500">Phone</label><p className="font-medium">{viewing.phone || '-'}</p></div>
                        <div><label className="text-xs text-gray-500">Type</label><p className="font-medium">{viewing.type || '-'}</p></div>
                        <div><label className="text-xs text-gray-500">Status</label><p className="font-medium">{viewing.status || 'new'}</p></div>
                        <div><label className="text-xs text-gray-500">Created</label><p className="font-medium">{viewing.created_at ? new Date(viewing.created_at).toLocaleString() : '-'}</p></div>
                    </div>
                    {viewing.meta && <div><label className="text-xs text-gray-500">Metadata</label><pre className="text-sm bg-gray-50 p-3 rounded-lg mt-1 overflow-auto max-h-60">{JSON.stringify(viewing.meta, null, 2)}</pre></div>}
                </div>}
            </Modal>

            <DeleteModal {...delModal.modalProps} title="Delete Lead" message="Are you sure?" confirmText="Delete" variant="danger" />
        </div>
    );
};
export default LeadsManager;