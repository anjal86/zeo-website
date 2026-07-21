import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle2, Clock, ExternalLink, ShieldCheck, Tag, User } from 'lucide-react';
import Breadcrumb from '../UI/Breadcrumb';
import SocialShare from './SocialShare';
import TableOfContents from './TableOfContents';
import MarkdownArticle from './MarkdownArticle';
import ReadingProgress from './ReadingProgress';
import TourCard from '../Tours/TourCard';
import { parseBlogSeoData, slugifyBlogValue, type BlogHeading, type BlogPerson } from '@/lib/blogSeo';

function displayDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

function absolutePageUrl(slug: string) {
  const origin = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://zeotourism.com').replace(/\/$/, '');
  return `${origin}/blog/${slug}`;
}

export default function BlogPostPage({
  post,
  headings,
  relatedPosts = [],
  relatedTours = [],
}: {
  post: any;
  headings: BlogHeading[];
  relatedPosts?: any[];
  relatedTours?: any[];
}) {
  const seo = parseBlogSeoData(post.seo);
  const pageUrl = absolutePageUrl(post.slug);
  const category = post.category || 'Travel';
  const categorySlug = slugifyBlogValue(category);
  const author: BlogPerson = seo.author || { name: post.author || 'Zeo Tourism', slug: slugifyBlogValue(post.author || 'Zeo Tourism') };
  const reviewer = seo.reviewer;
  const published = displayDate(post.published_at || post.created_at || post.date);
  const updated = displayDate(post.updated_at);
  const reviewed = displayDate(seo.reviewedAt);
  const image = post.image || post.image_url;
  const imageAlt = seo.imageAlt || post.title;
  const cta = seo.cta || {
    heading: 'Plan your journey with a local expert',
    body: 'Get route-specific advice, realistic timing and a trip plan built around your needs.',
    label: 'Talk to an expert',
    url: '/contact',
  };

  return (
    <>
      <ReadingProgress />
      <article className="min-h-screen bg-white pb-20">
        <header className="relative min-h-[520px] overflow-hidden bg-slate-950 md:min-h-[680px]">
          {image ? (
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority
              sizes="100vw"
              unoptimized={String(image).startsWith('http')}
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/15" />
          <div className="container mx-auto flex min-h-[520px] items-end px-4 pb-14 pt-32 md:min-h-[680px] md:pb-24">
            <div className="relative z-10 max-w-5xl text-white">
              <Link href={`/blog/category/${categorySlug}`} className="inline-flex bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-secondary-dark">
                {category}
              </Link>
              <h1 className="mt-6 max-w-5xl font-serif text-4xl font-bold leading-[1.08] md:text-7xl">{post.title}</h1>
              {post.excerpt && <p className="mt-6 max-w-3xl text-lg leading-8 text-white/85 md:text-xl">{post.excerpt}</p>}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-white/85">
                <span className="flex items-center gap-2"><User className="h-4 w-4 text-secondary" /> {author.name}</span>
                {published && <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-secondary" /> Published {published}</span>}
                {post.readTime && <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> {post.readTime}</span>}
              </div>
            </div>
          </div>
        </header>

        {(seo.imageCaption || seo.imageCredit) && (
          <div className="container mx-auto px-4 pt-3 text-xs text-slate-500">
            {[seo.imageCaption, seo.imageCredit && `Photo: ${seo.imageCredit}`].filter(Boolean).join(' · ')}
          </div>
        )}

        <div className="container mx-auto px-4 pt-6">
          <Breadcrumb items={[
            { name: 'Blog', href: '/blog' },
            { name: category, href: `/blog/category/${categorySlug}` },
            { name: post.title },
          ]} />
        </div>

        <div className="container mx-auto px-4 pt-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
            <main>
              <div className="border border-slate-100 bg-white p-6 shadow-sm md:p-12">
                {seo.updateNote && (
                  <div className="article-summary mb-8 border-l-4 border-primary bg-blue-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">What changed</p>
                    <p className="mt-2 leading-7 text-slate-700">{seo.updateNote}</p>
                  </div>
                )}
                <MarkdownArticle content={post.content || ''} />

                {Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-8">
                    <Tag className="mr-1 h-5 w-5 text-primary" />
                    {post.tags.map((item: string) => <span key={item} className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">{item}</span>)}
                  </div>
                )}

                {seo.sources && seo.sources.length > 0 && (
                  <section aria-labelledby="article-sources" className="mt-12 border-t border-slate-100 pt-8">
                    <h2 id="article-sources" className="font-serif text-2xl font-bold text-slate-950">Sources and verification</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Important factual guidance in this article was checked against these sources.</p>
                    <ol className="mt-5 space-y-4">
                      {seo.sources.map((source, index) => (
                        <li key={`${source.url}-${index}`} className="border border-slate-200 p-4">
                          <a href={source.url} target="_blank" rel="noopener" className="font-bold text-primary underline underline-offset-4">
                            {source.title} <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
                          </a>
                          <div className="mt-1 text-xs text-slate-500">
                            {[source.publisher, source.accessedAt && `Accessed ${displayDate(source.accessedAt)}`].filter(Boolean).join(' · ')}
                          </div>
                          {source.note && <p className="mt-2 text-sm leading-6 text-slate-600">{source.note}</p>}
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                <section className="mt-12 border-t border-slate-100 pt-8">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Written by</p>
                      <div className="mt-3 flex items-start gap-4">
                        {author.image ? <Image src={author.image} alt={author.name} width={64} height={64} unoptimized={author.image.startsWith('http')} className="h-16 w-16 object-cover" /> : <div className="flex h-16 w-16 items-center justify-center bg-primary/10"><User className="h-7 w-7 text-primary" /></div>}
                        <div>
                          <h2 className="text-lg font-bold text-slate-950">{author.name}</h2>
                          {author.title && <p className="text-sm text-slate-600">{author.title}</p>}
                          {author.bio && <p className="mt-2 text-sm leading-6 text-slate-600">{author.bio}</p>}
                          {author.slug && <Link href={`/blog/author/${author.slug}`} className="mt-3 inline-block text-sm font-bold text-primary hover:underline">View author profile →</Link>}
                        </div>
                      </div>
                    </div>
                    {reviewer ? (
                      <div className="border border-slate-200 bg-slate-50 p-5">
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500"><ShieldCheck className="h-4 w-4 text-green-600" /> Expert review</p>
                        <h2 className="mt-3 text-lg font-bold text-slate-950">{reviewer.name}</h2>
                        {reviewer.title && <p className="text-sm text-slate-600">{reviewer.title}</p>}
                        {reviewer.bio && <p className="mt-2 text-sm leading-6 text-slate-600">{reviewer.bio}</p>}
                        {reviewed && <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-700"><CheckCircle2 className="h-4 w-4" /> Reviewed {reviewed}</p>}
                      </div>
                    ) : (
                      <div className="border border-slate-200 bg-slate-50 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Article history</p>
                        {published && <p className="mt-3 text-sm text-slate-700">Published: {published}</p>}
                        {updated && updated !== published && <p className="mt-1 text-sm text-slate-700">Last updated: {updated}</p>}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </main>

            <aside>
              <div className="sticky top-24 space-y-6">
                <TableOfContents headings={headings} />
                <div className="border border-slate-100 bg-slate-50 p-6">
                  <h2 className="mb-4 text-lg font-bold text-slate-900">Share this guide</h2>
                  <SocialShare url={pageUrl} title={post.title} layout="grid" />
                </div>
                <div className="bg-gradient-to-br from-primary to-primary-dark p-7 text-white">
                  <h2 className="text-2xl font-bold">{cta.heading}</h2>
                  {cta.body && <p className="mt-3 leading-7 text-white/80">{cta.body}</p>}
                  <Link href={cta.url || '/contact'} className="mt-6 block bg-secondary px-5 py-3 text-center text-sm font-bold text-white hover:bg-secondary-dark">{cta.label || 'Talk to an expert'}</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {relatedTours.length > 0 && (
          <section className="container mx-auto mt-20 px-4">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Continue planning</p><h2 className="mt-2 font-serif text-3xl font-bold text-slate-950">Related journeys</h2></div>
              <Link href="/tours" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">All tours <ArrowLeft className="h-4 w-4 rotate-180" /></Link>
            </div>
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {relatedTours.slice(0, 3).map((tour: any) => <TourCard key={tour.id} tour={tour} destinations={tour.destinations || []} />)}
            </div>
          </section>
        )}

        {relatedPosts.length > 0 && (
          <section className="container mx-auto mt-20 px-4">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-widest text-primary">More useful reading</p><h2 className="mt-2 font-serif text-3xl font-bold text-slate-950">Related articles</h2></div>
              <Link href="/blog" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">View blog <ArrowLeft className="h-4 w-4 rotate-180" /></Link>
            </div>
            <div className="grid gap-7 md:grid-cols-3">
              {relatedPosts.slice(0, 3).map((item: any) => {
                const itemSeo = parseBlogSeoData(item.seo);
                return (
                  <Link key={item.id} href={`/blog/${item.slug}`} className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white hover:shadow-lg">
                    <div className="relative aspect-[16/10] bg-slate-100">
                      {item.image ? <Image src={item.image} alt={itemSeo.imageAlt || item.title} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized={String(item.image).startsWith('http')} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : null}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">{item.category || 'Travel'}</p>
                      <h3 className="mt-2 text-xl font-bold leading-snug text-slate-950 group-hover:text-primary">{item.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>
                      <span className="mt-auto pt-5 text-sm font-bold text-primary">Read guide →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
