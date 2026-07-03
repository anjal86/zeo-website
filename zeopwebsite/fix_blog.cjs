const fs = require('fs');
let code = fs.readFileSync('src/pages/BlogPost.tsx', 'utf8');

const interfaces = `
interface BlogPostData {
    id?: number;
    slug?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    image?: string;
    category?: string;
    date?: string;
    readTime?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

interface TourData {
    id?: number;
    title?: string;
    location?: string;
    category?: string;
    activities?: { name?: string }[];
    featured?: boolean;
    score?: number;
    [key: string]: unknown;
}
`;

code = code.replace(/import { useApi } from '\.\.\/hooks\/useApi';/g, "import { useApi } from '../hooks/useApi';\n" + interfaces);

code = code.replace(/useApi<any>\(\`/g, 'useApi<BlogPostData>(`');
code = code.replace(/useApi<any\[\]>\('\/api\/posts'\)/g, "useApi<BlogPostData[]>('/api/posts')");
code = code.replace(/useApi<any\[\]>\('\/api\/tours'\)/g, "useApi<TourData[]>('/api/tours')");
code = code.replace(/useApi<any\[\]>\('\/api\/destinations'\)/g, "useApi<{name: string}[]>('/api/destinations')");
code = code.replace(/\(allTours as any\)\.tours/g, '(allTours as unknown as { tours: TourData[] }).tours');

code = code.replace(/map\(\(tour: any\) =>/g, 'map((tour: TourData) =>');
code = code.replace(/map\(\(a: any\) =>/g, 'map((a: {name: string}) =>');
code = code.replace(/forEach\(\(dest: any\) =>/g, 'forEach((dest: {name: string}) =>');

code = code.replace(/\.filter\(\(t: any\) => t\.score > 2\)/g, '.filter((t: TourData) => (t.score || 0) > 2)');
code = code.replace(/\.sort\(\(a: any, b: any\) => b\.score \- a\.score\)/g, '.sort((a: TourData, b: TourData) => (b.score || 0) - (a.score || 0))');

code = code.replace(/filter\(\(t: any\) =>/g, 'filter((t: TourData) =>');
code = code.replace(/some\(\(r: any\) =>/g, 'some((r: TourData) =>');
code = code.replace(/map\(\(rPost: any\) =>/g, 'map((rPost: BlogPostData) =>');

fs.writeFileSync('src/pages/BlogPost.tsx', code);
