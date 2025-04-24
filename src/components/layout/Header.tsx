'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';

const navItems = [
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
];

const Header = () => {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 60;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-transparent backdrop-blur-sm">
      <div className="container px-4 flex h-16 items-center justify-between mx-auto">
        {/* Left spacer - keep same width as right side for symmetry */}
        <div className="w-14 md:w-20"></div>

        {/* Center navigation */}
        <nav className="flex-shrink-0 flex justify-center">
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item.id}>
                <Button
                  size="sm"
                  onClick={() => handleScroll(item.id)}
                  className="transition-colors px-3 py-1 h-9 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground"
                >
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right section with fixed width and alignment for theme toggle */}
        <div className="w-14 md:w-20 flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
