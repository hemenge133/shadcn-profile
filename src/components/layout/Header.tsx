'use client';

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';

const navItems = [
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

const Header = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

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
      setActiveSection(id);
    }
  };

  useEffect(() => {
    // Skip initial scroll detection to prevent auto-scrolling on page load
    setInitialLoadComplete(true);

    const handleScrollListen = () => {
      if (!initialLoadComplete) return;

      let currentSection = '';
      const headerOffset = 70;

      navItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          const elementTop = element.getBoundingClientRect().top;
          if (elementTop <= headerOffset) {
            currentSection = item.id;
          }
        }
      });

      let determinedSection = '';
      if (window.scrollY < 200 && currentSection === '') {
        determinedSection = 'hero';
      } else {
        determinedSection = currentSection;
      }
      if (determinedSection !== activeSection) {
        setActiveSection(determinedSection);
      }
    };

    // Set a small delay before enabling scroll detection
    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScrollListen);
      // Only run handleScrollListen after the delay
      if (initialLoadComplete) {
        handleScrollListen();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScrollListen);
    };
  }, [activeSection, initialLoadComplete]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center relative">
        {/* Navigation Links - Centered */}
        <nav className="flex items-center gap-3 text-lg mx-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              size="sm"
              onClick={() => handleScroll(item.id)}
              className={`transition-colors px-2 py-0.5 h-auto text-base font-medium rounded-md ${
                activeSection === item.id
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Theme Toggle - Positioned absolutely on the right */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
