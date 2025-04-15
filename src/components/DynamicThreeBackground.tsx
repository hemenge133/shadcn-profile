'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Three.js background without using React Three Fiber
const ThreeBackground = dynamic(
  () => import('./ThreeBackground'),
  { ssr: false }
);

export default function DynamicThreeBackground() {
  const [isMounted, setIsMounted] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Safe browser check for motion preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Mark as mounted
    setIsMounted(true);
    
    // Check motion preferences
    try {
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (prefersReducedMotion) {
        setIsReducedMotion(prefersReducedMotion.matches);
        
        // Add listener with proper fallbacks
        const handlePreferenceChange = (event: MediaQueryListEvent) => {
          setIsReducedMotion(event.matches);
        };
        
        // Handle different browser implementations
        if (prefersReducedMotion.addEventListener) {
          prefersReducedMotion.addEventListener('change', handlePreferenceChange);
          return () => prefersReducedMotion.removeEventListener('change', handlePreferenceChange);
        }
      }
    } catch (error) {
      console.warn("Error checking motion preferences:", error);
    }
  }, []);

  // Don't render if reduced motion is preferred or not mounted yet
  if (!isMounted || isReducedMotion) {
    return null;
  }

  return <ThreeBackground />;
}
