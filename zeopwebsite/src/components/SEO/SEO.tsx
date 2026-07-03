import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object[];
  langUrls?: Record<string, string>;
  robots?: string;
}

const truncateAtWord = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength - 3);
  const lastSpaceIdx = truncated.lastIndexOf(' ');
  if (lastSpaceIdx > 0) {
    return truncated.substring(0, lastSpaceIdx) + '...';
  }
  return truncated + '...';
};

const SEO: React.FC<SEOProps> = ({
  title = 'Zeo Tourism - Nepal Tours, Travel & Holiday Packages',
  description = 'Expert Nepal tours & spiritual journeys with Zeo Tourism. 25+ years experience in customized adventure and cultural travel.',
  keywords = 'Zeo Tourism, Zeo Tourism Nepal, Nepal tours, Nepal travel packages, Nepal holidays, trekking in Nepal, spiritual journeys Nepal, Mount Kailash Yatra, Everest Base Camp trek, cultural tours Nepal, adventure travel Asia, luxury Nepal travel, local tour operator Nepal',
  image = 'https://www.zeotourism.com/images/og-image.jpg',
  url = 'https://www.zeotourism.com',
  type = 'website',
  structuredData = [],
  langUrls = {},
  robots = 'index, follow'
}) => {
  const fullTitle = title.includes('Zeo Tourism') ? title : `${title} | Zeo Tourism`;
  const truncatedTitle = truncateAtWord(fullTitle, 60);
  const truncatedDescription = truncateAtWord(description, 160);

  const cleanUrl = url.trim().toLowerCase().replace(/\/$/, "");

  const absoluteImage = image.startsWith('http')
    ? image
    : `https://www.zeotourism.com${image.startsWith('/') ? '' : '/'}${image}`;

  const finalLangUrls = Object.keys(langUrls).length > 0
    ? Object.entries(langUrls).reduce((acc, [lang, langUrl]) => ({
        ...acc,
        [lang]: (langUrl as string).trim().toLowerCase().replace(/\/$/, "")
      }), {})
    : { 'en': cleanUrl, 'x-default': cleanUrl };

  return (
    <Helmet>
      <title>{truncatedTitle}</title>
      <meta name="description" content={truncatedDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />

      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={truncatedDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={cleanUrl} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content="Zeo Tourism" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      <meta name="twitter:image" content={absoluteImage} />

      <link rel="canonical" href={cleanUrl} />

      {Object.entries(finalLangUrls).map(([lang, langUrl]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={langUrl as string} />
      ))}

      {structuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;