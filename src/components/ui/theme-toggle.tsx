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
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 p-0 rounded-full flex items-center justify-center"
        disabled
      />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 rounded-full flex items-center justify-center"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}
