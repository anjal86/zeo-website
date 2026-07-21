"use client";

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, BookOpen, CheckCircle2, ExternalLink, Link2, Plus, Search, Trash2 } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import type { BlogLinkTarget, BlogLinkTargetType, BlogSource } from '@/lib/blogSeo';

const templates = [
  {
    label: 'Quick answer',
    content: `## Quick answer\n\nGive the reader a direct, specific answer in 2–4 sentences.\n`,
  },
  {
    label: 'Key facts',
    content: `## Key facts\n\n- Best for:\n- Typical duration:\n- Main difficulty:\n- Important requirement:\n`,
  },
  {
    label: 'Cost table',
    content: `## Cost breakdown\n\n| Item | Typical cost | Notes |\n|---|---:|---|\n| Permit |  |  |\n| Transport |  |  |\n| Accommodation |  |  |\n`,
  },
  {
    label: 'Month guide',
    content: `## Month-by-month conditions\n\n| Month | Conditions | Best for | Watch out for |\n|---|---|---|---|\n|  |  |  |  |\n`,
  },
  {
    label: 'Requirements',
    content: `## Requirements and documents\n\n1. Requirement one\n2. Requirement two\n3. Requirement three\n`,
  },
  {
    label: 'Packing list',
    content: `## Packing checklist\n\n### Essential documents\n\n- \n\n### Clothing and equipment\n\n- \n`,
  },
  {
    label: 'Comparison',
    content: `## Options compared\n\n| Option | Best for | Advantages | Limitations |\n|---|---|---|---|\n|  |  |  |  |\n`,
  },
  {
    label: 'Expert tip',
    content: `> **Expert tip:** Add a practical first-hand observation that helps the reader avoid a common mistake.\n`,
  },
];

export function ContentTemplateButtons({ onInsert }: { onInsert: (value: string) => void }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500"><BookOpen className="h-4 w-4" /> Insert useful content block</div>
      <div className="flex flex-wrap gap-2">
        {templates.map(template => (
          <button key={template.label} type="button" onClick={() => onInsert(template.content)} className="border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary">
            + {template.label}
          </button>
        ))}
      </div>
    </div>
  );
}

async function loadTargets(query: string, currentSlug: string) {
  return adminFetch<{ items: BlogLinkTarget[] }>(`/api/admin/seo/link-targets?q=${encodeURIComponent(query)}&current=${encodeURIComponent(currentSlug)}`);
}

export function InternalLinkAssistant({
  currentSlug,
  selectedText,
  onInsert,
}: {
  currentSlug: string;
  selectedText: string;
  onInsert: (target: BlogLinkTarget) => void;
}) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<BlogLinkTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const result = await loadTargets(query, currentSlug);
        setItems(result.items.slice(0, 16));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load link targets.');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, currentSlug]);

  return (
    <div className="border border-blue-200 bg-blue-50/40 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Link2 className="h-4 w-4 text-primary" /> Insert internal link</div>
          <p className="mt-1 text-xs text-slate-600">{selectedText ? `Selected anchor: “${selectedText}”` : 'Select text in the article or use the target title as anchor text.'}</p>
        </div>
        <div className="relative min-w-0 md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search articles, tours or destinations" className="w-full border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
      </div>
      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
      <div className="mt-4 grid max-h-64 gap-2 overflow-y-auto md:grid-cols-2">
        {items.map(target => (
          <button key={`${target.type}-${target.url}`} type="button" onClick={() => onInsert(target)} className="border border-slate-200 bg-white p-3 text-left hover:border-primary">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{target.title}</p><p className="mt-1 truncate text-xs text-primary">{target.url}</p></div>
              <span className="bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-500">{target.type}</span>
            </div>
            {target.status && !['published', 'listed'].includes(target.status) && <p className="mt-2 text-xs font-semibold text-amber-700">Status: {target.status}</p>}
          </button>
        ))}
        {!loading && items.length === 0 && <p className="text-xs text-slate-500">No matching internal pages found.</p>}
        {loading && <p className="text-xs text-slate-500">Searching…</p>}
      </div>
    </div>
  );
}

export function RelationPicker({
  label,
  description,
  currentSlug,
  allowedTypes,
  value,
  onChange,
}: {
  label: string;
  description: string;
  currentSlug: string;
  allowedTypes: BlogLinkTargetType[];
  value: BlogLinkTarget[];
  onChange: (value: BlogLinkTarget[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<BlogLinkTarget[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(async () => {
      try {
        const result = await loadTargets(query, currentSlug);
        setItems(result.items.filter(item => allowedTypes.includes(item.type)).slice(0, 12));
      } catch {
        setItems([]);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, currentSlug, open, allowedTypes]);

  const selectedUrls = useMemo(() => new Set(value.map(item => item.url)), [value]);
  return (
    <div className="border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-bold text-slate-900">{label}</p><p className="mt-1 text-xs leading-5 text-slate-600">{description}</p></div>
        <button type="button" onClick={() => setOpen(previous => !previous)} className="border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:border-primary hover:text-primary"><Plus className="mr-1 inline h-3.5 w-3.5" /> Add</button>
      </div>
      {value.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{value.map(item => <span key={item.url} className="inline-flex items-center gap-2 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{item.title}<button type="button" aria-label={`Remove ${item.title}`} onClick={() => onChange(value.filter(existing => existing.url !== item.url))} className="text-slate-400 hover:text-red-600">×</button></span>)}</div>}
      {open && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search available content" className="w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
            {items.map(item => <button key={item.url} type="button" disabled={selectedUrls.has(item.url)} onClick={() => onChange([...value, item])} className="flex w-full items-center justify-between gap-3 border border-slate-200 p-3 text-left text-sm disabled:opacity-50"><span><strong className="text-slate-900">{item.title}</strong><span className="ml-2 text-xs text-primary">{item.url}</span></span><span className="text-[10px] font-bold uppercase text-slate-400">{item.type}</span></button>)}
          </div>
        </div>
      )}
    </div>
  );
}

export function SourcesEditor({ value, onChange }: { value: BlogSource[]; onChange: (value: BlogSource[]) => void }) {
  const add = () => onChange([...value, { title: '', url: '', publisher: '', accessedAt: new Date().toISOString().slice(0, 10), note: '' }]);
  const update = (index: number, field: keyof BlogSource, next: string) => onChange(value.map((source, itemIndex) => itemIndex === index ? { ...source, [field]: next } : source));
  return (
    <div>
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-slate-900">Sources and verification</p><p className="mt-1 text-xs leading-5 text-slate-600">Record official or trustworthy sources for permits, schedules, rules, prices and health guidance.</p></div><button type="button" onClick={add} className="border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:border-primary hover:text-primary"><Plus className="mr-1 inline h-3.5 w-3.5" /> Source</button></div>
      <div className="mt-4 space-y-4">
        {value.map((source, index) => (
          <div key={index} className="grid gap-3 border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <input value={source.title} onChange={event => update(index, 'title', event.target.value)} placeholder="Source title" className="border border-slate-300 bg-white px-3 py-2.5 text-sm" />
            <input value={source.publisher || ''} onChange={event => update(index, 'publisher', event.target.value)} placeholder="Publisher or authority" className="border border-slate-300 bg-white px-3 py-2.5 text-sm" />
            <input value={source.url} onChange={event => update(index, 'url', event.target.value)} placeholder="https://official-source.example/page" className="border border-slate-300 bg-white px-3 py-2.5 text-sm md:col-span-2" />
            <input type="date" value={source.accessedAt || ''} onChange={event => update(index, 'accessedAt', event.target.value)} className="border border-slate-300 bg-white px-3 py-2.5 text-sm" />
            <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} className="justify-self-start text-xs font-bold text-red-700 hover:underline"><Trash2 className="mr-1 inline h-3.5 w-3.5" /> Remove</button>
            <textarea value={source.note || ''} onChange={event => update(index, 'note', event.target.value)} placeholder="What claim or section does this source support?" rows={2} className="border border-slate-300 bg-white px-3 py-2.5 text-sm md:col-span-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

type Diagnostics = {
  issues: Array<{ type: string; href: string; message: string }>;
  duplicates: Array<{ title: string; url: string; status: string; score: number; primaryQuery: string }>;
  inboundLinks: Array<{ title: string; url: string }>;
  orphaned: boolean;
  suggestions: Array<BlogLinkTarget & { score: number }>;
};

export function SeoDiagnosticsPanel({
  title,
  slug,
  content,
  primaryQuery,
  onIssueCount,
  onInsertSuggestion,
}: {
  title: string;
  slug: string;
  content: string;
  primaryQuery: string;
  onIssueCount: (count: number) => void;
  onInsertSuggestion: (target: BlogLinkTarget) => void;
}) {
  const [data, setData] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!title && !content) return;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const result = await adminFetch<Diagnostics>('/api/admin/seo/analyze', {
          method: 'POST',
          body: JSON.stringify({ title, slug, content, primaryQuery }),
        });
        setData(result);
        onIssueCount(result.issues.length);
      } catch {
        setData(null);
        onIssueCount(0);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [title, slug, content, primaryQuery, onIssueCount]);

  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-500"><AlertTriangle className="h-4 w-4" /> SEO diagnostics</div>{loading && <span className="text-xs text-slate-400">Checking…</span>}</div>
      {!data && !loading && <p className="mt-4 text-xs leading-5 text-slate-500">Start writing to check internal links, topic overlap and inbound links.</p>}
      {data && (
        <div className="mt-4 space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Link health</p>
            {data.issues.length === 0 ? <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-green-700"><CheckCircle2 className="h-4 w-4" /> No link problems found</p> : <div className="mt-2 space-y-2">{data.issues.map((issue, index) => <div key={`${issue.type}-${issue.href}-${index}`} className="border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>{issue.href || issue.type}</strong><br />{issue.message}</div>)}</div>}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Topic overlap</p>
            {data.duplicates.length === 0 ? <p className="mt-2 text-sm text-slate-600">No strong competing article found.</p> : <div className="mt-2 space-y-2">{data.duplicates.map(item => <a key={item.url} href={item.url} target="_blank" className="block border border-slate-200 p-3 text-sm hover:border-primary"><strong>{item.title}</strong><span className="ml-2 text-xs text-slate-500">{Math.round(item.score * 100)}% overlap</span><ExternalLink className="ml-1 inline h-3 w-3" /></a>)}</div>}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Inbound links</p>
            <p className={`mt-2 text-sm ${data.orphaned ? 'font-semibold text-amber-800' : 'text-slate-600'}`}>{data.orphaned ? 'No other article currently links to this page.' : `${data.inboundLinks.length} article${data.inboundLinks.length === 1 ? '' : 's'} link to this page.`}</p>
          </div>
          {data.suggestions.length > 0 && <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Suggested internal links</p><div className="mt-2 space-y-2">{data.suggestions.slice(0, 5).map(item => <button key={item.url} type="button" onClick={() => onInsertSuggestion(item)} className="block w-full border border-slate-200 p-3 text-left text-sm hover:border-primary"><strong>{item.title}</strong><span className="ml-2 text-xs text-primary">{item.url}</span></button>)}</div></div>}
        </div>
      )}
    </section>
  );
}

type SearchPerformance = {
  configured?: boolean;
  message?: string;
  error?: string;
  period?: { startDate: string; endDate: string };
  totals?: { clicks: number; impressions: number; ctr: number; position: number };
  queries?: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
};

export function SearchConsolePanel({ slug, enabled }: { slug: string; enabled: boolean }) {
  const [data, setData] = useState<SearchPerformance | null>(null);
  useEffect(() => {
    if (!enabled || !slug) return;
    const page = `${window.location.origin}/blog/${slug}`;
    adminFetch<SearchPerformance>(`/api/admin/seo/search-console?page=${encodeURIComponent(page)}&days=90`).then(setData).catch(error => setData({ error: error instanceof Error ? error.message : 'Could not load Search Console data' }));
  }, [slug, enabled]);

  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-500"><BarChart3 className="h-4 w-4" /> Search performance</div>
      {!enabled && <p className="mt-4 text-xs leading-5 text-slate-500">Performance appears after the article is saved.</p>}
      {enabled && !data && <p className="mt-4 text-xs text-slate-500">Loading Search Console data…</p>}
      {data?.configured === false && <p className="mt-4 text-xs leading-5 text-slate-600">{data.message}</p>}
      {data?.error && <p className="mt-4 text-xs leading-5 text-red-700">{data.error}</p>}
      {data?.totals && <div className="mt-4"><div className="grid grid-cols-2 gap-2"><Metric label="Clicks" value={Math.round(data.totals.clicks).toLocaleString()} /><Metric label="Impressions" value={Math.round(data.totals.impressions).toLocaleString()} /><Metric label="CTR" value={`${(data.totals.ctr * 100).toFixed(1)}%`} /><Metric label="Avg. position" value={data.totals.position.toFixed(1)} /></div>{data.queries && data.queries.length > 0 && <div className="mt-4 space-y-2"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Top queries</p>{data.queries.slice(0, 6).map(item => <div key={item.query} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-xs"><span className="min-w-0 truncate font-semibold text-slate-700">{item.query}</span><span className="whitespace-nowrap text-slate-500">{item.clicks} clicks · #{item.position.toFixed(1)}</span></div>)}</div>}</div>}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}
