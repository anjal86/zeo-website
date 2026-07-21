import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listPostCategories } from '@/server/repositories/blog-seo';
import { listPosts } from '@/server/repositories/content';
import { parseBlogSeoData, slugifyBlogValue } from '@/lib/blogSeo';

export const revalidate = 3600;

async function categoryName(slug: string) {
  const categories = await listPostCategories();
  return categories.find(item => slugifyBlogValue(item.category) === slug)?.category || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await categoryName(slug);
  if (!category) return { title: 'Blog category not found', robots: { index: false, follow: false } };
  const title = `${category} Travel Guides | Zeo Tourism`;
  const description = `Browse practical ${category} travel guides, planning advice and related journeys from Zeo Tourism.`;
  return {
    title,
    description,
    alternates: { canonical: `/blog/category/${slug}` },
    openGraph: { title, description, url: `/blog/category/${slug}`, type: 'website' },
  };
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await categoryName(slug);
  if (!category) notFound();
  const posts = await listPosts({ category, limit: '100' });

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-28">
      <section className="container mx-auto px-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Blog topic</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-slate-950 md:text-6xl">{category} guides</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Practical articles, preparation advice and route-specific planning resources for {category.toLowerCase()} travellers.</p>
        <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {posts.items.map(post => {
            const seo = parseBlogSeoData(post.seo);
            return (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white hover:shadow-lg">
                <div className="relative aspect-[16/10] bg-slate-100">
                  {post.image ? <Image src={post.image} alt={seo.imageAlt || post.title} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized={String(post.image).startsWith('http')} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : null}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-2xl font-bold leading-snug text-slate-950 group-hover:text-primary">{post.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                  <span className="mt-auto pt-6 text-sm font-bold text-primary">Read guide →</span>
                </div>
              </Link>
            );
          })}
        </div>
        {posts.items.length === 0 && <div className="mt-10 border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No published articles are currently assigned to this topic.</div>}
      </section>
    </main>
  );
}
