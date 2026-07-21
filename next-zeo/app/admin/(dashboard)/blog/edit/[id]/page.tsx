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
    Target,
    Upload,
    X,
} from 'lucide-react';
import { adminFetch, adminFetchRaw } from '@/lib/adminFetch';
import { htmlToPlainText } from '@/lib/blogMarkdown';
import {
    buildBlogSeoReadiness,
    normalizeTopicList,
    type BlogSearchIntent,
} from '@/lib/blogSeo';
import MarkdownArticle from '@/components/Blog/MarkdownArticle';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const api = '/api';

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
    seo_title: string;
    seo_description: string;
    primary_query: string;
    search_intent: BlogSearchIntent;
    target_reader: string;
    secondary_topics: string;
};

const emptyForm: PostForm = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft',
    image_url: '',
    image_alt: '',
    seo_title: '',
    seo_description: '',
    primary_query: '',
    search_intent: '',
    target_reader: '',
    secondary_topics: '',
};

const genSlug = (title: string) => title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

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

const PostEditor: React.FC = () => {
    const params = useParams<{ id?: string }>();
    const router = useRouter();
    const id = params.id || 'new';
    const isEditing = id !== 'new';

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState<PostForm>(emptyForm);
    const [tagInput, setTagInput] = useState('');
    const [activeTab, setActiveTab] = useState<EditorTab>('write');
    const initialSnapshot = useRef(serializeForm(emptyForm));

    const load = useCallback(async () => {
        try {
            const post = await adminFetch<any>(`${api}/admin/posts/${id}`);
            const tags = Array.isArray(post.tags) ? post.tags.join(', ') : '';
            const seo = post.seo || {};
            const loadedForm: PostForm = {
                title: post.title || '',
                slug: post.slug || genSlug(post.title || ''),
                excerpt: post.excerpt || '',
                content: htmlToPlainText(post.content || ''),
                category: post.category || '',
                tags,
                status: post.status === 'published' ? 'published' : 'draft',
                image_url: post.image_url || post.image || '',
                image_alt: seo.imageAlt || '',
                seo_title: seo.title || '',
                seo_description: seo.description || '',
                primary_query: seo.primaryQuery || '',
                search_intent: searchIntentOptions.some(option => option.value === seo.searchIntent)
                    ? seo.searchIntent
                    : '',
                target_reader: seo.targetReader || '',
                secondary_topics: Array.isArray(seo.secondaryTopics) ? seo.secondaryTopics.join(', ') : '',
            };
            initialSnapshot.current = serializeForm(loadedForm);
            setForm(loadedForm);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Could not load this article.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (isEditing) load();
        else {
            initialSnapshot.current = serializeForm(emptyForm);
            setLoading(false);
        }
    }, [load, isEditing]);

    const tags = useMemo(() => splitTags(form.tags), [form.tags]);
    const secondaryTopics = useMemo(() => normalizeTopicList(form.secondary_topics), [form.secondary_topics]);
    const words = useMemo(() => countWords(form.content), [form.content]);
    const readingTime = Math.max(1, Math.ceil(words / 220));
    const previewTitle = form.seo_title || form.title || 'Article title will appear here';
    const previewDescription = form.seo_description || form.excerpt || 'Write a short summary so readers understand why this article is useful.';
    const articleUrl = `/blog/${form.slug || genSlug(form.title) || 'article-link'}`;
    const isDirty = serializeForm(form) !== initialSnapshot.current;

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
    }), [form, secondaryTopics]);

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

    const updateField = (name: keyof PostForm, value: string) => {
        setForm(previous => {
            const next = { ...previous };
            if (name === 'status') next.status = value === 'published' ? 'published' : 'draft';
            else if (name === 'search_intent') next.search_intent = value as BlogSearchIntent;
            else next[name] = value as never;

            if (name === 'title' && !isEditing) {
                next.slug = genSlug(value);
                if (!previous.seo_title) next.seo_title = value;
            }
            if (name === 'excerpt' && !previous.seo_description) next.seo_description = value;
            return next;
        });
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        updateField(name as keyof PostForm, value);
    };

    const addTag = () => {
        const clean = tagInput.trim();
        if (!clean) return;
        const nextTags = [...new Set([...tags, clean])];
        setForm(previous => ({ ...previous, tags: nextTags.join(', ') }));
        setTagInput('');
    };

    const removeTag = (tag: string) => {
        setForm(previous => ({ ...previous, tags: splitTags(previous.tags).filter(item => item !== tag).join(', ') }));
    };

    const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addTag();
        }
    };

    const validate = () => {
        if (!form.title.trim()) return 'Please add an article title.';
        if (!form.slug.trim()) return 'Article link could not be generated. Please update the title.';
        if (!form.excerpt.trim()) return 'Please add a short summary for the article.';
        if (!form.content.trim()) return 'Please write the main article content before saving.';
        return null;
    };

    const savePost = async (statusOverride?: PostStatus) => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (statusOverride === 'published' && essentialIssues.length > 0) {
            setError(`Complete the essential publishing checks: ${essentialIssues.map(check => check.label).join(', ')}.`);
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const status = statusOverride || form.status;
            const payload = {
                title: form.title.trim(),
                slug: form.slug.trim() || genSlug(form.title),
                excerpt: form.excerpt.trim(),
                content: form.content,
                category: form.category.trim(),
                tags,
                status,
                image_url: form.image_url,
                seo: {
                    title: (form.seo_title || form.title).trim(),
                    description: (form.seo_description || form.excerpt).trim(),
                    primaryQuery: form.primary_query.trim(),
                    searchIntent: form.search_intent || undefined,
                    targetReader: form.target_reader.trim(),
                    secondaryTopics,
                    imageAlt: form.image_alt.trim(),
                },
            };
            const url = isEditing ? `${api}/admin/posts/${id}` : `${api}/admin/posts`;
            await adminFetch(url, { method: isEditing ? 'PUT' : 'POST', body: JSON.stringify(payload) });
            initialSnapshot.current = serializeForm(form);
            router.push('/admin/blog');
        } catch (err: unknown) {
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
            fd.append('slug', form.slug || genSlug(form.title) || `post-${Date.now()}`);
            const res = await adminFetchRaw(`${api}/admin/upload`, { method: 'POST', body: fd });
            const uploaded = await res.json();
            setForm(previous => ({ ...previous, image_url: uploaded.url }));
        } catch (err: unknown) {
            setError('Image upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const leaveEditor = () => {
        if (isDirty && !window.confirm('Leave without saving your article changes?')) return;
        router.push('/admin/blog');
    };

    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                    <button type="button" onClick={leaveEditor} className="border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" aria-label="Back to blog posts">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">SEO article editor</p>
                            {isDirty && <span className="bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">Unsaved changes</span>}
                        </div>
                        <h2 className="mt-1 text-2xl font-semibold text-gray-950">{isEditing ? 'Edit article' : 'Write a new article'}</h2>
                        <p className="mt-1 text-sm text-gray-600">Plan one clear search purpose, write a genuinely useful guide, and complete the practical publishing checks.</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => savePost('draft')} disabled={saving} className="border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50">
                        {saving ? 'Saving...' : <><Save className="mr-2 inline h-4 w-4" /> Save Draft</>}
                    </button>
                    <button type="button" onClick={() => savePost('published')} disabled={saving} className="bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                        {saving ? 'Publishing...' : <><CheckCircle className="mr-2 inline h-4 w-4" /> Publish Article</>}
                    </button>
                </div>
            </div>

            {error && <div className="border border-red-200 bg-red-50 p-4 flex items-start gap-2 text-red-800"><AlertCircle className="mt-0.5 w-5 h-5 flex-shrink-0" /><span>{error}</span></div>}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <form onSubmit={event => { event.preventDefault(); savePost(); }} className="space-y-6">
                    <section className="border border-blue-200 bg-blue-50/40 p-6 shadow-sm">
                        <div className="mb-5 flex items-start gap-3">
                            <div className="bg-blue-100 p-2 text-blue-700"><Target className="h-5 w-5" /></div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-950">1. Search target</h3>
                                <p className="mt-1 text-sm text-gray-600">Define the reader and the question before writing. These are planning fields, not a meta-keywords tag.</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Primary search query</label>
                                <input type="text" name="primary_query" value={form.primary_query} onChange={handleChange} placeholder="Example: best time for Kailash Mansarovar yatra" className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                <p className="mt-1 text-xs text-gray-600">Use one natural query that represents the page’s main purpose. Do not repeat it unnaturally.</p>
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">What does the reader want to do?</label>
                                    <select name="search_intent" value={form.search_intent} onChange={handleChange} className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        {searchIntentOptions.map(option => <option key={option.value || 'empty'} value={option.value}>{option.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Target reader</label>
                                    <input type="text" name="target_reader" value={form.target_reader} onChange={handleChange} placeholder="Example: First-time pilgrims travelling from India" className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Supporting topics</label>
                                <input type="text" name="secondary_topics" value={form.secondary_topics} onChange={handleChange} placeholder="Weather by month, permit timing, preparation, route options" className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                <p className="mt-1 text-xs text-gray-600">Separate topics with commas. Use these as coverage prompts, not repetition targets.</p>
                            </div>
                        </div>
                    </section>

                    <section className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-5"><h3 className="text-lg font-semibold text-gray-950">2. Article basics</h3><p className="mt-1 text-sm text-gray-600">Set the public title, URL, summary and classification.</p></div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Article title *</label>
                                <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="Example: Best Time to Visit Kailash Mansarovar" className="w-full border border-gray-300 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="border border-blue-100 bg-blue-50 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900"><Link2 className="h-4 w-4" /> Article link</div>
                                <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center"><span className="text-sm text-gray-600">Public URL:</span><code className="break-all bg-white px-3 py-2 text-sm text-blue-800">{articleUrl}</code></div>
                                <p className="mt-2 text-xs text-blue-800">New article links follow the title. Existing links stay stable while editing.</p>
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                <div><label className="block text-sm font-semibold text-gray-800 mb-2">Topic or category</label><input type="text" name="category" value={form.category} onChange={handleChange} placeholder="Trekking, Kailash, Nepal Travel" className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                                <div><label className="block text-sm font-semibold text-gray-800 mb-2">Publishing status</label><select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"><option value="draft">Save as draft</option><option value="published">Publish on website</option></select></div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Short summary *</label>
                                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={3} placeholder="Write 1–2 lines explaining exactly why this guide is useful." className="w-full border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                <div className="mt-1 text-xs text-gray-500">{form.excerpt.length}/160 characters as a practical guide</div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Article tags</label>
                                <div className="flex gap-2"><input type="text" value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={handleTagKeyDown} placeholder="Type a tag and press Enter" className="min-w-0 flex-1 border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /><button type="button" onClick={addTag} className="border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">Add</button></div>
                                {tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{tags.map(tag => <button key={tag} type="button" onClick={() => removeTag(tag)} className="bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200">{tag} <X className="ml-1 inline h-3 w-3" /></button>)}</div>}
                            </div>
                        </div>
                    </section>

                    <section className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-5"><h3 className="text-lg font-semibold text-gray-950">3. Cover image</h3><p className="mt-1 text-sm text-gray-600">Used on cards, article pages and social previews. Recommended source size: 1200×700px or larger.</p></div>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-green-500" onDrop={event => { event.preventDefault(); const file = Array.from(event.dataTransfer.files).find(item => item.type.startsWith('image/')); if (file) handleUpload(file); }} onDragOver={event => event.preventDefault()}>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" /><p className="text-sm font-semibold text-gray-800">Drop image here</p><p className="mt-1 text-xs text-gray-600">or choose from your computer</p>
                                <input type="file" accept="image/*" className="hidden" id="post-image" onChange={event => { const file = event.target.files?.[0]; if (file) handleUpload(file); }} />
                                <label htmlFor="post-image" className="mt-4 inline-flex cursor-pointer items-center gap-2 bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"><Camera className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Choose Image'}</label>
                            </div>
                            <div>{form.image_url ? <div className="relative border border-gray-200"><img src={form.image_url} alt={form.image_alt || 'Article cover preview'} className="w-full h-56 object-cover" /><button type="button" onClick={() => setForm(previous => ({ ...previous, image_url: '', image_alt: '' }))} className="absolute top-2 right-2 bg-red-600 text-white p-2 hover:bg-red-700" aria-label="Remove image"><X className="w-4 h-4" /></button></div> : <div className="flex h-56 items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50 text-center"><div><ImageIcon className="mx-auto mb-2 h-8 w-8 text-gray-300" /><p className="text-sm text-gray-500">No cover image yet</p></div></div>}</div>
                        </div>
                        <div className="mt-5"><label className="block text-sm font-semibold text-gray-800 mb-2">Image alt text</label><input type="text" name="image_alt" value={form.image_alt} onChange={handleChange} placeholder="Describe what is visibly shown in the image" className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /><p className="mt-1 text-xs text-gray-500">Describe the image naturally for accessibility. Do not stuff keywords.</p></div>
                    </section>

                    <section className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h3 className="text-lg font-semibold text-gray-950">4. Write article</h3><p className="mt-1 text-sm text-gray-600">Use descriptive sections and link readers to the next genuinely useful Zeo page.</p></div><div className="text-sm text-gray-500">{words} words · about {readingTime} min read</div></div>
                        <div className="mb-4 inline-flex border border-gray-200 bg-gray-50 p-1"><button type="button" onClick={() => setActiveTab('write')} className={`px-4 py-2 text-sm font-bold ${activeTab === 'write' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'}`}>Write</button><button type="button" onClick={() => setActiveTab('preview')} className={`px-4 py-2 text-sm font-bold ${activeTab === 'preview' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'}`}>Preview</button></div>
                        {activeTab === 'write' ? (
                            <textarea name="content" value={form.content} onChange={handleChange} rows={24} placeholder={`Start with a direct answer, then explain the important details.

## Best time at a glance

Give the reader a practical answer.

## Month-by-month conditions

Explain meaningful differences.

## Permits and planning

Link to a useful Zeo page: [Kailash package](/tours/kailash-mansarovar-yatra)`} className="w-full border border-gray-300 px-4 py-4 font-mono text-sm leading-7 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        ) : (
                            <div className="min-h-[420px] border border-gray-200 bg-white p-6">{form.content.trim() ? <MarkdownArticle content={form.content} /> : <p className="text-gray-500">Nothing to preview yet. Write or paste the article in the Write tab.</p>}</div>
                        )}
                    </section>

                    <section className="border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-5"><h3 className="text-lg font-semibold text-gray-950">5. Search appearance</h3><p className="mt-1 text-sm text-gray-600">These fields now control the real public metadata. Search engines may still choose different text for a specific query.</p></div>
                        <div className="space-y-5">
                            <div><label className="block text-sm font-semibold text-gray-800 mb-2">Search title</label><input type="text" name="seo_title" value={form.seo_title} onChange={handleChange} placeholder="Leave empty to use article title" className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /><div className="mt-1 text-xs text-gray-500">{(form.seo_title || form.title).length} characters</div></div>
                            <div><label className="block text-sm font-semibold text-gray-800 mb-2">Search description</label><textarea name="seo_description" value={form.seo_description} onChange={handleChange} rows={3} placeholder="Leave empty to use short summary" className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /><div className="mt-1 text-xs text-gray-500">{(form.seo_description || form.excerpt).length} characters</div></div>
                        </div>
                    </section>
                </form>

                <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                    <section className="border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-500"><Target className="h-4 w-4" /> Publishing readiness</div><p className="mt-2 text-2xl font-semibold text-gray-950">{completedChecks} of {readinessChecks.length}</p></div><div className={`px-3 py-1 text-xs font-bold ${essentialIssues.length === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>{essentialIssues.length === 0 ? 'Essential ready' : `${essentialIssues.length} essential`}</div></div>
                        <div className="mt-4 h-2 overflow-hidden bg-gray-100"><div className="h-full bg-green-600 transition-all" style={{ width: `${Math.round((completedChecks / readinessChecks.length) * 100)}%` }} /></div>
                        <div className="mt-5 space-y-3">{readinessChecks.map(check => <div key={check.id} className="flex items-start gap-2">{check.complete ? <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" /> : <Circle className={`mt-0.5 h-4 w-4 flex-shrink-0 ${check.priority === 'essential' ? 'text-red-500' : 'text-amber-500'}`} />}<div><p className={`text-sm font-semibold ${check.complete ? 'text-gray-700' : 'text-gray-950'}`}>{check.label}</p>{!check.complete && <p className="mt-0.5 text-xs leading-5 text-gray-600">{check.help}</p>}</div></div>)}</div>
                    </section>

                    <section className="border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-500"><Search className="h-4 w-4" /> Search preview</div><div className="border border-gray-200 bg-gray-50 p-4"><div className="text-sm text-green-700">zeotourism.com{articleUrl}</div><div className="mt-1 text-lg leading-snug text-blue-700">{previewTitle}</div><p className="mt-1 text-sm leading-6 text-gray-600">{previewDescription}</p></div><p className="mt-3 text-xs leading-5 text-gray-500">This is a planning preview. A search engine may generate a different title or snippet for a particular search.</p></section>

                    <section className="border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-gray-500"><Eye className="h-4 w-4" /> Article card preview</div><div className="border border-gray-200 bg-white">{form.image_url ? <img src={form.image_url} alt={form.image_alt || 'Preview'} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-gray-100 text-sm text-gray-400">Cover image preview</div>}<div className="p-4"><div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">{form.category || 'Category'}</div><h4 className="text-lg font-serif font-bold leading-snug text-gray-950">{form.title || 'Article title will appear here'}</h4><p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{form.excerpt || 'Your short summary will appear here.'}</p><div className="mt-4 text-sm font-bold text-blue-600">Read guide →</div></div></div></section>
                </aside>
            </div>
        </div>
    );
};

export default PostEditor;
