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

const LOCAL_DRAFT_PREFIX = 'zeo-blog-editor:';
const AUTOSAVE_DELAY = 1800;

type PostStatus = 'draft' | 'published';
type WorkspaceTab = 'write' | 'optimize' | 'preview';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

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

type LocalDraft = {
  savedAt: string;
  form: PostForm;
};

type SavedPost = {
  id?: number | string;
  db_id?: number | string;
  slug?: string;
  status?: PostStatus;
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
const localDraftKey = (id: string | null) => `${LOCAL_DRAFT_PREFIX}${id || 'new'}`;

const searchIntentOptions: Array<{ value: BlogSearchIntent; label: string }> = [
  { value: '', label: 'Choose the reader goal' },
  { value: 'learn', label: 'Learn about a topic' },
  { value: 'plan', label: 'Plan a trip' },
  { value: 'compare', label: 'Compare options' },
  { value: 'requirements', label: 'Check requirements' },
  { value: 'decide', label: 'Decide when or how to travel' },
  { value: 'book', label: 'Find a suitable package' },
];

const inputClass = 'w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

function readLocalDraft(key: string): LocalDraft | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalDraft>;
    if (!parsed.form || typeof parsed.savedAt !== 'string') return null;
    return { savedAt: parsed.savedAt, form: { ...emptyForm, ...parsed.form } };
  } catch {
    return null;
  }
}

export default function PostEditor() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const routeId = params.id && params.id !== 'new' ? params.id : null;
  const [postId, setPostId] = useState<string | null>(routeId);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const savingRef = useRef(false);

  const [loading, setLoading] = useState(Boolean(routeId));
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [workspace, setWorkspace] = useState<WorkspaceTab>('write');
  const [initialSerializedForm, setInitialSerializedForm] = useState(serializeForm(emptyForm));
  const [allowSlugEdit, setAllowSlugEdit] = useState(!routeId);
  const [selectedText, setSelectedText] = useState('');
  const [linkIssueCount, setLinkIssueCount] = useState(0);
  const [recoveryChecked, setRecoveryChecked] = useState(false);
  const [pendingRecovery, setPendingRecovery] = useState<LocalDraft | null>(null);

  const draftKey = useMemo(() => localDraftKey(postId), [postId]);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const post = await adminFetch<any>(`${api}/admin/posts/${postId}`);
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

      const local = readLocalDraft(localDraftKey(postId));
      if (local && serializeForm(local.form) !== serializeForm(loadedForm)) setPendingRecovery(local);
      setForm(loadedForm);
      setInitialSerializedForm(serializeForm(loadedForm));
      setSaveState('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this article.');
      setSaveState('error');
    } finally {
      setRecoveryChecked(true);
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      void load();
      return;
    }

    const local = readLocalDraft(localDraftKey(null));
    setForm(emptyForm);
    if (local) setPendingRecovery(local);
    setInitialSerializedForm(serializeForm(emptyForm));
    setRecoveryChecked(true);
    setLoading(false);
  }, [postId, load]);

  const tags = useMemo(() => splitTags(form.tags), [form.tags]);
  const secondaryTopics = useMemo(() => normalizeTopicList(form.secondary_topics), [form.secondary_topics]);
  const words = useMemo(() => countWords(form.content), [form.content]);
  const readingTime = Math.max(1, Math.ceil(words / 220));
  const generatedSlug = form.slug || slugifyBlogValue(form.title);
  const articleUrl = `/blog/${generatedSlug || 'article-link'}`;
  const previewTitle = form.seo_title || form.title || 'Article title will appear here';
  const previewDescription = form.seo_description || form.excerpt || 'Write a short summary so readers understand why this article is useful.';
  const isDirty = serializeForm(form) !== initialSerializedForm;

  const readinessChecks = useMemo(() => buildBlogSeoReadiness({
    title: form.title,
    slug: generatedSlug,
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
  }), [form, generatedSlug, secondaryTopics, linkIssueCount]);

  const completedChecks = readinessChecks.filter(check => check.complete).length;
  const essentialIssues = readinessChecks.filter(check => check.priority === 'essential' && !check.complete);
  const recommendationIssues = readinessChecks.filter(check => check.priority === 'improvement' && !check.complete);

  useEffect(() => {
    if (!recoveryChecked || pendingRecovery) return;
    const timer = window.setTimeout(() => {
      const local: LocalDraft = { savedAt: new Date().toISOString(), form };
      window.localStorage.setItem(draftKey, JSON.stringify(local));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draftKey, form, pendingRecovery, recoveryChecked]);

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
      if (name === 'title' && !postId) {
        next.slug = slugifyBlogValue(value);
        if (!previous.seo_title) next.seo_title = value;
      }
      if (name === 'excerpt' && !previous.seo_description) next.seo_description = value;
      if (name === 'author_name' && (!previous.author_slug || previous.author_slug === slugifyBlogValue(previous.author_name))) next.author_slug = slugifyBlogValue(value);
      if (name === 'reviewer_name' && (!previous.reviewer_slug || previous.reviewer_slug === slugifyBlogValue(previous.reviewer_name))) next.reviewer_slug = slugifyBlogValue(value);
      return next;
    });
    setSaveState('idle');
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
    setSaveState('idle');
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
    setSaveState('idle');
  }, []);

  const insertLink = useCallback((target: BlogLinkTarget) => {
    const element = textareaRef.current;
    const anchor = selectedText || target.title;
    const markdown = `[${anchor}](${target.url})`;
    if (element && element.selectionStart !== element.selectionEnd) insertMarkdown(markdown, true);
    else insertMarkdown(markdown, false);
  }, [insertMarkdown, selectedText]);

  const buildPayload = useCallback((status: PostStatus, sourceForm = form) => {
    const title = sourceForm.title.trim() || 'Untitled article';
    const slug = sourceForm.slug.trim() || slugifyBlogValue(title) || `untitled-article-${Date.now()}`;
    const sourceTags = splitTags(sourceForm.tags);
    const sourceSecondaryTopics = normalizeTopicList(sourceForm.secondary_topics);
    const sourceReadingTime = Math.max(1, Math.ceil(countWords(sourceForm.content) / 220));

    return {
      normalizedForm: { ...sourceForm, title, slug, status },
      payload: {
        title,
        slug,
        excerpt: sourceForm.excerpt.trim(),
        content: sourceForm.content,
        category: sourceForm.category.trim(),
        tags: sourceTags,
        author: sourceForm.author_name.trim() || 'Zeo Tourism',
        reading_time: `${sourceReadingTime} min read`,
        status,
        image_url: sourceForm.image_url,
        seo: {
          title: (sourceForm.seo_title || title).trim(),
          description: (sourceForm.seo_description || sourceForm.excerpt).trim(),
          canonicalUrl: sourceForm.canonical_url.trim() || undefined,
          noindex: sourceForm.noindex,
          primaryQuery: sourceForm.primary_query.trim(),
          searchIntent: sourceForm.search_intent || undefined,
          targetReader: sourceForm.target_reader.trim(),
          secondaryTopics: sourceSecondaryTopics,
          cornerstone: sourceForm.cornerstone,
          clusterName: sourceForm.cluster_name.trim(),
          imageAlt: sourceForm.image_alt.trim(),
          imageCaption: sourceForm.image_caption.trim(),
          imageCredit: sourceForm.image_credit.trim(),
          author: {
            name: sourceForm.author_name.trim() || 'Zeo Tourism',
            slug: sourceForm.author_slug.trim() || slugifyBlogValue(sourceForm.author_name || 'Zeo Tourism'),
            title: sourceForm.author_title.trim(),
            bio: sourceForm.author_bio.trim(),
            image: sourceForm.author_image.trim(),
            expertise: normalizeTopicList(sourceForm.author_expertise),
          },
          reviewer: sourceForm.reviewer_name.trim() ? {
            name: sourceForm.reviewer_name.trim(),
            slug: sourceForm.reviewer_slug.trim() || slugifyBlogValue(sourceForm.reviewer_name),
            title: sourceForm.reviewer_title.trim(),
            bio: sourceForm.reviewer_bio.trim(),
          } : undefined,
          reviewedAt: sourceForm.reviewed_at || undefined,
          updateNote: sourceForm.update_note.trim(),
          sources: sourceForm.sources.filter(source => source.title.trim() && source.url.trim()),
          relatedArticles: sourceForm.related_articles,
          relatedTours: sourceForm.related_tours,
          relatedDestinations: sourceForm.related_destinations,
          relatedActivities: sourceForm.related_activities,
          cta: {
            heading: sourceForm.cta_heading.trim(),
            body: sourceForm.cta_body.trim(),
            label: sourceForm.cta_label.trim(),
            url: sourceForm.cta_url.trim(),
          },
        },
      },
    };
  }, [form]);

  const persistPost = useCallback(async (status: PostStatus, silent = false) => {
    if (savingRef.current) return;
    if (status === 'published') {
      if (!form.title.trim()) {
        setWorkspace('write');
        return setError('Add an article title before publishing.');
      }
      if (!form.excerpt.trim()) {
        setWorkspace('write');
        return setError('Add a short summary before publishing.');
      }
      if (!form.content.trim()) {
        setWorkspace('write');
        return setError('Write the article before publishing.');
      }
      if (essentialIssues.length > 0) {
        setWorkspace('optimize');
        return setError(`Complete the essential publishing checks: ${essentialIssues.map(check => check.label).join(', ')}.`);
      }
    }

    savingRef.current = true;
    setSaving(true);
    setSaveState('saving');
    if (!silent) setError(null);

    try {
      const { normalizedForm, payload } = buildPayload(status);
      const url = postId ? `${api}/admin/posts/${postId}` : `${api}/admin/posts`;
      const saved = await adminFetch<SavedPost>(url, {
        method: postId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      setForm(normalizedForm);
      setInitialSerializedForm(serializeForm(normalizedForm));
      setLastSavedAt(new Date());
      setSaveState('saved');
      window.localStorage.removeItem(draftKey);

      const createdId = saved.id ?? saved.db_id;
      if (!postId && createdId !== undefined && createdId !== null) {
        const nextId = String(createdId);
        window.localStorage.removeItem(localDraftKey(null));
        setPostId(nextId);
        setAllowSlugEdit(false);
        router.replace(`/admin/blog/edit/${nextId}`);
      }
    } catch (err) {
      setSaveState('error');
      if (!silent) setError(err instanceof Error ? err.message : 'Could not save this article. Please try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [buildPayload, draftKey, essentialIssues, form, postId, router]);

  useEffect(() => {
    if (!recoveryChecked || pendingRecovery || loading || saving || !isDirty) return;
    if (form.status !== 'draft' || !form.title.trim()) return;
    const timer = window.setTimeout(() => void persistPost('draft', true), AUTOSAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [form.status, form.title, isDirty, loading, pendingRecovery, persistPost, recoveryChecked, saving]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      void persistPost(form.status === 'published' ? 'published' : 'draft');
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [form.status, persistPost]);

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
      setSaveState('idle');
    } catch (err) {
      setError('Image upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const restoreRecovery = () => {
    if (!pendingRecovery) return;
    setForm(pendingRecovery.form);
    setPendingRecovery(null);
    setSaveState('idle');
  };

  const dismissRecovery = () => {
    window.localStorage.removeItem(draftKey);
    setPendingRecovery(null);
  };

  const leaveEditor = () => {
    if (isDirty && !window.confirm('Leave without saving your article changes? A local recovery copy is available on this device.')) return;
    router.push('/admin/blog');
  };

  const saveLabel = saveState === 'saving'
    ? 'Saving…'
    : saveState === 'error'
      ? 'Save failed'
      : isDirty
        ? form.status === 'draft' ? 'Autosaving draft…' : 'Unsaved changes · stored locally'
        : lastSavedAt
          ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'All changes saved';

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5 pb-16">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button type="button" onClick={leaveEditor} className="border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" aria-label="Back to blog posts"><ArrowLeft className="h-5 w-5" /></button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${form.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>{form.status}</span>
                <span className={`text-xs font-semibold ${saveState === 'error' ? 'text-red-700' : isDirty ? 'text-amber-700' : 'text-slate-500'}`}>{saveLabel}</span>
              </div>
              <h1 className="mt-1 truncate text-xl font-semibold text-slate-950">{form.title || 'Untitled article'}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex border border-slate-200 bg-slate-50 p-1">
              <WorkspaceButton active={workspace === 'write'} onClick={() => setWorkspace('write')}>Write</WorkspaceButton>
              <WorkspaceButton active={workspace === 'optimize'} onClick={() => setWorkspace('optimize')}>Optimize {recommendationIssues.length > 0 ? `(${recommendationIssues.length})` : ''}</WorkspaceButton>
              <WorkspaceButton active={workspace === 'preview'} onClick={() => setWorkspace('preview')}>Preview</WorkspaceButton>
            </div>
            <button type="button" onClick={() => void persistPost(form.status === 'published' ? 'published' : 'draft')} disabled={saving} className="border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"><Save className="mr-2 inline h-4 w-4" /> {form.status === 'published' ? 'Save changes' : 'Save draft'}</button>
            <button type="button" onClick={() => void persistPost('published')} disabled={saving} className="bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"><CheckCircle className="mr-2 inline h-4 w-4" /> Publish</button>
          </div>
        </div>
      </header>

      {pendingRecovery && (
        <div className="flex flex-col gap-3 border border-blue-200 bg-blue-50 p-4 text-blue-950 md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm font-bold">A local recovery copy is available</p><p className="mt-1 text-xs text-blue-800">Saved on this device {new Date(pendingRecovery.savedAt).toLocaleString()}.</p></div>
          <div className="flex gap-2"><button type="button" onClick={dismissRecovery} className="border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-800">Discard</button><button type="button" onClick={restoreRecovery} className="bg-blue-700 px-3 py-2 text-xs font-bold text-white">Restore draft</button></div>
        </div>
      )}

      {error && <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-4 text-red-800"><AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" /><span>{error}</span><button type="button" onClick={() => setError(null)} className="ml-auto" aria-label="Dismiss error"><X className="h-4 w-4" /></button></div>}

      {workspace === 'write' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-5">
            <section className="border border-slate-200 bg-white p-6 shadow-sm">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Article title"
                className="w-full border-0 border-b border-slate-200 px-0 pb-4 font-serif text-3xl font-bold leading-tight text-slate-950 outline-none placeholder:text-slate-300 focus:border-blue-500"
              />
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows={2}
                placeholder="Add a short summary for readers and search previews…"
                className="mt-4 w-full resize-none border-0 px-0 text-base leading-7 text-slate-600 outline-none placeholder:text-slate-400"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>{words} words</span><span>·</span><span>about {readingTime} min read</span><span>·</span><span>{form.excerpt.length}/160 summary characters</span>
              </div>
            </section>

            <section className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div><h2 className="text-lg font-semibold text-slate-950">Write article</h2><p className="mt-1 text-sm text-slate-600">Write first. SEO and publishing controls are available in Optimize.</p></div>
                <button type="button" onClick={() => setWorkspace('preview')} className="inline-flex items-center gap-2 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"><Eye className="h-4 w-4" /> Preview article</button>
              </div>
              <ContentTemplateButtons onInsert={value => insertMarkdown(value)} />
              <textarea
                ref={textareaRef}
                name="content"
                value={form.content}
                onChange={handleChange}
                onSelect={updateSelection}
                onKeyUp={updateSelection}
                rows={32}
                placeholder="Start with a direct answer, then add helpful sections. You can paste Markdown or plain text."
                className="mt-4 w-full border border-gray-300 px-5 py-5 text-base leading-8 text-gray-900 outline-none focus:border-blue-500"
              />
            </section>

            <details className="border border-slate-200 bg-white shadow-sm">
              <summary className="cursor-pointer px-6 py-4 text-sm font-bold text-slate-900">Article settings and cover image</summary>
              <div className="space-y-6 border-t border-slate-100 p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Category"><input name="category" value={form.category} onChange={handleChange} placeholder="Kailash Yatra" className={inputClass} /></Field>
                  <Field label="Public URL"><div className="border border-blue-100 bg-blue-50 p-3"><code className="block break-all text-xs text-blue-800">{articleUrl}</code>{postId && <button type="button" onClick={() => setAllowSlugEdit(previous => !previous)} className="mt-2 text-xs font-bold text-blue-800 underline">{allowSlugEdit ? 'Lock URL' : 'Change URL'}</button>}</div></Field>
                </div>
                {allowSlugEdit && <Field label="URL slug"><input name="slug" value={form.slug} onChange={handleChange} className={inputClass} /><p className="mt-2 text-xs text-amber-800">Changing a published URL creates a permanent redirect from the old address.</p></Field>}
                <Field label="Tags"><div className="flex gap-2"><input value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addTag(); } }} placeholder="Type a tag and press Enter" className={inputClass} /><button type="button" onClick={addTag} className="border border-gray-300 px-4 text-sm font-semibold">Add</button></div>{tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{tags.map(tag => <button key={tag} type="button" onClick={() => setForm(previous => ({ ...previous, tags: splitTags(previous.tags).filter(item => item !== tag).join(', ') }))} className="bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{tag} <X className="ml-1 inline h-3 w-3" /></button>)}</div>}</Field>
                <CoverImageEditor form={form} uploading={uploading} onUpload={handleUpload} onRemove={() => setForm(previous => ({ ...previous, image_url: '', image_alt: '', image_caption: '', image_credit: '' }))} onChange={handleChange} />
              </div>
            </details>
          </main>

          <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
            <section className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500"><CheckCircle className="h-4 w-4" /> Writing progress</div>
              <div className="mt-4 space-y-3">
                <ProgressItem complete={Boolean(form.title.trim())} label="Article title" />
                <ProgressItem complete={Boolean(form.content.trim())} label="Main article" />
                <ProgressItem complete={form.excerpt.trim().length >= 60} label="Useful summary" />
                <ProgressItem complete={Boolean(form.image_url.trim())} label="Cover image" optional />
              </div>
              <button type="button" onClick={() => setWorkspace('optimize')} className="mt-5 w-full border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800 hover:bg-blue-100">Review SEO and publishing</button>
            </section>

            <ArticleCardPreview form={form} />
          </aside>
        </div>
      )}

      {workspace === 'optimize' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <main className="space-y-5">
            <section className="border border-blue-200 bg-blue-50/40 p-6 shadow-sm">
              <SectionTitle icon={<Target className="h-5 w-5" />} title="Search target" description="Optional planning inputs that help the article stay focused." />
              <div className="space-y-5">
                <Field label="Primary search query"><input name="primary_query" value={form.primary_query} onChange={handleChange} placeholder="Example: best time for Kailash Mansarovar yatra" className={inputClass} /></Field>
                <div className="grid gap-5 md:grid-cols-2"><Field label="Reader goal"><select name="search_intent" value={form.search_intent} onChange={handleChange} className={inputClass}>{searchIntentOptions.map(option => <option key={option.value || 'empty'} value={option.value}>{option.label}</option>)}</select></Field><Field label="Target reader"><input name="target_reader" value={form.target_reader} onChange={handleChange} placeholder="First-time pilgrims travelling from India" className={inputClass} /></Field></div>
                <Field label="Supporting topics"><input name="secondary_topics" value={form.secondary_topics} onChange={handleChange} placeholder="Weather by month, permits, preparation, route options" className={inputClass} /></Field>
              </div>
            </section>

            <section className="border border-slate-200 bg-white p-6 shadow-sm">
              <SectionTitle icon={<Link2 className="h-5 w-5" />} title="Internal links" description="Connect readers to the most useful Zeo pages without leaving the editor." />
              <InternalLinkAssistant currentSlug={form.slug} selectedText={selectedText} onInsert={insertLink} />
            </section>

            <details open className="border border-slate-200 bg-white shadow-sm">
              <summary className="cursor-pointer px-6 py-4 text-sm font-bold text-slate-900">Search appearance</summary>
              <div className="space-y-5 border-t border-slate-100 p-6">
                <Field label="Search title"><input name="seo_title" value={form.seo_title} onChange={handleChange} placeholder="Uses article title when empty" className={inputClass} /><p className="mt-1 text-xs text-gray-500">{(form.seo_title || form.title).length} characters</p></Field>
                <Field label="Search description"><textarea name="seo_description" value={form.seo_description} onChange={handleChange} rows={3} placeholder="Uses short summary when empty" className={inputClass} /><p className="mt-1 text-xs text-gray-500">{(form.seo_description || form.excerpt).length} characters</p></Field>
              </div>
            </details>

            <details className="border border-slate-200 bg-white shadow-sm">
              <summary className="cursor-pointer px-6 py-4 text-sm font-bold text-slate-900">Author, reviewer and sources</summary>
              <div className="space-y-6 border-t border-slate-100 p-6">
                <div><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><UserRound className="h-4 w-4 text-blue-600" /> Author</h3><div className="grid gap-4 md:grid-cols-2"><Field label="Author name"><input name="author_name" value={form.author_name} onChange={handleChange} className={inputClass} /></Field><Field label="Role or title"><input name="author_title" value={form.author_title} onChange={handleChange} placeholder="Kailash travel specialist" className={inputClass} /></Field></div><div className="mt-4"><Field label="Author bio"><textarea name="author_bio" value={form.author_bio} onChange={handleChange} rows={3} className={inputClass} /></Field></div></div>
                <div className="border-t border-slate-100 pt-6"><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><ShieldCheck className="h-4 w-4 text-green-600" /> Expert reviewer</h3><div className="grid gap-4 md:grid-cols-2"><Field label="Reviewer name"><input name="reviewer_name" value={form.reviewer_name} onChange={handleChange} className={inputClass} /></Field><Field label="Reviewer title"><input name="reviewer_title" value={form.reviewer_title} onChange={handleChange} className={inputClass} /></Field><Field label="Reviewed date"><input type="date" name="reviewed_at" value={form.reviewed_at} onChange={handleChange} className={inputClass} /></Field><Field label="What changed"><input name="update_note" value={form.update_note} onChange={handleChange} placeholder="Updated permit dates and road conditions" className={inputClass} /></Field></div></div>
                <SourcesEditor value={form.sources} onChange={sources => setForm(previous => ({ ...previous, sources }))} />
              </div>
            </details>

            <details className="border border-slate-200 bg-white shadow-sm">
              <summary className="cursor-pointer px-6 py-4 text-sm font-bold text-slate-900">Related content and conversion</summary>
              <div className="space-y-4 border-t border-slate-100 p-6"><RelationPicker label="Related articles" description="Supporting guides that deepen the reader’s understanding." currentSlug={form.slug} allowedTypes={[...articleTypes]} value={form.related_articles} onChange={related_articles => setForm(previous => ({ ...previous, related_articles }))} /><RelationPicker label="Related tours" description="Journeys directly relevant to this article." currentSlug={form.slug} allowedTypes={[...tourTypes]} value={form.related_tours} onChange={related_tours => setForm(previous => ({ ...previous, related_tours }))} /><RelationPicker label="Related destinations" description="Destination pages that help with route research." currentSlug={form.slug} allowedTypes={[...destinationTypes]} value={form.related_destinations} onChange={related_destinations => setForm(previous => ({ ...previous, related_destinations }))} /><RelationPicker label="Related activities" description="Activity pages relevant to the guide." currentSlug={form.slug} allowedTypes={[...activityTypes]} value={form.related_activities} onChange={related_activities => setForm(previous => ({ ...previous, related_activities }))} /></div>
            </details>

            <details className="border border-slate-200 bg-white shadow-sm">
              <summary className="cursor-pointer px-6 py-4 text-sm font-bold text-slate-900">Advanced SEO and publishing controls</summary>
              <div className="space-y-5 border-t border-slate-100 p-6">
                <div className="grid gap-5 md:grid-cols-2"><Field label="Topic cluster"><input name="cluster_name" value={form.cluster_name} onChange={handleChange} placeholder="Kailash planning" className={inputClass} /></Field><label className="flex items-center gap-3 border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-slate-800"><input type="checkbox" checked={form.cornerstone} onChange={event => setForm(previous => ({ ...previous, cornerstone: event.target.checked }))} className="h-4 w-4" /> Cornerstone article</label></div>
                <Field label="Canonical URL override"><input name="canonical_url" value={form.canonical_url} onChange={handleChange} placeholder="Leave empty to use the article URL" className={inputClass} /></Field>
                <label className="flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><input type="checkbox" checked={form.noindex} onChange={event => setForm(previous => ({ ...previous, noindex: event.target.checked }))} className="mt-0.5 h-4 w-4" /><span><strong>Exclude this article from search indexing</strong><br /><span className="text-xs">Use only for temporary, duplicate or private-purpose content.</span></span></label>
                <div className="grid gap-4 md:grid-cols-2"><Field label="CTA heading"><input name="cta_heading" value={form.cta_heading} onChange={handleChange} className={inputClass} /></Field><Field label="CTA button label"><input name="cta_label" value={form.cta_label} onChange={handleChange} className={inputClass} /></Field><Field label="CTA destination"><input name="cta_url" value={form.cta_url} onChange={handleChange} placeholder="/contact" className={inputClass} /></Field><Field label="CTA supporting copy"><textarea name="cta_body" value={form.cta_body} onChange={handleChange} rows={3} className={inputClass} /></Field></div>
              </div>
            </details>
          </main>

          <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
            <ReadinessPanel checks={readinessChecks} completed={completedChecks} essentialIssues={essentialIssues.length} />
            <SeoDiagnosticsPanel title={form.title} slug={form.slug} content={form.content} primaryQuery={form.primary_query} onIssueCount={setLinkIssueCount} onInsertSuggestion={insertLink} />
            <SearchConsolePanel slug={form.slug} enabled={Boolean(postId)} />
            <SearchPreview articleUrl={articleUrl} title={previewTitle} description={previewDescription} />
          </aside>
        </div>
      )}

      {workspace === 'preview' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            {form.image_url && <img src={form.image_url} alt={form.image_alt || form.title || 'Article cover'} className="mb-8 h-auto max-h-[520px] w-full object-cover" />}
            <div className="mx-auto max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">{form.category || 'Travel guide'}</p>
              <h1 className="mt-3 font-serif text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">{form.title || 'Untitled article'}</h1>
              {form.excerpt && <p className="mt-5 text-xl leading-8 text-slate-600">{form.excerpt}</p>}
              <div className="mt-5 border-b border-slate-200 pb-5 text-sm text-slate-500">{form.author_name || 'Zeo Tourism'} · {readingTime} min read</div>
              <div className="mt-8">{form.content.trim() ? <MarkdownArticle content={form.content} /> : <p className="text-slate-500">Nothing to preview yet.</p>}</div>
            </div>
          </main>
          <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
            <ReadinessPanel checks={readinessChecks} completed={completedChecks} essentialIssues={essentialIssues.length} />
            <SearchPreview articleUrl={articleUrl} title={previewTitle} description={previewDescription} />
            <ArticleCardPreview form={form} />
            <button type="button" onClick={() => void persistPost('published')} disabled={saving} className="w-full bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"><CheckCircle className="mr-2 inline h-4 w-4" /> Publish article</button>
          </aside>
        </div>
      )}
    </div>
  );
}

function WorkspaceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`px-4 py-2 text-sm font-bold transition ${active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-white'}`}>{children}</button>;
}

function SectionTitle({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return <div className="mb-5 flex items-start gap-3">{icon && <div className="bg-blue-100 p-2 text-blue-700">{icon}</div>}<div><h2 className="text-lg font-semibold text-gray-950">{title}</h2><p className="mt-1 text-sm text-gray-600">{description}</p></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-800">{label}</span>{children}</label>;
}

function ProgressItem({ complete, label, optional = false }: { complete: boolean; label: string; optional?: boolean }) {
  return <div className="flex items-start gap-2">{complete ? <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" /> : <Circle className="mt-0.5 h-4 w-4 text-slate-300" />}<div><p className="text-sm font-semibold text-slate-800">{label}</p>{optional && !complete && <p className="text-xs text-slate-500">Recommended</p>}</div></div>;
}

function CoverImageEditor({ form, uploading, onUpload, onRemove, onChange }: { form: PostForm; uploading: boolean; onUpload: (file: File) => void; onRemove: () => void; onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-slate-900">Cover image</h3>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center" onDrop={event => { event.preventDefault(); const file = Array.from(event.dataTransfer.files).find(item => item.type.startsWith('image/')); if (file) onUpload(file); }} onDragOver={event => event.preventDefault()}>
          <Upload className="mx-auto mb-3 h-8 w-8 text-gray-400" /><p className="text-sm font-semibold">Drop image here</p><input type="file" accept="image/*" className="hidden" id="post-image" onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(file); }} /><label htmlFor="post-image" className="mt-4 inline-flex cursor-pointer items-center gap-2 bg-green-600 px-4 py-2 text-sm font-semibold text-white"><Camera className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Choose image'}</label>
        </div>
        <div>{form.image_url ? <div className="relative border border-gray-200"><img src={form.image_url} alt={form.image_alt || 'Article cover preview'} className="h-56 w-full object-cover" /><button type="button" onClick={onRemove} className="absolute right-2 top-2 bg-red-600 p-2 text-white" aria-label="Remove cover image"><X className="h-4 w-4" /></button></div> : <div className="flex h-56 items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50"><ImageIcon className="h-8 w-8 text-gray-300" /></div>}</div>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2"><Field label="Image alt text"><input name="image_alt" value={form.image_alt} onChange={onChange} placeholder="Describe what is visibly shown" className={inputClass} /></Field><Field label="Photo credit"><input name="image_credit" value={form.image_credit} onChange={onChange} placeholder="Photographer or source" className={inputClass} /></Field></div>
      <div className="mt-5"><Field label="Image caption"><input name="image_caption" value={form.image_caption} onChange={onChange} placeholder="Optional context shown below the image" className={inputClass} /></Field></div>
    </div>
  );
}

function ReadinessPanel({ checks, completed, essentialIssues }: { checks: ReturnType<typeof buildBlogSeoReadiness>; completed: number; essentialIssues: number }) {
  return (
    <section className="border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-500"><Target className="h-4 w-4" /> Publishing readiness</div><p className="mt-2 text-2xl font-semibold text-gray-950">{completed} of {checks.length}</p></div><div className={`px-3 py-1 text-xs font-bold ${essentialIssues === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>{essentialIssues === 0 ? 'Essential ready' : `${essentialIssues} essential`}</div></div>
      <div className="mt-4 h-2 overflow-hidden bg-gray-100"><div className="h-full bg-green-600" style={{ width: `${Math.round((completed / checks.length) * 100)}%` }} /></div>
      <div className="mt-5 space-y-3">{checks.map(check => <div key={check.id} className="flex items-start gap-2">{check.complete ? <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" /> : <Circle className={`mt-0.5 h-4 w-4 ${check.priority === 'essential' ? 'text-red-500' : 'text-amber-500'}`} />}<div><p className="text-sm font-semibold text-gray-800">{check.label}</p>{!check.complete && <p className="mt-0.5 text-xs leading-5 text-gray-600">{check.help}</p>}</div></div>)}</div>
    </section>
  );
}

function SearchPreview({ articleUrl, title, description }: { articleUrl: string; title: string; description: string }) {
  return <section className="border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-500"><Search className="h-4 w-4" /> Search preview</div><div className="border border-gray-200 bg-gray-50 p-4"><div className="break-all text-sm text-green-700">zeotourism.com{articleUrl}</div><div className="mt-1 text-lg leading-snug text-blue-700">{title}</div><p className="mt-1 text-sm leading-6 text-gray-600">{description}</p></div></section>;
}

function ArticleCardPreview({ form }: { form: PostForm }) {
  return <section className="border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-500"><Eye className="h-4 w-4" /> Article card</div><div className="border border-gray-200 bg-white">{form.image_url ? <img src={form.image_url} alt={form.image_alt || 'Preview'} className="h-40 w-full object-cover" /> : <div className="flex h-40 items-center justify-center bg-gray-100 text-sm text-gray-400">Cover image preview</div>}<div className="p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">{form.category || 'Category'}</div><h2 className="font-serif text-lg font-bold leading-snug text-gray-950">{form.title || 'Article title will appear here'}</h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{form.excerpt || 'Your short summary will appear here.'}</p></div></div></section>;
}
