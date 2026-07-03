const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://zeotourism.com';
const DIST_DIR = path.join(__dirname, '../dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');
const API_DATA_DIR = path.join(__dirname, '../../api/data');

const DEFAULT_IMAGE = `${BASE_URL}/images/og-image.jpg`;
const ORGANIZATION_ID = `${BASE_URL}/#organization`;

const MONEY_SLUG_HINTS = [
  'kailash',
  'mansarovar',
  'yatra',
  'muktinath',
  'everest-base-camp',
  'annapurna-base-camp',
  'nepal-heritage'
];

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.warn(`[SEO prerender] Failed to parse ${filePath}:`, error.message);
    return fallback;
  }
}

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateAtWord(value = '', maxLength = 160) {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : truncated.length)}...`;
}

function normalizeUrl(route) {
  if (!route || route === '/') return BASE_URL;
  return `${BASE_URL}${route.startsWith('/') ? route : `/${route}`}`.replace(/\/$/, '');
}

function normalizeImage(image) {
  if (!image) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
}

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toIsoDuration(duration) {
  if (!duration) return undefined;
  const text = String(duration).toLowerCase();
  const nightsDays = text.match(/(\d+)\s*nights?\s*(\d+)\s*days?/i);
  if (nightsDays) return `P${Number(nightsDays[2])}D`;
  const days = text.match(/(\d+)\s*days?/i);
  if (days) return `P${Number(days[1])}D`;
  return duration;
}

function currentPlusMonths(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

function readTours() {
  const dir = path.join(API_DATA_DIR, 'tour-details');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({ ...readJson(path.join(dir, file), {}), slug: file.replace(/\.json$/, '') }))
    .filter((tour) => tour.slug && tour.title);
}

function readPosts() {
  const data = readJson(path.join(API_DATA_DIR, 'posts.json'), { posts: [] });
  return data.posts || [];
}

function readDestinations() {
  return readJson(path.join(API_DATA_DIR, 'destinations.json'), []);
}

function readActivities() {
  return readJson(path.join(API_DATA_DIR, 'activities.json'), []);
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['TravelAgency', 'Organization'],
    '@id': ORGANIZATION_ID,
    name: 'Zeo Tourism',
    url: BASE_URL,
    logo: `${BASE_URL}/logo/zeo-logo.png`,
    description: 'Nepal-based travel agency specializing in Kailash Mansarovar Yatra, Nepal pilgrimage tours, Himalayan treks, cultural tours, and outbound travel packages.',
    foundingDate: '2000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Thamel, Kathmandu',
      addressLocality: 'Kathmandu',
      addressRegion: 'Bagmati Province',
      addressCountry: 'NP'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@zeotourism.com',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi', 'Nepali']
    },
    knowsAbout: [
      'Kailash Mansarovar Yatra',
      'Mount Kailash Pilgrimage',
      'Kailash Yatra from Nepal',
      'Kailash Yatra for Indian Citizens',
      'Kailash Yatra for NRI Travelers',
      'Muktinath Yatra',
      'Nepal Tour Packages',
      'Everest Base Camp Trek'
    ]
  };
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

function touristTripSchema(tour) {
  const url = normalizeUrl(`/tours/${tour.slug}`);
  const price = Number(tour.price);
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${url}#trip`,
    name: tour.title,
    description: truncateAtWord(tour.description, 500),
    image: normalizeImage(tour.image),
    url,
    provider: { '@id': ORGANIZATION_ID },
    touristType: ['Pilgrim', 'Adventure Traveler', 'Cultural Traveler'],
    ...(tour.duration && { duration: toIsoDuration(tour.duration) }),
    ...(tour.location && { itinerary: { '@type': 'ItemList', name: `${tour.title} itinerary` } }),
    ...(price > 0 && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        priceValidUntil: currentPlusMonths(6),
        url,
        seller: { '@id': ORGANIZATION_ID }
      }
    })
  };
}

function pageHtmlContent(page) {
  const bullets = (page.bullets || [])
    .filter(Boolean)
    .slice(0, 8)
    .map((item) => `<li>${escapeHtml(stripHtml(item))}</li>`)
    .join('');

  return `<main data-prerender-content="true" style="padding:40px;max-width:960px;margin:0 auto;font-family:Inter,Arial,sans-serif;line-height:1.65;color:#111827">
    <h1>${escapeHtml(page.h1 || page.title)}</h1>
    <p>${escapeHtml(stripHtml(page.description))}</p>
    ${bullets ? `<ul>${bullets}</ul>` : ''}
    <p><a href="${escapeHtml(page.canonical)}">View ${escapeHtml(page.h1 || page.title)} on Zeo Tourism</a></p>
  </main>`;
}

function replaceOrInsertMeta(html, selector, replacement) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+${escapedSelector}[^>]*>`, 'i');
  if (regex.test(html)) return html.replace(regex, replacement);
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function applySeo(template, page) {
  let html = template;
  const title = truncateAtWord(page.title, 60);
  const description = truncateAtWord(page.description, 160);
  const canonical = page.canonical;
  const image = normalizeImage(page.image);

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = replaceOrInsertMeta(html, 'name="description"', `<meta name="description" content="${escapeHtml(description)}" />`);
  html = replaceOrInsertMeta(html, 'name="keywords"', `<meta name="keywords" content="${escapeHtml(page.keywords || '')}" />`);
  html = replaceOrInsertMeta(html, 'property="og:title"', `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = replaceOrInsertMeta(html, 'property="og:description"', `<meta property="og:description" content="${escapeHtml(description)}" />`);
  html = replaceOrInsertMeta(html, 'property="og:url"', `<meta property="og:url" content="${escapeHtml(canonical)}" />`);
  html = replaceOrInsertMeta(html, 'property="og:image"', `<meta property="og:image" content="${escapeHtml(image)}" />`);
  html = replaceOrInsertMeta(html, 'name="twitter:title"', `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  html = replaceOrInsertMeta(html, 'name="twitter:description"', `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  html = replaceOrInsertMeta(html, 'name="twitter:image"', `<meta name="twitter:image" content="${escapeHtml(image)}" />`);
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  html = html.replace(/\s*<script type="application\/ld\+json" data-prerender-seo>[\s\S]*?<\/script>/g, '');
  html = html.replace('</head>', `  <script type="application/ld+json" data-prerender-seo>${JSON.stringify(page.schema)}</script>\n</head>`);
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${pageHtmlContent(page)}</div>`);
  return html;
}

function routeToOutput(route) {
  if (route === '/') return INDEX_PATH;
  const clean = route.replace(/^\//, '').replace(/\/$/, '');
  return path.join(DIST_DIR, clean, 'index.html');
}

function writeRoute(template, page) {
  const output = routeToOutput(page.route);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, applySeo(template, page));
}

function buildPages() {
  const tours = readTours();
  const destinations = readDestinations();
  const activities = readActivities();
  const posts = readPosts();

  const staticPages = [
    {
      route: '/',
      title: 'Kailash Mansarovar Yatra & Nepal Tour Packages | Zeo Tourism',
      h1: 'Kailash Mansarovar Yatra & Nepal Tour Packages',
      description: 'Plan Kailash Mansarovar Yatra, Nepal pilgrimage tours, Muktinath Yatra, Everest Base Camp Trek, and custom Nepal holidays with Zeo Tourism.',
      keywords: 'Kailash Mansarovar Yatra, Nepal tour packages, Muktinath Yatra, Everest Base Camp Trek, Nepal travel agency',
      bullets: ['Kailash Mansarovar Yatra packages', 'Nepal pilgrimage tours', 'Himalayan treks and cultural tours']
    },
    {
      route: '/kailash-mansarovar',
      title: 'Kailash Mansarovar Yatra Package from Nepal | Zeo Tourism',
      h1: 'Kailash Mansarovar Yatra Package from Nepal',
      description: 'Expert-guided Kailash Mansarovar Yatra packages from Kathmandu with visa guidance, Tibet permits, route planning, guides, and pilgrimage support.',
      keywords: 'Kailash Mansarovar Yatra, Kailash Yatra from Nepal, Kailash package from Kathmandu, Mount Kailash pilgrimage',
      bullets: ['Kathmandu-based Kailash Yatra support', 'Tibet permit and visa guidance', 'Overland and helicopter route options']
    },
    {
      route: '/kailash-mansarovar-yatra-guide',
      title: 'Kailash Mansarovar Yatra Guide | Routes, Permits, Best Time',
      h1: 'Kailash Mansarovar Yatra Guide',
      description: 'Complete Kailash Mansarovar Yatra guide covering routes, permits, documents, best travel season, fitness preparation, cost factors, and NRI support.',
      keywords: 'Kailash Mansarovar Yatra guide, Kailash Yatra route, Kailash Yatra permits, Kailash Yatra best time',
      bullets: ['Routes and permit guidance', 'Best time from May to September', 'Preparation for Indian and NRI pilgrims']
    },
    {
      route: '/kailash-mansarovar-yatra-cost',
      title: 'Kailash Mansarovar Yatra Cost Guide | Zeo Tourism',
      h1: 'Kailash Mansarovar Yatra Cost Guide',
      description: 'Understand Kailash Mansarovar Yatra cost factors including route, duration, permit handling, accommodation level, transportation, and support services.',
      keywords: 'Kailash Mansarovar Yatra cost, Kailash Yatra package price, Kailash Yatra from Kathmandu cost',
      bullets: ['Route-based cost factors', 'Group size and duration impact', 'Permit and logistics considerations']
    },
    {
      route: '/kailash-yatra-nri-guide',
      title: 'Kailash Yatra for NRI Travelers | Zeo Tourism',
      h1: 'Kailash Yatra for NRI Travelers',
      description: 'Kailash Mansarovar Yatra planning support for NRI travelers, including document guidance, Kathmandu coordination, route selection, and pilgrimage logistics.',
      keywords: 'Kailash Yatra for NRI, Kailash Mansarovar for NRI, NRI Kailash Yatra from Nepal',
      bullets: ['NRI-friendly documentation guidance', 'Kathmandu coordination', 'English, Hindi, and Nepali support']
    },
    {
      route: '/tours',
      title: 'Nepal Tour Packages, Kailash Yatra & Treks | Zeo Tourism',
      h1: 'Nepal Tour Packages, Kailash Yatra & Treks',
      description: 'Explore Zeo Tourism tour packages including Kailash Mansarovar Yatra, Muktinath Yatra, Everest Base Camp Trek, Annapurna treks, Nepal heritage tours, and outbound holidays.',
      keywords: 'Nepal tour packages, Kailash Yatra packages, Nepal trekking packages, Muktinath tour package',
      bullets: tours.slice(0, 8).map((tour) => tour.title)
    },
    {
      route: '/destinations',
      title: 'Nepal, Tibet & Bhutan Travel Destinations | Zeo Tourism',
      h1: 'Nepal, Tibet & Bhutan Travel Destinations',
      description: 'Discover travel destinations for pilgrimage, trekking, culture, heritage, wildlife, and Himalayan journeys across Nepal, Tibet, Bhutan, and beyond.',
      keywords: 'Nepal destinations, Tibet tours, Bhutan tour packages, Nepal pilgrimage destinations',
      bullets: destinations.slice(0, 8).map((destination) => destination.name)
    },
    {
      route: '/activities',
      title: 'Trekking, Pilgrimage & Cultural Tour Activities | Zeo Tourism',
      h1: 'Trekking, Pilgrimage & Cultural Tour Activities',
      description: 'Explore pilgrimage tours, trekking, mountaineering, jungle safari, cultural tours, city tours, meditation, and adventure travel activities with Zeo Tourism.',
      keywords: 'Nepal trekking, pilgrimage tours, Nepal cultural tours, jungle safari Nepal, adventure activities Nepal',
      bullets: activities.slice(0, 8).map((activity) => activity.name)
    }
  ];

  const tourPages = tours.map((tour) => ({
    route: `/tours/${tour.slug}`,
    title: `${tour.title} | Zeo Tourism`,
    h1: tour.title,
    description: tour.description || `${tour.title} package by Zeo Tourism.`,
    keywords: [tour.title, tour.location, tour.category, tour.difficulty, 'Nepal tour package', 'Zeo Tourism'].filter(Boolean).join(', '),
    image: tour.image,
    bullets: [...(tour.highlights || []), ...(tour.inclusions || [])],
    schema: [organizationSchema(), touristTripSchema(tour), breadcrumbSchema([
      { name: 'Home', url: BASE_URL },
      { name: 'Tours', url: `${BASE_URL}/tours` },
      { name: tour.title, url: normalizeUrl(`/tours/${tour.slug}`) }
    ])]
  }));

  const destinationPages = destinations.map((destination) => {
    const slug = destination.slug || slugify(destination.name);
    return {
      route: `/destinations/${slug}`,
      title: `${destination.name} Tours & Travel Packages | Zeo Tourism`,
      h1: `${destination.name} Tours & Travel Packages`,
      description: destination.description || `Explore ${destination.name} travel packages with Zeo Tourism.`,
      keywords: `${destination.name} tours, ${destination.name} travel packages, Nepal destinations, Zeo Tourism`,
      image: destination.image,
      bullets: ['Guided travel packages', 'Custom itinerary planning', 'Local travel support'],
      schema: [organizationSchema(), breadcrumbSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Destinations', url: `${BASE_URL}/destinations` },
        { name: destination.name, url: normalizeUrl(`/destinations/${slug}`) }
      ])]
    };
  });

  const activityPages = activities.map((activity) => {
    const slug = activity.slug || slugify(activity.name);
    return {
      route: `/activities/${slug}`,
      title: `${activity.name} Tours & Packages | Zeo Tourism`,
      h1: `${activity.name} Tours & Packages`,
      description: activity.description || `Explore ${activity.name} packages with Zeo Tourism.`,
      keywords: `${activity.name}, Nepal travel activities, Nepal tour packages, Zeo Tourism`,
      image: activity.image,
      bullets: ['Curated activity-based packages', 'Guided local support', 'Custom travel planning'],
      schema: [organizationSchema(), breadcrumbSchema([
        { name: 'Home', url: BASE_URL },
        { name: 'Activities', url: `${BASE_URL}/activities` },
        { name: activity.name, url: normalizeUrl(`/activities/${slug}`) }
      ])]
    };
  });

  const blogPages = posts.map((post) => ({
    route: `/blog/${post.slug}`,
    title: `${post.title} | Zeo Tourism Blog`,
    h1: post.title,
    description: post.summary || post.excerpt || `${post.title} by Zeo Tourism.`,
    keywords: [post.title, post.category, ...(post.tags || []), 'Nepal travel blog'].filter(Boolean).join(', '),
    image: post.image,
    bullets: post.tags || [],
    schema: [organizationSchema(), breadcrumbSchema([
      { name: 'Home', url: BASE_URL },
      { name: 'Blog', url: `${BASE_URL}/blog` },
      { name: post.title, url: normalizeUrl(`/blog/${post.slug}`) }
    ])]
  }));

  return [...staticPages, ...tourPages, ...destinationPages, ...activityPages, ...blogPages]
    .map((page) => ({
      ...page,
      canonical: normalizeUrl(page.route),
      image: page.image || DEFAULT_IMAGE,
      schema: page.schema || [organizationSchema(), breadcrumbSchema([
        { name: 'Home', url: BASE_URL },
        { name: page.h1 || page.title, url: normalizeUrl(page.route) }
      ])]
    }))
    .sort((a, b) => {
      const aMoney = MONEY_SLUG_HINTS.some((hint) => a.route.includes(hint) || a.title.toLowerCase().includes(hint));
      const bMoney = MONEY_SLUG_HINTS.some((hint) => b.route.includes(hint) || b.title.toLowerCase().includes(hint));
      return Number(bMoney) - Number(aMoney);
    });
}

function run() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.warn(`[SEO prerender] Skipped. Build output not found at ${INDEX_PATH}`);
    return;
  }

  const template = fs.readFileSync(INDEX_PATH, 'utf8');
  const pages = buildPages();
  pages.forEach((page) => writeRoute(template, page));
  console.log(`✅ SEO prerendered ${pages.length} public route snapshots.`);
}

run();
