"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Search, AlertCircle, ChevronLeft, ChevronRight, X, Star } from 'lucide-react';
import DeleteModal from '@/components/UI/DeleteModal';
import Toggle from '@/components/UI/Toggle';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { adminFetch } from '@/lib/adminFetch';

const api = '/api';
interface Testimonial { id: number; name: string; country?: string; tour?: string; rating: number; title?: string; message?: string; is_approved?: boolean; is_featured?: boolean; created_at?: string; }
type TestimonialListResponse = Testimonial[] | { testimonials?: Testimonial[]; items?: Testimonial[]; pagination?: { totalItems: number } };

const TestimonialsManager: React.FC = () => {
    const router = useRouter();
    const [items, setItems] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [approvedFilter, setApprovedFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;
    const [total, setTotal] = useState(0);

    const fetch = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const p = new URLSearchParams({ page: String(page), limit: String(limit), ...(search ? { search } : {}), ...(approvedFilter ? { is_approved: approvedFilter } : {}) });
            const data = await adminFetch<TestimonialListResponse>(`${api}/admin/testimonials?${p}`);
            const list = Array.isArray(data) ? data : (data.testimonials || data.items || []);
            setItems(list); setTotal(Array.isArray(data) ? list.length : (data.pagination?.totalItems ?? list.length));
        } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to load testimonials'); } finally { setLoading(false); }
    }, [page, search, approvedFilter]);
    useEffect(() => { fetch(); }, [fetch]);

    const handleDelete = async (t: Testimonial) => { await adminFetch(`${api}/admin/testimonials/${t.id}`, { method: 'DELETE' }); await fetch(); };
    const toggleApprove = async (t: Testimonial) => { await adminFetch(`${api}/admin/testimonials/${t.id}/approve`, { method: 'PATCH', body: JSON.stringify({ approved: !t.is_approved }) }); await fetch(); };
    const toggleFeatured = async (t: Testimonial) => { await adminFetch(`${api}/admin/testimonials/${t.id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured: !t.is_featured }) }); await fetch(); };
    const delModal = useDeleteModal<Testimonial>({ onDelete: handleDelete, getItemName: t => t.name, getItemId: t => t.id });

    const tp = Math.ceil(total / limit);
    if (loading && items.length === 0) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h3 className="text-xl font-semibold">Testimonials</h3><p className="text-slate-600 text-sm">Manage customer reviews</p></div>
                <button onClick={() => router.push('/admin/testimonials/new')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">Add Testimonial</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search by name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm" />
                        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
                    </div>
                    <select value={approvedFilter} onChange={e => { setApprovedFilter(e.target.value); setPage(1); }} className="w-full px-4 py-3 border rounded-lg text-sm bg-white">
                        <option value="">All</option><option value="1">Approved</option><option value="0">Pending</option>
                    </select>
                </div>
            </div>
            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span><button onClick={fetch} className="ml-auto text-sm underline">Retry</button></div>}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium uppercase">Name</th><th className="px-3 py-3 text-xs font-medium uppercase">Rating</th><th className="px-3 py-3 text-xs font-medium uppercase">Approved</th><th className="px-3 py-3 text-xs font-medium uppercase">Featured</th><th className="px-3 py-3 text-xs font-medium uppercase">Actions</th></tr></thead>
                    <tbody>{items.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No testimonials found.</td></tr>
                        : items.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 font-medium">{t.name}<div className="text-xs text-gray-500">{t.country}{t.tour ? ` - ${t.tour}` : ''}</div></td>
                                <td className="px-3 py-4"><div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}</div></td>
                                <td className="px-3 py-4"><Toggle checked={!!t.is_approved} onChange={() => toggleApprove(t)} size="sm" /></td>
                                <td className="px-3 py-4"><Toggle checked={!!t.is_featured} onChange={() => toggleFeatured(t)} size="sm" /></td>
                                <td className="px-3 py-4"><button onClick={() => router.push(`/admin/testimonials/${t.id}`)} className="text-blue-600"><Edit className="w-4 h-4" /></button><button onClick={() => delModal.openModal(t)} className="text-red-600 ml-2"><Trash2 className="w-4 h-4" /></button></td>
                            </tr>
                        ))}</tbody>
                </table>
                {total > limit && <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-700">Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}</div>
                    <div className="flex space-x-2"><button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button><button disabled={page === tp} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button></div>
                </div>}
            </div>
            <DeleteModal {...delModal.modalProps} title="Delete Testimonial" message="Are you sure?" confirmText="Delete" variant="danger" />
        </div>
    );
};
export default TestimonialsManager;
