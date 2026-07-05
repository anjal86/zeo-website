import fs from 'fs';
import path from 'path';

const routes = [
  {
    path: 'app/tours/page.tsx',
    content: `
import React from 'react';
import { listTours } from '../../src/server/repositories/tours';
import Tours from '../../src/components/Tours/Tours';

export const metadata = {
  title: "Tours & Packages - Zeo Tourism",
  description: "Browse our comprehensive collection of tours, from the Himalayas to cultural heritage sites.",
};

export default async function ToursPage() {
  const result = await listTours({ limit: 500 });
  
  return (
    <div className="pt-20">
      <Tours initialTours={result.data as any} />
    </div>
  );
}
`
  },
  {
    path: 'app/tours/[slug]/page.tsx',
    content: `
import React from 'react';
import { notFound } from 'next/navigation';
import { getTourBySlug } from '../../../src/server/repositories/tours';
import TourDetailComponent from '../../../src/components/Tours/TourDetail'; // Assuming we rename to TourDetail component
import { createTouristTripSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';
import JsonLd from '../../../src/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  
  if (!tour) return { title: 'Not Found' };
  
  return {
    title: \`\${tour.name} - Zeo Tourism\`,
    description: tour.description || \`Join our \${tour.name} package.\`,
    alternates: {
      canonical: \`https://www.zeotourism.com/tours/\${slug}\`
    }
  };
}

export default async function TourDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  
  if (!tour) {
    notFound();
  }

  const structuredData = [
    createTouristTripSchema({
      name: tour.name,
      description: tour.description || '',
      image: tour.image || '',
      url: \`https://www.zeotourism.com/tours/\${slug}\`,
      price: tour.price_usd || 0,
      currency: "USD",
      category: "Tour Package",
      duration: \`\${tour.duration_days} Days\`,
      location: tour.location || ''
    }),
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "Tours", url: "https://www.zeotourism.com/tours" },
      { name: tour.name, url: \`https://www.zeotourism.com/tours/\${slug}\` }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <TourDetailComponent tour={tour as any} />
    </>
  );
}
`
  },
  {
    path: 'app/destinations/page.tsx',
    content: `
import React from 'react';
import { listDestinations } from '../../src/server/repositories/catalog';
import Destinations from '../../src/components/Destinations/Destinations';

export const metadata = {
  title: "Destinations - Zeo Tourism",
  description: "Explore our beautiful destinations across Nepal and beyond.",
};

export default async function DestinationsPage() {
  const result = await listDestinations({ limit: 100 });
  
  return (
    <div className="pt-20">
      <Destinations initialDestinations={result.data as any} />
    </div>
  );
}
`
  },
  {
    path: 'app/destinations/[slug]/page.tsx',
    content: `
import React from 'react';
import { notFound } from 'next/navigation';
import { getDestinationBySlug } from '../../../src/server/repositories/catalog';
import DestinationDetailComponent from '../../../src/components/Destinations/DestinationDetail'; 
import { createTouristDestinationSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';
import JsonLd from '../../../src/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  
  if (!dest) return { title: 'Not Found' };
  
  return {
    title: \`\${dest.name} Tours & Travel Guide - Zeo Tourism\`,
    description: dest.description || \`Explore \${dest.name} with our guided tours.\`,
    alternates: {
      canonical: \`https://www.zeotourism.com/destinations/\${slug}\`
    }
  };
}

export default async function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  
  if (!dest) {
    notFound();
  }

  const structuredData = [
    createTouristDestinationSchema({
      name: dest.name,
      description: dest.description || '',
      country: dest.country || 'Nepal',
      image: dest.image || '',
      url: \`https://www.zeotourism.com/destinations/\${slug}\`,
      toursCount: 1 // mock or compute
    }),
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "Destinations", url: "https://www.zeotourism.com/destinations" },
      { name: dest.name, url: \`https://www.zeotourism.com/destinations/\${slug}\` }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <DestinationDetailComponent destination={dest as any} />
    </>
  );
}
`
  },
  {
    path: 'app/activities/page.tsx',
    content: `
import React from 'react';
import { listActivities } from '../../src/server/repositories/catalog';
import Activities from '../../src/components/Activities/Activities';

export const metadata = {
  title: "Activities - Zeo Tourism",
  description: "Find exciting activities for your next adventure.",
};

export default async function ActivitiesPage() {
  const result = await listActivities({ limit: 100 });
  
  return (
    <div className="pt-20">
      <Activities initialActivities={result.data as any} />
    </div>
  );
}
`
  },
  {
    path: 'app/activities/[slug]/page.tsx',
    content: `
import React from 'react';
import { notFound } from 'next/navigation';
import { getActivityBySlug } from '../../../src/server/repositories/catalog';
import ActivityDetailComponent from '../../../src/components/Activities/ActivityDetail'; 
import { createTouristAttractionSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';
import JsonLd from '../../../src/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  
  if (!activity) return { title: 'Not Found' };
  
  return {
    title: \`\${activity.name} - Zeo Tourism\`,
    description: activity.description || \`Enjoy \${activity.name} with us.\`,
    alternates: {
      canonical: \`https://www.zeotourism.com/activities/\${slug}\`
    }
  };
}

export default async function ActivityDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  
  if (!activity) {
    notFound();
  }

  const structuredData = [
    createTouristAttractionSchema({
      name: activity.name,
      description: activity.description || '',
      image: activity.image || '',
      url: \`https://www.zeotourism.com/activities/\${slug}\`,
      toursCount: 1 
    }),
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "Activities", url: "https://www.zeotourism.com/activities" },
      { name: activity.name, url: \`https://www.zeotourism.com/activities/\${slug}\` }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <ActivityDetailComponent activity={activity as any} />
    </>
  );
}
`
  },
  {
    path: 'app/blog/page.tsx',
    content: `
import React from 'react';
import { listPosts } from '../../src/server/repositories/content';
import BlogComponent from '../../src/components/Blog/Blog';

export const metadata = {
  title: "Blog - Zeo Tourism",
  description: "Read our latest travel guides, tips, and news.",
};

export default async function BlogPage() {
  const result = await listPosts({ limit: 100 });
  
  return (
    <div className="pt-20">
      <BlogComponent initialPosts={result.data as any} />
    </div>
  );
}
`
  },
  {
    path: 'app/blog/[slug]/page.tsx',
    content: `
import React from 'react';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '../../../src/server/repositories/content';
import BlogPostComponent from '../../../src/components/Blog/BlogPost';
import { createArticleSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';
import JsonLd from '../../../src/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) return { title: 'Not Found' };
  
  return {
    title: \`\${post.title} - Zeo Tourism Blog\`,
    description: post.excerpt || \`Read about \${post.title}\`,
    alternates: {
      canonical: \`https://www.zeotourism.com/blog/\${slug}\`
    }
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  const structuredData = [
    createArticleSchema({
      title: post.title,
      description: post.excerpt || '',
      author: 'Zeo Tourism',
      publishDate: post.published_at?.toISOString() || new Date().toISOString(),
      image: post.cover_image || '',
      url: \`https://www.zeotourism.com/blog/\${slug}\`,
      category: post.category || 'Travel',
      tags: []
    }),
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "Blog", url: "https://www.zeotourism.com/blog" },
      { name: post.title, url: \`https://www.zeotourism.com/blog/\${slug}\` }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <BlogPostComponent post={post as any} />
    </>
  );
}
`
  }
];

for (const route of routes) {
  const destPath = path.join(process.cwd(), route.path);
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(destPath, route.content.trim() + '\\n');
  console.log('Created ' + destPath);
}
