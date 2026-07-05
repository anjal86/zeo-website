"use client";

import React, { useEffect, useState, useRef } from 'react';
import { List } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentHtml: string;
}

/**
 * Parses h2/h3 headings from HTML string, injects stable IDs into the live DOM,
 * and renders a sticky TOC with active-section highlighting.
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ contentHtml }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from the rendered DOM (runs after content is painted)
  useEffect(() => {
    // Give the prose container time to render
    const timer = setTimeout(() => {
      const article = document.querySelector('.blog-post-content');
      if (!article) return;

      const nodes = Array.from(article.querySelectorAll('h2, h3'));
      const extracted: Heading[] = nodes.map((el, idx) => {
        const text = el.textContent?.trim() || `section-${idx}`;
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 60);
        const id = `toc-${slug}-${idx}`;
        el.id = id;
        return { id, text, level: parseInt(el.tagName[1], 10) };
      });

      setHeadings(extracted);
    }, 100);

    return () => clearTimeout(timer);
  }, [contentHtml]);

  // Highlight active section as user scrolls
  useEffect(() => {
    if (!headings.length) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        // Pick the topmost visible heading
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 96; // height of sticky nav
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <nav aria-label="Table of contents" className="bg-slate-50 rounded-none border border-slate-100 p-6">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
        <List className="w-4 h-4 text-primary" />
        In this article
      </h3>
      <ol className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: level === 3 ? '1rem' : '0' }}>
            <button
              onClick={() => scrollTo(id)}
              className={`text-left w-full text-sm py-1 leading-snug transition-colors duration-150 ${
                activeId === id
                  ? 'text-primary font-semibold'
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              {activeId === id && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 align-middle" />
              )}
              {text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default TableOfContents;
