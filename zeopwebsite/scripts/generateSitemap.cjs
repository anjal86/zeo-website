// Build script to generate dynamic sitemap
// Run this during the build process to create sitemap.xml with current data

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://www.zeotourism.com';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

const MONEY_PAGE_SLUGS = [
  'kailash-mansarovar',
  'kailash-mansarovar-yatra-guide',
  'kailash-mansarovar-yatra-cost',
  'kailash-mansarovar-yatra-documents-permits',
  'kailash-yatra-nri-guide',
  'kailash-packing-list',
  'kailash-fitness-medical-guide',
  'kailash-inner-kora-guide'
];

// Sitemap URL class
class SitemapUrl {
  constructor(loc, lastmod, changefreq, priority) {
    this.loc = loc;
    this.lastmod = lastmod;
    this.changefreq = changefreq;
    this.priority = priority;
  }
}

function cleanSlug(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getValidLastmod(...dates) {
  const validDate = dates.find((date) => date && !Number.isNaN(new Date(date).getTime()));
  return validDate ? new Date(validDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
}

// Static pages configuration
function getStaticPages() {
  const currentDate = new Date().toISOString().split('T')[0];

  return [
    new SitemapUrl(`${BASE_URL}/`, currentDate, 'weekly', 1.0),
    new SitemapUrl(`${BASE_URL}/kailash-mansarovar`, currentDate, 'weekly', 0.95),
    new SitemapUrl(`${BASE_URL}/kailash-mansarovar-yatra-guide`, currentDate, 'weekly', 0.93),
    new SitemapUrl(`${BASE_URL}/kailash-mansarovar-yatra-cost`, currentDate, 'weekly', 0.92),
    new SitemapUrl(`${BASE_URL}/kailash-mansarovar-yatra-documents-permits`, currentDate, 'weekly', 0.9),
    new SitemapUrl(`${BASE_URL}/kailash-yatra-nri-guide`, currentDate, 'weekly', 0.9),
    new SitemapUrl(`${BASE_URL}/tours`, currentDate, 'weekly', 0.88),
    new SitemapUrl(`${BASE_URL}/destinations`, currentDate, 'weekly', 0.86),
    new SitemapUrl(`${BASE_URL}/activities`, currentDate, 'weekly', 0.84),
    new SitemapUrl(`${BASE_URL}/kailash-packing-list`, currentDate, 'monthly', 0.82),
    new SitemapUrl(`${BASE_URL}/kailash-fitness-medical-guide`, currentDate, 'monthly', 0.82),
    new SitemapUrl(`${BASE_URL}/kailash-inner-kora-guide`, currentDate, 'monthly', 0.82),
    new SitemapUrl(`${BASE_URL}/everest-base-camp-guide`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/nepal-visa-guide`, currentDate, 'monthly', 0.78),
    new SitemapUrl(`${BASE_URL}/best-time-to-visit-nepal`, currentDate, 'monthly', 0.78),
    new SitemapUrl(`${BASE_URL}/blog`, currentDate, 'weekly', 0.75),
    new SitemapUrl(`${BASE_URL}/about`, currentDate, 'monthly', 0.7),
    new SitemapUrl(`${BASE_URL}/contact`, currentDate, 'monthly', 0.7),
    new SitemapUrl(`${BASE_URL}/privacy-policy`, currentDate, 'yearly', 0.4)
  ];
}

// Fetch tours from local JSON files
function getTourUrls() {
  try {
    const tourDetailsDir = path.join(__dirname, '../../api/data/tour-details');
    const tourUrls = [];

    if (fs.existsSync(tourDetailsDir)) {
      const tourFiles = fs.readdirSync(tourDetailsDir).filter(file => file.endsWith('.json'));

      for (const file of tourFiles) {
        const tourData = JSON.parse(fs.readFileSync(path.join(tourDetailsDir, file), 'utf8'));
        const slug = file.replace('.json', '');

        tourUrls.push(new SitemapUrl(
          `${BASE_URL}/tours/${slug}`,
          getValidLastmod(tourData.updatedAt, tourData.createdAt),
          MONEY_PAGE_SLUGS.some((hint) => slug.includes(hint)) ? 'weekly' : 'monthly',
          getTourPriority(slug, tourData.title || '')
        ));
      }
    }

    return tourUrls;
  } catch (error) {
    console.error('Error fetching tours for sitemap:', error);
    return [];
  }
}

// Fetch destinations from API data
function getDestinationUrls() {
  try {
    const destinationsFile = path.join(__dirname, '../../api/data/destinations.json');

    if (!fs.existsSync(destinationsFile)) {
      return [];
    }

    const destinations = JSON.parse(fs.readFileSync(destinationsFile, 'utf8'));

    return destinations.map(destination => {
      const slug = destination.slug || cleanSlug(destination.name);
      return new SitemapUrl(
        `${BASE_URL}/destinations/${slug}`,
        getValidLastmod(destination.updatedAt, destination.createdAt),
        'monthly',
        getDestinationPriority(destination.name)
      );
    });
  } catch (error) {
    console.error('Error fetching destinations for sitemap:', error);
    return [];
  }
}

// Fetch activities from API data
function getActivityUrls() {
  try {
    const activitiesFile = path.join(__dirname, '../../api/data/activities.json');

    if (!fs.existsSync(activitiesFile)) {
      return [];
    }

    const activities = JSON.parse(fs.readFileSync(activitiesFile, 'utf8'));

    return activities.map(activity => {
      const activityPath = activity.href || `/activities/${activity.slug || cleanSlug(activity.name)}`;
      return new SitemapUrl(
        `${BASE_URL}${activityPath}`,
        getValidLastmod(activity.updatedAt, activity.createdAt),
        activity.name?.toLowerCase().includes('pilgrimage') ? 'weekly' : 'monthly',
        activity.name?.toLowerCase().includes('pilgrimage') ? 0.82 : 0.7
      );
    });
  } catch (error) {
    console.error('Error fetching activities for sitemap:', error);
    return [];
  }
}

// Fetch blog posts from API data
function getBlogPostUrls() {
  try {
    const postsFile = path.join(__dirname, '../../api/data/posts.json');

    if (!fs.existsSync(postsFile)) {
      return [];
    }

    const data = JSON.parse(fs.readFileSync(postsFile, 'utf8'));
    const posts = data.posts || [];

    return posts.map(post => new SitemapUrl(
      `${BASE_URL}/blog/${post.slug}`,
      getValidLastmod(post.updated_at, post.created_at),
      post.title?.toLowerCase().includes('kailash') ? 'weekly' : 'monthly',
      post.title?.toLowerCase().includes('kailash') ? 0.82 : 0.72
    ));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
}

// Determine tour priority based on commercial SEO importance
function getTourPriority(slug, title = '') {
  const combined = `${slug} ${title}`.toLowerCase();

  if (combined.includes('kailash') || combined.includes('mansarovar') || combined.includes('yatra')) return 0.9;
  if (combined.includes('muktinath')) return 0.86;
  if (combined.includes('everest-base-camp') || combined.includes('annapurna-base-camp')) return 0.84;
  if (combined.includes('nepal') || combined.includes('heritage')) return 0.78;
  return 0.65;
}

// Determine destination priority based on popularity and commercial relevance
function getDestinationPriority(name = '') {
  const lowerName = name.toLowerCase();

  if (['kathmandu', 'muktinath', 'tibet', 'lumbini'].some(dest => lowerName.includes(dest))) return 0.82;
  if (['everest', 'annapurna', 'pokhara'].some(dest => lowerName.includes(dest))) return 0.8;
  if (['chitwan', 'nagarkot'].some(dest => lowerName.includes(dest))) return 0.72;
  return 0.6;
}

// Generate complete sitemap XML
async function generateSitemap() {
  try {
    console.log('🚀 Generating dynamic sitemap...');

    const [staticUrls, tourUrls, destinationUrls, activityUrls, blogPostUrls] = await Promise.all([
      Promise.resolve(getStaticPages()),
      Promise.resolve(getTourUrls()),
      Promise.resolve(getDestinationUrls()),
      Promise.resolve(getActivityUrls()),
      Promise.resolve(getBlogPostUrls())
    ]);

    const allUrls = [
      ...staticUrls,
      ...tourUrls,
      ...destinationUrls,
      ...activityUrls,
      ...blogPostUrls
    ];

    // Sort URLs by priority (highest first)
    allUrls.sort((a, b) => b.priority - a.priority);

    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

    const xmlUrls = allUrls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

    const xmlFooter = `
</urlset>`;

    const sitemapXml = xmlHeader + xmlUrls + xmlFooter;

    // Ensure the public directory exists
    const publicDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write sitemap to file
    fs.writeFileSync(OUTPUT_PATH, sitemapXml);

    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📊 Stats:`);
    console.log(`   - Total URLs: ${allUrls.length}`);
    console.log(`   - Static pages: ${staticUrls.length}`);
    console.log(`   - Tours: ${tourUrls.length}`);
    console.log(`   - Destinations: ${destinationUrls.length}`);
    console.log(`   - Activities: ${activityUrls.length}`);
    console.log(`   - Blog posts: ${blogPostUrls.length}`);
    console.log(`📁 Saved to: ${OUTPUT_PATH}`);

    return sitemapXml;
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  generateSitemap()
    .then(() => {
      console.log('🎉 Sitemap generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Sitemap generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateSitemap };
