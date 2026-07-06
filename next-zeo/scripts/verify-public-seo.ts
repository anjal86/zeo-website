import * as cheerio from 'cheerio';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

type SlugItem = { slug?: string };
type ListPayload = SlugItem[] | {
  tours?: SlugItem[];
  destinations?: SlugItem[];
  activities?: SlugItem[];
  posts?: SlugItem[];
  items?: SlugItem[];
};

function readList(payload: ListPayload, key: 'tours' | 'destinations' | 'activities' | 'posts') {
  if (Array.isArray(payload)) return payload;
  return payload[key] ?? payload.items ?? [];
}

async function fetchFirstSlug(path: string, key: 'tours' | 'destinations' | 'activities' | 'posts') {
  try {
    const response = await fetch(`${APP_URL}${path}`);
    if (!response.ok) return null;
    const payload = (await response.json()) as ListPayload;
    return readList(payload, key).find((item) => item.slug)?.slug ?? null;
  } catch {
    return null;
  }
}

async function getUrlsToCheck() {
  const urls = [
    '/',
    '/tours',
    '/destinations',
    '/destinations/nepal',
    '/activities',
    '/blog',
    '/kailash-mansarovar',
    '/contact',
    '/sitemap.xml',
    '/robots.txt',
  ];

  const [tourSlug, activitySlug, postSlug] = await Promise.all([
    fetchFirstSlug('/api/tours?limit=1&page=1', 'tours'),
    fetchFirstSlug('/api/activities?limit=1&page=1', 'activities'),
    fetchFirstSlug('/api/posts?limit=1&page=1', 'posts'),
  ]);

  if (tourSlug) urls.splice(2, 0, `/tours/${tourSlug}`);
  if (activitySlug) urls.splice(urls.indexOf('/blog'), 0, `/activities/${activitySlug}`);
  if (postSlug) urls.splice(urls.indexOf('/kailash-mansarovar'), 0, `/blog/${postSlug}`);

  return urls;
}

async function checkUrl(path: string) {
  const url = `${APP_URL}${path}`;
  console.log(`\nChecking: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ Failed to fetch ${url} - Status: ${response.status}`);
      return false;
    }

    const text = await response.text();

    if (path.endsWith('.xml') || path.endsWith('.txt')) {
      if (text.length > 50) {
        console.log(`✅ ${path} looks valid (length: ${text.length})`);
        return true;
      } else {
        console.error(`❌ ${path} seems too short or empty.`);
        return false;
      }
    }

    const $ = cheerio.load(text);
    
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const canonical = $('link[rel="canonical"]').attr('href');
    const h1 = $('h1').first().text().trim();
    
    let hasJsonLd = false;
    $('script[type="application/ld+json"]').each(() => {
      hasJsonLd = true;
    });

    console.log(`  Title: ${title || 'MISSING'}`);
    console.log(`  Description: ${description ? 'Present' : 'MISSING'}`);
    console.log(`  Canonical: ${canonical || 'MISSING'}`);
    console.log(`  H1: ${h1 || 'MISSING'}`);
    console.log(`  JSON-LD: ${hasJsonLd ? 'Present' : 'MISSING'}`);

    const hasMainContent = $('main').length > 0 || $('#main-content').length > 0 || $('.prose').length > 0 || $('body').text().trim().length > 300;
    
    let passed = true;
    if (!title || title === 'Not Found' || title.includes('undefined')) { passed = false; console.error('  ❌ Invalid title'); }
    if (!description) { passed = false; console.error('  ❌ Missing description'); }
    if (!canonical) { passed = false; console.error('  ❌ Missing canonical URL'); }
    if (!h1) { passed = false; console.error('  ❌ Missing H1'); }
    if (!hasMainContent) { passed = false; console.error('  ❌ Missing main content (empty shell?)'); }
    if (!hasJsonLd) { console.warn('  ⚠️ Missing JSON-LD (might be intentional for some pages)'); }
    
    if (passed) {
      console.log('✅ Passed SEO checks');
    } else {
      console.error('❌ Failed SEO checks');
    }
    return passed;

  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error);
    return false;
  }
}

async function run() {
  console.log('Starting SEO verification...');
  const urlsToCheck = await getUrlsToCheck();
  let allPassed = true;
  for (const url of urlsToCheck) {
    const passed = await checkUrl(url);
    if (!passed) allPassed = false;
  }
  
  if (allPassed) {
    console.log('\n✅ All URLs passed SEO verification!');
    process.exit(0);
  } else {
    console.error('\n❌ Some URLs failed SEO verification.');
    process.exit(1);
  }
}

run();
