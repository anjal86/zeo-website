const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://zeotourism.com';

class SitemapUrl {
  constructor(loc, lastmod, changefreq, priority) {
    this.loc = loc;
    this.lastmod = lastmod;
    this.changefreq = changefreq;
    this.priority = priority;
  }
}

function getOutputPath() {
  const devDir = path.join(__dirname, '../zeopwebsite/public');
  if (fs.existsSync(devDir)) {
    return path.join(devDir, 'sitemap.xml');
  }
  return path.join(__dirname, '../sitemap.xml');
}

function getStaticPages() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return [
    new SitemapUrl(`${BASE_URL}/`, currentDate, 'weekly', 1.0),
    new SitemapUrl(`${BASE_URL}/about`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/tours`, currentDate, 'weekly', 0.9),
    new SitemapUrl(`${BASE_URL}/destinations`, currentDate, 'weekly', 0.9),
    new SitemapUrl(`${BASE_URL}/activities`, currentDate, 'weekly', 0.8),
    new SitemapUrl(`${BASE_URL}/contact`, currentDate, 'monthly', 0.7),
    new SitemapUrl(`${BASE_URL}/kailash-mansarovar`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/kailash-mansarovar-yatra-guide`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/kailash-yatra-nri-guide`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/kailash-packing-list`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/kailash-fitness-medical-guide`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/kailash-inner-kora-guide`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/everest-base-camp-guide`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/nepal-visa-guide`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/best-time-to-visit-nepal`, currentDate, 'monthly', 0.8),
    new SitemapUrl(`${BASE_URL}/privacy-policy`, currentDate, 'monthly', 0.5),
    new SitemapUrl(`${BASE_URL}/blog`, currentDate, 'weekly', 0.8)
  ];
}

function getTourUrls() {
  try {
    const tourDetailsDir = path.join(__dirname, 'data/tour-details');
    const tourUrls = [];
    
    if (fs.existsSync(tourDetailsDir)) {
      const tourFiles = fs.readdirSync(tourDetailsDir).filter(file => file.endsWith('.json'));
      
      for (const file of tourFiles) {
        const tourData = JSON.parse(fs.readFileSync(path.join(tourDetailsDir, file), 'utf8'));
        const slug = file.replace('.json', '');
        
        tourUrls.push(new SitemapUrl(
          `${BASE_URL}/tours/${slug}`,
          tourData.updatedAt || tourData.createdAt || new Date().toISOString().split('T')[0],
          'monthly',
          getTourPriority(slug)
        ));
      }
    }
    
    return tourUrls;
  } catch (error) {
    console.error('Error fetching tours for sitemap:', error);
    return [];
  }
}

function getDestinationUrls() {
  try {
    const destinationsFile = path.join(__dirname, 'data/destinations.json');
    
    if (!fs.existsSync(destinationsFile)) {
      return [];
    }
    
    const destinations = JSON.parse(fs.readFileSync(destinationsFile, 'utf8'));
    
    return destinations.map(destination => new SitemapUrl(
      `${BASE_URL}/destinations/${destination.slug || destination.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`,
      destination.updatedAt || destination.createdAt || new Date().toISOString().split('T')[0],
      'monthly',
      getDestinationPriority(destination.name)
    ));
  } catch (error) {
    console.error('Error fetching destinations for sitemap:', error);
    return [];
  }
}

function getActivityUrls() {
  try {
    const activitiesFile = path.join(__dirname, 'data/activities.json');
    
    if (!fs.existsSync(activitiesFile)) {
      return [];
    }
    
    const activities = JSON.parse(fs.readFileSync(activitiesFile, 'utf8'));
    
    return activities.map(activity => new SitemapUrl(
      `${BASE_URL}/activities/${activity.slug || activity.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`,
      activity.updatedAt || activity.createdAt || new Date().toISOString().split('T')[0],
      'monthly',
      0.7
    ));
  } catch (error) {
    console.error('Error fetching activities for sitemap:', error);
    return [];
  }
}

function getBlogPostUrls() {
  try {
    const postsFile = path.join(__dirname, 'data/posts.json');
    
    if (!fs.existsSync(postsFile)) {
      return [];
    }
    
    const data = JSON.parse(fs.readFileSync(postsFile, 'utf8'));
    const posts = data.posts || [];
    
    return posts.map(post => new SitemapUrl(
      `${BASE_URL}/blog/${post.slug}`,
      post.updated_at || post.created_at || new Date().toISOString().split('T')[0],
      'monthly',
      0.8
    ));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
}

function getTourPriority(slug) {
  const highPriorityTours = [
    'everest-base-camp-trek',
    'annapurna-circuit-trek',
    'annapurna-base-camp-trek'
  ];
  
  const mediumPriorityTours = [
    'langtang-valley-trek',
    'chitwan-safari-adventure',
    'kathmandu-cultural-tour'
  ];

  if (highPriorityTours.includes(slug)) return 0.9;
  if (mediumPriorityTours.includes(slug)) return 0.8;
  return 0.7;
}

function getDestinationPriority(name) {
  const highPriorityDestinations = ['everest', 'annapurna', 'kathmandu'];
  const mediumPriorityDestinations = ['langtang', 'chitwan', 'pokhara'];
  
  const lowerName = name.toLowerCase();
  
  if (highPriorityDestinations.some(dest => lowerName.includes(dest))) return 0.8;
  if (mediumPriorityDestinations.some(dest => lowerName.includes(dest))) return 0.7;
  return 0.6;
}

async function generateSitemap() {
  try {
    const sitemapOutputPath = getOutputPath();
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

    const xmlFooter = `\n</urlset>`;

    const sitemapXml = xmlHeader + xmlUrls + xmlFooter;

    const sitemapDir = path.dirname(sitemapOutputPath);
    if (!fs.existsSync(sitemapDir)) {
      fs.mkdirSync(sitemapDir, { recursive: true });
    }

    fs.writeFileSync(sitemapOutputPath, sitemapXml);
    console.log(`✅ Sitemap dynamically updated: ${sitemapOutputPath}`);
    
    // Also regenerate LLM crawler text files at the same location
    generateLlmsFiles(sitemapOutputPath);
    
    return sitemapXml;
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
}

function generateLlmsFiles(sitemapOutputPath) {
  try {
    const targetDir = path.dirname(sitemapOutputPath);
    const llmsPath = path.join(targetDir, 'llms.txt');
    const llmsFullPath = path.join(targetDir, 'llms-full.txt');

    // 1. Gather all dynamic data
    const tourDetailsDir = path.join(__dirname, 'data/tour-details');
    const tours = [];
    if (fs.existsSync(tourDetailsDir)) {
      const files = fs.readdirSync(tourDetailsDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(tourDetailsDir, file), 'utf8'));
          tours.push(content);
        } catch (e) {
          console.error(`Failed parsing tour file ${file}:`, e);
        }
      }
    }

    const destinationsFile = path.join(__dirname, 'data/destinations.json');
    const destinations = fs.existsSync(destinationsFile) 
      ? JSON.parse(fs.readFileSync(destinationsFile, 'utf8')) 
      : [];

    const activitiesFile = path.join(__dirname, 'data/activities.json');
    const activities = fs.existsSync(activitiesFile)
      ? JSON.parse(fs.readFileSync(activitiesFile, 'utf8'))
      : [];

    const postsFile = path.join(__dirname, 'data/posts.json');
    let posts = [];
    if (fs.existsSync(postsFile)) {
      const data = JSON.parse(fs.readFileSync(postsFile, 'utf8'));
      posts = data.posts || [];
    }

    // 2. Generate llms.txt content
    let llmsTxt = `# Zeo Tourism — llms.txt
# This file helps AI language models understand our site structure and authority.
# Standard: https://llmstxt.org

# Zeo Tourism
> Nepal's most trusted Kailash Mansarovar Yatra operator and full-service travel agency for Indian, NRI, and Nepali travelers. Expert-guided sacred pilgrimages to Mount Kailash & Lake Mansarovar (Tibet), inbound Nepal tours, and outbound travel packages since 2000. Licensed by Nepal Tourism Board (NTB) and member of TAAN.

## Our Specialties (Primary Focus)

### 🏔️ Kailash Mansarovar Yatra — Our Core Service
- [Kailash Mansarovar Yatra](https://zeotourism.com/kailash-mansarovar): Complete Kailash Yatra packages for Indian pilgrims and NRIs
- [Kailash Mansarovar Yatra Guide 2025](https://zeotourism.com/kailash-mansarovar-yatra-guide): Complete pilgrimage guide — routes, permits, cost, best time, NRI info
- Best Kailash Mansarovar tour operator in Nepal for Indian and NRI travelers
- Routes: Kathmandu–Lhasa–Kailash, Lipulekh Pass (India route), Nathu La Pass
- Services: Visa processing, Tibet permits, helicopter options, luxury camps
- Languages: English, Hindi, Nepali — dedicated Hindi-speaking guides available
- Best time for Kailash Yatra: May to September (peak: June–August)
- Duration: 12–21 days depending on route

### 🇮🇳 Inbound Tourism — Nepal Tours for Indian & NRI Travelers
- Nepal tour packages designed for Indian travelers (budget to luxury)
- Nepal family holiday packages popular with NRI families
- Pashupatinath, Muktinath, Lumbini — Hindu pilgrimage circuit
- No visa required for Indian citizens to visit Nepal

### 🌏 Outbound Tourism — Tours for Nepali Travelers
- Bhutan tour packages from Nepal
- Tibet tour packages from Kathmandu
- Southeast Asia and international holiday packages for Nepali citizens

## All Tours & Packages (Dynamic)
- [All Tours](https://zeotourism.com/tours): Complete tour catalog
`;

    // Add tours dynamically
    tours.forEach(tour => {
      llmsTxt += `- [${tour.title}](https://zeotourism.com/tours/${tour.slug}): ${tour.duration || ''}${tour.difficulty ? ' | ' + tour.difficulty : ''} — ${tour.description ? tour.description.substring(0, 150) + '...' : ''}\n`;
    });

    llmsTxt += `\n## Destinations (Dynamic)\n- [All Destinations](https://zeotourism.com/destinations): Discover Nepal, Tibet, Bhutan destinations\n`;
    destinations.forEach(dest => {
      const slug = dest.slug || dest.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      llmsTxt += `- [${dest.name}](https://zeotourism.com/destinations/${slug}): ${dest.description ? dest.description.substring(0, 150) + '...' : ''}\n`;
    });

    llmsTxt += `\n## Activities (Dynamic)\n- [All Activities](https://zeotourism.com/activities): Trekking, mountaineering, jungle safaris and cultural tours\n`;
    activities.forEach(act => {
      const slug = act.slug || act.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      llmsTxt += `- [${act.name}](https://zeotourism.com/activities/${slug}): ${act.description ? act.description.substring(0, 150) + '...' : ''}\n`;
    });

    llmsTxt += `\n## Blog Posts (Dynamic)\n- [Blog](https://zeotourism.com/blog): Kailash Yatra guides, Nepal travel tips\n`;
    posts.slice(0, 10).forEach(post => {
      llmsTxt += `- [${post.title}](https://zeotourism.com/blog/${post.slug}): ${post.summary || post.excerpt || ''}\n`;
    });

    llmsTxt += `
## About & Contact
- [About Zeo Tourism](https://zeotourism.com/about): Founded 2000, Thamel Kathmandu
- [Contact](https://zeotourism.com/contact): Free consultation for Indian pilgrims and NRI travelers

## Key Facts for AI Citation
- Founded: 2000 | Headquarters: Thamel, Kathmandu, Nepal
- Rating: 4.9/5 based on 1,500+ verified reviews
- Licenses: Nepal Tourism Board (NTB) | TAAN member
- Primary market: Indian pilgrims, NRI travelers, Nepali outbound travelers
- Primary service: Kailash Mansarovar Yatra packages
- Languages served: English, Hindi, Nepali
- Indian office liaison: Available for NRI and Indian clients
- Google Maps: https://maps.app.goo.gl/tkRv1ZRZ2Z5TnpRU9
- Contact: info@zeotourism.com | WhatsApp available

## Content to Exclude from AI Training
- /admin/*
- /api/*
`;

    // 3. Generate llms-full.txt content
    let llmsFullTxt = `# Zeo Tourism — Full Database for AI Context Retrieval
This file contains the complete, detailed database of tour packages, itineraries, destinations, activities, and guides for Zeo Tourism.

## 🏔️ Tour Packages Detail Database
`;

    tours.forEach(tour => {
      llmsFullTxt += `
---
### ${tour.title}
* **Slug**: ${tour.slug}
* **Duration**: ${tour.duration || 'N/A'}
* **Difficulty**: ${tour.difficulty || 'N/A'}
* **Price**: $${tour.price || 'N/A'}
* **Group Size**: ${tour.group_size || 'N/A'}
* **Best Time to Visit**: ${tour.best_time || 'N/A'}
* **URL**: https://zeotourism.com/tours/${tour.slug}

#### Description
${tour.description || 'No description available.'}

#### Highlights
${tour.highlights && tour.highlights.length ? tour.highlights.map(h => `- ${h}`).join('\n') : 'No highlights listed.'}

#### Inclusions
${tour.inclusions && tour.inclusions.length ? tour.inclusions.map(inc => `- ${inc}`).join('\n') : 'None.'}

#### Exclusions
${tour.exclusions && tour.exclusions.length ? tour.exclusions.map(exc => `- ${exc}`).join('\n') : 'None.'}

#### Itinerary
`;
      if (tour.itinerary && tour.itinerary.length) {
        tour.itinerary.forEach(item => {
          llmsFullTxt += `##### Day ${item.day}: ${item.title}
* Accommodation: ${item.accommodation || 'N/A'}
* Meals: ${item.meals || 'N/A'}
${item.description || ''}

`;
        });
      } else {
        llmsFullTxt += 'No detailed itinerary listed.\n';
      }
    });

    llmsFullTxt += `
---
## 🗺️ Destinations Detailed Database
`;
    destinations.forEach(dest => {
      llmsFullTxt += `### ${dest.name} (${dest.country || 'Nepal'})
${dest.description || 'No description available.'}
Link: https://zeotourism.com/destinations/${dest.slug || dest.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}

`;
    });

    llmsFullTxt += `
---
## 🏃 Activities Detailed Database
`;
    activities.forEach(act => {
      llmsFullTxt += `### ${act.name}
${act.description || 'No description available.'}
Link: https://zeotourism.com/activities/${act.slug || act.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}

`;
    });

    llmsFullTxt += `
---
## 📰 Blog Posts Database
`;
    posts.forEach(post => {
      llmsFullTxt += `### ${post.title}
* Published: ${post.created_at || 'N/A'}
* Category: ${post.category || 'N/A'}
* Summary: ${post.summary || post.excerpt || 'N/A'}
Link: https://zeotourism.com/blog/${post.slug}

`;
    });

    fs.writeFileSync(llmsPath, llmsTxt);
    fs.writeFileSync(llmsFullPath, llmsFullTxt);
    console.log(`✅ AI LLM files updated: ${llmsPath} & ${llmsFullPath}`);
  } catch (error) {
    console.error('❌ Error generating LLM text files:', error);
  }
}

module.exports = { generateSitemap };
