import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

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
    return null; // Or a loading skeleton
  }

  // Sort slightly by date later if needed, but API usually returns insertion order. 
  // Assuming backend returns newest last, or we can reverse.
  // For now simple display.
  const featuredPosts = posts.filter(p => p.featured).slice(0, 1);
  const recentPosts = posts.filter(p => !p.featured).slice(0, 3); // Top 3 recent

  return (
    <section id="blog" className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center mb-4 text-secondary text-xs font-bold uppercase tracking-[0.2em]">
            <BookOpen className="w-5 h-5 mr-2" />
            <span>Travel Inspirations</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Stories & <span className="text-gradient">Insights</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dive into travel guides, tips, and inspiring stories from the mountains to help you plan your perfect adventure
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Post */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {featuredPosts.map(post => (
              <motion.article
                key={post.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-none overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* Featured Badge */}
                  <div className="absolute top-6 left-6">
                    <span className="bg-gradient-to-r from-secondary to-secondary-light text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Featured Article
                    </span>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                        {post.category}
                      </span>
                      <span className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-3xl font-serif font-bold mb-3">
                      {post.title}
                    </h3>
                    <p className="text-white/90 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-sm">
                          <User className="w-4 h-4 mr-1" />
                          {post.author}
                        </span>
                        <span className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {post.date}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="flex items-center text-white font-semibold group/btn"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Recent Posts */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">
              Recent Articles
            </h3>
            {recentPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ x: 10 }}
                className="bg-white rounded-none overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex">
                  <div className="w-1/3 relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <span className="text-xs text-primary font-semibold">
                      {post.category}
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900 mt-1 mb-2 line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {post.author}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}

            {/* View All Button */}
            <Link
              to="/blog"
              className="block w-full text-center bg-gradient-to-r from-primary to-primary-light text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              View All Articles
            </Link>
          </motion.div>
        </div>

        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-gradient-to-r from-primary to-primary-light rounded-none p-12 text-white text-center"
        >
          <h3 className="text-3xl font-serif font-bold mb-4">
            Get Travel Inspiration Delivered
          </h3>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive travel tips, destination guides, and special offers
          </p>

          {newsletterStatus === 'success' ? (
            <div className="max-w-md mx-auto flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-8 py-4">
              <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
              <span className="font-semibold">{newsletterMsg}</span>
            </div>
          ) : (
            <>
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={newsletterStatus === 'loading'}
                  className="flex-1 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:bg-white/30 transition-all duration-300 disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: newsletterStatus === 'loading' ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={newsletterStatus === 'loading'}
                  className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {newsletterStatus === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </motion.button>
              </form>
              {newsletterStatus === 'error' && (
                <div className="max-w-md mx-auto mt-3 flex items-center gap-2 text-white/90 text-sm justify-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{newsletterMsg}</span>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
