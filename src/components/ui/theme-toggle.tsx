'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Use resolvedTheme instead of theme to get the actual applied theme
  const isDark = resolvedTheme === 'dark';

  // Mount effect
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Toggle between 'light' and 'dark' directly instead of basing it on current theme
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Only render the actual button content after mounting to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-10 h-10 inline-flex">
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full" disabled />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 inline-flex">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="w-10 h-10 rounded-full"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
