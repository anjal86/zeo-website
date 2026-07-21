"use client";

import { useEffect, useRef, useState } from 'react';
import { List } from 'lucide-react';
import type { BlogHeading } from '@/lib/blogSeo';

export default function TableOfContents({ headings }: { headings: BlogHeading[] }) {
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length < 2) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -65% 0px', threshold: 0 },
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observerRef.current?.observe(element);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="border border-slate-100 bg-slate-50 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-900">
        <List className="h-4 w-4 text-primary" />
        In this article
      </h2>
      <ol className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <li key={id} className={level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${id}`}
              aria-current={activeId === id ? 'location' : undefined}
              className={`block py-1 text-sm leading-snug transition-colors ${
                activeId === id ? 'font-semibold text-primary' : 'text-slate-500 hover:text-primary'
              }`}
            >
              {activeId === id && <span aria-hidden="true" className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />}
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
