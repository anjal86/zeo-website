"use client";
import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Upload, Camera, X } from 'lucide-react';
import { adminFetch, adminFetchRaw } from '@/lib/adminFetch';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
const api = '/api';

const DirectorEditor: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', title: '', message: '', image_url: '' });

    useEffect(() => {
        (async () => {
            try { const d = await adminFetch<any>(`${api}/director-message`); if (d) setForm({ name: d.name || '', title: d.title || '', message: d.message || '', image_url: d.image_url || '' }); }
            catch { /* ignore */ } finally { setLoading(false); }
        })();
    }, []);

    const handleUpload = async (file: File) => {
        try {
            const fd = new FormData(); fd.append('image', file); fd.append('entityType', 'director'); fd.append('slug', 'director-message');
            const res = await adminFetchRaw(`${api}/admin/upload`, { method: 'POST', body: fd });
            const r = await res.json(); setForm(p => ({ ...p, image_url: r.url }));
        } catch (err: any) { alert(err.message); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null);
        try { await adminFetch(`${api}/admin/director-message`, { method: 'PUT', body: JSON.stringify(form) }); alert('Saved!'); }
        catch (err: any) { setError(err.message); } finally { setSaving(false); }
    };

    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h3 className="text-xl font-semibold">Director Message</h3></div>
                <button onClick={handleSubmit} disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2">{saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}</button>
            </div>
            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-2">Name</label><input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Title</label><input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-2">Message</label><textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={8} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-4">Photo</label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 cursor-pointer bg-gray-50"
                            onDrop={e => { e.preventDefault(); const f = Array.from(e.dataTransfer.files).find(x => x.type.startsWith('image/')); if (f) handleUpload(f); }} onDragOver={e => e.preventDefault()}>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" /><p className="text-xs text-gray-600 mb-3">Drag & drop or click</p>
                            <input type="file" accept="image/*" className="hidden" id="dir-img" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                            <label htmlFor="dir-img" className="bg-green-600 text-white px-3 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2 text-sm"><Camera className="w-4 h-4" /> Choose</label>
                        </div>
                        <div>{form.image_url ? <div className="relative"><img src={form.image_url} alt="" className="w-full h-48 object-cover rounded-xl border" /><button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))} className="absolute top-2 right-2 bg-red-500/80 text-white p-2 rounded-lg"><X className="w-4 h-4" /></button></div> : <div className="w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed flex items-center justify-center"><p className="text-sm text-gray-500">No photo</p></div>}</div>
                    </div>
                </div>
            </form>
        </div>
    );
};
export default DirectorEditor;