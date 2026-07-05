"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Edit, Trash2, Search, AlertCircle, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import DeleteModal from '@/components/UI/DeleteModal';
import Toggle from '@/components/UI/Toggle';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { adminFetch } from '@/lib/adminFetch';

const getApiBaseUrl = (): string => '/api';

interface Destination {
    id: number;
    slug: string;
    name: string;
    title?: string;
    country?: string;
    type?: string;
    image_url?: string;
    description?: string;
    listed?: boolean;
    featured?: boolean;
    tour_count?: number;
    created_at?: string;
}

const DestinationsManager: React.FC = () => {
    const router = useRouter();
    const [items, setItems] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [countries, setCountries] = useState<string[]>([]);
    const [updating, setUpdating] = useState<Set<number>>(new Set());
    const [page, setPage] = useState(1);
    const limit = 20;
    const [total, setTotal] = useState(0);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(page), limit: String(limit),
                ...(search ? { search } : {}),
                ...(typeFilter ? { type: typeFilter } : {}),
                ...(countryFilter ? { country: countryFilter } : {}),
            });
            const data = await adminFetch<{ destinations: Destination[]; pagination?: { totalItems: number } }>(
                `${getApiBaseUrl()}/admin/destinations?${params}`
            );
            const list = data.destinations || [];
            setItems(list);
            setTotal(data.pagination?.totalItems ?? list.length);
        } catch (err: any) {
            setError(err.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [page, search, typeFilter, countryFilter]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    useEffect(() => {
        (async () => {
            try {
                const data = await adminFetch<Destination[]>('/api/destinations');
                const unique = [...new Set(data.map((d: Destination) => d.country).filter(Boolean))] as string[];
                setCountries(unique);
            } catch { /* ignore */ }
        })();
    }, []);

    const handleDelete = async (dest: Destination) => {
        await adminFetch(`${getApiBaseUrl()}/admin/destinations/${dest.id}`, { method: 'DELETE' });
        await fetchItems();
    };

    const toggleListed = async (dest: Destination) => {
        setUpdating(p => new Set(p).add(dest.id));
        try {
            const updated = await adminFetch<Destination>(`${getApiBaseUrl()}/admin/destinations/${dest.id}`, {
                method: 'PUT',
                body: JSON.stringify({ listed: !dest.listed }),
            });
            setItems(prev => prev.map(d => d.id === dest.id ? { ...d, listed: updated.listed } : d));
        } finally {
            setUpdating(p => { const s = new Set(p); s.delete(dest.id); return s; });
        }
    };

    const deleteModal = useDeleteModal<Destination>({
        onDelete: handleDelete,
        getItemName: d => d.name,
        getItemId: d => d.id,
    });

    const totalPages = Math.ceil(total / limit);
    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    if (loading && items.length === 0) {
        return <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /><span className="ml-3 text-slate-600">Loading destinations...</span></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-slate-900">Destinations</h3>
                    <p className="text-slate-600 text-sm">Manage your destinations</p>
                </div>
                <button onClick={() => router.push('/admin/destinations/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Add Destination
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search destinations..." value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
                    </div>
                    <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white">
                        <option value="">All Types</option>
                        <option value="nepal">Nepal</option>
                        <option value="international">International</option>
                    </select>
                    <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setPage(1); }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white">
                        <option value="">All Countries</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                {(search || typeFilter || countryFilter) && (
                    <div className="mt-4 text-sm text-gray-500">Found {total} destinations</div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" /><span>{error}</span>
                    <button onClick={fetchItems} className="ml-auto text-sm underline">Retry</button>
                </div>
            )}

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tours</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listed</th>
                                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No destinations found.</td></tr>
                            ) : items.map(dest => (
                                <tr key={dest.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/destinations/${dest.slug || dest.id}`)}>
                                    <td className="px-4 py-4 font-medium text-gray-900">{dest.name}</td>
                                    <td className="px-3 py-4 text-sm text-gray-500">{dest.country}</td>
                                    <td className="px-3 py-4 text-sm text-gray-500">{dest.type}</td>
                                    <td className="px-3 py-4 text-sm text-gray-500">{dest.tour_count ?? 0}</td>
                                    <td className="px-3 py-4" onClick={e => e.stopPropagation()}>
                                        <Toggle checked={dest.listed !== false} onChange={() => toggleListed(dest)}
                                            disabled={updating.has(dest.id)} size="sm" />
                                    </td>
                                    <td className="px-3 py-4 text-right" onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => router.push(`/admin/destinations/${dest.slug || dest.id}`)} className="text-blue-600 hover:text-blue-900"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => deleteModal.openModal(dest)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {total > limit && (
                    <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-700">Showing {startItem} to {endItem} of {total}</div>
                        <div className="flex space-x-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {items.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">No destinations found.</div>
                ) : items.map(dest => (
                    <div key={dest.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer"
                        onClick={() => router.push(`/admin/destinations/${dest.slug || dest.id}`)}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900">{dest.name}</div>
                            <div className="text-xs text-gray-500">{dest.country}</div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{dest.type || 'N/A'}</span>
                            <span className="text-xs text-gray-500">{dest.tour_count ?? 0} tours</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                            <div onClick={e => e.stopPropagation()}>
                                <Toggle checked={dest.listed !== false} onChange={() => toggleListed(dest)}
                                    disabled={updating.has(dest.id)} size="sm" />
                            </div>
                            <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                                <button onClick={() => router.push(`/admin/destinations/${dest.slug || dest.id}`)} className="text-blue-600"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => deleteModal.openModal(dest)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <DeleteModal {...deleteModal.modalProps} title="Delete Destination"
                message="Are you sure you want to delete this destination?" confirmText="Delete" variant="danger" />
        </div>
    );
};

export default DestinationsManager;