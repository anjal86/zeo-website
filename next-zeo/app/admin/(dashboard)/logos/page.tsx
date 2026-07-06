"use client";
import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Upload, Camera, X, Eye, Trash2 } from 'lucide-react';
import { adminFetch, adminFetchRaw } from '@/lib/adminFetch';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
const api = '/api';

const LogosManager: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState<string | null>(null);
    const [logos, setLogos] = useState<Record<string, { image_url: string; name?: string; website_url?: string }>>({});

    const load = async () => {
        try {
            const d = await adminFetch<any[]>(`${api}/logos`);
            const map: Record<string, any> = {};
            (d || []).forEach((l: any) => { map[l.type] = l; });
            setLogos(map);
        } catch { /* ignore */ } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const handleUpload = async (type: string, file: File) => {
        setUploading(type);
        try {
            const fd = new FormData(); fd.append('image', file); fd.append('slug', `logo-${type}`);
            const res = await adminFetchRaw(`${api}/admin/logos/upload`, { method: 'POST', body: fd });
            const r = await res.json();
            await adminFetch(`${api}/admin/logos`, { method: 'PUT', body: JSON.stringify({ type, image_url: r.url, name: type }) });
            await load();
        } catch (err: any) { alert('Upload failed: ' + err.message); } finally { setUploading(null); }
    };

    const handleDelete = async (type: string) => {
        if (!confirm(`Delete ${type} logo?`)) return;
        await adminFetch(`${api}/admin/logos/${type}`, { method: 'DELETE' });
        await load();
    };

    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

const LogoField = ({ type, label, logo, uploading, onUpload, onDelete }: { type: string; label: string, logo?: { image_url: string }, uploading: string | null, onUpload: (type: string, file: File) => void, onDelete: (type: string) => void }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="font-semibold mb-4">{label}</h4>
            {logo?.image_url ? (
                <div className="relative inline-block">
                    <img src={logo.image_url} alt={label} className="h-20 object-contain border rounded-lg p-2 bg-gray-50" />
                    <div className="absolute top-1 right-1 flex gap-1">
                        <button type="button" onClick={() => window.open(logo.image_url, '_blank')} className="bg-black/50 text-white p-1 rounded"><Eye className="w-3 h-3" /></button>
                        <button type="button" onClick={() => onDelete(type)} className="bg-red-500/80 text-white p-1 rounded"><Trash2 className="w-3 h-3" /></button>
                    </div>
                </div>
            ) : <p className="text-sm text-gray-500 mb-3">No logo uploaded</p>}
            <div className="mt-4">
                <input type="file" accept="image/*" className="hidden" id={`logo-${type}`} onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(type, f); }} />
                <label htmlFor={`logo-${type}`} className="bg-blue-600 text-white px-3 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2 text-sm hover:bg-blue-700">
                    {uploading === type ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload</>}
                </label>
            </div>
        </div>
    );
};

    return (
        <div className="space-y-6">
            <div><h3 className="text-xl font-semibold">Logos</h3><p className="text-slate-600 text-sm">Manage header, footer, and brand logos</p></div>
            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LogoField type="header" label="Header Logo" logo={logos.header} uploading={uploading} onUpload={handleUpload} onDelete={handleDelete} />
                <LogoField type="footer" label="Footer Logo" logo={logos.footer} uploading={uploading} onUpload={handleUpload} onDelete={handleDelete} />
                <LogoField type="favicon" label="Favicon" logo={logos.favicon} uploading={uploading} onUpload={handleUpload} onDelete={handleDelete} />
            </div>
        </div>
    );
};
export default LogosManager;