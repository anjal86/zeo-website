const fs = require('fs');
const path = require('path');

const filesToUpdateRevalidate = [
  'app/tours/[slug]/page.tsx',
  'app/destinations/page.tsx',
  'app/destinations/[slug]/page.tsx',
  'app/activities/page.tsx',
  'app/activities/[slug]/page.tsx',
  'app/blog/page.tsx',
  'app/blog/[slug]/page.tsx',
  'app/page.tsx'
];

for (const file of filesToUpdateRevalidate) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/export const dynamic = 'force-dynamic';/g, 'export const revalidate = 3600;');
    
    // Replace URL in backticks: `https://www.zeotourism.com/tours/${slug}` -> `${process.env.APP_URL || 'https://www.zeotourism.com'}/tours/${slug}`
    content = content.replace(/`https:\/\/www\.zeotourism\.com(.*?)`/g, '`${process.env.APP_URL || \'https://www.zeotourism.com\'}$1`');
    
    // Replace URL in double quotes: "https://www.zeotourism.com" -> process.env.APP_URL || 'https://www.zeotourism.com'
    content = content.replace(/"https:\/\/www\.zeotourism\.com(.*?)"/g, '(process.env.APP_URL || \'https://www.zeotourism.com\') + \'$1\'');
    
    // Clean up empty strings like + ''
    content = content.replace(/ \+ ''/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

// Update schema.ts
const schemaPath = path.join(__dirname, 'src/server/seo/schema.ts');
if (fs.existsSync(schemaPath)) {
  let content = fs.readFileSync(schemaPath, 'utf8');
  content = content.replace(/"https:\/\/www\.zeotourism\.com([^"]*)"/g, '`${process.env.APP_URL || "https://www.zeotourism.com"}$1`');
  fs.writeFileSync(schemaPath, content, 'utf8');
  console.log(`Updated schema.ts`);
}
