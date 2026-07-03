import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    Save,
    ArrowLeft,
    Image as ImageIcon,
    FileText,
    Settings,
    AlertCircle,
    Upload,
    Eye,
    X,
    Menu
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminSidebar from '../components/Admin/AdminSidebar';
import LoadingSpinner from '../components/UI/LoadingSpinner';

interface BlogPost {
    id?: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    author: string;
    featured: boolean;
    image: string;
}

const toSlug = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);

const BlogEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const postId = id ? parseInt(id, 10) : undefined;
    const isEditing = !!postId;

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [activeTab, setActiveTab] = useState('content');

    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [formData, setFormData] = useState<BlogPost>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        author: 'Admin',
        featured: false,
        image: ''
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        navigate('/admin/dashboard?tab=blog');
    };

    useEffect(() => {
        // Check authentication and get user data
        const userData = localStorage.getItem('adminUser');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isEditing && postId) {
            fetchPost(postId);
        }
    }, [postId, isEditing]);

    const fetchPost = async (id: number) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`/api/admin/posts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch post');

            const post = await response.json();
            setFormData({
                id: post.id,
                title: post.title,
                slug: post.slug || toSlug(post.title),
                excerpt: post.excerpt,
                content: post.content,
                category: post.category,
                author: post.author,
                featured: post.featured,
                image: post.image
            });
            setSlugManuallyEdited(true); // don't auto-override when editing
            setImagePreview(post.image);
        } catch (err) {
            setError('Failed to load post details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('adminToken');
            const formDataToSend = new FormData();

            const { image, ...postData } = formData;
            // Ensure slug is included and never empty
            if (!postData.slug) postData.slug = toSlug(postData.title);
            formDataToSend.append('postData', JSON.stringify(postData));

            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
            }

            const url = isEditing && postId
                ? `/api/admin/posts/${postId}`
                : '/api/admin/posts';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) throw new Error('Failed to save post');

            handleClose();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post');
        } finally {
            setSubmitting(false);
        }
    };

    const tabs = [
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'media', label: 'Media', icon: ImageIcon },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    // Custom toolbar options
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'table'],
            ['clean']
        ],
        table: true
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'table'
    ];

    if (loading) return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Loading post...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Mobile Overlay */}
            {sidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                className={`bg-slate-800 text-white fixed left-0 top-0 h-full z-50 overflow-hidden ${sidebarOpen ? 'md:w-64' : 'md:w-16'}`}
                initial={false}
                animate={{ x: isMobile && !sidebarOpen ? '-100%' : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
                <AdminSidebar
                    activeKey="blog"
                    onSelect={(key) => {
                        if (key === 'blog') navigate('/admin/dashboard?tab=blog');
                        else if (key === 'tours') navigate('/admin/dashboard?tab=tours');
                        else navigate('/admin/dashboard?tab=' + key);
                    }}
                    sidebarOpen={sidebarOpen}
                    user={user}
                    onLogout={() => {
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminUser');
                        navigate('/admin/login');
                    }}
                    mode="buttons"
                />
            </motion.aside>

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'ml-64' : 'ml-0 md:ml-16'}`}>
                {/* Sticky Header */}
                <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 mr-2"
                                >
                                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                                    title="Back to Blog Manager"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                        {isEditing ? 'Edit Blog Post' : 'Create New Post'}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {isEditing ? 'Polishing your story to perfection' : 'Tell the world about your next adventure'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {isEditing ? 'Update Post' : 'Publish Post'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="px-6">
                        <nav className="flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-auto w-full">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">Error</span>
                            </div>
                            <p className="text-red-700 mt-1">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 h-full">
                        {/* Content Tab */}
                        {activeTab === 'content' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 h-full flex flex-col">
                                <div className="space-y-6 flex-1 flex flex-col">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={e => {
                                                const title = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    title,
                                                    slug: slugManuallyEdited ? prev.slug : toSlug(title)
                                                }));
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg font-medium placeholder-gray-400"
                                            placeholder="Enter a catchy title..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL Slug
                                            {!slugManuallyEdited && <span className="ml-2 text-xs text-blue-500 font-normal">auto-generated</span>}
                                        </label>
                                        <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                                            <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-300 whitespace-nowrap">/blog/</span>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={e => {
                                                    setSlugManuallyEdited(true);
                                                    setFormData(prev => ({ ...prev, slug: toSlug(e.target.value) }));
                                                }}
                                                className="flex-1 px-3 py-3 outline-none text-sm font-mono"
                                                placeholder="my-blog-post-title"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Letters, numbers, and hyphens only. Edit the title above to regenerate.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.excerpt}
                                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Brief summary of the post for lists and SEO..."
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col min-h-0">
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            Post Content
                                        </label>
                                        <div className="flex-1 min-h-[600px] mb-4 editor-wrapper">
                                            <ReactQuill
                                                theme="snow"
                                                value={formData.content}
                                                onChange={(content: string) => setFormData({ ...formData, content })}
                                                modules={modules}
                                                formats={formats}
                                                className="h-full rounded-xl overflow-hidden shadow-inner bg-slate-50/50"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2 italic">
                                            Tip: Use Headers (H1, H2, H3) for better organization and SEO.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Media Tab */}
                        {activeTab === 'media' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer relative group bg-gray-50">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-white text-blue-500 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                                    <Upload className="w-8 h-8" />
                                                </div>
                                                <h4 className="text-sm font-semibold text-gray-900 mb-1">Click to upload</h4>
                                                <p className="text-xs text-gray-500 mb-4">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                                <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium group-hover:bg-blue-700 transition-colors">
                                                    Browse Files
                                                </span>
                                            </div>
                                        </div>

                                        {/* URL Input Alternative */}
                                        <div className="mt-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Or enter image URL</label>
                                            <div className="relative">
                                                <input
                                                    type="url"
                                                    value={formData.image && !selectedImage ? formData.image : ''}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, image: e.target.value });
                                                        setImagePreview(e.target.value);
                                                        setSelectedImage(null); // Clear file selection if URL is keyed in
                                                    }}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                                <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                                        <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden h-64 flex items-center justify-center relative group">
                                            {imagePreview ? (
                                                <>
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => window.open(imagePreview, '_blank')}
                                                            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                                                            title="View full size"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setImagePreview('');
                                                                setFormData({ ...formData, image: '' });
                                                                setSelectedImage(null);
                                                            }}
                                                            className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors"
                                                            title="Remove image"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center text-gray-400">
                                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No image selected</p>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Use high-quality images. Recommended size: 1200x630px.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Post Settings</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. Travel Guide"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.author}
                                            onChange={e => setFormData({ ...formData, author: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. Admin"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center h-6">
                                            <input
                                                type="checkbox"
                                                checked={formData.featured}
                                                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Featured Post</span>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Featured posts are highlighted on the homepage and at the top of the blog list.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}
                    </form>
                </main>
            </div>
        </div>
    );
};

export default BlogEditor;
