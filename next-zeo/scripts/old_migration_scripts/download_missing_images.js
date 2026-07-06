import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import https from 'https';

const DB_CONFIG = {
  host: '127.0.0.1',
  port: 3308,
  user: 'zeo_user',
  password: 'zeopassword',
  database: 'zeo_website'
};

const BASE_URL = 'https://test.zeotourism.com';
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Helper to download a file
const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        // Follow redirect
        file.close();
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function syncImages() {
  const connection = await mysql.createConnection(DB_CONFIG);
  const imagePaths = new Set();

  try {
    console.log('Querying database for image URLs...');

    // Tours
    try {
      const [tours] = await connection.query('SELECT image_url, gallery FROM tours');
      tours.forEach(t => {
        if (t.image_url) imagePaths.add(t.image_url);
        if (t.gallery) {
          try {
            const parsed = typeof t.gallery === 'string' ? JSON.parse(t.gallery) : t.gallery;
            if (Array.isArray(parsed)) parsed.forEach(img => imagePaths.add(img));
          } catch (e) {}
        }
      });
    } catch(e) {}

    // Destinations
    try {
      const [destinations] = await connection.query('SELECT image_url, gallery FROM destinations');
      destinations.forEach(d => {
        if (d.image_url) imagePaths.add(d.image_url);
        if (d.gallery) {
          try {
            const parsed = typeof d.gallery === 'string' ? JSON.parse(d.gallery) : d.gallery;
            if (Array.isArray(parsed)) parsed.forEach(img => imagePaths.add(img));
          } catch (e) {}
        }
      });
    } catch(e) {}

    // Activities
    try {
      const [activities] = await connection.query('SELECT image_url FROM activities');
      activities.forEach(a => {
        if (a.image_url) imagePaths.add(a.image_url);
      });
    } catch(e) {}

    // Sliders
    try {
      const [sliders] = await connection.query('SELECT image_url FROM sliders');
      sliders.forEach(s => {
        if (s.image_url) imagePaths.add(s.image_url);
      });
    } catch(e) {}
    
    // Team
    try {
      const [team] = await connection.query('SELECT image_url FROM team');
      team.forEach(t => {
        if (t.image_url) imagePaths.add(t.image_url);
      });
    } catch(e) {}
    
    // Testimonials
    try {
      const [testimonials] = await connection.query('SELECT image_url FROM testimonials');
      testimonials.forEach(t => {
        if (t.image_url) imagePaths.add(t.image_url);
      });
    } catch(e) {}

    console.log(`Found ${imagePaths.size} unique image references.`);

    let downloaded = 0;
    let failed = 0;
    let skipped = 0;

    for (let imgPath of imagePaths) {
      if (!imgPath || imgPath.startsWith('http') || imgPath.includes('unsplash.com')) {
        skipped++;
        continue;
      }

      // Fix double slashes or missing leading slashes
      if (!imgPath.startsWith('/')) imgPath = '/' + imgPath;
      
      const localPath = path.join(PUBLIC_DIR, imgPath);
      const remoteUrl = `${BASE_URL}${imgPath}`;

      if (!fs.existsSync(localPath)) {
        try {
          console.log(`Downloading: ${imgPath}`);
          await downloadFile(remoteUrl, localPath);
          downloaded++;
        } catch (err) {
          console.error(`Failed to download ${imgPath}: ${err.message}`);
          failed++;
        }
      } else {
        skipped++;
      }
    }

    console.log(`\nSync Complete!`);
    console.log(`Downloaded: ${downloaded}`);
    console.log(`Skipped (already exists or external): ${skipped}`);
    console.log(`Failed: ${failed}`);

  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await connection.end();
  }
}

syncImages();
