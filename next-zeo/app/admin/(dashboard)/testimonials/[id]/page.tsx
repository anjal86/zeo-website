"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, AlertCircle, Star } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
const api = '/api';

interface TestForm { name: string; email?: string; country?: string; tour?: string; rating: number; title?: string; message?: string; image_url?: string; is_approved?: boolean; is_featured?: boolean; }

const TestimonialEditor: React.FC = () => {
    const params = useParams<{ id?: string }>();
    const router = useRouter();
    const id = params.id || 'new';
    const isEditing = id !== 'new';
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<TestForm>({ name: '', rating: 5, is_approved: true, is_featured: false });

    useEffect(() => {
        if (!isEditing) return;
        (async () => {
            try {
                const data = await adminFetch<{ testimonials: any[] }>(`${api}/admin/testimonials`);
                const item = data.testimonials?.find((t: any) => String(t.id) === id);
                if (!item) { setError('Testimonial not found'); setLoading(false); return; }
                setForm({ name: item.name || '', email: item.email || '', country: item.country || '', tour: item.tour || '', rating: item.rating ?? 5, title: item.title || '', message: item.message || '', image_url: item.image_url || '', is_approved: item.is_approved !== false, is_featured: !!item.is_featured });
            } catch (err: any) { setError(err.message); } finally { setLoading(false); }
        })();
    }, [id, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm(p => ({ ...p, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : name === 'rating' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null);
        try {
            await adminFetch(`${api}/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(form) });
            router.push('/admin/testimonials');
        } catch (err: any) { setError(err.message); } finally { setSaving(false); }
    };

    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4"><Link href="/admin/testimonials" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link><div><h2 className="text-xl font-semibold">{isEditing ? 'Edit Testimonial' : 'New Testimonial'}</h2></div></div>
                <button onClick={handleSubmit} disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2">{saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}</button>
            </div>
            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium mb-2">Name *</label><input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Email</label><input type="email" name="email" value={form.email || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Country</label><input type="text" name="country" value={form.country || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Tour</label><input type="text" name="tour" value={form.tour || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                    <div><label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button" onClick={() => setForm(p => ({ ...p, rating: n }))}><Star className={`w-6 h-6 ${n <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} /></button>
                        ))}</div>
                    </div>
                    <div><label className="block text-sm font-medium mb-2">Title</label><input type="text" name="title" value={form.title || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-2">Message</label><textarea name="message" value={form.message || ''} onChange={handleChange} rows={5} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2"><input type="checkbox" name="is_approved" checked={!!form.is_approved} onChange={handleChange} className="w-5 h-5 text-green-600 rounded border-gray-300" /><span>Approved</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="is_featured" checked={!!form.is_featured} onChange={handleChange} className="w-5 h-5 text-yellow-600 rounded border-gray-300" /><span>Featured</span></label>
                </div>
            </form>
        </div>
    );
};
export default TestimonialEditor;