'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Inverted logic: Show Moon in light, Sun in dark
  const Icon = theme === 'dark' ? Sun : Moon;
  // Determine the next theme for the onClick handler
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  // Prevent rendering button contents on initial mount if theme is undefined
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a placeholder or null during hydration to avoid mismatches
    return <Button variant="ghost" size="icon" className="rounded-full" disabled />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      className="rounded-full"
      aria-label={`Switch to ${nextTheme} mode`} // Improved accessibility
    >
      <Icon className="h-[1.2rem] w-[1.2rem]" />
      {/* Removed the hidden icon and sr-only span */}
    </Button>
  );
}
