import React, { type ReactNode } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { htmlToPlainText } from '@/lib/blogMarkdown';
import { slugifyHeading } from '@/lib/blogSeo';

interface MarkdownArticleProps {
  content: string;
  className?: string;
}

const normalizeInput = (content: string) => {
  const trimmed = (content || '').trim();
  if (!trimmed) return '';
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed) || /&lt;\/?[a-z][\s\S]*&gt;/i.test(trimmed);
  return looksLikeHtml ? htmlToPlainText(trimmed) : trimmed;
};

function nodeText(value: ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(nodeText).join('');
  if (React.isValidElement<{ children?: ReactNode }>(value)) return nodeText(value.props.children);
  return '';
}

function linkRel(title?: string) {
  const requested = title?.trim().toLowerCase();
  if (requested === 'nofollow') return 'nofollow noopener';
  if (requested === 'sponsored') return 'sponsored noopener';
  if (requested === 'ugc') return 'ugc noopener';
  return 'noopener';
}

const MarkdownArticle: React.FC<MarkdownArticleProps> = ({ content, className = '' }) => {
  const markdown = normalizeInput(content);
  const headingCounts = new Map<string, number>();

  const headingId = (children: ReactNode) => {
    const base = slugifyHeading(nodeText(children));
    const occurrence = headingCounts.get(base) ?? 0;
    headingCounts.set(base, occurrence + 1);
    return occurrence === 0 ? base : `${base}-${occurrence + 1}`;
  };

  return (
    <div className={`blog-post-content blog-article-rich max-w-none break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ node: _node, children, ...props }) => (
            <h2 id={headingId(children)} className="scroll-mt-28 mt-12 mb-5 border-t border-slate-200 pt-8 font-serif text-4xl font-extrabold leading-tight text-slate-950" {...props}>{children}</h2>
          ),
          h2: ({ node: _node, children, ...props }) => (
            <h2 id={headingId(children)} className="scroll-mt-28 mt-12 mb-5 border-t border-slate-200 pt-8 font-serif text-3xl font-extrabold leading-tight text-slate-950" {...props}>{children}</h2>
          ),
          h3: ({ node: _node, children, ...props }) => (
            <h3 id={headingId(children)} className="scroll-mt-28 mt-9 mb-4 border-l-4 border-primary pl-4 text-2xl font-bold leading-snug text-slate-900" {...props}>{children}</h3>
          ),
          h4: ({ node: _node, ...props }) => <h4 className="mt-7 mb-3 text-lg font-extrabold uppercase tracking-wide text-primary" {...props} />,
          p: ({ node: _node, ...props }) => <p className="my-5 text-[1.05rem] leading-8 text-slate-700" {...props} />,
          ul: ({ node: _node, ...props }) => <ul className="my-6 list-disc space-y-2 border border-slate-200 bg-slate-50 py-5 pl-8 pr-5 text-slate-700" {...props} />,
          ol: ({ node: _node, ...props }) => <ol className="my-6 list-decimal space-y-2 border border-slate-200 bg-slate-50 py-5 pl-8 pr-5 text-slate-700" {...props} />,
          li: ({ node: _node, ...props }) => <li className="pl-1 leading-7 marker:font-bold marker:text-secondary" {...props} />,
          blockquote: ({ node: _node, ...props }) => <blockquote className="my-8 border-l-4 border-primary bg-blue-50 px-6 py-5 text-lg italic leading-8 text-slate-800" {...props} />,
          table: ({ node: _node, ...props }) => (
            <div className="my-8 overflow-x-auto border border-slate-200">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm" {...props} />
            </div>
          ),
          th: ({ node: _node, ...props }) => <th className="border border-slate-200 bg-primary px-4 py-3 font-bold text-white" {...props} />,
          td: ({ node: _node, ...props }) => <td className="border border-slate-200 px-4 py-3 align-top text-slate-700" {...props} />,
          strong: ({ node: _node, ...props }) => <strong className="font-extrabold text-slate-950" {...props} />,
          em: ({ node: _node, ...props }) => <em className="italic text-slate-800" {...props} />,
          code: ({ node: _node, ...props }) => <code className="bg-slate-100 px-1.5 py-0.5 text-sm font-semibold text-slate-900" {...props} />,
          a: ({ node: _node, href = '', title, children, ...props }) => {
            const className = 'font-bold text-primary underline decoration-2 underline-offset-4 hover:text-primary-dark';
            if (href.startsWith('/') || href.startsWith('#')) {
              return <Link href={href} className={className} {...props}>{children}</Link>;
            }
            return <a href={href} title={title} className={className} target="_blank" rel={linkRel(title)} {...props}>{children}</a>;
          },
          img: ({ node: _node, alt = '', ...props }) => <img alt={alt} loading="lazy" decoding="async" className="my-8 h-auto w-full border border-slate-200 object-cover" {...props} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownArticle;
