"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Navigation as NavIcon, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toursApi, destinationsApi, blogsApi } from '../../services/api';
import type { Tour, Destination, Blog } from '../../services/api';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    tours: Tour[];
    destinations: Destination[];
    blogs: Blog[];
  }>({ tours: [], destinations: [], blogs: [] });
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults({ tours: [], destinations: [], blogs: [] });
      setHasSearched(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = query.trim();
      if (trimmed.length >= 2) {
        setIsSearching(true);
        try {
          // Tours: backend supports ?search= param
          const tours = await toursApi.search(trimmed).catch(() => [] as Tour[]);

          // Destinations: fetch all, filter client-side
          const allDests = await destinationsApi.getAll().catch(() => [] as Destination[]);
          const q = trimmed.toLowerCase();
          const destinations = allDests.filter(d =>
            d.name?.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q) ||
            d.location?.toLowerCase().includes(q) ||
            d.country?.toLowerCase().includes(q)
          );

          // Blogs: fetch all, filter client-side (no search endpoint)
          let blogs: Blog[] = [];
          try {
            const allBlogs = await blogsApi.getAll();
            blogs = allBlogs.filter(b =>
              b.title?.toLowerCase().includes(q) ||
              b.excerpt?.toLowerCase().includes(q) ||
              b.category?.toLowerCase().includes(q) ||
              b.tags?.some(t => t.toLowerCase().includes(q))
            ).slice(0, 5);
          } catch {
            blogs = [];
          }

          setResults({
            tours: tours.slice(0, 6),
            destinations: destinations.slice(0, 6),
            blogs,
          });
          setHasSearched(true);
        } catch (error) {
          console.error('Search failed:', error);
          setResults({ tours: [], destinations: [], blogs: [] });
          setHasSearched(true);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults({ tours: [], destinations: [], blogs: [] });
        setHasSearched(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    results.tours.length > 0 ||
    results.destinations.length > 0 ||
    results.blogs.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl bg-white shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Input */}
            <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <Search className="w-5 h-5 text-primary flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tours, destinations, blogs..."
                className="flex-1 bg-transparent border-none text-lg md:text-xl outline-none placeholder-gray-400 text-gray-800 min-w-0"
              />
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
              ) : (
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="overflow-y-auto flex-1">
              {/* Prompt state */}
              {!hasSearched && query.length < 2 && (
                <div className="p-12 text-center text-gray-400">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-base">Type to search tours, destinations & blogs</p>
                </div>
              )}

              {/* No results */}
              {hasSearched && !hasResults && !isSearching && (
                <div className="p-12 text-center">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-20 text-gray-400" />
                  <p className="text-base font-semibold text-gray-700">No results for "{query}"</p>
                  <p className="text-sm text-gray-400 mt-1">Try different keywords.</p>
                </div>
              )}

              {/* Results */}
              {hasResults && (
                <div className="p-4 md:p-6 space-y-6">

                  {/* Tours Section */}
                  {results.tours.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-1.5">
                        <NavIcon className="w-3.5 h-3.5" />
                        Tours &amp; Packages ({results.tours.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {results.tours.map(tour => (
                          <Link
                            key={tour.id}
                            href={`/tours/${tour.slug || tour.id}`}
                            onClick={onClose}
                            className="group flex gap-3 p-3 hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all"
                          >
                            {tour.image ? (
                              <img
                                src={tour.image}
                                alt={tour.title}
                                className="w-12 h-12 object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-primary/10 flex-shrink-0 flex items-center justify-center">
                                <NavIcon className="w-5 h-5 text-primary/30" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                {tour.title}
                              </h4>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {tour.location} · {tour.duration}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Destinations Section */}
                  {results.destinations.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-secondary-dark mb-3 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Destinations ({results.destinations.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {results.destinations.map(dest => (
                          <Link
                            key={dest.id}
                            href={`/destinations/${dest.slug || dest.name?.toLowerCase()}`}
                            onClick={onClose}
                            className="group flex gap-3 p-3 hover:bg-secondary/5 border border-transparent hover:border-secondary/10 transition-all"
                          >
                            {dest.image ? (
                              <img
                                src={dest.image}
                                alt={dest.name}
                                className="w-12 h-12 object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-secondary/10 flex-shrink-0 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-secondary/30" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 group-hover:text-secondary-dark transition-colors line-clamp-1">
                                {dest.name}
                              </h4>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {dest.country} · {dest.difficulty}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blogs Section */}
                  {results.blogs.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Blog Posts ({results.blogs.length})
                      </h3>
                      <div className="space-y-1">
                        {results.blogs.map(blog => (
                          <Link
                            key={blog.slug}
                            href={`/blog/${blog.slug}`}
                            onClick={onClose}
                            className="group p-3 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all block"
                          >
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {blog.title}
                            </h4>
                            {blog.excerpt && (
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{blog.excerpt}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-center text-xs text-gray-400">
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 shadow-sm font-mono text-[10px]">
                ESC
              </kbd>{' '}
              to close
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
