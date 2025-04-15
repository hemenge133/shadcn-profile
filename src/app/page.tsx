'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/sections/Hero';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import About from '@/components/sections/About';
import dynamic from 'next/dynamic';
// Contact component no longer needed as we've added CTAs to the Hero section

// Dynamic import with client-side only rendering
const DynamicThreeBackground = dynamic(
  () => import('@/components/DynamicThreeBackground'),
  { ssr: false }
);

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Only render the background on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {/* Render the background only on client side */}
      {isMounted && <DynamicThreeBackground />}

      {/* Main content with z-index to ensure it's above the background */}
      <div className="relative z-10">
        <Hero />
        <Projects />
        <Skills />
        <About />
      </div>

      {/* Container for the rest of the content (now removed) */}
      {/* 
      <div className="container mx-auto py-10 px-4 md:px-0">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
      </div>
      */}
    </>
  );
}
