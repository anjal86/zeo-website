"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import DeleteModal from '@/components/UI/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import Toggle from '@/components/UI/Toggle';
import { adminFetch } from '@/lib/adminFetch';

const api = '/api';
interface Slider { id: number; title: string; subtitle?: string; image_url?: string; button_text?: string; button_url?: string; order_index: number; is_active?: boolean; }

const SlidersManager: React.FC = () => {
    const router = useRouter();
    const [items, setItems] = useState<Slider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const limit = 50;
    const [total, setTotal] = useState(0);

    const fetch = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const data = await adminFetch<any>(`${api}/admin/sliders?page=${page}&limit=${limit}`);
            const list = Array.isArray(data) ? data : (data.sliders || []);
            setItems(list);
            setTotal(Array.isArray(data) ? data.length : (data.pagination?.totalItems ?? list.length));
        } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to load sliders'); } finally { setLoading(false); }
    }, [page]);
    useEffect(() => { fetch(); }, [fetch]);

    const handleDelete = async (s: Slider) => { await adminFetch(`${api}/admin/sliders/${s.id}`, { method: 'DELETE' }); await fetch(); };
    const toggleActive = async (s: Slider) => {
        const u = await adminFetch<{ is_active: boolean }>(`${api}/admin/sliders/${s.id}`, { method: 'PATCH', body: JSON.stringify({ is_active: !s.is_active }) });
        setItems(prev => prev.map(x => x.id === s.id ? { ...x, is_active: u.is_active } : x));
    };
    const delModal = useDeleteModal<Slider>({ onDelete: handleDelete, getItemName: s => s.title, getItemId: s => s.id });

    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h3 className="text-xl font-semibold">Sliders</h3><p className="text-slate-600 text-sm">Home page hero sliders</p></div>
                <button onClick={() => router.push('/admin/sliders/new')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Slider</button>
            </div>
            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium uppercase">Order</th><th className="px-4 py-3 text-left text-xs font-medium uppercase">Title</th><th className="px-3 py-3 text-xs font-medium uppercase">Active</th><th className="px-3 py-3 text-xs font-medium uppercase">Image</th><th className="px-3 py-3 text-right text-xs font-medium uppercase">Actions</th></tr></thead>
                    <tbody>{items.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">{s.order_index}</td>
                            <td className="px-4 py-4 font-medium">{s.title}</td>
                            <td className="px-3 py-4"><Toggle checked={s.is_active !== false} onChange={() => toggleActive(s)} size="sm" /></td>
                            <td className="px-3 py-4">{s.image_url ? <img src={s.image_url} alt="" className="w-16 h-10 object-cover rounded" /> : '-'}</td>
                            <td className="px-3 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => router.push(`/admin/sliders/${s.id}`)} className="text-blue-600"><Edit className="w-4 h-4" /></button><button onClick={() => delModal.openModal(s)} className="text-red-600"><Trash2 className="w-4 h-4" /></button></div></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
            <DeleteModal {...delModal.modalProps} title="Delete Slider" message="Are you sure?" confirmText="Delete" variant="danger" />
        </div>
    );
};
export default SlidersManager;
