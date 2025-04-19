'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure the component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to toggle between light and dark mode only
  const toggleTheme = () => {
    if (resolvedTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  // Get the icon based on the current theme
  const getThemeIcon = () => {
    if (!mounted) return null;

    if (resolvedTheme === 'dark') {
      return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    } else {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    }
  };

  // Get the tooltip text based on the current theme
  const getTooltipText = () => {
    if (!mounted) return 'Toggle theme';

    return resolvedTheme === 'dark' ? 'Dark theme' : 'Light theme';
  };

  // Placeholder for the loading state
  if (!mounted) {
    return (
      <div className="flex items-center justify-center">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md opacity-50" disabled>
          <div className="h-[1.2rem] w-[1.2rem] animate-pulse bg-current rounded-full" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-md flex items-center justify-center focus-visible:ring-1 focus-visible:ring-ring"
              onClick={toggleTheme}
              aria-label={getTooltipText()}
            >
              {getThemeIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
