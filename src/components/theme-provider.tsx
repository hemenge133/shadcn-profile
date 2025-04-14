'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Define props we expect without trying to exactly match the library's type
type ThemeProps = {
  defaultTheme?: string;
  storageKey?: string;
  themes?: string[];
  enableSystem?: boolean;
  // Add more as needed but keep it loose
  [key: string]: unknown;
};

export function ThemeProvider({ children, ...props }: React.PropsWithChildren<ThemeProps>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
