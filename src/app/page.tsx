import Hero from '@/components/sections/Hero';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import About from '@/components/sections/About';

export default function Home() {
  return (
    <div className="relative">
      <Hero />
      <Projects />
      <Skills />
      <About />
    </div>
  );
}
