"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, AlertCircle, Upload, Camera, Save } from 'lucide-react';
import DeleteModal from '@/components/UI/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { adminFetch, adminFetchRaw } from '@/lib/adminFetch';
const api = '/api';

interface GalleryItem { id: number; title?: string; image_url: string; alt?: string; order_index: number; is_active?: boolean; }

const GalleryManager: React.FC = () => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Partial<GalleryItem> | null>(null);
    const [saving, setSaving] = useState(false);

    const fetch = useCallback(async () => {
        try { const d = await adminFetch<any>(`${api}/kailash-gallery`); setItems(d?.gallery || (Array.isArray(d) ? d : [])); } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    }, []);
    useEffect(() => { fetch(); }, [fetch]);

    const handleDelete = async (g: GalleryItem) => { await adminFetch(`${api}/admin/kailash-gallery/${g.id}`, { method: 'DELETE' }); await fetch(); };
    const delModal = useDeleteModal<GalleryItem>({ onDelete: handleDelete, getItemName: g => g.title || 'image', getItemId: g => g.id });

    const handleSave = async () => {
        if (!editing?.image_url) return; setSaving(true);
        try {
            await adminFetch(`${api}/admin/kailash-gallery`, { method: 'POST', body: JSON.stringify(editing) });
            setEditing(null); await fetch();
        } catch (err: any) { alert(err.message); } finally { setSaving(false); }
    };

    const handleUpload = async (file: File) => {
        try {
            const fd = new FormData(); fd.append('image', file); fd.append('entityType', 'kailash-gallery'); fd.append('slug', `gallery-${Date.now()}`);
            const res = await adminFetchRaw(`${api}/admin/upload`, { method: 'POST', body: fd });
            const r = await res.json(); setEditing(p => ({ ...p, image_url: r.url }));
        } catch (err: any) { alert(err.message); }
    };

    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h3 className="text-xl font-semibold">Kailash Gallery</h3></div>
                <button onClick={() => setEditing({ title: '', alt: '', order_index: items.length + 1, is_active: true })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Image</button>
            </div>
            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}

            {editing && (
                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                    <h4 className="font-semibold">Add Gallery Image</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Title" value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} className="px-3 py-2 border rounded-lg" />
                        <input type="text" placeholder="Alt text" value={editing.alt || ''} onChange={e => setEditing(p => ({ ...p, alt: e.target.value }))} className="px-3 py-2 border rounded-lg" />
                        <input type="number" placeholder="Order" value={editing.order_index ?? 0} onChange={e => setEditing(p => ({ ...p, order_index: Number(e.target.value) }))} className="px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 cursor-pointer bg-gray-50"
                        onDrop={e => { e.preventDefault(); const f = Array.from(e.dataTransfer.files).find(x => x.type.startsWith('image/')); if (f) handleUpload(f); }} onDragOver={e => e.preventDefault()}>
                        {editing.image_url ? <img src={editing.image_url} alt="" className="h-32 mx-auto object-contain" />
                            : <><Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" /><p className="text-xs text-gray-600">Drag & drop or click to upload</p></>}
                        <input type="file" accept="image/*" className="hidden" id="gal-img" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                        <label htmlFor="gal-img" className="bg-green-600 text-white px-3 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2 text-sm mt-3"><Camera className="w-4 h-4" /> Choose</label>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={saving || !editing.image_url} className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2">{saving ? 'Saving...' : <><Save className="w-4 h-4" /> Add to Gallery</>}</button>
                        <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(g => (
                    <div key={g.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group relative">
                        <img src={g.image_url} alt={g.alt || g.title || ''} className="h-40 w-full object-cover" />
                        <div className="p-3">
                            <p className="text-sm font-medium truncate">{g.title || 'Untitled'}</p>
                            <p className="text-xs text-gray-500">Order: {g.order_index}</p>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={() => delModal.openModal(g)} className="bg-red-500 text-white p-1 rounded"><Trash2 className="w-3 h-3" /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">No gallery images yet.</div>}
            </div>
            <DeleteModal {...delModal.modalProps} title="Delete Image" message="Are you sure?" confirmText="Delete" variant="danger" />
        </div>
    );
};
export default GalleryManager;