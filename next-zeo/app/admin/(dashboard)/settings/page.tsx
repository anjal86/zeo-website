"use client";
import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
const api = '/api';

const ContactSettingsEditor: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        phone: { primary: '', whatsapp: '' },
        email: { primary: '' },
        address: { full: '' },
        social: { facebook: '', instagram: '', twitter: '', youtube: '', linkedin: '' },
        company: { name: '' },
    });

    useEffect(() => {
        (async () => {
            try {
                const d = await adminFetch<any>(`${api}/contact`);
                setForm(prev => ({
                    phone: { primary: d.phone?.primary || '', whatsapp: d.phone?.whatsapp || '' },
                    email: { primary: d.email?.primary || '' },
                    address: { full: d.address?.full || '' },
                    social: { facebook: d.social?.facebook || '', instagram: d.social?.instagram || '', twitter: d.social?.twitter || '', youtube: d.social?.youtube || '', linkedin: d.social?.linkedin || '' },
                    company: { name: d.company?.name || 'Zeo Tourism' },
                }));
            } catch { /* ignore */ }
            finally { setLoading(false); }
        })();
    }, []);

    const setNested = (path: string, val: string) => {
        const parts = path.split('.');
        setForm(prev => {
            const clone = JSON.parse(JSON.stringify(prev));
            let obj = clone;
            for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
            obj[parts[parts.length - 1]] = val;
            return clone;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError(null);
        try { await adminFetch(`${api}/admin/contact`, { method: 'PUT', body: JSON.stringify(form) }); alert('Saved!'); }
        catch (err: any) { setError(err.message); } finally { setSaving(false); }
    };

    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

    const F = ({ label, path, placeholder }: { label: string; path: string; placeholder?: string }) => {
        const parts = path.split('.');
        let val: any = form;
        for (const p of parts) val = val?.[p];
        return <div><label className="block text-sm font-medium mb-2">{label}</label><input type="text" value={val || ''} onChange={e => setNested(path, e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder={placeholder} /></div>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h3 className="text-xl font-semibold">Contact & Settings</h3><p className="text-slate-600 text-sm">Manage contact info, social links, and company settings</p></div>
                <button onClick={handleSubmit} disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">{saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}</button>
            </div>
            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                <h4 className="font-semibold border-b pb-2">Phone</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <F label="Primary Phone" path="phone.primary" placeholder="+9779851234567" />
                    <F label="WhatsApp" path="phone.whatsapp" placeholder="+9779705246799" />
                </div>
                <h4 className="font-semibold border-b pb-2">Email</h4>
                <F label="Primary Email" path="email.primary" placeholder="info@zeotourism.com" />
                <h4 className="font-semibold border-b pb-2">Address</h4>
                <F label="Full Address" path="address.full" placeholder="Thamel, Kathmandu, Nepal" />
                <h4 className="font-semibold border-b pb-2">Social Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <F label="Facebook" path="social.facebook" />
                    <F label="Instagram" path="social.instagram" />
                    <F label="Twitter / X" path="social.twitter" />
                    <F label="YouTube" path="social.youtube" />
                    <F label="LinkedIn" path="social.linkedin" />
                </div>
                <h4 className="font-semibold border-b pb-2">Company</h4>
                <F label="Company Name" path="company.name" placeholder="Zeo Tourism" />
            </form>
        </div>
    );
};
export default ContactSettingsEditor;