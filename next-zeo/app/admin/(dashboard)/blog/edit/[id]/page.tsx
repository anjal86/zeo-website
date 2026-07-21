"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle,
  Circle,
  Eye,
  ImageIcon,
  Link2,
  Save,
  Search,
  ShieldCheck,
  Target,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { adminFetch, adminFetchRaw } from '@/lib/adminFetch';
import { htmlToPlainText } from '@/lib/blogMarkdown';
import {
  buildBlogSeoReadiness,
  normalizeTopicList,
  parseBlogSeoData,
  slugifyBlogValue,
  type BlogLinkTarget,
  type BlogSearchIntent,
  type BlogSource,
} from '@/lib/blogSeo';
import MarkdownArticle from '@/components/Blog/MarkdownArticle';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import {
  ContentTemplateButtons,
  InternalLinkAssistant,
  RelationPicker,
  SearchConsolePanel,
  SeoDiagnosticsPanel,
  SourcesEditor,
} from '@/components/Admin/BlogSeoTools';

const api = '/api';
const articleTypes = ['blog'] as const;
const tourTypes = ['tour'] as const;
const destinationTypes = ['destination'] as const;
const activityTypes = ['activity'] as const;

type PostStatus = 'draft' | 'published';
type EditorTab = 'write' | 'preview';

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  status: PostStatus;
  image_url: string;
  image_alt: string;
  image_caption: string;
  image_credit: string;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  noindex: boolean;
  primary_query: string;
  search_intent: BlogSearchIntent;
  target_reader: string;
  secondary_topics: string;
  cornerstone: boolean;
  cluster_name: string;
  author_name: string;
  author_slug: string;
  author_title: string;
  author_bio: string;
  author_image: string;
  author_expertise: string;
  reviewer_name: string;
  reviewer_slug: string;
  reviewer_title: string;
  reviewer_bio: string;
  reviewed_at: string;
  update_note: string;
  sources: BlogSource[];
  related_articles: BlogLinkTarget[];
  related_tours: BlogLinkTarget[];
  related_destinations: BlogLinkTarget[];
  related_activities: BlogLinkTarget[];
  cta_heading: string;
  cta_body: string;
  cta_label: string;
  cta_url: string;
};

const emptyForm: PostForm = {
  title: '', slug: '', excerpt: '', content: '', category: '', tags: '', status: 'draft',
  image_url: '', image_alt: '', image_caption: '', image_credit: '',
  seo_title: '', seo_description: '', canonical_url: '', noindex: false,
  primary_query: '', search_intent: '', target_reader: '', secondary_topics: '', cornerstone: false, cluster_name: '',
  author_name: 'Zeo Tourism', author_slug: 'zeo-tourism', author_title: 'Travel planning team', author_bio: '', author_image: '', author_expertise: '',
  reviewer_name: '', reviewer_slug: '', reviewer_title: '', reviewer_bio: '', reviewed_at: '', update_note: '',
  sources: [], related_articles: [], related_tours: [], related_destinations: [], related_activities: [],
  cta_heading: 'Plan your journey with a local expert',
  cta_body: 'Get route-specific advice, realistic timing and a trip plan built around your needs.',
  cta_label: 'Talk to an expert', cta_url: '/contact',
};

const splitTags = (tags: string) => tags.split(',').map(tag => tag.trim()).filter(Boolean);
const countWords = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;
const serializeForm = (form: PostForm) => JSON.stringify(form);

const searchIntentOptions: Array<{ value: BlogSearchIntent; label: string }> = [
  { value: '', label: 'Choose the reader goal' },
  { value: 'learn', label: 'Learn about a topic' },
  { value: 'plan', label: 'Plan a trip' },
  { value: 'compare', label: 'Compare options' },
  { value: 'requirements', label: 'Check requirements' },
  { value: 'decide', label: 'Decide when or how to travel' },
  { value: 'book', label: 'Find a suitable package' },
];

const inputClass = 'w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

export default function PostEditor() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const id = params.id || 'new';
  const isEditing = id !== 'new';
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<EditorTab>('write');
  const [initialSerializedForm, setInitialSerializedForm] = useState(serializeForm(emptyForm));
  const [allowSlugEdit, setAllowSlugEdit] = useState(!isEditing);
  const [selectedText, setSelectedText] = useState('');
  const [linkIssueCount, setLinkIssueCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const post = await adminFetch<any>(`${api}/admin/posts/${id}`);
      const seo = parseBlogSeoData(post.seo);
      const loadedForm: PostForm = {
        ...emptyForm,
        title: post.title || '',
        slug: post.slug || slugifyBlogValue(post.title || ''),
        excerpt: post.excerpt || '',
        content: htmlToPlainText(post.content || ''),
        category: post.category || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
        status: post.status === 'published' ? 'published' : 'draft',
        image_url: post.image_url || post.image || '',
        image_alt: seo.imageAlt || '',
        image_caption: seo.imageCaption || '',
        image_credit: seo.imageCredit || '',
        seo_title: seo.title || '',
        seo_description: seo.description || '',
        canonical_url: seo.canonicalUrl || '',
        noindex: Boolean(seo.noindex),
        primary_query: seo.primaryQuery || '',
        search_intent: seo.searchIntent || '',
        target_reader: seo.targetReader || '',
        secondary_topics: (seo.secondaryTopics || []).join(', '),
        cornerstone: Boolean(seo.cornerstone),
        cluster_name: seo.clusterName || '',
        author_name: seo.author?.name || post.author || 'Zeo Tourism',
        author_slug: seo.author?.slug || slugifyBlogValue(seo.author?.name || post.author || 'Zeo Tourism'),
        author_title: seo.author?.title || '',
        author_bio: seo.author?.bio || '',
        author_image: seo.author?.image || '',
        author_expertise: (seo.author?.expertise || []).join(', '),
        reviewer_name: seo.reviewer?.name || '',
        reviewer_slug: seo.reviewer?.slug || '',
        reviewer_title: seo.reviewer?.title || '',
        reviewer_bio: seo.reviewer?.bio || '',
        reviewed_at: seo.reviewedAt?.slice(0, 10) || '',
        update_note: seo.updateNote || '',
        sources: seo.sources || [],
        related_articles: seo.relatedArticles || [],
        related_tours: seo.relatedTours || [],
        related_destinations: seo.relatedDestinations || [],
        related_activities: seo.relatedActivities || [],
        cta_heading: seo.cta?.heading || emptyForm.cta_heading,
        cta_body: seo.cta?.body || emptyForm.cta_body,
        cta_label: seo.cta?.label || emptyForm.cta_label,
        cta_url: seo.cta?.url || emptyForm.cta_url,
      };
      setForm(loadedForm);
      setInitialSerializedForm(serializeForm(loadedForm));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this article.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) load();
    else {
      setForm(emptyForm);
      setInitialSerializedForm(serializeForm(emptyForm));
      setLoading(false);
    }
  }, [isEditing, load]);

  const tags = useMemo(() => splitTags(form.tags), [form.tags]);
  const secondaryTopics = useMemo(() => normalizeTopicList(form.secondary_topics), [form.secondary_topics]);
  const words = useMemo(() => countWords(form.content), [form.content]);
  const readingTime = Math.max(1, Math.ceil(words / 220));
  const articleUrl = `/blog/${form.slug || slugifyBlogValue(form.title) || 'article-link'}`;
  const previewTitle = form.seo_title || form.title || 'Article title will appear here';
  const previewDescription = form.seo_description || form.excerpt || 'Write a short summary so readers understand why this article is useful.';
  const isDirty = serializeForm(form) !== initialSerializedForm;

  const readinessChecks = useMemo(() => buildBlogSeoReadiness({
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt,
    content: form.content,
    imageUrl: form.image_url,
    imageAlt: form.image_alt,
    seoTitle: form.seo_title,
    seoDescription: form.seo_description,
    primaryQuery: form.primary_query,
    searchIntent: form.search_intent,
    targetReader: form.target_reader,
    secondaryTopics,
    authorName: form.author_name,
    reviewerName: form.reviewer_name,
    sourceCount: form.sources.filter(source => source.title.trim() && source.url.trim()).length,
    linkIssueCount,
  }), [form, secondaryTopics, linkIssueCount]);

  const completedChecks = readinessChecks.filter(check => check.complete).length;
  const essentialIssues = readinessChecks.filter(check => check.priority === 'essential' && !check.complete);

  useEffect(() => {
    if (!isDirty || saving) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [isDirty, saving]);

  const updateText = (name: keyof PostForm, value: string) => {
    setForm(previous => {
      const next = { ...previous, [name]: value } as PostForm;
      if (name === 'title' && !isEditing) {
        next.slug = slugifyBlogValue(value);
        if (!previous.seo_title) next.seo_title = value;
      }
      if (name === 'excerpt' && !previous.seo_description) next.seo_description = value;
      if (name === 'author_name' && (!previous.author_slug || previous.author_slug === slugifyBlogValue(previous.author_name))) next.author_slug = slugifyBlogValue(value);
      if (name === 'reviewer_name' && (!previous.reviewer_slug || previous.reviewer_slug === slugifyBlogValue(previous.reviewer_name))) next.reviewer_slug = slugifyBlogValue(value);
      return next;
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (name === 'status') setForm(previous => ({ ...previous, status: value === 'published' ? 'published' : 'draft' }));
    else if (name === 'search_intent') setForm(previous => ({ ...previous, search_intent: value as BlogSearchIntent }));
    else updateText(name as keyof PostForm, value);
  };

  const addTag = () => {
    const clean = tagInput.trim();
    if (!clean) return;
    setForm(previous => ({ ...previous, tags: [...new Set([...splitTags(previous.tags), clean])].join(', ') }));
    setTagInput('');
  };

  const updateSelection = () => {
    const element = textareaRef.current;
    if (!element) return;
    setSelectedText(element.value.slice(element.selectionStart, element.selectionEnd).trim());
  };

  const insertMarkdown = useCallback((value: string, replaceSelection = false) => {
    const element = textareaRef.current;
    setForm(previous => {
      if (!element) return { ...previous, content: `${previous.content}${previous.content ? '\n\n' : ''}${value}` };
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const before = previous.content.slice(0, start);
      const after = previous.content.slice(end);
      const insertion = replaceSelection ? value : `${before && !before.endsWith('\n') ? '\n\n' : ''}${value}`;
      window.requestAnimationFrame(() => {
        element.focus();
        const cursor = before.length + insertion.length;
        element.setSelectionRange(cursor, cursor);
        setSelectedText('');
      });
      return { ...previous, content: `${before}${insertion}${after}` };
    });
  }, []);

  const insertLink = useCallback((target: BlogLinkTarget) => {
    const element = textareaRef.current;
    const anchor = selectedText || target.title;
    const markdown = `[${anchor}](${target.url})`;
    if (element && element.selectionStart !== element.selectionEnd) insertMarkdown(markdown, true);
    else insertMarkdown(markdown, false);
  }, [insertMarkdown, selectedText]);

  const validate = () => {
    if (!form.title.trim()) return 'Please add an article title.';
    if (!form.slug.trim()) return 'Please add a readable article URL.';
    if (!form.excerpt.trim()) return 'Please add a short summary for the article.';
    if (!form.content.trim()) return 'Please write the main article content before saving.';
    return null;
  };

  const savePost = async (statusOverride?: PostStatus) => {
    const validationError = validate();
    if (validationError) return setError(validationError);
    if (statusOverride === 'published' && essentialIssues.length > 0) return setError(`Complete the essential publishing checks: ${essentialIssues.map(check => check.label).join(', ')}.`);

    setSaving(true);
    setError(null);
    try {
      const status = statusOverride || form.status;
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugifyBlogValue(form.title),
        excerpt: form.excerpt.trim(),
        content: form.content,
        category: form.category.trim(),
        tags,
        author: form.author_name.trim() || 'Zeo Tourism',
        reading_time: `${readingTime} min read`,
        status,
        image_url: form.image_url,
        seo: {
          title: (form.seo_title || form.title).trim(),
          description: (form.seo_description || form.excerpt).trim(),
          canonicalUrl: form.canonical_url.trim() || undefined,
          noindex: form.noindex,
          primaryQuery: form.primary_query.trim(),
          searchIntent: form.search_intent || undefined,
          targetReader: form.target_reader.trim(),
          secondaryTopics,
          cornerstone: form.cornerstone,
          clusterName: form.cluster_name.trim(),
          imageAlt: form.image_alt.trim(),
          imageCaption: form.image_caption.trim(),
          imageCredit: form.image_credit.trim(),
          author: {
            name: form.author_name.trim() || 'Zeo Tourism',
            slug: form.author_slug.trim() || slugifyBlogValue(form.author_name || 'Zeo Tourism'),
            title: form.author_title.trim(),
            bio: form.author_bio.trim(),
            image: form.author_image.trim(),
            expertise: normalizeTopicList(form.author_expertise),
          },
          reviewer: form.reviewer_name.trim() ? {
            name: form.reviewer_name.trim(),
            slug: form.reviewer_slug.trim() || slugifyBlogValue(form.reviewer_name),
            title: form.reviewer_title.trim(),
            bio: form.reviewer_bio.trim(),
          } : undefined,
          reviewedAt: form.reviewed_at || undefined,
          updateNote: form.update_note.trim(),
          sources: form.sources.filter(source => source.title.trim() && source.url.trim()),
          relatedArticles: form.related_articles,
          relatedTours: form.related_tours,
          relatedDestinations: form.related_destinations,
          relatedActivities: form.related_activities,
          cta: {
            heading: form.cta_heading.trim(),
            body: form.cta_body.trim(),
            label: form.cta_label.trim(),
            url: form.cta_url.trim(),
          },
        },
      };
      const url = isEditing ? `${api}/admin/posts/${id}` : `${api}/admin/posts`;
      await adminFetch(url, { method: isEditing ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      setInitialSerializedForm(serializeForm({ ...form, status }));
      router.push('/admin/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('entityType', 'post');
      fd.append('slug', form.slug || slugifyBlogValue(form.title) || `post-${Date.now()}`);
      const res = await adminFetchRaw(`${api}/admin/upload`, { method: 'POST', body: fd });
      const uploaded = await res.json();
      setForm(previous => ({ ...previous, image_url: uploaded.url }));
    } catch (err) {
      setError('Image upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const leaveEditor = () => {
    if (isDirty && !window.confirm('Leave without saving your article changes?')) return;
    router.push('/admin/blog');
  };

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <button type="button" onClick={leaveEditor} className="border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" aria-label="Back to blog posts"><ArrowLeft className="h-5 w-5" /></button>
          <div><div className="flex flex-wrap items-center gap-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Complete SEO article editor</p>{isDirty && <span className="bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">Unsaved changes</span>}</div><h1 className="mt-1 text-2xl font-semibold text-gray-950">{isEditing ? 'Edit article' : 'Write a new article'}</h1><p className="mt-1 text-sm text-gray-600">Plan the search purpose, write useful content, connect it to the site and document who verified it.</p></div>
        </div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => savePost('draft')} disabled={saving} className="border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"><Save className="mr-2 inline h-4 w-4" /> {saving ? 'Saving…' : 'Save draft'}</button><button type="button" onClick={() => savePost('published')} disabled={saving} className="bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"><CheckCircle className="mr-2 inline h-4 w-4" /> {saving ? 'Publishing…' : 'Publish article'}</button></div>
      </div>

      {error && <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-4 text-red-800"><AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" /><span>{error}</span></div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={event => { event.preventDefault(); savePost(); }} className="space-y-6">
          <section className="border border-blue-200 bg-blue-50/40 p-6 shadow-sm">
            <SectionTitle icon={<Target className="h-5 w-5" />} number="1" title="Search target" description="Define the reader, purpose and topic cluster before writing. These are planning inputs, not meta keywords." />
            <div className="space-y-5">
              <Field label="Primary search query"><input name="primary_query" value={form.primary_query} onChange={handleChange} placeholder="Example: best time for Kailash Mansarovar yatra" className={inputClass} /></Field>
              <div className="grid gap-5 md:grid-cols-2"><Field label="Reader goal"><select name="search_intent" value={form.search_intent} onChange={handleChange} className={inputClass}>{searchIntentOptions.map(option => <option key={option.value || 'empty'} value={option.value}>{option.label}</option>)}</select></Field><Field label="Target reader"><input name="target_reader" value={form.target_reader} onChange={handleChange} placeholder="First-time pilgrims travelling from India" className={inputClass} /></Field></div>
              <Field label="Supporting topics"><input name="secondary_topics" value={form.secondary_topics} onChange={handleChange} placeholder="Weather by month, permits, preparation, route options" className={inputClass} /></Field>
              <div className="grid gap-5 md:grid-cols-2"><Field label="Topic cluster"><input name="cluster_name" value={form.cluster_name} onChange={handleChange} placeholder="Kailash planning" className={inputClass} /></Field><label className="flex items-center gap-3 border border-blue-100 bg-white p-4 text-sm font-semibold text-slate-800"><input type="checkbox" checked={form.cornerstone} onChange={event => setForm(previous => ({ ...previous, cornerstone: event.target.checked }))} className="h-4 w-4" /> Cornerstone article for this cluster</label></div>
            </div>
          </section>

          <section className="border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle number="2" title="Article basics" description="Set the public title, URL, summary and controlled classification." />
            <div className="space-y-5">
              <Field label="Article title *"><input name="title" value={form.title} onChange={handleChange} required placeholder="Best Time to Visit Kailash Mansarovar" className={inputClass} /></Field>
              <div className="border border-blue-100 bg-blue-50 p-4"><div className="flex items-center justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-semibold text-blue-900"><Link2 className="h-4 w-4" /> Public URL</div><code className="mt-2 block break-all bg-white px-3 py-2 text-sm text-blue-800">{articleUrl}</code></div>{isEditing && <button type="button" onClick={() => setAllowSlugEdit(previous => !previous)} className="border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-800">{allowSlugEdit ? 'Lock URL' : 'Change URL'}</button>}</div>{allowSlugEdit && <div className="mt-3"><input name="slug" value={form.slug} onChange={handleChange} className={inputClass} /><p className="mt-2 text-xs text-amber-800">Changing a published URL creates a permanent redirect from the old slug. Use only when necessary.</p></div>}</div>
              <div className="grid gap-5 md:grid-cols-2"><Field label="Topic or category"><input name="category" value={form.category} onChange={handleChange} placeholder="Kailash Yatra" className={inputClass} /></Field><Field label="Publishing status"><select name="status" value={form.status} onChange={handleChange} className={inputClass}><option value="draft">Draft</option><option value="published">Published</option></select></Field></div>
              <Field label="Short summary *"><textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={3} placeholder="Explain exactly why this guide is useful." className={inputClass} /><p className="mt-1 text-xs text-gray-500">{form.excerpt.length}/160 characters as a practical guide</p></Field>
              <Field label="Article tags"><div className="flex gap-2"><input value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addTag(); } }} placeholder="Type a tag and press Enter" className={inputClass} /><button type="button" onClick={addTag} className="border border-gray-300 px-4 text-sm font-semibold">Add</button></div>{tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{tags.map(tag => <button key={tag} type="button" onClick={() => setForm(previous => ({ ...previous, tags: splitTags(previous.tags).filter(item => item !== tag).join(', ') }))} className="bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{tag} <X className="ml-1 inline h-3 w-3" /></button>)}</div>}</Field>
            </div>
          </section>

          <section className="border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle number="3" title="Cover image" description="Use a representative image for the article, cards and social sharing." />
            <div className="grid gap-6 lg:grid-cols-2"><div className="border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center" onDrop={event => { event.preventDefault(); const file = Array.from(event.dataTransfer.files).find(item => item.type.startsWith('image/')); if (file) handleUpload(file); }} onDragOver={event => event.preventDefault()}><Upload className="mx-auto mb-3 h-8 w-8 text-gray-400" /><p className="text-sm font-semibold">Drop image here</p><input type="file" accept="image/*" className="hidden" id="post-image" onChange={event => { const file = event.target.files?.[0]; if (file) handleUpload(file); }} /><label htmlFor="post-image" className="mt-4 inline-flex cursor-pointer items-center gap-2 bg-green-600 px-4 py-2 text-sm font-semibold text-white"><Camera className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Choose image'}</label></div><div>{form.image_url ? <div className="relative border border-gray-200"><img src={form.image_url} alt={form.image_alt || 'Article cover preview'} className="h-56 w-full object-cover" /><button type="button" onClick={() => setForm(previous => ({ ...previous, image_url: '', image_alt: '', image_caption: '', image_credit: '' }))} className="absolute right-2 top-2 bg-red-600 p-2 text-white"><X className="h-4 w-4" /></button></div> : <div className="flex h-56 items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50"><ImageIcon className="h-8 w-8 text-gray-300" /></div>}</div></div>
            <div className="mt-5 grid gap-5 md:grid-cols-2"><Field label="Image alt text"><input name="image_alt" value={form.image_alt} onChange={handleChange} placeholder="Describe what is visibly shown" className={inputClass} /></Field><Field label="Photo credit"><input name="image_credit" value={form.image_credit} onChange={handleChange} placeholder="Photographer or source" className={inputClass} /></Field></div>
            <div className="mt-5"><Field label="Image caption"><input name="image_caption" value={form.image_caption} onChange={handleChange} placeholder="Optional context shown below the hero image" className={inputClass} /></Field></div>
          </section>

          <section className="border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle number="4" title="Write article" description="Use descriptive sections, verified facts and useful internal links." />
            <div className="mb-4 flex flex-col gap-4"><ContentTemplateButtons onInsert={value => insertMarkdown(value)} /><InternalLinkAssistant currentSlug={form.slug} selectedText={selectedText} onInsert={insertLink} /></div>
            <div className="mb-4 flex items-center justify-between"><div className="inline-flex border border-gray-200 bg-gray-50 p-1"><button type="button" onClick={() => setActiveTab('write')} className={`px-4 py-2 text-sm font-bold ${activeTab === 'write' ? 'bg-primary text-white' : 'text-gray-600'}`}>Write</button><button type="button" onClick={() => setActiveTab('preview')} className={`px-4 py-2 text-sm font-bold ${activeTab === 'preview' ? 'bg-primary text-white' : 'text-gray-600'}`}>Preview</button></div><div className="text-sm text-gray-500">{words} words · about {readingTime} min read</div></div>
            {activeTab === 'write' ? <textarea ref={textareaRef} name="content" value={form.content} onChange={handleChange} onSelect={updateSelection} onKeyUp={updateSelection} rows={28} placeholder="Start with a direct answer, then build practical sections." className="w-full border border-gray-300 px-4 py-4 font-mono text-sm leading-7 text-gray-900 outline-none focus:border-blue-500" /> : <div className="min-h-[420px] border border-gray-200 bg-white p-6">{form.content.trim() ? <MarkdownArticle content={form.content} /> : <p className="text-gray-500">Nothing to preview yet.</p>}</div>}
          </section>

          <section className="border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle icon={<UserRound className="h-5 w-5" />} number="5" title="Authorship, review and freshness" description="Show who wrote the article, who checked it and what changed." />
            <div className="space-y-6">
              <div><h3 className="mb-3 text-sm font-bold text-slate-900">Author profile</h3><div className="grid gap-4 md:grid-cols-2"><Field label="Author name"><input name="author_name" value={form.author_name} onChange={handleChange} className={inputClass} /></Field><Field label="Author profile slug"><input name="author_slug" value={form.author_slug} onChange={handleChange} className={inputClass} /></Field><Field label="Role or title"><input name="author_title" value={form.author_title} onChange={handleChange} placeholder="Kailash travel specialist" className={inputClass} /></Field><Field label="Profile image URL"><input name="author_image" value={form.author_image} onChange={handleChange} className={inputClass} /></Field></div><div className="mt-4"><Field label="Author bio"><textarea name="author_bio" value={form.author_bio} onChange={handleChange} rows={3} className={inputClass} /></Field></div><div className="mt-4"><Field label="Expertise"><input name="author_expertise" value={form.author_expertise} onChange={handleChange} placeholder="Kailash Yatra, Nepal trekking, permit planning" className={inputClass} /></Field></div></div>
              <div className="border-t border-slate-100 pt-6"><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><ShieldCheck className="h-4 w-4 text-green-600" /> Expert reviewer</h3><div className="grid gap-4 md:grid-cols-2"><Field label="Reviewer name"><input name="reviewer_name" value={form.reviewer_name} onChange={handleChange} className={inputClass} /></Field><Field label="Reviewer profile slug"><input name="reviewer_slug" value={form.reviewer_slug} onChange={handleChange} className={inputClass} /></Field><Field label="Reviewer title"><input name="reviewer_title" value={form.reviewer_title} onChange={handleChange} className={inputClass} /></Field><Field label="Reviewed date"><input type="date" name="reviewed_at" value={form.reviewed_at} onChange={handleChange} className={inputClass} /></Field></div><div className="mt-4"><Field label="Reviewer bio or qualification"><textarea name="reviewer_bio" value={form.reviewer_bio} onChange={handleChange} rows={3} className={inputClass} /></Field></div></div>
              <Field label="What changed in this update"><textarea name="update_note" value={form.update_note} onChange={handleChange} rows={3} placeholder="Example: Updated 2026 permit timeline and revised road conditions." className={inputClass} /></Field>
              <SourcesEditor value={form.sources} onChange={sources => setForm(previous => ({ ...previous, sources }))} />
            </div>
          </section>

          <section className="border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle number="6" title="Related content and conversion" description="Choose exact next-step pages instead of relying on unstable keyword guessing." />
            <div className="space-y-4"><RelationPicker label="Related articles" description="Supporting guides that deepen the reader’s understanding." currentSlug={form.slug} allowedTypes={[...articleTypes]} value={form.related_articles} onChange={related_articles => setForm(previous => ({ ...previous, related_articles }))} /><RelationPicker label="Related tours" description="Journeys directly relevant to this article." currentSlug={form.slug} allowedTypes={[...tourTypes]} value={form.related_tours} onChange={related_tours => setForm(previous => ({ ...previous, related_tours }))} /><RelationPicker label="Related destinations" description="Destination pages that help with route research." currentSlug={form.slug} allowedTypes={[...destinationTypes]} value={form.related_destinations} onChange={related_destinations => setForm(previous => ({ ...previous, related_destinations }))} /><RelationPicker label="Related activities" description="Activity pages relevant to the guide." currentSlug={form.slug} allowedTypes={[...activityTypes]} value={form.related_activities} onChange={related_activities => setForm(previous => ({ ...previous, related_activities }))} /></div>
            <div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="CTA heading"><input name="cta_heading" value={form.cta_heading} onChange={handleChange} className={inputClass} /></Field><Field label="CTA button label"><input name="cta_label" value={form.cta_label} onChange={handleChange} className={inputClass} /></Field><Field label="CTA destination"><input name="cta_url" value={form.cta_url} onChange={handleChange} placeholder="/contact" className={inputClass} /></Field><Field label="CTA supporting copy"><textarea name="cta_body" value={form.cta_body} onChange={handleChange} rows={3} className={inputClass} /></Field></div>
          </section>

          <section className="border border-gray-200 bg-white p-6 shadow-sm">
            <SectionTitle number="7" title="Search appearance and indexing" description="Control public metadata, canonicalization and intentional noindex behavior." />
            <div className="space-y-5"><Field label="Search title"><input name="seo_title" value={form.seo_title} onChange={handleChange} placeholder="Leave empty to use article title" className={inputClass} /><p className="mt-1 text-xs text-gray-500">{(form.seo_title || form.title).length} characters</p></Field><Field label="Search description"><textarea name="seo_description" value={form.seo_description} onChange={handleChange} rows={3} placeholder="Leave empty to use short summary" className={inputClass} /><p className="mt-1 text-xs text-gray-500">{(form.seo_description || form.excerpt).length} characters</p></Field><Field label="Canonical URL override"><input name="canonical_url" value={form.canonical_url} onChange={handleChange} placeholder="Leave empty to use the article URL" className={inputClass} /><p className="mt-1 text-xs text-gray-500">Only same-domain canonical URLs are accepted publicly.</p></Field><label className="flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><input type="checkbox" checked={form.noindex} onChange={event => setForm(previous => ({ ...previous, noindex: event.target.checked }))} className="mt-0.5 h-4 w-4" /><span><strong>Exclude this article from search indexing</strong><br /><span className="text-xs">Use for temporary, duplicate or private-purpose content—not as a normal publishing setting.</span></span></label></div>
          </section>
        </form>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <section className="border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-500"><Target className="h-4 w-4" /> Publishing readiness</div><p className="mt-2 text-2xl font-semibold text-gray-950">{completedChecks} of {readinessChecks.length}</p></div><div className={`px-3 py-1 text-xs font-bold ${essentialIssues.length === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>{essentialIssues.length === 0 ? 'Essential ready' : `${essentialIssues.length} essential`}</div></div><div className="mt-4 h-2 overflow-hidden bg-gray-100"><div className="h-full bg-green-600" style={{ width: `${Math.round((completedChecks / readinessChecks.length) * 100)}%` }} /></div><div className="mt-5 space-y-3">{readinessChecks.map(check => <div key={check.id} className="flex items-start gap-2">{check.complete ? <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" /> : <Circle className={`mt-0.5 h-4 w-4 ${check.priority === 'essential' ? 'text-red-500' : 'text-amber-500'}`} />}<div><p className="text-sm font-semibold text-gray-800">{check.label}</p>{!check.complete && <p className="mt-0.5 text-xs leading-5 text-gray-600">{check.help}</p>}</div></div>)}</div></section>
          <SeoDiagnosticsPanel title={form.title} slug={form.slug} content={form.content} primaryQuery={form.primary_query} onIssueCount={setLinkIssueCount} onInsertSuggestion={insertLink} />
          <SearchConsolePanel slug={form.slug} enabled={isEditing} />
          <section className="border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-500"><Search className="h-4 w-4" /> Search preview</div><div className="border border-gray-200 bg-gray-50 p-4"><div className="text-sm text-green-700">zeotourism.com{articleUrl}</div><div className="mt-1 text-lg leading-snug text-blue-700">{previewTitle}</div><p className="mt-1 text-sm leading-6 text-gray-600">{previewDescription}</p></div></section>
          <section className="border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-500"><Eye className="h-4 w-4" /> Article card preview</div><div className="border border-gray-200 bg-white">{form.image_url ? <img src={form.image_url} alt={form.image_alt || 'Preview'} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-gray-100 text-sm text-gray-400">Cover image preview</div>}<div className="p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">{form.category || 'Category'}</div><h2 className="font-serif text-lg font-bold leading-snug text-gray-950">{form.title || 'Article title will appear here'}</h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{form.excerpt || 'Your short summary will appear here.'}</p></div></div></section>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({ number, title, description, icon }: { number: string; title: string; description: string; icon?: React.ReactNode }) {
  return <div className="mb-5 flex items-start gap-3">{icon && <div className="bg-blue-100 p-2 text-blue-700">{icon}</div>}<div><h2 className="text-lg font-semibold text-gray-950">{number}. {title}</h2><p className="mt-1 text-sm text-gray-600">{description}</p></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-800">{label}</span>{children}</label>;
}
