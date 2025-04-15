import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/layout/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Hayden Menge | Software Engineer Portfolio',
  description:
    'Software Engineer specializing in distributed systems, full-stack development, and AI/ML. View my projects, skills, and experience.',
  keywords:
    'Software Engineer, Full-Stack Developer, Portfolio, Distributed Systems, AI/ML, React, Next.js',
  authors: [{ name: 'Hayden Menge' }],
  creator: 'Hayden Menge',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://haydenmenge.com',
    siteName: 'Hayden Menge Portfolio',
    title: 'Hayden Menge | Software Engineer Portfolio',
    description:
      'Software Engineer specializing in distributed systems, full-stack development, and AI/ML. View my projects, skills, and experience.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hayden Menge Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hayden Menge | Software Engineer Portfolio',
    description:
      'Software Engineer specializing in distributed systems, full-stack development, and AI/ML. View my projects, skills, and experience.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-background focus:text-foreground focus:p-2 focus:border"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <footer className="py-6 border-t border-border/40 bg-background/95">
            <div className="container mx-auto px-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  N
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Hayden Menge. All rights reserved.
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
