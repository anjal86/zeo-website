"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, AlertCircle, Upload, Camera, X } from 'lucide-react';
import { adminFetch, adminFetchRaw } from '@/lib/adminFetch';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
const api = '/api';
const SliderEditor: React.FC = () => {
    const params = useParams<{ id?: string }>(); const router = useRouter();
    const id = params.id || 'new'; const isEditing = id !== 'new';
    const [loading, setLoading] = useState(isEditing); const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null); const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', button_text: '', button_url: '', order_index: 0, is_active: true, show_button: false });
    useEffect(() => {
        if (!isEditing) return;
        (async () => { try { const d = await adminFetch<any>(`${api}/admin/sliders/${id}`); setForm({ title: d.title || '', subtitle: d.subtitle || '', image_url: d.image_url || '', button_text: d.button_text || '', button_url: d.button_url || '', order_index: d.order_index ?? 0, is_active: d.is_active !== false, show_button: !!d.show_button }); } catch (err: any) { setError(err.message); } finally { setLoading(false); } })();
    }, [id, isEditing]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value, type } = e.target; setForm(p => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value })); };
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); setError(null); try { await adminFetch(isEditing ? `${api}/admin/sliders/${id}` : `${api}/admin/sliders`, { method: isEditing ? 'PUT' : 'POST', body: JSON.stringify(form) }); router.push('/admin/sliders'); } catch (err: any) { setError(err.message); } finally { setSaving(false); } };
    const handleUpload = async (file: File) => { setUploading(true); try { const fd = new FormData(); fd.append('image', file); fd.append('entityType', 'slider'); fd.append('slug', `slider-${Date.now()}`); const res = await adminFetchRaw(`${api}/admin/upload`, { method: 'POST', body: fd }); const r = await res.json(); setForm(p => ({ ...p, image_url: r.url })); } catch (err: any) { alert(err.message); } finally { setUploading(false); } };
    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4"><Link href="/admin/sliders" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link><div><h2 className="text-xl font-semibold">{isEditing ? 'Edit Slider' : 'New Slider'}</h2></div></div>
                <button onClick={handleSubmit} disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2">{saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}</button>
            </div>
            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-2">Title *</label><input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Order</label><input type="number" name="order_index" value={form.order_index} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-2">Subtitle</label><input type="text" name="subtitle" value={form.subtitle} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-2">Button Text</label><input type="text" name="button_text" value={form.button_text} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Button URL</label><input type="text" name="button_url" value={form.button_url} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2"><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-5 h-5 text-green-600 rounded border-gray-300" /><span>Active</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="show_button" checked={form.show_button} onChange={handleChange} className="w-5 h-5 text-yellow-600 rounded border-gray-300" /><span>Show Button</span></label>
                </div>
                <div><label className="block text-sm font-medium mb-4">Image</label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 cursor-pointer bg-gray-50" onDrop={e => { e.preventDefault(); const f = Array.from(e.dataTransfer.files).find(x => x.type.startsWith('image/')); if (f) handleUpload(f); }} onDragOver={e => e.preventDefault()}>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" /><p className="text-xs text-gray-600 mb-3">Drag & drop or click</p>
                            <input type="file" accept="image/*" className="hidden" id="slider-img" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                            <label htmlFor="slider-img" className="bg-green-600 text-white px-3 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2 text-sm"><Camera className="w-4 h-4" /> Choose</label>
                        </div>
                        <div>{form.image_url ? <div className="relative"><img src={form.image_url} alt="" className="w-full h-48 object-cover rounded-xl border" /><button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))} className="absolute top-2 right-2 bg-red-500/80 text-white p-2 rounded-lg"><X className="w-4 h-4" /></button></div> : <div className="w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed flex items-center justify-center"><p className="text-sm text-gray-500">No image</p></div>}</div>
                    </div>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-2">Or enter image URL</label><input type="url" name="image_url" value={form.image_url} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            </form>
        </div>
    );
};
export default SliderEditor;