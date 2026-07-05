"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, AlertCircle, Upload, Camera, X } from 'lucide-react';
import { adminFetch, adminFetchRaw } from '@/lib/adminFetch';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const api = '/api';

const PostEditor: React.FC = () => {
    const params = useParams<{ id?: string }>();
    const router = useRouter();
    const id = params.id || 'new';
    const isEditing = id !== 'new';

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', category: '', tags: '', status: 'draft' as string, image_url: '', seo_title: '', seo_description: '' });

    const load = useCallback(async () => {
        try {
            const d = await adminFetch<any>(`${api}/admin/posts/${id}`);
            setForm({ title: d.title || '', slug: d.slug || '', excerpt: d.excerpt || '', content: d.content || '', category: d.category || '', tags: (d.tags || []).join(', '), status: d.status || 'draft', image_url: d.image_url || '', seo_title: d.seo?.title || '', seo_description: d.seo?.description || '' });
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    }, [id]);
    useEffect(() => { if (isEditing) load(); else setLoading(false); }, [load, isEditing]);

    const genSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').trim();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(p => { const u = { ...p, [name]: value }; if (name === 'title' && !isEditing) u.slug = genSlug(value); return u; });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null);
        try {
            const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
            const payload = { ...form, tags, seo: { title: form.seo_title || form.title, description: form.seo_description || form.excerpt } };
            const url = isEditing ? `${api}/admin/posts/${id}` : `${api}/admin/posts`;
            await adminFetch(url, { method: isEditing ? 'PUT' : 'POST', body: JSON.stringify(payload) });
            router.push('/admin/blog');
        } catch (err: any) { setError(err.message); } finally { setSaving(false); }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const fd = new FormData(); fd.append('image', file); fd.append('entityType', 'post'); fd.append('slug', form.slug || genSlug(form.title));
            const res = await adminFetchRaw(`${api}/admin/upload`, { method: 'POST', body: fd });
            const r = await res.json(); setForm(p => ({ ...p, image_url: r.url }));
        } catch (err: any) { alert('Upload failed: ' + err.message); } finally { setUploading(false); }
    };

    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
                    <div><h2 className="text-xl font-semibold">{isEditing ? 'Edit Post' : 'New Post'}</h2></div>
                </div>
                <button onClick={handleSubmit} disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                    {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {isEditing ? 'Update' : 'Publish'}</>}
                </button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Title *</label><input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Slug</label><input type="text" name="slug" value={form.slug} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Category</label><input type="text" name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label><select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"><option value="draft">Draft</option><option value="published">Published</option></select></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label><input type="text" name="tags" value={form.tags} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="travel, nepal, trekking" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label><textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Content</label><textarea name="content" value={form.content} onChange={handleChange} rows={15} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-4">Featured Image</label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 cursor-pointer bg-gray-50"
                            onDrop={e => { e.preventDefault(); const f = Array.from(e.dataTransfer.files).find(x => x.type.startsWith('image/')); if (f) handleUpload(f); }} onDragOver={e => e.preventDefault()}>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" /><p className="text-xs text-gray-600 mb-3">Drag & drop or click</p>
                            <input type="file" accept="image/*" className="hidden" id="post-image" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                            <label htmlFor="post-image" className="bg-green-600 text-white px-3 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2 text-sm"><Camera className="w-4 h-4" /> Choose</label>
                        </div>
                        <div>{form.image_url ? <div className="relative"><img src={form.image_url} alt="" className="w-full h-48 object-cover rounded-xl border" /><button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))} className="absolute top-2 right-2 bg-red-500/80 text-white p-2 rounded-lg"><X className="w-4 h-4" /></button></div> : <div className="w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed flex items-center justify-center"><p className="text-sm text-gray-500">No image</p></div>}</div>
                    </div>
                </div>
                <div className="border-t pt-6"><h3 className="text-lg font-semibold mb-4">SEO</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label><input type="text" name="seo_title" value={form.seo_title} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label><input type="text" name="seo_description" value={form.seo_description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
                    </div>
                </div>
            </form>
        </div>
    );
};
export default PostEditor;