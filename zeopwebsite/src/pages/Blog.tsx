import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader/PageHeader';
import SEO from '../components/SEO/SEO';
import { useApi } from '../hooks/useApi';
import { createBlogListSchema, createBreadcrumbSchema } from '../utils/schema';
import SkeletonCard from '../components/UI/SkeletonCard';

interface BlogPost {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
}

const POSTS_PER_PAGE = 6;

const BlogPage: React.FC = () => {
    const { data: posts, loading, error } = useApi<BlogPost[]>('/api/posts');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const structuredData = useMemo(() => {
        if (!posts) return [];
        return [
            createBlogListSchema(posts.map(post => ({
                title: post.title,
                url: `https://www.zeotourism.com/blog/${post.slug}`,
                date: post.date
            }))),
            createBreadcrumbSchema([
                { name: 'Home', url: 'https://www.zeotourism.com' },
                { name: 'Blog', url: 'https://www.zeotourism.com/blog' }
            ])
        ];
    }, [posts]);

    const categories = useMemo(
        () => ['All', ...Array.from(new Set((posts || []).map(p => p.category)))],
        [posts]
    );

    const filteredPosts = useMemo(() => {
        if (!posts) return [];
        const q = searchQuery.trim().toLowerCase();
        return posts.filter(post => {
            const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
            const matchesSearch = !q ||
                post.title.toLowerCase().includes(q) ||
                post.excerpt.toLowerCase().includes(q) ||
                post.author.toLowerCase().includes(q) ||
                post.category.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [posts, selectedCategory, searchQuery]);

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const paginatedPosts = filteredPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    // Reset to page 1 when filters change
    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        setCurrentPage(1);
    };
    const handleSearch = (q: string) => {
        setSearchQuery(q);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="blog-page bg-white">
                <PageHeader
                    title="Travel Stories & Guides"
                    subtitle="Inspiration and practical advice for your next adventure in the Himalayas."
                    breadcrumb="Blog"
                    backgroundImage="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070"
                />
                <section className="py-20 lg:py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <SkeletonCard key={i} type="blog" />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (error || !posts) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                Failed to load blog posts. Please try again later.
            </div>
        );
    }

    return (
        <div className="blog-page-container">
            <SEO
                title="Travel Blog & Guides - Zeo Tourism"
                description="Explore our latest travel guides, tips, and stories about trekking in Nepal, Kailash Mansarovar Yatra, and spiritual journeys."
                keywords="travel blog, nepal travel guide, kailash mansarovar tips, trekking blog"
                url="https://www.zeotourism.com/blog"
                type="website"
                structuredData={structuredData}
            />

            <div className="blog-page bg-white">
                <PageHeader
                    title="Travel Stories & Guides"
                    subtitle="Inspiration and practical advice for your next adventure in the Himalayas."
                    breadcrumb="Blog"
                    backgroundImage="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070"
                />

                <section className="py-20 lg:py-24">
                    <div className="container mx-auto px-4">

                        {/* Search + Filter row */}
                        <div className="flex flex-col items-center mb-16 gap-8">
                            <div>
                                <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block text-center">Discover Content</span>
                                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 text-center">
                                    Browse by <span className="text-gradient">Categories</span>
                                </h2>
                            </div>

                            {/* Search bar */}
                            <div className="relative w-full max-w-lg">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => handleSearch(e.target.value)}
                                    placeholder="Search articles…"
                                    className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Category pills */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
                                        className={`px-6 py-2.5 rounded-none text-sm font-bold transition-all duration-300 ${
                                            selectedCategory === cat
                                                ? 'bg-primary text-white shadow-xl shadow-primary/25 scale-105'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Results count */}
                            {(searchQuery || selectedCategory !== 'All') && (
                                <p className="text-sm text-gray-500">
                                    {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} found
                                    {searchQuery && <> for "<span className="font-semibold text-gray-700">{searchQuery}</span>"</>}
                                </p>
                            )}
                        </div>

                        {/* Posts Grid */}
                        <AnimatePresence mode="wait">
                            {paginatedPosts.length > 0 ? (
                                <motion.div
                                    key={`${selectedCategory}-${searchQuery}-${currentPage}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
                                >
                                    {paginatedPosts.map((post, index) => (
                                        <motion.article
                                            key={post.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.06 }}
                                            className="group flex flex-col h-full bg-white rounded-none overflow-hidden border border-gray-100/50 hover:border-primary/20 hover:shadow-2xl transition-all duration-500"
                                        >
                                            <Link to={`/blog/${post.slug}`} className="relative h-64 overflow-hidden block">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute bottom-4 left-4">
                                                    <span className="bg-white/90 backdrop-blur-md text-gray-900 px-4 py-1.5 rounded-none text-xs font-bold shadow-lg">
                                                        {post.category}
                                                    </span>
                                                </div>
                                            </Link>

                                            <div className="p-8 flex flex-col flex-grow">
                                                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-5 tracking-wide">
                                                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                                                </div>

                                                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors leading-tight">
                                                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                                                </h3>

                                                <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed">
                                                    {post.excerpt}
                                                </p>

                                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                                    <span className="text-xs text-gray-400 font-medium">By {post.author}</span>
                                                    <Link
                                                        to={`/blog/${post.slug}`}
                                                        className="text-primary font-bold text-sm inline-flex items-center group/btn"
                                                    >
                                                        Read More
                                                        <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover/btn:translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.article>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20 bg-gray-50 rounded-none border-2 border-dashed border-gray-200"
                                >
                                    <p className="text-gray-500 text-lg font-medium">No articles found.</p>
                                    <button
                                        onClick={() => { handleSearch(''); handleCategoryChange('All'); }}
                                        className="mt-4 text-primary font-bold hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-16">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 rounded-none hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 text-sm font-bold border transition-all rounded-none ${
                                            currentPage === page
                                                ? 'bg-primary text-white border-primary'
                                                : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 rounded-none hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BlogPage;
