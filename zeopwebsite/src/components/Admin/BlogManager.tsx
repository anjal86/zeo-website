import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useAdminApi } from '../../hooks/useApi';
import LoadingSpinner from '../UI/LoadingSpinner';
import DeleteModal from '../UI/DeleteModal';
import Toggle from '../UI/Toggle';
import { useDeleteModal } from '../../hooks/useDeleteModal';

interface BlogPost {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    author: string;
    date: string;
    category: string;
    featured: boolean;
    readTime: string;
}

const BlogManager: React.FC = () => {
    const { data: posts, loading, error, refetch } = useAdminApi('/api/posts');
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');

    // Sorting state
    const [sortBy, setSortBy] = useState<{ field: keyof BlogPost; direction: 'asc' | 'desc' }>({ field: 'date', direction: 'desc' });

    const toggleSort = (field: keyof BlogPost) => {
        setSortBy(prev => prev.field === field ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { field, direction: 'asc' });
    };

    // Filter posts
    const filteredPosts = posts?.filter((post: BlogPost) => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' ? true :
            statusFilter === 'featured' ? post.featured :
                statusFilter === 'standard' ? !post.featured : true;

        return matchesSearch && matchesStatus;
    }) || [];

    // Sort posts
    const sortedPosts = [...filteredPosts].sort((a, b) => {
        const aVal = a[sortBy.field];
        const bVal = b[sortBy.field];

        if (aVal < bVal) return sortBy.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortBy.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalItems = sortedPosts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPosts = sortedPosts.slice(startIndex, startIndex + itemsPerPage);

    const deletePost = async (post: BlogPost) => {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/posts/${post.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete post');
        refetch();
    };

    const handleToggleFeatured = async (post: BlogPost) => {
        try {
            const token = localStorage.getItem('adminToken');
            const updatedPost = { ...post, featured: !post.featured };
            const formData = new FormData();
            formData.append('postData', JSON.stringify(updatedPost));

            const response = await fetch(`/api/admin/posts/${post.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to update status');
            refetch();
        } catch (error) {
            console.error('Error updating featured status:', error);
            alert('Failed to update status');
        }
    };

    const deleteModal = useDeleteModal<BlogPost>({
        onDelete: deletePost,
        getItemName: (post) => post.title,
        getItemId: (post) => post.id
    });

    if (loading) return <LoadingSpinner size="lg" />;
    if (error) return <div className="text-red-500">Error loading posts</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-slate-900">Blog Posts</h3>
                    <p className="text-slate-600 text-sm">Manage your blog content</p>
                </div>
                <button
                    onClick={() => navigate('/admin/blog/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Post
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="featured">Featured</option>
                            <option value="standard">Standard</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => toggleSort('title')} className="flex items-center gap-1 font-medium">
                                        Post
                                        <span className="text-gray-400">{sortBy.field === 'title' ? (sortBy.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => toggleSort('date')} className="flex items-center gap-1 font-medium">
                                        Date
                                        <span className="text-gray-400">{sortBy.field === 'date' ? (sortBy.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentPosts.map((post: BlogPost) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/blog/edit/${post.id}`)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                    src={post.image || 'https://via.placeholder.com/150'}
                                                    alt=""
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={post.title}>{post.title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{post.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{post.author}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{post.date}</td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center">
                                            <Toggle
                                                checked={post.featured}
                                                onChange={() => handleToggleFeatured(post)}
                                                size="sm"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end space-x-3">
                                            <button
                                                onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteModal.openModal(post)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentPosts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No posts found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Cards (for smaller screens) */}
            <div className="lg:hidden grid gap-4">
                {currentPosts.map((post: BlogPost) => (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md" onClick={() => navigate(`/admin/blog/edit/${post.id}`)}>
                        <div className="flex gap-4">
                            <img
                                src={post.image || 'https://via.placeholder.com/150'}
                                alt=""
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-gray-900 truncate pr-2" title={post.title}>{post.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{post.date}</p>
                                    </div>
                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
                                        {post.category}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div onClick={e => e.stopPropagation()}>
                                        <Toggle
                                            checked={post.featured}
                                            onChange={() => handleToggleFeatured(post)}
                                            size="sm"
                                        />
                                    </div>
                                    <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                                            className="text-blue-600 p-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteModal.openModal(post)}
                                            className="text-red-600 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <DeleteModal
                {...deleteModal.modalProps}
                title="Delete Post"
                message="Are you sure you want to delete this post?"
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default BlogManager;
