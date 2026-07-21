import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { findAuthorProfile } from '@/server/repositories/blog-seo';
import { parseBlogSeoData } from '@/lib/blogSeo';

export const revalidate = 3600;
const siteUrl = (process.env.APP_URL || 'https://zeotourism.com').replace(/\/$/, '');

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { profile } = await findAuthorProfile(slug);
  if (!profile) return { title: 'Author not found', robots: { index: false, follow: false } };
  const title = `${profile.name} | Zeo Tourism Author`;
  const description = profile.bio || `Read travel guides written and reviewed by ${profile.name} for Zeo Tourism.`;
  return { title, description, alternates: { canonical: `/blog/author/${slug}` } };
}

export default async function BlogAuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { profile, posts } = await findAuthorProfile(slug);
  if (!profile) notFound();
  const canonical = `${siteUrl}/blog/author/${slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${canonical}#profile`,
    url: canonical,
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      url: canonical,
      ...(profile.title ? { jobTitle: profile.title } : {}),
      ...(profile.bio ? { description: profile.bio } : {}),
      ...(profile.image ? { image: profile.image } : {}),
      ...(profile.expertise?.length ? { knowsAbout: profile.expertise } : {}),
      worksFor: { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'Zeo Tourism' },
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-28">
      <JsonLd data={schema} />
      <section className="container mx-auto px-4">
        <div className="grid gap-8 border border-slate-200 bg-white p-7 md:grid-cols-[180px_1fr] md:p-10">
          <div className="relative aspect-square overflow-hidden bg-slate-100">
            {profile.image ? <Image src={profile.image} alt={profile.name} fill sizes="180px" unoptimized={profile.image.startsWith('http')} className="object-cover" /> : null}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Zeo Tourism author</p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-slate-950 md:text-5xl">{profile.name}</h1>
            {profile.title && <p className="mt-2 text-lg font-semibold text-slate-700">{profile.title}</p>}
            {profile.bio && <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{profile.bio}</p>}
            {profile.expertise && profile.expertise.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{profile.expertise.map(item => <span key={item} className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">{item}</span>)}</div>}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-serif text-3xl font-bold text-slate-950">Articles by {profile.name}</h2>
          <div className="mt-7 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => {
              const seo = parseBlogSeoData(post.seo);
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white hover:shadow-lg">
                  <div className="relative aspect-[16/10] bg-slate-100">
                    {post.image ? <Image src={post.image} alt={seo.imageAlt || post.title} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized={String(post.image).startsWith('http')} className="object-cover" /> : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">{post.category || 'Travel'}</p>
                    <h3 className="mt-2 text-xl font-bold leading-snug text-slate-950 group-hover:text-primary">{post.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                    <span className="mt-auto pt-5 text-sm font-bold text-primary">Read guide →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
