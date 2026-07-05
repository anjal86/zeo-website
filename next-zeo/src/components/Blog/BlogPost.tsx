"use client";
import React from 'react';
import { useParams, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Tag, User, Clock, Calendar } from 'lucide-react';
import Breadcrumb from '../UI/Breadcrumb';
import SEO from '../seo/SEO';
import SocialShare from '../Blog/SocialShare';
import TableOfContents from '../Blog/TableOfContents';
import { useApi } from '../../hooks/useApi';
import LoadingSpinner from '../UI/LoadingSpinner';
import 'react-quill-new/dist/quill.snow.css';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Share2 } from 'lucide-react';
import TourCard from '../Tours/TourCard';



const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: post, loading, error } = useApi<any>(`/api/posts/${slug}`);
    const { data: allPosts } = useApi<any[]>('/api/posts');
    const { data: allTours } = useApi<any[]>('/api/tours');
    const { data: destinations } = useApi<any[]>('/api/destinations');



    // Reading progress bar setup
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });



    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !post) {
        if (!loading && !post) return null;
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                Error loading post.
            </div>
        );
    }

    const pageUrl = window.location.href;
    const origin = window.location.origin;
    const relatedPosts = allPosts?.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3) || [];

    // SEO Structured Data Generation
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${pageUrl}#article`,
        "headline": post.title,
        "description": post.excerpt,
        "image": {
            "@type": "ImageObject",
            "url": post.image
        },
        "author": {
            "@type": "Organization",
            "@id": "https://www.zeotourism.com/#organization",
            "name": "Zeo Tourism",
            "url": origin
        },
        "publisher": {
            "@type": "Organization",
            "@id": "https://www.zeotourism.com/#organization",
            "name": "Zeo Tourism",
            "logo": {
                "@type": "ImageObject",
                "url": `${origin}/logo/zeo-logo.png`,
                "width": 280,
                "height": 80
            }
        },
        "datePublished": post.created_at || post.date,
        "dateModified": post.updated_at || post.created_at || post.date,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl
        },
        "articleSection": post.category,
        "keywords": `${post.category}, Nepal travel, Zeo Tourism, ${post.title}`,
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": ["h1", ".blog-post-content p:first-of-type", "h2"]
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": origin
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": `${origin}/blog`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": pageUrl
            }
        ]
    };



    // Automatic Tour Recommendation Logic
    const getRecommendedTours = () => {
        if (!allTours) return [];

        const toursList = Array.isArray(allTours) ? allTours : (allTours as any).tours || [];
        const blogTitle = (post.title || '').toLowerCase();
        const blogContent = (post.content || '').toLowerCase().replace(/<[^>]*>?/gm, ' '); // Strip HTML tags for cleaner matching
        const blogExcerpt = (post.excerpt || '').toLowerCase();
        const blogCategory = (post.category || '').toLowerCase();
        const fullBlogText = `${blogTitle} ${blogExcerpt} ${blogContent}`;

        // Stopwords to ignore in keyword matching
        const stopWords = new Set(['this', 'that', 'with', 'from', 'your', 'their', 'there', 'about', 'guide', 'tours', 'travel', 'nepal', 'visit', 'best', 'tour', 'place', 'places', 'trip', 'nepali', 'stay', 'day', 'days', 'package', 'packages']);

        // Extract key nouns from title (simplified)
        const titleKeywords = blogTitle.split(/[^a-z]/).filter((w: string) => w.length > 4 && !stopWords.has(w));

        const scoredTours = toursList.map((tour: any) => {
            let score = 0;
            const tourTitle = (tour.title || '').toLowerCase();
            const tourLocation = (tour.location || '').toLowerCase();
            const tourCategory = (tour.category || '').toLowerCase();
            const tourActivities = (tour.activities || []).map((a: any) => (a.name || '').toLowerCase());

            // 1. Primary Location Match (Critical)
            if (tourLocation && tourLocation !== 'nepal' && fullBlogText.includes(tourLocation)) {
                score += 20;
            }

            // 2. Category Match
            if (tourCategory && (blogCategory.includes(tourCategory) || tourCategory.includes(blogCategory))) {
                score += 15;
            }

            // 3. Title Keyword Match (High priority)
            titleKeywords.forEach((keyword: string) => {
                if (tourTitle.includes(keyword)) {
                    score += 10;
                }
            });

            // 4. Activity Match
            tourActivities.forEach((activity: string) => {
                if (fullBlogText.includes(activity)) {
                    score += 8;
                } else {
                    const words = activity.split(' ');
                    words.forEach((word: string) => {
                        if (word.length > 4 && !stopWords.has(word) && fullBlogText.includes(word)) {
                            score += 4;
                        }
                    });
                }
            });

            // 5. Explicit Destination Match
            if (destinations) {
                destinations.forEach((dest: any) => {
                    const destName = (dest.name || '').toLowerCase();
                    if (destName.length > 3 && (tourTitle.includes(destName) || tourLocation.includes(destName)) && fullBlogText.includes(destName)) {
                        score += 12;
                    }
                });
            }

            // 6. Featured Bonus
            if (tour.featured) score += 2;

            return { ...tour, score };
        });

        // Filter and Sort
        let results = scoredTours
            .filter((t: any) => t.score > 2) // Lower threshold to allow more "similar" results
            .sort((a: any, b: any) => b.score - a.score);

        // Fallback Layer 1: If no specific math, show tours from same category
        if (results.length < 3) {
            const categoryTours = toursList
                .filter((t: any) =>
                    (t.category || '').toLowerCase().includes(blogCategory) ||
                    blogCategory.includes((t.category || '').toLowerCase())
                )
                .filter((t: any) => !results.some((r: any) => r.id === t.id))
                .slice(0, 3 - results.length);

            results = [...results, ...categoryTours];
        }

        // Fallback Layer 2: Featured tours
        if (results.length < 3) {
            const featuredTours = toursList
                .filter((t: any) => t.featured)
                .filter((t: any) => !results.some((r: any) => r.id === t.id))
                .slice(0, 3 - results.length);

            results = [...results, ...featuredTours];
        }

        return results.slice(0, 3);
    };

    const recommendedTours = getRecommendedTours();

    return (
        <>
            <SEO
                title={`${post.title} | Nepal Travel Guide — Zeo Tourism`}
                description={post.excerpt}
                keywords={`${post.category}, ${post.title}, Nepal travel guide, Nepal trekking tips, Zeo Tourism blog`}
                image={post.image}
                url={pageUrl}
                type="article"
                structuredData={[articleSchema, breadcrumbSchema]}
            />

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-primary origin-left z-[100]"
                style={{ scaleX }}
            />

            <article className="blog-post-detail bg-white min-h-screen pb-20">
                {/* Immersive Hero Section */}
                <header className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <img
                            src={post.image}
                            alt={post.title}
                            fetchPriority="high"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </motion.div>

                    <div className="absolute inset-0 flex flex-col justify-end">
                        <div className="container mx-auto px-4 pb-12 md:pb-24">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="max-w-4xl"
                            >
                                <span className="inline-block bg-secondary text-white px-4 py-1.5 rounded-2xl text-sm font-bold tracking-widest uppercase mb-6 shadow-xl">
                                    {post.category}
                                </span>
                                <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-8 leading-[1.1]">
                                    {post.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base font-medium">
                                    <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-secondary" /> {post.date}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                    <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-secondary" /> {post.readTime} read</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </header>

                {/* Breadcrumb */}
                <div className="container mx-auto px-4 pt-6 relative z-30">
                    <Breadcrumb
                        items={[
                            { name: 'Blog', href: '/blog' },
                            { name: post.category, href: `/blog?category=${encodeURIComponent(post.category)}` },
                            { name: post.title }
                        ]}
                    />
                </div>

                {/* Content Layout */}
                <div className="container mx-auto px-4 -mt-10 relative z-20">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Main Content */}
                        <div className="lg:w-2/3">
                            <div className="bg-white rounded-2xl p-8 md:p-16 shadow-2xl shadow-slate-200/50 border border-gray-100">
                                <div
                                    className="prose prose-base md:prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-950 prose-a:text-primary prose-img:rounded-2xl break-words scroll-mt-24 blog-post-content"
                                    dangerouslySetInnerHTML={{
                                        __html: (post.content || '').replace(/&nbsp;/g, ' ')
                                    }}
                                />

                                {/* Tags Section */}
                                <div className="mt-16 pt-10 border-t border-gray-100 flex flex-wrap items-center gap-3">
                                    <Tag className="w-5 h-5 text-primary mr-2" />
                                    <span className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-2xl text-sm font-semibold border border-slate-100">
                                        {post.category}
                                    </span>
                                </div>

                                {/* Author Info Block */}
                                <div className="mt-10 p-6 bg-slate-50 border border-slate-100 flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <User className="w-7 h-7 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Written by</p>
                                        <h4 className="text-lg font-bold text-gray-900">{post.author}</h4>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime} read</span>
                                        </div>
                                        <Link
                                            href={`/blog?author=${encodeURIComponent(post.author)}`}
                                            className="inline-block mt-3 text-sm font-semibold text-primary hover:underline"
                                        >
                                            More articles by {post.author} →
                                        </Link>
                                    </div>

                                    {/* Inline share — row layout */}
                                    <div className="hidden md:block flex-shrink-0">
                                        <SocialShare url={pageUrl} title={post.title} layout="row" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Sidebar */}
                        <aside className="lg:w-1/3">
                            <div className="sticky top-24 space-y-8">
                                {/* Table of Contents */}
                                <TableOfContents contentHtml={post.content || ''} />

                                {/* Sharing Widget */}
                                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Share2 className="w-5 h-5 text-primary" /> Share this Story
                                    </h3>
                                    <SocialShare url={pageUrl} title={post.title} layout="grid" />
                                </div>

                                {/* Newsletter / CTA */}
                                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-bold mb-4">Plan your Nepal Trip?</h3>
                                        <p className="text-white/80 mb-6">Expert travel consultation for your customized itinerary. Join 10k+ happy travelers.</p>
                                        <Link
                                            href="/contact"
                                            className="block w-full text-center bg-secondary hover:bg-secondary-dark text-white py-4 rounded-2xl font-bold transition-all transform hover:scale-105"
                                        >
                                            Talk to an Expert
                                        </Link>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-2xl blur-3xl" />
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Recommended Tours Horizontal Section */}
                {recommendedTours.length > 0 && (
                    <section className="container mx-auto px-4 mt-24">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <span className="text-primary font-bold tracking-widest uppercase text-sm">Adventure Awaits</span>
                                <h2 className="text-4xl font-serif font-bold text-gray-900 mt-2">Recommended Adventures</h2>
                            </div>
                            <Link href="/tours" className="text-primary font-bold hover:underline mb-2 flex items-center gap-2">
                                Discover More Tours <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {recommendedTours.map((tour: any) => (
                                    <TourCard
                                        key={tour.id}
                                        tour={tour}
                                        destinations={destinations || []}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Related Posts Section */}
                {relatedPosts.length > 0 && (
                    <section className="container mx-auto px-4 mt-24">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <span className="text-primary font-bold tracking-widest uppercase text-sm">More to read</span>
                                <h2 className="text-4xl font-serif font-bold text-gray-900 mt-2">Related Articles</h2>
                            </div>
                            <Link href="/blog" className="text-primary font-bold hover:underline mb-2 flex items-center gap-2">
                                View Blog <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {relatedPosts.map((rPost: any) => (
                                <Link
                                    key={rPost.id}
                                    href={`/blog/${rPost.slug}`}
                                    className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all h-full flex flex-col"
                                >
                                    <div className="h-56 overflow-hidden">
                                        <img
                                            src={rPost.image}
                                            alt={rPost.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <span className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">{rPost.category}</span>
                                        <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                            {rPost.title}
                                        </h4>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{rPost.excerpt}</p>
                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-gray-400">
                                            <span>{rPost.date}</span>
                                            <span>{rPost.readTime}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </>
    );
};

export default BlogPostPage;
