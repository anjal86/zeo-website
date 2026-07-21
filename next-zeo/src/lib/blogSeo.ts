export type BlogSearchIntent = '' | 'learn' | 'plan' | 'compare' | 'requirements' | 'decide' | 'book';

export type BlogHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type BlogLinkTargetType = 'blog' | 'tour' | 'destination' | 'activity' | 'page';

export type BlogLinkTarget = {
  type: BlogLinkTargetType;
  title: string;
  url: string;
  status?: string;
  description?: string;
};

export type BlogSource = {
  title: string;
  url: string;
  publisher?: string;
  accessedAt?: string;
  note?: string;
};

export type BlogPerson = {
  name: string;
  slug?: string;
  title?: string;
  bio?: string;
  image?: string;
  expertise?: string[];
};

export type BlogCallToAction = {
  heading?: string;
  body?: string;
  label?: string;
  url?: string;
};

export type BlogSeoData = {
  title?: string;
  description?: string;
  primaryQuery?: string;
  searchIntent?: BlogSearchIntent;
  targetReader?: string;
  secondaryTopics?: string[];
  imageAlt?: string;
  imageCaption?: string;
  imageCredit?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  cornerstone?: boolean;
  clusterName?: string;
  author?: BlogPerson;
  reviewer?: BlogPerson;
  reviewedAt?: string;
  updateNote?: string;
  sources?: BlogSource[];
  relatedArticles?: BlogLinkTarget[];
  relatedTours?: BlogLinkTarget[];
  relatedDestinations?: BlogLinkTarget[];
  relatedActivities?: BlogLinkTarget[];
  cta?: BlogCallToAction;
};

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
  authorName?: string;
  reviewerName?: string;
  sourceCount?: number;
  linkIssueCount?: number;
};

export type BlogSeoCheck = {
  id: string;
  label: string;
  complete: boolean;
  priority: 'essential' | 'improvement';
  help: string;
};

export type MarkdownLink = {
  text: string;
  href: string;
  title?: string;
  internal: boolean;
  genericAnchor: boolean;
};

const genericAnchors = new Set([
  'click here',
  'read more',
  'learn more',
  'here',
  'this page',
  'more info',
  'more information',
  'view more',
]);

const markdownLinkPattern = /\[([^\]]+)\]\((\S+?)(?:\s+["']([^"']+)["'])?\)/g;

export const staticBlogLinkTargets: BlogLinkTarget[] = [
  { type: 'page', title: 'Kailash Mansarovar Yatra', url: '/kailash-mansarovar', status: 'published' },
  { type: 'page', title: 'Kailash Mansarovar Yatra Guide', url: '/kailash-mansarovar-yatra-guide', status: 'published' },
  { type: 'page', title: 'Kailash Mansarovar Yatra Cost', url: '/kailash-mansarovar-yatra-cost', status: 'published' },
  { type: 'page', title: 'Kailash Documents and Permits', url: '/kailash-mansarovar-yatra-documents-permits', status: 'published' },
  { type: 'page', title: 'Kailash Inner Kora Guide', url: '/kailash-inner-kora-guide', status: 'published' },
  { type: 'page', title: 'Kailash Yatra NRI Guide', url: '/kailash-yatra-nri-guide', status: 'published' },
  { type: 'page', title: 'Kailash Packing List', url: '/kailash-packing-list', status: 'published' },
  { type: 'page', title: 'Kailash Fitness and Medical Guide', url: '/kailash-fitness-medical-guide', status: 'published' },
  { type: 'page', title: 'Everest Base Camp Guide', url: '/everest-base-camp-guide', status: 'published' },
  { type: 'page', title: 'Best Time to Visit Nepal', url: '/best-time-to-visit-nepal', status: 'published' },
  { type: 'page', title: 'Nepal Visa Guide', url: '/nepal-visa-guide', status: 'published' },
  { type: 'page', title: 'All Tours', url: '/tours', status: 'published' },
  { type: 'page', title: 'All Destinations', url: '/destinations', status: 'published' },
  { type: 'page', title: 'All Activities', url: '/activities', status: 'published' },
  { type: 'page', title: 'Travel Blog', url: '/blog', status: 'published' },
  { type: 'page', title: 'Contact Zeo Tourism', url: '/contact', status: 'published' },
];

export function slugifyBlogValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export function slugifyHeading(value: string) {
  return slugifyBlogValue(value).slice(0, 80) || 'section';
}

export function extractMarkdownHeadings(content: string): BlogHeading[] {
  const counts = new Map<string, number>();
  const headings: BlogHeading[] = [];
  for (const line of content.split(/\r?\n/)) {
    const match = line.trim().match(/^(#{2,3})\s+(.+?)\s*#*$/);
    if (!match) continue;
    const text = match[2].replace(/[*_`~]/g, '').trim();
    const base = slugifyHeading(text);
    const occurrence = counts.get(base) ?? 0;
    counts.set(base, occurrence + 1);
    headings.push({
      id: occurrence === 0 ? base : `${base}-${occurrence + 1}`,
      text,
      level: match[1].length as 2 | 3,
    });
  }
  return headings;
}

export function countMarkdownHeadings(content: string) {
  return extractMarkdownHeadings(content).filter(heading => heading.level === 2).length;
}

export function analyzeMarkdownLinks(content: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];
  for (const match of content.matchAll(markdownLinkPattern)) {
    const text = (match[1] || '').trim();
    const href = (match[2] || '').trim();
    links.push({
      text,
      href,
      title: match[3]?.trim(),
      internal: href.startsWith('/') || href.startsWith('#'),
      genericAnchor: genericAnchors.has(text.toLowerCase()),
    });
  }
  return links;
}

export function countInternalLinks(content: string) {
  return analyzeMarkdownLinks(content).filter(link => link.internal).length;
}

export function normalizeTopicList(value: string | string[]) {
  const values = Array.isArray(value) ? value : value.split(',');
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of values) {
    const clean = item.trim();
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }
  return result;
}

export function mergeSeoKeywords(primaryQuery: string, tags: string[], secondaryTopics: string[]) {
  return normalizeTopicList([primaryQuery, ...tags, ...secondaryTopics]);
}

function wordTokens(value: string) {
  const stop = new Set(['a', 'an', 'and', 'are', 'best', 'for', 'from', 'guide', 'how', 'in', 'is', 'of', 'the', 'to', 'travel', 'trip', 'what', 'when', 'with']);
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !stop.has(token)),
  );
}

export function topicSimilarity(left: string, right: string) {
  const a = wordTokens(left);
  const b = wordTokens(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean) : [];
}

function personValue(value: unknown): BlogPerson | undefined {
  const item = record(value);
  const name = stringValue(item.name);
  if (!name) return undefined;
  return {
    name,
    slug: stringValue(item.slug) || slugifyBlogValue(name),
    title: stringValue(item.title) || undefined,
    bio: stringValue(item.bio) || undefined,
    image: stringValue(item.image) || undefined,
    expertise: stringArray(item.expertise),
  };
}

function targetArray(value: unknown): BlogLinkTarget[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    const target = record(item);
    const url = stringValue(target.url);
    const title = stringValue(target.title);
    const type = stringValue(target.type) as BlogLinkTargetType;
    if (!url || !title || !['blog', 'tour', 'destination', 'activity', 'page'].includes(type)) return [];
    return [{ type, title, url, status: stringValue(target.status) || undefined, description: stringValue(target.description) || undefined }];
  });
}

function sourceArray(value: unknown): BlogSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    const source = record(item);
    const title = stringValue(source.title);
    const url = stringValue(source.url);
    if (!title || !url) return [];
    return [{
      title,
      url,
      publisher: stringValue(source.publisher) || undefined,
      accessedAt: stringValue(source.accessedAt) || undefined,
      note: stringValue(source.note) || undefined,
    }];
  });
}

export function parseBlogSeoData(value: unknown): BlogSeoData {
  const seo = record(value);
  const ctaRecord = record(seo.cta);
  const cta = Object.values(ctaRecord).some(Boolean) ? {
    heading: stringValue(ctaRecord.heading) || undefined,
    body: stringValue(ctaRecord.body) || undefined,
    label: stringValue(ctaRecord.label) || undefined,
    url: stringValue(ctaRecord.url) || undefined,
  } : undefined;
  return {
    title: stringValue(seo.title) || undefined,
    description: stringValue(seo.description) || undefined,
    primaryQuery: stringValue(seo.primaryQuery) || undefined,
    searchIntent: stringValue(seo.searchIntent) as BlogSearchIntent || undefined,
    targetReader: stringValue(seo.targetReader) || undefined,
    secondaryTopics: stringArray(seo.secondaryTopics),
    imageAlt: stringValue(seo.imageAlt) || undefined,
    imageCaption: stringValue(seo.imageCaption) || undefined,
    imageCredit: stringValue(seo.imageCredit) || undefined,
    canonicalUrl: stringValue(seo.canonicalUrl) || undefined,
    noindex: seo.noindex === true,
    cornerstone: seo.cornerstone === true,
    clusterName: stringValue(seo.clusterName) || undefined,
    author: personValue(seo.author),
    reviewer: personValue(seo.reviewer),
    reviewedAt: stringValue(seo.reviewedAt) || undefined,
    updateNote: stringValue(seo.updateNote) || undefined,
    sources: sourceArray(seo.sources),
    relatedArticles: targetArray(seo.relatedArticles),
    relatedTours: targetArray(seo.relatedTours),
    relatedDestinations: targetArray(seo.relatedDestinations),
    relatedActivities: targetArray(seo.relatedActivities),
    cta,
  };
}

export function buildBlogSeoReadiness(input: BlogSeoReadinessInput): BlogSeoCheck[] {
  const headingCount = countMarkdownHeadings(input.content);
  const links = analyzeMarkdownLinks(input.content);
  const internalLinkCount = links.filter(link => link.internal).length;
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
      id: 'link-health',
      label: 'Internal links pass validation',
      complete: (input.linkIssueCount ?? 0) === 0,
      priority: 'improvement',
      help: 'Fix broken, self-referencing, draft or generic-anchor links.',
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
      id: 'author',
      label: 'Author identity added',
      complete: Boolean(input.authorName?.trim()),
      priority: 'improvement',
      help: 'Name the person or team responsible for the article.',
    },
    {
      id: 'reviewer',
      label: 'Expert reviewer added',
      complete: Boolean(input.reviewerName?.trim()),
      priority: 'improvement',
      help: 'For important planning, permit or health guidance, add a reviewer.',
    },
    {
      id: 'sources',
      label: 'Important claims have sources',
      complete: (input.sourceCount ?? 0) > 0,
      priority: 'improvement',
      help: 'Add official or trustworthy sources for permits, rules, schedules and health guidance.',
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
