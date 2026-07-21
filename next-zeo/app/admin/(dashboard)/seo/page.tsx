import type { Metadata } from 'next';
import SeoManager from '@/components/Admin/SeoManager';

export const metadata: Metadata = {
  title: 'SEO Manager - Zeo Tourism Admin',
  robots: { index: false, follow: false },
};

export default function SeoManagerPage() {
  return <SeoManager />;
}
