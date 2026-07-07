import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownArticleProps {
    content: string;
}

const MarkdownArticle: React.FC<MarkdownArticleProps> = ({ content }) => {
    return (
        <div className="blog-post-content prose prose-base md:prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-950 prose-a:text-primary prose-img:rounded-2xl break-words scroll-mt-24">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                    h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mt-10 mb-4 text-slate-900" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mt-8 mb-3 text-slate-800" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 text-slate-700 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 text-slate-700 space-y-2" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-slate-600 bg-slate-50 py-2 pr-4 rounded-r-lg" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-6">
                            <table className="w-full text-left border-collapse" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }) => <th className="border-b-2 border-slate-200 p-3 bg-slate-50 font-bold text-slate-800" {...props} />,
                    td: ({ node, ...props }) => <td className="border-b border-slate-200 p-3 text-slate-700" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                    a: ({ node, ...props }) => <a className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownArticle;
