'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Gauge,
  Globe2,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';

type MetricTotals = { clicks: number; impressions: number; ctr: number; position: number };
type PerformanceRow = { page?: string; query?: string; clicks: number; impressions: number; ctr: number; position: number };
type Overview = {
  configured?: boolean;
  message?: string;
  error?: string;
  siteUrl?: string;
  period?: { startDate: string; endDate: string; days: number };
  totals?: MetricTotals;
  previousTotals?: MetricTotals;
  pages?: PerformanceRow[];
  queries?: PerformanceRow[];
};
type SitemapItem = {
  path?: string;
  type?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  lastSubmitted?: string;
  lastDownloaded?: string;
  warnings?: string | number;
  errors?: string | number;
};
type SitemapResponse = { configured?: boolean; message?: string; siteUrl?: string; sitemaps?: SitemapItem[]; error?: string };
type Inspection = {
  configured?: boolean;
  message?: string;
  pageUrl?: string;
  inspectionResultLink?: string;
  index?: {
    verdict?: string;
    coverageState?: string;
    robotsTxtState?: string;
    indexingState?: string;
    lastCrawlTime?: string;
    pageFetchState?: string;
    googleCanonical?: string;
    userCanonical?: string;
    crawledAs?: string;
    sitemap?: string[];
    referringUrls?: string[];
  } | null;
  mobile?: { verdict?: string; issues?: Array<{ issueType?: string; message?: string }> } | null;
  richResults?: { verdict?: string; detectedItems?: Array<{ richResultType?: string }> } | null;
};
type HealthIssue = { code: string; severity: 'critical' | 'warning' | 'notice'; message: string };
type HealthPage = {
  url: string;
  status: number;
  responseTimeMs: number;
  title: string;
  description: string;
  canonical: string;
  noindex: boolean;
  h1Count: number;
  jsonLdCount: number;
  internalLinkCount: number;
  imagesMissingAlt: number;
  score: number;
  issues: HealthIssue[];
};
type HealthReport = {
  generatedAt: string;
  origin: string;
  summary: {
    score: number;
    totalDiscovered: number;
    pagesChecked: number;
    truncated: boolean;
    issueCounts: { critical: number; warning: number; notice: number };
  };
  infrastructure: {
    robots: { url: string; status: number; hasSitemapDirective: boolean; blocksEntireSite: boolean };
    sitemap: { url: string; status: number; childSitemaps: string[]; discoveredUrls: number };
  };
  pages: HealthPage[];
};

type Tab = 'overview' | 'inspection' | 'health' | 'sitemaps';

const inputClass = 'w-full border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

function formatNumber(value = 0) {
  return Math.round(value).toLocaleString();
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function delta(current = 0, previous = 0, reverse = false) {
  if (!previous) return null;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return { value: change, positive: reverse ? change <= 0 : change >= 0 };
}

function verdictTone(value?: string) {
  const normalized = String(value || '').toUpperCase();
  if (['PASS', 'VERDICT_PASS', 'INDEXING_ALLOWED', 'SUCCESS'].some(item => normalized.includes(item))) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (['FAIL', 'ERROR', 'BLOCKED', 'EXCLUDED', 'NEUTRAL'].some(item => normalized.includes(item))) return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-amber-50 text-amber-800 border-amber-200';
}

export default function SeoManager() {
  const [tab, setTab] = useState<Tab>('overview');
  const [days, setDays] = useState(28);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [sitemaps, setSitemaps] = useState<SitemapResponse | null>(null);
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [inspectionUrl, setInspectionUrl] = useState('');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [healthLimit, setHealthLimit] = useState(60);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewResult, sitemapResult] = await Promise.all([
        adminFetch<Overview>(`/api/admin/seo/overview?days=${days}`),
        adminFetch<SitemapResponse>('/api/admin/seo/sitemaps'),
      ]);
      setOverview(overviewResult);
      setSitemaps(sitemapResult);
      const origin = window.location.origin;
      setInspectionUrl(current => current || `${origin}/`);
      setSitemapUrl(current => current || `${origin}/sitemap.xml`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load the SEO manager.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const runHealthCheck = async () => {
    setHealthLoading(true);
    setError('');
    try {
      const result = await adminFetch<HealthReport>(`/api/admin/seo/health?limit=${healthLimit}`);
      setHealth(result);
      setTab('health');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Health check failed.');
    } finally {
      setHealthLoading(false);
    }
  };

  const inspectUrl = async (event: FormEvent) => {
    event.preventDefault();
    setInspectionLoading(true);
    setInspection(null);
    setError('');
    try {
      const result = await adminFetch<Inspection>('/api/admin/seo/inspect', {
        method: 'POST',
        body: JSON.stringify({ url: inspectionUrl }),
      });
      setInspection(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'URL inspection failed.');
    } finally {
      setInspectionLoading(false);
    }
  };

  const sitemapAction = async (action: 'submit' | 'delete', target = sitemapUrl) => {
    const confirmation = action === 'delete'
      ? window.confirm('Remove this sitemap submission from Search Console? This does not delete the sitemap file from the website.')
      : true;
    if (!confirmation) return;
    setSitemapLoading(true);
    setError('');
    try {
      await adminFetch('/api/admin/seo/sitemaps', {
        method: 'POST',
        body: JSON.stringify({ action, sitemapUrl: target }),
      });
      setSitemaps(await adminFetch<SitemapResponse>('/api/admin/seo/sitemaps'));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Sitemap action failed.');
    } finally {
      setSitemapLoading(false);
    }
  };

  const removalUrl = useMemo(() => {
    const property = overview?.siteUrl || sitemaps?.siteUrl;
    return property
      ? `https://search.google.com/search-console/removals?resource_id=${encodeURIComponent(property)}`
      : 'https://search.google.com/search-console/removals';
  }, [overview?.siteUrl, sitemaps?.siteUrl]);

  const tabs: Array<{ id: Tab; label: string; icon: typeof BarChart3 }> = [
    { id: 'overview', label: 'Performance', icon: BarChart3 },
    { id: 'inspection', label: 'URL inspection', icon: FileSearch },
    { id: 'health', label: 'Site health', icon: Activity },
    { id: 'sitemaps', label: 'Sitemaps', icon: Globe2 },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-12">
      <header className="overflow-hidden border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300"><Gauge className="h-4 w-4" /> Search visibility control centre</div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">SEO Manager</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">Monitor Google performance, inspect index coverage, maintain sitemap submissions, and audit the rendered SEO health of every important page from one workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={loadDashboard} disabled={loading} className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/15 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh data</button>
            <button type="button" onClick={runHealthCheck} disabled={healthLoading} className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2.5 text-sm font-bold hover:bg-blue-500 disabled:opacity-50">{healthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />} Run health check</button>
          </div>
        </div>
      </header>

      {error && <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800"><XCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><strong>Action could not be completed.</strong><p className="mt-1">{error}</p></div></div>}

      {overview?.configured === false && (
        <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 p-5 text-amber-900"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><strong>Search Console is not connected.</strong><p className="mt-1 text-sm">{overview.message}</p></div></div>
      )}

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2">
        {tabs.map(item => {
          const Icon = item.icon;
          return <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${tab === item.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}><Icon className="h-4 w-4" />{item.label}</button>;
        })}
      </nav>

      {loading && !overview ? <LoadingPanel /> : null}
      {!loading && tab === 'overview' && <OverviewPanel overview={overview} days={days} onDaysChange={setDays} />}
      {tab === 'inspection' && (
        <InspectionPanel
          url={inspectionUrl}
          onUrlChange={setInspectionUrl}
          onSubmit={inspectUrl}
          loading={inspectionLoading}
          result={inspection}
          removalUrl={removalUrl}
        />
      )}
      {tab === 'health' && (
        <HealthPanel
          report={health}
          loading={healthLoading}
          limit={healthLimit}
          onLimitChange={setHealthLimit}
          onRun={runHealthCheck}
        />
      )}
      {tab === 'sitemaps' && (
        <SitemapPanel
          data={sitemaps}
          sitemapUrl={sitemapUrl}
          onSitemapUrlChange={setSitemapUrl}
          loading={sitemapLoading}
          onSubmit={() => sitemapAction('submit')}
          onDelete={target => sitemapAction('delete', target)}
        />
      )}
    </div>
  );
}

function OverviewPanel({ overview, days, onDaysChange }: { overview: Overview | null; days: number; onDaysChange: (days: number) => void }) {
  const totals = overview?.totals;
  const previous = overview?.previousTotals;
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div><h2 className="text-lg font-bold text-slate-950">Google Search performance</h2><p className="mt-1 text-sm text-slate-500">Final Search Console data through {overview?.period?.endDate || 'the latest available date'}.</p></div>
        <select value={days} onChange={event => onDaysChange(Number(event.target.value))} className="border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"><option value={7}>Last 7 days</option><option value={28}>Last 28 days</option><option value={90}>Last 90 days</option><option value={180}>Last 180 days</option></select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Clicks" value={formatNumber(totals?.clicks)} change={delta(totals?.clicks, previous?.clicks)} />
        <MetricCard label="Impressions" value={formatNumber(totals?.impressions)} change={delta(totals?.impressions, previous?.impressions)} />
        <MetricCard label="Average CTR" value={`${((totals?.ctr || 0) * 100).toFixed(1)}%`} change={delta(totals?.ctr, previous?.ctr)} />
        <MetricCard label="Average position" value={(totals?.position || 0).toFixed(1)} change={delta(totals?.position, previous?.position, true)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.6fr)]">
        <DataTable title="Top pages" rows={(overview?.pages || []).slice(0, 25)} mode="page" />
        <DataTable title="Top queries" rows={(overview?.queries || []).slice(0, 20)} mode="query" />
      </div>
    </div>
  );
}

function InspectionPanel({ url, onUrlChange, onSubmit, loading, result, removalUrl }: { url: string; onUrlChange: (value: string) => void; onSubmit: (event: FormEvent) => void; loading: boolean; result: Inspection | null; removalUrl: string }) {
  const index = result?.index;
  return (
    <div className="space-y-6">
      <section className="border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3"><FileSearch className="mt-0.5 h-6 w-6 text-blue-600" /><div><h2 className="text-xl font-bold text-slate-950">Inspect a URL in Google’s index</h2><p className="mt-1 text-sm leading-6 text-slate-600">See the indexed version, coverage reason, crawl status, canonical selection, mobile verdict, and rich-result detection.</p></div></div>
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2 md:flex-row"><input type="url" required value={url} onChange={event => onUrlChange(event.target.value)} className={inputClass} placeholder="https://zeotourism.com/page" /><button disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Inspect URL</button></form>
      </section>

      {result && index && (
        <section className="space-y-5 border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Google index result</p><h3 className="mt-1 break-all text-lg font-bold text-slate-950">{result.pageUrl}</h3></div><span className={`border px-3 py-1.5 text-xs font-bold ${verdictTone(index.verdict)}`}>{index.verdict || 'Unknown verdict'}</span></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Fact label="Coverage" value={index.coverageState} /><Fact label="Indexing" value={index.indexingState} /><Fact label="Fetch" value={index.pageFetchState} /><Fact label="Last crawl" value={formatDate(index.lastCrawlTime)} /></div>
          <div className="grid gap-4 lg:grid-cols-2"><DetailCard title="Canonical declared by site" value={index.userCanonical} /><DetailCard title="Canonical selected by Google" value={index.googleCanonical} /><DetailCard title="Robots.txt state" value={index.robotsTxtState} /><DetailCard title="Crawled as" value={index.crawledAs} /></div>
          <div className="flex flex-wrap gap-2">{result.inspectionResultLink && <a href={result.inspectionResultLink} target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-700">Open in Search Console <ExternalLink className="h-4 w-4" /></a>}<a href={removalUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100">Temporary removal tool <ExternalLink className="h-4 w-4" /></a></div>
        </section>
      )}

      <section className="border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950"><strong>Correct indexing workflow:</strong> Google does not provide a general “request indexing” API for normal travel pages. Publish an indexable page, include it in the sitemap, link to it internally, submit the sitemap, and use URL Inspection to monitor Google’s decision. Permanent removal requires a 404/410, access restriction, or noindex; Search Console’s removal tool is temporary.</section>
    </div>
  );
}

function HealthPanel({ report, loading, limit, onLimitChange, onRun }: { report: HealthReport | null; loading: boolean; limit: number; onLimitChange: (value: number) => void; onRun: () => void }) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'notice'>('all');
  const pages = useMemo(() => (report?.pages || []).filter(page => filter === 'all' || page.issues.some(issue => issue.severity === filter)), [report?.pages, filter]);
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border border-slate-200 bg-white p-6 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Rendered site health audit</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Crawls same-domain URLs from the live sitemap and verifies what search engines actually receive.</p></div><div className="flex gap-2"><select value={limit} onChange={event => onLimitChange(Number(event.target.value))} className="border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"><option value={30}>Quick scan · 30 pages</option><option value={60}>Standard scan · 60 pages</option><option value={120}>Deep scan · 120 pages</option><option value={200}>Full scan · up to 200</option></select><button type="button" onClick={onRun} disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />} Run audit</button></div></section>
      {!report && !loading && <EmptyState icon={Activity} title="No health report yet" description="Run an audit to inspect status codes, metadata, canonicals, indexing directives, headings, structured data, image accessibility, internal links, and response time." />}
      {report && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><ScoreCard score={report.summary.score} /><SmallStat label="Pages discovered" value={formatNumber(report.summary.totalDiscovered)} /><SmallStat label="Pages checked" value={formatNumber(report.summary.pagesChecked)} /><SmallStat label="Critical issues" value={formatNumber(report.summary.issueCounts.critical)} tone="red" /><SmallStat label="Warnings" value={formatNumber(report.summary.issueCounts.warning)} tone="amber" /></div>
        <div className="grid gap-4 md:grid-cols-2"><InfrastructureCard title="robots.txt" status={report.infrastructure.robots.status} checks={[{ label: 'Sitemap directive present', pass: report.infrastructure.robots.hasSitemapDirective }, { label: 'Entire site is crawlable', pass: !report.infrastructure.robots.blocksEntireSite }]} /><InfrastructureCard title="sitemap.xml" status={report.infrastructure.sitemap.status} checks={[{ label: `${report.infrastructure.sitemap.discoveredUrls} URLs discovered`, pass: report.infrastructure.sitemap.discoveredUrls > 0 }, { label: 'Sitemap responds successfully', pass: report.infrastructure.sitemap.status >= 200 && report.infrastructure.sitemap.status < 300 }]} /></div>
        <section className="overflow-hidden border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between"><div><h3 className="font-bold text-slate-950">Page diagnostics</h3><p className="mt-1 text-xs text-slate-500">Sorted by lowest health score first.</p></div><div className="flex flex-wrap gap-1">{(['all', 'critical', 'warning', 'notice'] as const).map(item => <button key={item} onClick={() => setFilter(item)} className={`px-3 py-1.5 text-xs font-bold capitalize ${filter === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>{item}</button>)}</div></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Score</th><th className="px-4 py-3">Page</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Response</th><th className="px-4 py-3">Issues</th></tr></thead><tbody className="divide-y divide-slate-100">{[...pages].sort((a, b) => a.score - b.score).map(page => <tr key={page.url} className="align-top"><td className="px-4 py-4"><ScoreBadge score={page.score} /></td><td className="max-w-xl px-4 py-4"><a href={page.url} target="_blank" rel="noopener" className="break-all font-bold text-slate-900 hover:text-blue-700">{page.title || page.url}</a><p className="mt-1 break-all text-xs text-slate-500">{page.url}</p></td><td className="px-4 py-4 font-semibold">{page.status || 'Failed'}</td><td className="px-4 py-4">{page.responseTimeMs ? `${page.responseTimeMs} ms` : '—'}</td><td className="min-w-80 px-4 py-4"><div className="space-y-1.5">{page.issues.length ? page.issues.map(issue => <div key={`${issue.code}-${issue.message}`} className="flex items-start gap-2 text-xs"><SeverityDot severity={issue.severity} /><span>{issue.message}</span></div>) : <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> No material issue detected</span>}</div></td></tr>)}</tbody></table></div></section>
      </>}
    </div>
  );
}

function SitemapPanel({ data, sitemapUrl, onSitemapUrlChange, loading, onSubmit, onDelete }: { data: SitemapResponse | null; sitemapUrl: string; onSitemapUrlChange: (value: string) => void; loading: boolean; onSubmit: () => void; onDelete: (value: string) => void }) {
  return <div className="space-y-6"><section className="border border-slate-200 bg-white p-6"><div className="flex items-start gap-3"><Globe2 className="mt-0.5 h-6 w-6 text-blue-600" /><div><h2 className="text-xl font-bold text-slate-950">Sitemap management</h2><p className="mt-1 text-sm leading-6 text-slate-600">Submit the live sitemap after meaningful publishing changes, monitor download status, and remove obsolete submissions without deleting the website file.</p></div></div><div className="mt-5 flex flex-col gap-2 md:flex-row"><input type="url" value={sitemapUrl} onChange={event => onSitemapUrlChange(event.target.value)} className={inputClass} /><button type="button" onClick={onSubmit} disabled={loading || !sitemapUrl} className="inline-flex shrink-0 items-center justify-center gap-2 bg-blue-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Submit sitemap</button></div></section><section className="overflow-hidden border border-slate-200 bg-white"><div className="border-b border-slate-200 p-5"><h3 className="font-bold text-slate-950">Submitted sitemaps</h3><p className="mt-1 text-xs text-slate-500">Data reported directly by Search Console.</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Sitemap</th><th className="px-4 py-3">Last submitted</th><th className="px-4 py-3">Last downloaded</th><th className="px-4 py-3">Warnings</th><th className="px-4 py-3">Errors</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{(data?.sitemaps || []).map(item => <tr key={item.path} className="align-middle"><td className="px-4 py-4"><a href={item.path} target="_blank" rel="noopener" className="break-all font-bold text-blue-700 hover:underline">{item.path}</a><p className="mt-1 text-xs text-slate-500">{item.type || 'sitemap'}{item.isPending ? ' · Processing' : ''}</p></td><td className="whitespace-nowrap px-4 py-4">{formatDate(item.lastSubmitted)}</td><td className="whitespace-nowrap px-4 py-4">{formatDate(item.lastDownloaded)}</td><td className="px-4 py-4">{item.warnings || 0}</td><td className="px-4 py-4">{item.errors || 0}</td><td className="px-4 py-4"><button type="button" onClick={() => item.path && onDelete(item.path)} disabled={loading} className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline"><Trash2 className="h-3.5 w-3.5" /> Remove submission</button></td></tr>)}{!data?.sitemaps?.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">No submitted sitemap returned by Search Console.</td></tr>}</tbody></table></div></section></div>;
}

function MetricCard({ label, value, change }: { label: string; value: string; change: ReturnType<typeof delta> }) {
  return <div className="border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>{change && <p className={`mt-2 text-xs font-bold ${change.positive ? 'text-emerald-700' : 'text-red-700'}`}>{change.value >= 0 ? '+' : ''}{change.value.toFixed(1)}% vs previous period</p>}</div>;
}

function DataTable({ title, rows, mode }: { title: string; rows: PerformanceRow[]; mode: 'page' | 'query' }) {
  return <section className="overflow-hidden border border-slate-200 bg-white"><div className="border-b border-slate-200 p-5"><h3 className="font-bold text-slate-950">{title}</h3></div><div className="max-h-[640px] overflow-auto"><table className="min-w-full text-left text-sm"><thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">{mode === 'page' ? 'Page' : 'Query'}</th><th className="px-4 py-3">Clicks</th><th className="px-4 py-3">Impressions</th><th className="px-4 py-3">Position</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={`${row.page || row.query}-${index}`}><td className="max-w-lg px-4 py-3"><span className="block truncate font-semibold text-slate-800" title={row.page || row.query}>{row.page || row.query || 'Unknown'}</span></td><td className="px-4 py-3">{formatNumber(row.clicks)}</td><td className="px-4 py-3">{formatNumber(row.impressions)}</td><td className="px-4 py-3">{row.position.toFixed(1)}</td></tr>)}{!rows.length && <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">No Search Console rows for this period.</td></tr>}</tbody></table></div></section>;
}

function Fact({ label, value }: { label: string; value?: string }) { return <div className="border border-slate-200 bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-sm font-bold text-slate-900">{value || 'Not reported'}</p></div>; }
function DetailCard({ title, value }: { title: string; value?: string }) { return <div className="border border-slate-200 p-4"><p className="text-xs font-bold text-slate-500">{title}</p><p className="mt-2 break-all text-sm text-slate-800">{value || 'Not reported'}</p></div>; }
function SmallStat({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'slate' | 'red' | 'amber' }) { const classes = tone === 'red' ? 'text-red-700' : tone === 'amber' ? 'text-amber-700' : 'text-slate-950'; return <div className="border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-2 text-2xl font-bold ${classes}`}>{value}</p></div>; }
function ScoreCard({ score }: { score: number }) { return <div className="border border-slate-200 bg-slate-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Site health score</p><p className="mt-2 text-4xl font-bold">{score}<span className="text-lg text-slate-400">/100</span></p></div>; }
function ScoreBadge({ score }: { score: number }) { const className = score >= 85 ? 'bg-emerald-100 text-emerald-800' : score >= 65 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'; return <span className={`inline-flex min-w-12 justify-center px-2 py-1 text-xs font-bold ${className}`}>{score}</span>; }
function SeverityDot({ severity }: { severity: HealthIssue['severity'] }) { return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severity === 'critical' ? 'bg-red-500' : severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />; }
function InfrastructureCard({ title, status, checks }: { title: string; status: number; checks: Array<{ label: string; pass: boolean }> }) { return <div className="border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-950">{title}</h3><span className={`text-xs font-bold ${status >= 200 && status < 300 ? 'text-emerald-700' : 'text-red-700'}`}>HTTP {status || 'failed'}</span></div><div className="mt-4 space-y-2">{checks.map(check => <div key={check.label} className="flex items-center gap-2 text-sm">{check.pass ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <ShieldAlert className="h-4 w-4 text-red-600" />}<span>{check.label}</span></div>)}</div></div>; }
function EmptyState({ icon: Icon, title, description }: { icon: typeof Activity; title: string; description: string }) { return <div className="border border-dashed border-slate-300 bg-white p-12 text-center"><Icon className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p></div>; }
function LoadingPanel() { return <div className="flex min-h-80 items-center justify-center border border-slate-200 bg-white"><div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" /><p className="mt-3 text-sm font-semibold text-slate-500">Loading Search Console data…</p></div></div>; }
