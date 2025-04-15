'use client';

import Hero from '@/components/sections/Hero';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import About from '@/components/sections/About';
// Contact component no longer needed as we've added CTAs to the Hero section

// Dynamically import the Three.js background to improve performance
// Temporarily disabled due to module resolution issues
// const DynamicThreeBackground = dynamic(
//   () => import("@/components/DynamicThreeBackground"),
//   { ssr: false }
// );

export default function Home() {
  return (
    <>
      {/* Three.js Background Animation */}
      {/* <DynamicThreeBackground /> */}

      <Hero />
      <Projects />
      <Skills />
      <About />
      {/* Contact section removed in favor of CTA buttons in Hero section */}

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
