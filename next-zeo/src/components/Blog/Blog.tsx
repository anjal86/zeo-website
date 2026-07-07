"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  Search,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useApi } from "../../hooks/useApi";

type BlogPost = {
  id: number | string;
  slug?: string;
  title: string;
  excerpt?: string | null;
  image?: string | null;
  image_url?: string | null;
  author?: string | null;
  category?: string | null;
  readTime?: string | null;
  reading_time?: string | null;
  featured?: boolean;
  is_featured?: boolean;
  published_at?: string | null;
  date?: string | null;
  created_at?: string | null;
  tags?: string[];
};

type PostsPayload = BlogPost[] | { posts?: BlogPost[]; items?: BlogPost[] };

type BlogProps = {
  initialPosts?: BlogPost[];
  totalPosts?: number;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const readPosts = (payload: PostsPayload | null | undefined) => {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : (payload.posts || payload.items || []);
};

const postHref = (post: BlogPost) => `/blog/${post.slug || post.id}`;
const postImage = (post: BlogPost) => post.image || post.image_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200";
const postDate = (post: BlogPost) => formatDate(post.published_at || post.date || post.created_at);
const postReadTime = (post: BlogPost) => post.readTime || post.reading_time || "5 min read";
const postCategory = (post: BlogPost) => post.category || "Travel guide";

const BlogSkeleton = () => (
  <section className="py-14 md:py-16 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
    <div className="container-xl">
      <div className="mb-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[430px] animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-[430px] animate-pulse rounded-3xl bg-gray-100" />
      </div>
    </div>
  </section>
);

const EmptyState = ({ reset }: { reset: () => void }) => (
  <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
    <BookOpen className="mx-auto mb-4 h-10 w-10 text-gray-300" />
    <h3 className="text-xl font-serif font-bold text-gray-950">No matching articles found</h3>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600">
      Try a different keyword, clear the category filter, or contact our team for route-specific travel advice.
    </p>
    <button onClick={reset} className="mt-5 inline-flex items-center rounded-full border border-gray-200 px-5 py-2 text-sm font-bold text-gray-800 transition-colors hover:border-primary hover:text-primary">
      Clear filters
    </button>
  </div>
);

const Blog: React.FC<BlogProps> = ({ initialPosts = [], totalPosts }) => {
  const shouldFetchClient = initialPosts.length === 0;
  const { data: clientPayload, loading } = useApi<PostsPayload>(shouldFetchClient ? "/api/posts" : null);
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const posts = useMemo(() => {
    const source = initialPosts.length > 0 ? initialPosts : readPosts(clientPayload);
    return [...source].sort((a, b) => {
      const dateA = new Date(a.published_at || a.date || a.created_at || 0).getTime();
      const dateB = new Date(b.published_at || b.date || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [initialPosts, clientPayload]);

  const categories = useMemo(() => {
    const unique = [...new Set(posts.map((post) => postCategory(post)).filter(Boolean))];
    return ["All", ...unique];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === "All" || postCategory(post) === category;
      const haystack = [post.title, post.excerpt, post.author, postCategory(post), ...(post.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [posts, query, category]);

  const featuredPost = posts.find((post) => post.featured || post.is_featured) || posts[0];
  const recentPosts = posts.filter((post) => String(post.id) !== String(featuredPost?.id)).slice(0, 4);
  const visibleGridPosts = filteredPosts.filter((post) => String(post.id) !== String(featuredPost?.id));
  const articleCount = totalPosts ?? posts.length;

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
  };

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setNewsletterStatus("loading");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNewsletterStatus("success");
        setNewsletterMsg(data.message || "Thank you for subscribing!");
        setEmail("");
      } else {
        setNewsletterStatus("error");
        setNewsletterMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setNewsletterStatus("error");
      setNewsletterMsg("Network error. Please try again.");
    }
  };

  if (loading && posts.length === 0) return <BlogSkeleton />;

  if (!featuredPost) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="container-xl">
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-gray-300" />
            <h2 className="text-2xl font-serif font-bold text-gray-950">Travel guides are coming soon</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              We are preparing practical destination guides, trekking tips and pilgrimage planning resources. Contact us for help planning your route now.
            </p>
            <Link href="/contact" className="mt-6 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
              Talk to a travel expert <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
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
              Helpful travel reading before you book
            </h2>
          </div>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed lg:max-w-xl lg:justify-self-end">
            Browse {articleCount} practical guides on Nepal travel, trekking preparation, pilgrimage routes and seasonal planning.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <motion.article
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-950 shadow-xl shadow-gray-900/10 min-h-[430px]"
          >
            <Link href={postHref(featuredPost)} className="absolute inset-0 z-20" aria-label={`Read ${featuredPost.title}`} />
            <img src={postImage(featuredPost)} alt={featuredPost.title} loading="eager" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/55 to-gray-950/10" />
            <div className="relative z-10 flex min-h-[430px] flex-col justify-between p-6 md:p-8 text-white">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">Start here</span>
                <span className="rounded-full bg-white/15 backdrop-blur-sm px-3 py-2 text-xs font-bold uppercase tracking-wider text-white">{postCategory(featuredPost)}</span>
              </div>

              <div>
                <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{featuredPost.author || "Zeo Tourism"}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{postDate(featuredPost)}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{postReadTime(featuredPost)}</span>
                </div>
                <h3 className="max-w-3xl text-3xl md:text-4xl font-serif font-bold leading-tight">{featuredPost.title}</h3>
                <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-white/82 line-clamp-3">{featuredPost.excerpt || "Read this guide before planning your next trip."}</p>
                <div className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-bold text-gray-950 transition-transform group-hover:translate-x-1">
                  Read featured guide <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.article>

          <motion.aside
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5 md:p-6">
              <div>
                <h3 className="text-2xl font-serif font-bold text-gray-950">Recent articles</h3>
                <p className="mt-1 text-sm text-gray-500">Fresh guides for faster decisions</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">{articleCount} posts</span>
            </div>

            <div className="divide-y divide-gray-100">
              {recentPosts.length > 0 ? recentPosts.map((post) => (
                <Link key={post.id} href={postHref(post)} className="group grid grid-cols-[96px_1fr] gap-4 p-5 transition-colors hover:bg-gray-50 md:grid-cols-[112px_1fr]">
                  <div className="relative h-24 overflow-hidden rounded-2xl bg-gray-100">
                    <img src={postImage(post)} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">
                      <span>{postCategory(post)}</span><span className="text-gray-300">•</span><span className="text-gray-400">{postReadTime(post)}</span>
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-gray-950 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h4>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>{postDate(post)}</span>
                      <span className="inline-flex items-center font-bold text-gray-900 group-hover:text-primary">Read <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
                    </div>
                  </div>
                </Link>
              )) : <div className="p-6 text-sm leading-6 text-gray-500">More travel articles are being prepared.</div>}
            </div>

            <div className="border-t border-gray-100 p-5 md:p-6">
              <Link href="/contact" className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-bold text-gray-950 transition-colors hover:border-primary hover:bg-white hover:text-primary">
                Need help choosing a route? <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.aside>
        </div>

        <div className="mt-12 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="text-2xl font-serif font-bold text-gray-950">Browse all guides</h3>
              <p className="mt-1 text-sm text-gray-600">Search by destination, topic, author, category or keyword.</p>
            </div>
            <div className="relative w-full lg:w-[360px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles..." className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm outline-none transition-colors focus:border-primary focus:bg-white" />
              {query && <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X className="h-4 w-4" /></button>}
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${category === item ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {filteredPosts.length === 0 ? <EmptyState reset={resetFilters} /> : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleGridPosts.map((post) => (
                <Link key={post.id} href={postHref(post)} className="group overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/10">
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    <img src={postImage(post)} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-900 backdrop-blur">{postCategory(post)}</span>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{postDate(post)}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{postReadTime(post)}</span>
                    </div>
                    <h4 className="text-lg font-serif font-bold leading-snug text-gray-950 line-clamp-2 group-hover:text-primary">{post.title}</h4>
                    <p className="mt-3 text-sm leading-6 text-gray-600 line-clamp-3">{post.excerpt || "Open this guide for practical route and planning advice."}</p>
                    <div className="mt-5 inline-flex items-center text-sm font-bold text-primary">Read guide <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-12 rounded-[2rem] border border-primary/15 bg-primary text-white p-6 md:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider"><Mail className="h-3.5 w-3.5" /> Newsletter</div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold">Get travel inspiration delivered</h3>
              <p className="mt-2 text-sm md:text-base text-white/85 max-w-2xl">Practical route advice, destination guides and seasonal planning tips — sent occasionally, not constantly.</p>
            </div>

            {newsletterStatus === "success" ? (
              <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
                <CheckCircle className="w-5 h-5 text-white flex-shrink-0" /><span className="font-semibold">{newsletterMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex w-full flex-col gap-3 sm:w-[420px] sm:flex-row">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" required disabled={newsletterStatus === "loading"} className="min-w-0 flex-1 rounded-full border border-white/25 bg-white/15 px-4 py-3 text-sm text-white placeholder-white/70 outline-none transition-all duration-300 focus:bg-white/20 disabled:opacity-50" />
                <motion.button type="submit" whileHover={{ scale: newsletterStatus === "loading" ? 1 : 1.03 }} whileTap={{ scale: 0.98 }} disabled={newsletterStatus === "loading"} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-primary transition-all duration-300 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed">
                  {newsletterStatus === "loading" ? "Sending…" : "Subscribe"}
                </motion.button>
              </form>
            )}
          </div>

          {newsletterStatus === "error" && <div className="mt-3 flex items-center gap-2 text-white/90 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{newsletterMsg}</span></div>}
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
