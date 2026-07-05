"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, AlertCircle, Save, Upload, Camera, X } from 'lucide-react';
import DeleteModal from '@/components/UI/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import Toggle from '@/components/UI/Toggle';
import { adminFetch, adminFetchRaw } from '@/lib/adminFetch';
const api = '/api';

interface Member { id: number; name: string; role?: string; image_url?: string; order_index: number; is_active?: boolean; }

const TeamManager: React.FC = () => {
    const [items, setItems] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Partial<Member> | null>(null);
    const [saving, setSaving] = useState(false);

    const fetch = useCallback(async () => {
        try { const d = await adminFetch<Member[]>(`${api}/admin/team`); setItems(d || []); } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    }, []);
    useEffect(() => { fetch(); }, [fetch]);

    const handleDelete = async (m: Member) => { await adminFetch(`${api}/admin/team/${m.id}`, { method: 'DELETE' }); await fetch(); };
    const delModal = useDeleteModal<Member>({ onDelete: handleDelete, getItemName: m => m.name, getItemId: m => m.id });

    const handleSave = async () => {
        if (!editing?.name) return; setSaving(true);
        try {
            if (editing.id) await adminFetch(`${api}/admin/team/${editing.id}`, { method: 'PUT', body: JSON.stringify(editing) });
            else await adminFetch(`${api}/admin/team`, { method: 'POST', body: JSON.stringify(editing) });
            setEditing(null); await fetch();
        } catch (err: any) { alert(err.message); } finally { setSaving(false); }
    };

    const handleUpload = async (file: File) => {
        try {
            const fd = new FormData(); fd.append('image', file); fd.append('entityType', 'team'); fd.append('slug', `team-${Date.now()}`);
            const res = await adminFetchRaw(`${api}/admin/upload`, { method: 'POST', body: fd });
            const r = await res.json(); setEditing(p => ({ ...p, image_url: r.url }));
        } catch (err: any) { alert(err.message); }
    };

    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h3 className="text-xl font-semibold">Team Members</h3></div>
                <button onClick={() => setEditing({ name: '', role: '', order_index: items.length + 1, is_active: true })} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Member</button>
            </div>
            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}

            {editing && (
                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                    <h4 className="font-semibold">{editing.id ? 'Edit' : 'New'} Member</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Name" value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} className="px-3 py-2 border rounded-lg" />
                        <input type="text" placeholder="Role" value={editing.role || ''} onChange={e => setEditing(p => ({ ...p, role: e.target.value }))} className="px-3 py-2 border rounded-lg" />
                        <input type="number" placeholder="Order" value={editing.order_index ?? 0} onChange={e => setEditing(p => ({ ...p, order_index: Number(e.target.value) }))} className="px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="flex items-center gap-4">
                        <input type="file" accept="image/*" className="hidden" id="team-img" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                        <label htmlFor="team-img" className="bg-blue-600 text-white px-3 py-2 rounded-lg cursor-pointer text-sm flex items-center gap-2"><Camera className="w-4 h-4" /> Photo</label>
                        {editing.image_url && <img src={editing.image_url} alt="" className="h-12 w-12 object-cover rounded-full" />}
                        <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active !== false} onChange={e => setEditing(p => ({ ...p, is_active: e.target.checked }))} className="w-5 h-5" /><span>Active</span></label>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2">{saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}</button>
                        <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium uppercase">Order</th><th className="px-4 py-3 text-left text-xs font-medium uppercase">Name</th><th className="px-3 py-3 text-xs font-medium uppercase">Role</th><th className="px-3 py-3 text-xs font-medium uppercase">Active</th><th className="px-3 py-3 text-right text-xs font-medium uppercase">Actions</th></tr></thead>
                    <tbody>{items.map(m => (
                        <tr key={m.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">{m.order_index}</td>
                            <td className="px-4 py-4 font-medium">{m.name}</td>
                            <td className="px-3 py-4 text-sm text-gray-500">{m.role}</td>
                            <td className="px-3 py-4"><Toggle checked={m.is_active !== false} onChange={async () => { await adminFetch(`${api}/admin/team/${m.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !m.is_active }) }); await fetch(); }} size="sm" /></td>
                            <td className="px-3 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => setEditing(m)} className="text-blue-600"><Edit className="w-4 h-4" /></button><button onClick={() => delModal.openModal(m)} className="text-red-600"><Trash2 className="w-4 h-4" /></button></div></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
            <DeleteModal {...delModal.modalProps} title="Delete Member" message="Are you sure?" confirmText="Delete" variant="danger" />
        </div>
    );
};
export default TeamManager;