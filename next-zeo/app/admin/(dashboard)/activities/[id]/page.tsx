"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, Camera, X, Eye, Upload, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { adminFetch, adminFetchRaw } from '@/lib/adminFetch';

const api = '/api';

interface ActivityForm {
    slug: string;
    name: string;
    type?: string;
    description?: string;
    image_url?: string;
    highlights?: string[];
    difficulty?: string;
    duration?: string;
    best_time?: string;
    featured?: boolean;
    is_active?: boolean;
}

const ActivityEditor: React.FC = () => {
    const params = useParams<{ id?: string }>();
    const router = useRouter();
    const id = params.id || 'new';
    const isEditing = id !== 'new';

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState<ActivityForm>({
        slug: '', name: '', type: '', description: '', image_url: '',
        highlights: [], difficulty: '', duration: '', best_time: '',
        featured: false, is_active: true,
    });

    useEffect(() => {
        if (!isEditing) return;
        (async () => {
            try {
                const data = await adminFetch<any>(`${api}/admin/activities/${id}`);
                setForm({
                    slug: data.slug || '', name: data.name || '', type: data.type || '',
                    description: data.description || '', image_url: data.image_url || '',
                    highlights: data.highlights || [], difficulty: data.difficulty || '',
                    duration: data.duration || '', best_time: data.best_time || '',
                    featured: !!data.featured, is_active: data.is_active !== false,
                });
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally { setLoading(false); }
        })();
    }, [id, isEditing]);

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').trim();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'name' && !isEditing) updated.slug = generateSlug(value);
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const url = isEditing ? `${api}/admin/activities/${id}` : `${api}/admin/activities`;
            await adminFetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                body: JSON.stringify(form),
            });
            router.push('/admin/activities');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally { setSaving(false); }
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            fd.append('entityType', 'activity');
            fd.append('slug', form.slug || form.name.toLowerCase().replace(/[^a-z0-9]/g, '-'));
            const res = await adminFetchRaw(`${api}/admin/upload`, { method: 'POST', body: fd });
            const result = await res.json();
            setForm(prev => ({ ...prev, image_url: result.url }));
        } catch (err: any) {
            alert('Upload failed: ' + err.message);
        } finally { setUploading(false); }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/activities" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
                    <div>
                        <h2 className="text-xl font-semibold">{isEditing ? 'Edit Activity' : 'New Activity'}</h2>
                        <p className="text-sm text-slate-600">{isEditing ? form.name : 'Create a new activity'}</p>
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={saving}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                    {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                        : <><Save className="w-4 h-4" /> {isEditing ? 'Update' : 'Create'}</>}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" /><span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                        <input type="text" name="slug" value={form.slug} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select name="type" value={form.type || ''} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                            <option value="">Select type</option>
                            <option value="adventure">Adventure</option>
                            <option value="cultural">Cultural</option>
                            <option value="spiritual">Spiritual</option>
                            <option value="trekking">Trekking</option>
                            <option value="wildlife">Wildlife</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                        <input type="text" name="difficulty" value={form.difficulty || ''} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <input type="text" name="duration" value={form.duration || ''} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 3-5 hours" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Best Time</label>
                        <input type="text" name="best_time" value={form.best_time || ''} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Spring, Autumn" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea name="description" value={form.description || ''} onChange={handleChange} rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">Image</label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 cursor-pointer bg-gray-50"
                                onDrop={e => { e.preventDefault(); const f = Array.from(e.dataTransfer.files).find(x => x.type.startsWith('image/')); if (f) handleImageUpload(f); }}
                                onDragOver={e => e.preventDefault()}>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                <p className="text-xs text-gray-600 mb-3">Drag & drop or click to browse</p>
                                <input type="file" accept="image/*" className="hidden" id="act-image"
                                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                                <label htmlFor="act-image" className="bg-green-600 text-white px-3 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2 text-sm">
                                    <Camera className="w-4 h-4" /> Choose Image
                                </label>
                            </div>
                            {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                            <div className="mt-4">
                                <label className="block text-xs font-medium text-gray-600 mb-2">Or enter image URL</label>
                                <input type="url" name="image_url" value={form.image_url || ''} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                        </div>
                        <div>
                            {form.image_url ? (
                                <div className="relative">
                                    <img src={form.image_url.startsWith('http') ? form.image_url : form.image_url}
                                        alt="Preview" className="w-full h-48 object-cover rounded-xl border"
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <button type="button" onClick={() => window.open(form.image_url, '_blank')}
                                            className="bg-black/50 text-white p-2 rounded-lg"><Eye className="w-4 h-4" /></button>
                                        <button type="button" onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                                            className="bg-red-500/80 text-white p-2 rounded-lg"><X className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <p className="text-sm text-gray-500">No image</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_active !== false}
                            onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                            className="w-5 h-5 text-green-600 rounded border-gray-300" />
                        <span className="text-sm font-medium">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!form.featured}
                            onChange={e => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                            className="w-5 h-5 text-yellow-600 rounded border-gray-300" />
                        <span className="text-sm font-medium">Featured</span>
                    </label>
                </div>
            </form>
        </div>
    );
};

export default ActivityEditor;