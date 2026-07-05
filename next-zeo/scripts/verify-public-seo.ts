import { execSync } from 'child_process';
import * as cheerio from 'cheerio';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

const urlsToCheck = [
  '/',
  '/tours',
  '/tours/everest-base-camp-trek',
  '/destinations',
  '/destinations/nepal',
  '/activities',
  '/activities/trekking',
  '/blog',
  '/blog/best-time-to-visit-nepal',
  '/kailash-mansarovar',
  '/contact',
  '/sitemap.xml',
  '/robots.txt'
];

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
    $('script[type="application/ld+json"]').each((i, el) => {
      hasJsonLd = true;
    });

    console.log(`  Title: ${title || 'MISSING'}`);
    console.log(`  Description: ${description ? 'Present' : 'MISSING'}`);
    console.log(`  Canonical: ${canonical || 'MISSING'}`);
    console.log(`  H1: ${h1 || 'MISSING'}`);
    console.log(`  JSON-LD: ${hasJsonLd ? 'Present' : 'MISSING'}`);

    // Check if it's an empty shell by looking for common main content containers
    const hasMainContent = $('main').length > 0 || $('#main-content').length > 0 || $('.prose').length > 0;
    
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
