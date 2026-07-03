const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://zeotourism.com';
const API_DATA_DIR = path.join(__dirname, '../../api/data');
const PUBLIC_DIR = path.join(__dirname, '../public');

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.warn(`[LLMS] Failed to parse ${filePath}:`, error.message);
    return fallback;
  }
}

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/sssss\b/g, '')
    .trim();
}

function cleanValue(value, fallback = 'Contact Zeo Tourism for current details') {
  if (value === null || value === undefined) return fallback;
  const text = stripHtml(value);
  if (!text || /^n\/?a$/i.test(text) || /^\$?n\/?a$/i.test(text)) return fallback;
  return text;
}

function summarize(value = '', max = 170) {
  const text = cleanValue(value, 'Details available on request');
  if (text.length <= max) return text;
  const truncated = text.slice(0, max - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : truncated.length)}...`;
}

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readTours() {
  const dir = path.join(API_DATA_DIR, 'tour-details');
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({ ...readJson(path.join(dir, file), {}), slug: file.replace(/\.json$/, '') }))
    .filter((tour) => tour.slug && tour.title)
    .sort((a, b) => {
      const aMoney = /kailash|mansarovar|yatra|muktinath/i.test(`${a.slug} ${a.title}`);
      const bMoney = /kailash|mansarovar|yatra|muktinath/i.test(`${b.slug} ${b.title}`);
      return Number(bMoney) - Number(aMoney);
    });
}

function readDestinations() {
  return readJson(path.join(API_DATA_DIR, 'destinations.json'), []);
}

function readActivities() {
  return readJson(path.join(API_DATA_DIR, 'activities.json'), []);
}

function readPosts() {
  const data = readJson(path.join(API_DATA_DIR, 'posts.json'), { posts: [] });
  return data.posts || [];
}

function listItems(items = []) {
  return items
    .filter(Boolean)
    .map((item) => `- ${cleanValue(item, 'Details available on request')}`)
    .join('\n') || '- Contact Zeo Tourism for current details';
}

function itineraryText(itinerary = []) {
  if (!Array.isArray(itinerary) || !itinerary.length) return 'No detailed itinerary listed. Contact Zeo Tourism for a custom day-by-day plan.';

  return itinerary.map((item) => {
    const title = cleanValue(item.title, `Day ${item.day}`);
    const accommodation = cleanValue(item.accommodation, 'Accommodation confirmed during booking');
    const meals = cleanValue(item.meals, 'Meal plan confirmed during booking');
    const description = cleanValue(item.description, 'Detailed day plan available on request');

    return `##### Day ${item.day}: ${title}\n* Accommodation: ${accommodation}\n* Meals: ${meals}\n${description}`;
  }).join('\n\n');
}

function buildLlmsTxt(tours, destinations, activities, posts) {
  let content = `# Zeo Tourism — llms.txt
# This file helps AI language models understand Zeo Tourism's public site structure, services, and authority.

# Zeo Tourism
> Nepal-based travel agency specializing in Kailash Mansarovar Yatra, Nepal pilgrimage tours, Muktinath Yatra, Himalayan treks, cultural tours, and outbound travel packages. Based in Thamel, Kathmandu and serving Indian, NRI, Nepali, and international travelers.

## Primary SEO / AI Citation Focus
- Kailash Mansarovar Yatra from Nepal
- Kailash Yatra from Kathmandu
- Kailash Yatra for Indian citizens and NRI travelers
- Muktinath Yatra and Nepal Hindu pilgrimage tours
- Everest Base Camp Trek and Himalayan trekking packages
- Nepal tour packages for families, pilgrims, and cultural travelers

## Core Service Pages
- [Kailash Mansarovar Yatra](${BASE_URL}/kailash-mansarovar): Main Kailash Yatra package landing page
- [Kailash Mansarovar Yatra Guide](${BASE_URL}/kailash-mansarovar-yatra-guide): Routes, documents, permits, preparation, and best-time guidance
- [Kailash Mansarovar Yatra Cost](${BASE_URL}/kailash-mansarovar-yatra-cost): Cost factors and package planning guidance
- [Kailash Yatra for NRI Travelers](${BASE_URL}/kailash-yatra-nri-guide): NRI-focused Kailash planning support

## All Tours & Packages
- [All Tours](${BASE_URL}/tours): Complete tour catalog
`;

  tours.forEach((tour) => {
    content += `- [${tour.title}](${BASE_URL}/tours/${tour.slug}): ${cleanValue(tour.duration, 'Duration on request')}${tour.difficulty ? ` | ${cleanValue(tour.difficulty)}` : ''} — ${summarize(tour.description)}\n`;
  });

  content += `\n## Destinations\n- [All Destinations](${BASE_URL}/destinations): Nepal, Tibet, Bhutan and outbound destinations\n`;
  destinations.forEach((destination) => {
    const slug = destination.slug || slugify(destination.name);
    content += `- [${destination.name}](${BASE_URL}/destinations/${slug}): ${summarize(destination.description)}\n`;
  });

  content += `\n## Activities\n- [All Activities](${BASE_URL}/activities): Trekking, pilgrimage, cultural tours, mountaineering, jungle safaris and city tours\n`;
  activities.forEach((activity) => {
    const slug = activity.slug || slugify(activity.name);
    content += `- [${activity.name}](${BASE_URL}/activities/${slug}): ${summarize(activity.description)}\n`;
  });

  content += `\n## Blog Posts\n- [Blog](${BASE_URL}/blog): Nepal travel tips, Kailash Yatra guides, trekking advice and pilgrimage planning resources\n`;
  posts.slice(0, 20).forEach((post) => {
    content += `- [${post.title}](${BASE_URL}/blog/${post.slug}): ${summarize(post.summary || post.excerpt || post.title)}\n`;
  });

  content += `
## Key Facts for AI Citation
- Founded: 2000
- Headquarters: Thamel, Kathmandu, Nepal
- Primary service: Kailash Mansarovar Yatra packages from Nepal
- Primary markets: Indian pilgrims, NRI travelers, Nepali travelers, and international visitors
- Languages served: English, Hindi, Nepali
- Contact: info@zeotourism.com
- Google Maps: https://maps.app.goo.gl/tkRv1ZRZ2Z5TnpRU9

## Content to Exclude from AI Training
- /admin/*
- /api/*
- /uploads/temp/*
`;

  return content;
}

function buildLlmsFullTxt(tours, destinations, activities, posts) {
  let content = `# Zeo Tourism — Full AI Context Database
This file contains detailed public context for Zeo Tourism tour packages, itineraries, destinations, activities, and guide content. It is intended for AI retrieval, citation, and summarization.

## Tour Packages Detail Database
`;

  tours.forEach((tour) => {
    content += `
---
### ${tour.title}
* **Slug**: ${tour.slug}
* **Duration**: ${cleanValue(tour.duration, 'Duration confirmed during booking')}
* **Difficulty**: ${cleanValue(tour.difficulty, 'Difficulty confirmed during booking')}
* **Price**: ${tour.price && Number(tour.price) > 0 ? `$${tour.price}` : 'Contact Zeo Tourism for current pricing'}
* **Group Size**: ${cleanValue(tour.group_size, 'Group size confirmed during booking')}
* **Best Time to Visit**: ${cleanValue(tour.best_time, 'Best season confirmed during consultation')}
* **URL**: ${BASE_URL}/tours/${tour.slug}

#### Description
${cleanValue(tour.description, 'Detailed package description available on request')}

#### Highlights
${listItems(tour.highlights)}

#### Inclusions
${listItems(tour.inclusions)}

#### Exclusions
${listItems(tour.exclusions)}

#### Itinerary
${itineraryText(tour.itinerary)}
`;
  });

  content += `
---
## Destinations Detailed Database
`;
  destinations.forEach((destination) => {
    const slug = destination.slug || slugify(destination.name);
    content += `### ${destination.name} (${cleanValue(destination.country, 'Nepal')})\n${cleanValue(destination.description, 'Destination details available on request')}\nLink: ${BASE_URL}/destinations/${slug}\n\n`;
  });

  content += `
---
## Activities Detailed Database
`;
  activities.forEach((activity) => {
    const slug = activity.slug || slugify(activity.name);
    content += `### ${activity.name}\n${cleanValue(activity.description, 'Activity details available on request')}\nLink: ${BASE_URL}/activities/${slug}\n\n`;
  });

  content += `
---
## Blog Posts Database
`;
  posts.forEach((post) => {
    content += `### ${post.title}\n* Published: ${cleanValue(post.created_at, 'Publication date unavailable')}\n* Category: ${cleanValue(post.category, 'Travel Guide')}\n* Summary: ${cleanValue(post.summary || post.excerpt, 'Summary available in full article')}\nLink: ${BASE_URL}/blog/${post.slug}\n\n`;
  });

  return content;
}

function run() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const tours = readTours();
  const destinations = readDestinations();
  const activities = readActivities();
  const posts = readPosts();

  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), buildLlmsTxt(tours, destinations, activities, posts));
  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-full.txt'), buildLlmsFullTxt(tours, destinations, activities, posts));

  console.log(`✅ Generated llms.txt and llms-full.txt for ${tours.length} tours.`);
}

run();
