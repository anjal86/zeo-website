"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import DeleteModal from '@/components/UI/DeleteModal';
import { useDeleteModal } from '@/hooks/useDeleteModal';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { adminFetch } from '@/lib/adminFetch';

const api = '/api';

interface Post { id: number; slug: string; title: string; excerpt?: string; category?: string; status?: string; image_url?: string; published_at?: string; created_at?: string; }

const BlogManager: React.FC = () => {
    const router = useRouter();
    const [items, setItems] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;
    const [total, setTotal] = useState(0);

    const fetch = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const p = new URLSearchParams({ page: String(page), limit: String(limit), ...(search ? { search } : {}), ...(statusFilter ? { status: statusFilter } : {}) });
            const data = await adminFetch<{ posts: Post[]; pagination?: { totalItems: number } }>(`${api}/admin/posts?${p}`);
            const list = data.posts || []; setItems(list); setTotal(data.pagination?.totalItems ?? list.length);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    }, [page, search, statusFilter]);
    useEffect(() => { fetch(); }, [fetch]);

    const handleDelete = async (p: Post) => { await adminFetch(`${api}/admin/posts/${p.id}`, { method: 'DELETE' }); await fetch(); };
    const delModal = useDeleteModal<Post>({ onDelete: handleDelete, getItemName: p => p.title, getItemId: p => p.id });

    const tp = Math.ceil(total / limit);
    if (loading && items.length === 0) return <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /><span className="ml-3">Loading posts...</span></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div><h3 className="text-xl font-semibold">Blog Posts</h3><p className="text-slate-600 text-sm">Manage your blog</p></div>
                <button onClick={() => router.push('/admin/blog/new')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> New Post</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search posts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm" />
                        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white">
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span><button onClick={fetch} className="ml-auto text-sm underline">Retry</button></div>}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th><th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase">Category</th><th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No posts found.</td></tr>
                            : items.map(post => (
                                <tr key={post.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/blog/edit/${post.id}`)}>
                                    <td className="px-4 py-4 font-medium text-gray-900">{post.title}</td>
                                    <td className="px-3 py-4 text-sm text-gray-500">{post.category}</td>
                                    <td className="px-3 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{post.status}</span></td>
                                    <td className="px-3 py-4 text-sm text-gray-500">{post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}</td>
                                    <td className="px-3 py-4 text-right" onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-end gap-2"><button onClick={() => router.push(`/admin/blog/edit/${post.id}`)} className="text-blue-600"><Edit className="w-4 h-4" /></button><button onClick={() => delModal.openModal(post)} className="text-red-600"><Trash2 className="w-4 h-4" /></button></div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                {total > limit && <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-700">Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}</div>
                    <div className="flex space-x-2"><button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button><button disabled={page === tp} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button></div>
                </div>}
            </div>
            <DeleteModal {...delModal.modalProps} title="Delete Post" message="Are you sure?" confirmText="Delete" variant="danger" />
        </div>
    );
};
export default BlogManager;