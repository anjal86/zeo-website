export type BlogSearchIntent = '' | 'learn' | 'plan' | 'compare' | 'requirements' | 'decide' | 'book';

export type BlogSeoReadinessInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  primaryQuery: string;
  searchIntent: BlogSearchIntent;
  targetReader: string;
  secondaryTopics: string[];
};

export type BlogSeoCheck = {
  id: string;
  label: string;
  complete: boolean;
  priority: 'essential' | 'improvement';
  help: string;
};

const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

export function countMarkdownHeadings(content: string) {
  return content
    .split(/\r?\n/)
    .filter(line => /^##\s+\S/.test(line.trim())).length;
}

export function countInternalLinks(content: string) {
  let count = 0;
  for (const match of content.matchAll(markdownLinkPattern)) {
    const href = match[1]?.trim() || '';
    if (href.startsWith('/') || href.startsWith('#')) count += 1;
  }
  return count;
}

export function normalizeTopicList(value: string | string[]) {
  const values = Array.isArray(value) ? value : value.split(',');
  return [...new Set(values.map(item => item.trim()).filter(Boolean))];
}

export function mergeSeoKeywords(primaryQuery: string, tags: string[], secondaryTopics: string[]) {
  return [...new Set([primaryQuery, ...tags, ...secondaryTopics].map(item => item.trim()).filter(Boolean))];
}

export function buildBlogSeoReadiness(input: BlogSeoReadinessInput): BlogSeoCheck[] {
  const headingCount = countMarkdownHeadings(input.content);
  const internalLinkCount = countInternalLinks(input.content);
  const effectiveSeoTitle = input.seoTitle.trim() || input.title.trim();
  const effectiveDescription = input.seoDescription.trim() || input.excerpt.trim();

  return [
    {
      id: 'title',
      label: 'Clear article title',
      complete: input.title.trim().length > 0,
      priority: 'essential',
      help: 'Add a specific title that states what the guide helps the reader do.',
    },
    {
      id: 'slug',
      label: 'Readable article URL',
      complete: input.slug.trim().length > 0,
      priority: 'essential',
      help: 'A descriptive URL is required before publishing.',
    },
    {
      id: 'summary',
      label: 'Useful short summary',
      complete: input.excerpt.trim().length >= 60,
      priority: 'essential',
      help: 'Explain the value of the article in one or two useful sentences.',
    },
    {
      id: 'content',
      label: 'Complete article content',
      complete: input.content.trim().length > 0,
      priority: 'essential',
      help: 'Write the main guide before publishing.',
    },
    {
      id: 'primary-query',
      label: 'One primary search query',
      complete: input.primaryQuery.trim().length > 0,
      priority: 'improvement',
      help: 'State the real search phrase this page should answer.',
    },
    {
      id: 'intent',
      label: 'Search intent selected',
      complete: input.searchIntent.length > 0,
      priority: 'improvement',
      help: 'Choose what the reader is trying to accomplish.',
    },
    {
      id: 'reader',
      label: 'Target reader defined',
      complete: input.targetReader.trim().length > 0,
      priority: 'improvement',
      help: 'Describe who the advice is for so the article stays practical.',
    },
    {
      id: 'topics',
      label: 'Supporting topics added',
      complete: input.secondaryTopics.length >= 2,
      priority: 'improvement',
      help: 'Add the important related questions the article should cover.',
    },
    {
      id: 'headings',
      label: 'Article has useful sections',
      complete: headingCount >= 2,
      priority: 'improvement',
      help: 'Use at least two descriptive H2 sections to make the guide scannable.',
    },
    {
      id: 'internal-links',
      label: 'Relevant internal link added',
      complete: internalLinkCount >= 1,
      priority: 'improvement',
      help: 'Link to a useful Zeo tour, destination, activity or related guide.',
    },
    {
      id: 'cover',
      label: 'Cover image added',
      complete: input.imageUrl.trim().length > 0,
      priority: 'improvement',
      help: 'Add a clear image for cards, the article hero and social sharing.',
    },
    {
      id: 'image-alt',
      label: 'Cover image alt text',
      complete: !input.imageUrl.trim() || input.imageAlt.trim().length > 0,
      priority: 'improvement',
      help: 'Describe what is visibly shown in the cover image.',
    },
    {
      id: 'search-title',
      label: 'Search title is concise',
      complete: effectiveSeoTitle.length >= 20 && effectiveSeoTitle.length <= 65,
      priority: 'improvement',
      help: 'Keep the search title clear and usually within about 20–65 characters.',
    },
    {
      id: 'search-description',
      label: 'Search description is useful',
      complete: effectiveDescription.length >= 70 && effectiveDescription.length <= 170,
      priority: 'improvement',
      help: 'Summarize the page accurately in roughly 70–170 characters.',
    },
  ];
}
