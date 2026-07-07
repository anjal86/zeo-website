import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { htmlToPlainText } from '@/lib/blogMarkdown';

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

const MarkdownArticle: React.FC<MarkdownArticleProps> = ({ content, className = '' }) => {
    const markdown = useMemo(() => normalizeInput(content), [content]);

    return (
        <div className={`blog-post-content blog-article-rich max-w-none break-words scroll-mt-24 ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                    h1: ({ node: _node, ...props }) => <h2 className="mt-12 mb-5 border-t border-slate-200 pt-8 font-serif text-4xl font-extrabold leading-tight text-slate-950" {...props} />,
                    h2: ({ node: _node, ...props }) => <h2 className="mt-12 mb-5 border-t border-slate-200 pt-8 font-serif text-3xl font-extrabold leading-tight text-slate-950" {...props} />,
                    h3: ({ node: _node, ...props }) => <h3 className="mt-9 mb-4 border-l-4 border-primary pl-4 text-2xl font-bold leading-snug text-slate-900" {...props} />,
                    h4: ({ node: _node, ...props }) => <h4 className="mt-7 mb-3 text-lg font-extrabold uppercase tracking-wide text-primary" {...props} />,
                    p: ({ node: _node, ...props }) => <p className="my-5 text-[1.05rem] leading-8 text-slate-700" {...props} />,
                    ul: ({ node: _node, ...props }) => <ul className="my-6 border border-slate-200 bg-slate-50 py-5 pl-8 pr-5 text-slate-700 space-y-2 list-disc" {...props} />,
                    ol: ({ node: _node, ...props }) => <ol className="my-6 border border-slate-200 bg-slate-50 py-5 pl-8 pr-5 text-slate-700 space-y-2 list-decimal" {...props} />,
                    li: ({ node: _node, ...props }) => <li className="pl-1 leading-7 marker:text-secondary marker:font-bold" {...props} />,
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
                    a: ({ node: _node, ...props }) => <a className="font-bold text-primary underline decoration-2 underline-offset-4 hover:text-primary-dark" target="_blank" rel="noopener noreferrer" {...props} />,
                }}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownArticle;
