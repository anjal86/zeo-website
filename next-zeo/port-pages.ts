import fs from 'fs';
import path from 'path';

const pagesToPort = [
  { file: 'About.tsx', route: 'about' },
  { file: 'Contact.tsx', route: 'contact' },
  { file: 'PrivacyPolicy.tsx', route: 'privacy-policy' },
  { file: 'KailashMansarovar.tsx', route: 'kailash-mansarovar' },
  { file: 'KailashGuide.tsx', route: 'kailash-mansarovar-yatra-guide' },
  { file: 'KailashCostGuide.tsx', route: 'kailash-mansarovar-yatra-cost' },
  { file: 'KailashDocumentsGuide.tsx', route: 'kailash-mansarovar-yatra-documents-permits' },
  { file: 'NRIGuide.tsx', route: 'kailash-yatra-nri-guide' },
  { file: 'KailashPackingList.tsx', route: 'kailash-packing-list' },
  { file: 'KailashMedicalGuide.tsx', route: 'kailash-fitness-medical-guide' },
  { file: 'KailashInnerKora.tsx', route: 'kailash-inner-kora-guide' },
  { file: 'EverestGuide.tsx', route: 'everest-base-camp-guide' },
  { file: 'NepalVisaGuide.tsx', route: 'nepal-visa-guide' },
  { file: 'BestTimeToVisitNepal.tsx', route: 'best-time-to-visit-nepal' },
];

function extractSeoData(content: string) {
  const titleMatch = content.match(/title="([^"]+)"/);
  const descriptionMatch = content.match(/description="([^"]+)"/);
  return {
    title: titleMatch ? titleMatch[1] : '',
    description: descriptionMatch ? descriptionMatch[1] : '',
  };
}

for (const page of pagesToPort) {
  const srcPath = path.join(process.cwd(), '../zeopwebsite/src/pages', page.file);
  const destDir = path.join(process.cwd(), 'app', page.route);
  const destPath = path.join(destDir, 'page.tsx');
  
  if (!fs.existsSync(srcPath)) {
    console.error(`Source not found: ${srcPath}`);
    continue;
  }
  
  let content = fs.readFileSync(srcPath, 'utf8');
  const seo = extractSeoData(content);
  
  // Create dir
  fs.mkdirSync(destDir, { recursive: true });
  
  // Transform content
  // Remove SEO imports and usage
  content = content.replace(/import SEO from.*?;?\n/, '');
  content = content.replace(/<SEO[^>]+(\/>|>.*?<\/SEO>)/gs, '');
  
  // Fix React imports
  content = content.replace(/import React(?:,\s*\{.*?\}\s*)? from 'react';/, '');
  
  // Add schemas imports
  if (content.includes('createBreadcrumbSchema') || content.includes('createOrganizationSchema')) {
    content = content.replace(/import .*? from '\.\.\/utils\/schema';?/, '');
    content = `import { createOrganizationSchema, createBreadcrumbSchema } from '../../src/server/seo/schema';\nimport JsonLd from '../../src/components/seo/JsonLd';\n` + content;
    
    // Inject JsonLd
    content = content.replace(/const structuredData = useMemo\(\(\) => (\[.*?\]), \[\]\);/s, 'const structuredData = $1;');
    content = content.replace(/return \(\s*<>/, `return (\n    <>\n      <JsonLd data={structuredData} />`);
  }
  
  // Fix component imports
  content = content.replace(/from '\.\.\/components\//g, "from '../../src/components/");
  
  // Fix utils imports
  content = content.replace(/from '\.\.\/utils\//g, "from '../../src/utils/");
  
  // Add Metadata export
  const metadataExport = `
export const metadata = {
  title: "${seo.title}",
  description: "${seo.description}",
  alternates: {
    canonical: "https://www.zeotourism.com/${page.route}"
  }
};
`;
  
  fs.writeFileSync(destPath, metadataExport + '\n' + content.trim() + '\n');
  console.log(`Ported ${page.file} to ${page.route}`);
}
