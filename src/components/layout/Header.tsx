'use client';

import React from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container px-4 flex h-14 items-center justify-between mx-auto">
        {/* Left spacer */}
        <div className="w-10 md:w-20" />

        {/* Center navigation */}
        <nav className="flex-shrink-0 flex justify-center">
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleScroll(item.id)}
                  className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 py-1 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-full h-px bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right section with theme toggle */}
        <div className="w-10 md:w-20 flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
