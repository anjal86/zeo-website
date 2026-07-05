import fs from 'fs';
import path from 'path';

function processDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('use client')) continue;
      
      const needsClient = content.includes('useState') || 
                          content.includes('useEffect') || 
                          content.includes('useRef') || 
                          content.includes('useLocation') || 
                          content.includes('useRouter') || 
                          content.includes('framer-motion') ||
                          content.includes('onClick');
                          
      if (needsClient) {
        fs.writeFileSync(fullPath, '"use client";\n\n' + content);
        console.log('Added use client to', fullPath);
      }
    }
  }
}

processDir(path.resolve('./next-zeo/src/components'));
