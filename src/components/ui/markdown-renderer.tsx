'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom rendering for table elements
          table: (props) => (
            <div className="overflow-x-auto">
              <table {...props} className="table-auto" />
            </div>
          ),
          // Custom rendering for code blocks
          code: ({ className, children, ...props }) => {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Custom rendering for headings
          h1: (props) => <h1 {...props} className="text-3xl md:text-4xl" />,
          h2: (props) => <h2 {...props} className="text-2xl md:text-3xl" />,
          h3: (props) => <h3 {...props} className="text-xl md:text-2xl" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
