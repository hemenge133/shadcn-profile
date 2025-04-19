'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const pythonSyntaxHighlight = (code: string) => {
  // Basic Python syntax highlighting
  return code
    .replace(
      /(class|def|if|else|elif|for|while|return|import|from|as|with|in|is|not|and|or|True|False|None|self|super|__init__|__main__|__name__)/g,
      '<span class="python-keyword">$1</span>'
    )
    .replace(/(\w+)\(/g, '<span class="python-function">$1</span>(')
    .replace(/(class\s+)(\w+)/g, '$1<span class="python-class">$2</span>')
    .replace(/('[^']*'|"[^"]*")/g, '<span class="python-string">$1</span>')
    .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="python-number">$1</span>');
};

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom rendering for table elements
          table: (props) => (
            <div className="overflow-x-auto my-8 rounded-lg shadow-md border border-border/50 dark:border-border/50">
              <table {...props} className="table-auto w-full" />
            </div>
          ),
          // Enhance table headers
          th: (props) => <th {...props} className="text-center font-bold" />,
          // Enhance table cells
          td: (props) => <td {...props} className="text-center" />,
          // Custom rendering for code blocks
          code: ({ className, children, ...props }) => {
            const language = className ? className.replace('language-', '') : '';
            const code = children ? String(children).replace(/\n$/, '') : '';

            // Apply syntax highlighting based on language
            let highlightedCode = code;
            if (language === 'python') {
              highlightedCode = pythonSyntaxHighlight(code);
              return (
                <pre className={`language-${language}`}>
                  <code
                    {...props}
                    className={className}
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                  />
                </pre>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Custom rendering for headings
          h1: (props) => <h1 {...props} className="text-3xl md:text-4xl mb-6" />,
          h2: (props) => <h2 {...props} className="text-2xl md:text-3xl mt-10 mb-4" />,
          h3: (props) => <h3 {...props} className="text-xl md:text-2xl mt-8 mb-3" />,
          // Custom rendering for lists in research methods
          ol: (props) => <ol {...props} className="list-decimal space-y-3" />,
          // Enhanced lists
          ul: (props) => <ul {...props} className="list-disc space-y-2" />,
          li: (props) => <li {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
