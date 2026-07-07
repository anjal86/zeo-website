"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import DeleteModal from '@/components/UI/DeleteModal';
import Toggle from '@/components/UI/Toggle';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { adminFetch } from '@/lib/adminFetch';

const api = '/api';

interface Activity {
    id: number;
    slug: string;
    name: string;
    type?: string;
    image_url?: string;
    is_active?: boolean;
    featured?: boolean;
    difficulty?: string;
    duration?: string;
    best_time?: string;
    created_at?: string;
}

const ActivitiesManager: React.FC = () => {
    const router = useRouter();
    const [items, setItems] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;
    const [total, setTotal] = useState(0);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(limit), ...(search ? { search } : {}), ...(typeFilter ? { type: typeFilter } : {}) });
            const data = await adminFetch<{ activities: Activity[]; pagination?: { totalItems: number } }>(`${api}/admin/activities?${params}`);
            const list = data.activities || [];
            setItems(list);
            setTotal(data.pagination?.totalItems ?? list.length);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally { setLoading(false); }
    }, [page, search, typeFilter]);

    useEffect(() => { 
        Promise.resolve().then(() => fetchItems()); 
    }, [fetchItems]);

    const handleDelete = async (act: Activity) => {
        await adminFetch(`${api}/admin/activities/${act.id}`, { method: 'DELETE' });
        await fetchItems();
    };

    const toggleActive = async (act: Activity) => {
        const updated = await adminFetch<{ is_active: boolean }>(`${api}/admin/activities/${act.id}`, {
            method: 'PATCH', body: JSON.stringify({ is_active: !act.is_active }),
        });
        setItems(prev => prev.map(a => a.id === act.id ? { ...a, is_active: updated.is_active } : a));
    };

    const deleteModal = useDeleteModal<Activity>({
        onDelete: handleDelete, getItemName: a => a.name, getItemId: a => a.id,
    });

    const totalPages = Math.ceil(total / limit);
    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    if (loading && items.length === 0) {
        return <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /><span className="ml-3 text-slate-600">Loading activities...</span></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div><h3 className="text-xl font-semibold text-slate-900">Activities</h3><p className="text-slate-600 text-sm">Manage your activities</p></div>
                <button onClick={() => router.push('/admin/activities/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Add Activity
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search activities..." value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
                    </div>
                    <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white">
                        <option value="">All Types</option>
                        <option value="adventure">Adventure</option>
                        <option value="cultural">Cultural</option>
                        <option value="spiritual">Spiritual</option>
                        <option value="trekking">Trekking</option>
                        <option value="wildlife">Wildlife</option>
                    </select>
                </div>
                {(search || typeFilter) && <div className="mt-4 text-sm text-gray-500">Found {total} activities</div>}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" /><span>{error}</span>
                    <button onClick={fetchItems} className="ml-auto text-sm underline">Retry</button>
                </div>
            )}

            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No activities found.</td></tr>
                        ) : items.map(act => (
                            <tr key={act.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/activities/${act.id}`)}>
                                <td className="px-4 py-4 font-medium text-gray-900">{act.name}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{act.type}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{act.difficulty}</td>
                                <td className="px-3 py-4" onClick={e => e.stopPropagation()}>
                                    <Toggle checked={act.is_active !== false} onChange={() => toggleActive(act)} size="sm" />
                                </td>
                                <td className="px-3 py-4 text-right" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => router.push(`/admin/activities/${act.id}`)} className="text-blue-600"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => deleteModal.openModal(act)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {total > limit && (
                    <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-700">Showing {startItem} to {endItem} of {total}</div>
                        <div className="flex space-x-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            <div className="lg:hidden space-y-4">
                {items.length === 0 ? <div className="bg-white rounded-xl p-8 text-center text-gray-500 border">No activities found.</div>
                    : items.map(act => (
                        <div key={act.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer" onClick={() => router.push(`/admin/activities/${act.id}`)}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-medium text-gray-900">{act.name}</div>
                                <div className="text-xs text-gray-500">{act.type}</div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t">
                                <div onClick={e => e.stopPropagation()}>
                                    <Toggle checked={act.is_active !== false} onChange={() => toggleActive(act)} size="sm" />
                                </div>
                                <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => router.push(`/admin/activities/${act.id}`)} className="text-blue-600"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => deleteModal.openModal(act)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            <DeleteModal {...deleteModal.modalProps} title="Delete Activity"
                message="Are you sure you want to delete this activity?" confirmText="Delete" variant="danger" />
        </div>
    );
};

export default ActivitiesManager;
