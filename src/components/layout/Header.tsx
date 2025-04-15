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
                  className={`transition-colors px-3 py-1 h-9 text-base font-medium rounded-md ${
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
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
