"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useApi } from '../../hooks/useApi';

const formatDate = (value?: string) => {
  if (!value) return 'Recently updated';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const postHref = (post: any) => `/blog/${post.slug || post.id}`;
const postDate = (post: any) => formatDate(post.published_at || post.date || post.created_at);
const postReadTime = (post: any) => post.readTime || post.read_time || '5 min read';

const Blog: React.FC = () => {
  const { data: posts, loading } = useApi<any[]>('/api/posts');
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewsletterStatus('success');
        setNewsletterMsg(data.message || 'Thank you for subscribing!');
        setEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMsg('Network error. Please try again.');
    }
  };

  if (loading || !posts) {
    return null;
  }

  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.published_at || a.date || a.created_at || 0).getTime();
    const dateB = new Date(b.published_at || b.date || b.created_at || 0).getTime();
    return dateB - dateA;
  });

  const featuredPost = sortedPosts.find(post => post.featured || post.is_featured) || sortedPosts[0];
  const recentPosts = sortedPosts
    .filter(post => post.id !== featuredPost?.id)
    .slice(0, 4);
  const articleCount = sortedPosts.length;

  if (!featuredPost) {
    return null;
  }

  return (
    <section id="blog" className="py-14 md:py-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden border-t border-gray-100">
      <div className="absolute top-12 right-0 w-96 h-96 bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-secondary/5 blur-3xl" />

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
        >
          <div>
            <div className="inline-flex items-center mb-3 text-secondary text-xs font-bold uppercase tracking-[0.22em]">
              <BookOpen className="w-4 h-4 mr-2" />
              <span>Latest guides</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-950 leading-tight max-w-2xl">
              Featured travel reading
            </h2>
          </div>
          <div className="lg:max-w-xl lg:justify-self-end">
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Trekking guides, pilgrimage preparation, Nepal travel tips and seasonal advice — written to help you choose with more confidence.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <motion.article
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden border border-gray-200 bg-gray-950 shadow-xl shadow-gray-900/10 min-h-[430px]"
          >
            <Link href={postHref(featuredPost)} className="absolute inset-0 z-20" aria-label={`Read ${featuredPost.title}`} />
            <img
              src={featuredPost.image || undefined}
              alt={featuredPost.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/55 to-gray-950/10" />
            <div className="relative z-10 flex min-h-[430px] flex-col justify-between p-6 md:p-8 text-white">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  Featured guide
                </span>
                <span className="bg-white/15 backdrop-blur-sm px-3 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  {featuredPost.category || 'Travel guide'}
                </span>
              </div>

              <div>
                <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {featuredPost.author || 'Zeo Tourism'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {postDate(featuredPost)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {postReadTime(featuredPost)}
                  </span>
                </div>
                <h3 className="max-w-3xl text-3xl md:text-4xl font-serif font-bold leading-tight">
                  {featuredPost.title}
                </h3>
                <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-white/82 line-clamp-2">
                  {featuredPost.excerpt}
                </p>
                <div className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-wider text-white">
                  Read article
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </motion.article>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5 md:p-6">
              <div>
                <h3 className="text-2xl font-serif font-bold text-gray-950">Recent articles</h3>
                <p className="mt-1 text-sm text-gray-500">{articleCount} published travel guides</p>
              </div>
              <Link href="/blog" className="hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-dark">
                View all <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {recentPosts.length > 0 ? recentPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={postHref(post)}
                  className="group grid grid-cols-[96px_1fr] gap-4 p-5 transition-colors hover:bg-gray-50 md:grid-cols-[112px_1fr]"
                >
                  <div className="relative h-24 overflow-hidden bg-gray-100">
                    <img
                      src={post.image || undefined}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">
                      <span>{post.category || 'Guide'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400">{postReadTime(post)}</span>
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-gray-950 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>{postDate(post)}</span>
                      <span className="inline-flex items-center font-bold text-gray-900 group-hover:text-primary">
                        Read <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="p-6 text-sm leading-6 text-gray-500">
                  More travel articles are being prepared. Start with the featured guide, or contact us for route-specific advice.
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 p-5 md:p-6">
              <Link
                href="/contact"
                className="flex items-center justify-between border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-bold text-gray-950 transition-colors hover:border-primary hover:bg-white hover:text-primary"
              >
                Need help choosing a route?
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 border border-primary/15 bg-primary text-white p-6 md:p-8"
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold">
                Get travel inspiration delivered
              </h3>
              <p className="mt-2 text-sm md:text-base text-white/85 max-w-2xl">
                Practical route advice, destination guides and seasonal planning tips — sent occasionally, not constantly.
              </p>
            </div>

            {newsletterStatus === 'success' ? (
              <div className="flex items-center gap-3 border border-white/20 bg-white/10 px-5 py-4">
                <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                <span className="font-semibold">{newsletterMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex w-full gap-3 sm:w-[420px]">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={newsletterStatus === 'loading'}
                  className="min-w-0 flex-1 border border-white/25 bg-white/15 px-4 py-3 text-sm text-white placeholder-white/70 outline-none transition-all duration-300 focus:bg-white/20 disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: newsletterStatus === 'loading' ? 1 : 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={newsletterStatus === 'loading'}
                  className="bg-white px-5 py-3 text-sm font-bold text-primary transition-all duration-300 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {newsletterStatus === 'loading' ? 'Sending…' : 'Subscribe'}
                </motion.button>
              </form>
            )}
          </div>

          {newsletterStatus === 'error' && (
            <div className="mt-3 flex items-center gap-2 text-white/90 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{newsletterMsg}</span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
