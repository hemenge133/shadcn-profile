import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

import projectsData from '@/data/projects.json';
import { Project } from '@/types';

const allProjects: Project[] = projectsData;

const Projects = () => {
  const [filter, setFilter] = useState<string>('All');
  const router = useRouter();

  // Get unique categories from all projects
  const categories = ['All', ...new Set(allProjects.flatMap((p) => p.categories))];

  // Memoize filtered projects to prevent unnecessary re-renders
  const filteredProjects = React.useMemo(
    () =>
      filter === 'All' ? allProjects : allProjects.filter((p) => p.categories.includes(filter)),
    [filter]
  );

  // Handle filter change
  const handleFilterChange = useCallback((category: string) => {
    setFilter(category);
  }, []);

  // Handle project click
  const handleProjectClick = useCallback(
    (projectId: string) => {
      router.push(`/projects/${projectId}`);
    },
    [router]
  );

  return (
    <section id="projects" aria-labelledby="projects-heading" className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          id="projects-heading"
          className="text-3xl font-bold text-center mb-12"
        >
          Projects
        </motion.h2>

        {/* Filtering Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center flex-wrap gap-3 mb-10"
          role="tablist"
          aria-label="Project categories"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 15,
                delay: 0.1 + index * 0.05,
              }}
            >
              <Button
                variant={filter === category ? 'default' : 'outline'}
                onClick={() => handleFilterChange(category)}
                role="tab"
                aria-selected={filter === category}
                aria-controls="projects-panel"
                id={`tab-${category}`}
              >
                {category}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Project Grid */}
        <div
          id="projects-panel"
          role="tabpanel"
          aria-labelledby={`tab-${filter}`}
          className="flex flex-wrap justify-center gap-8"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 20,
                mass: 1.2,
                delay: 0.1 + ((index * 0.1) % 0.7), // Cycle through delays to create a staggered effect
              }}
              className="w-full md:w-auto md:max-w-sm lg:w-auto lg:max-w-xs flex"
            >
              <Card className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg group w-full">
                <div
                  className="block cursor-pointer flex-grow flex flex-col"
                  onClick={() => handleProjectClick(project.id.toString())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProjectClick(project.id.toString());
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${project.title}`}
                >
                  {/* Project Image */}
                  {project.imageUrl && (
                    <div className="relative w-full h-40">
                      <Image
                        src={project.imageUrl}
                        alt={`Screenshot of ${project.title}`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {project.description}
                    </p>
                  </CardContent>
                </div>
                {/* Links */}
                <CardFooter className="p-4 flex gap-3 justify-start items-center border-t mt-auto">
                  {project.sourceUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={project.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View source code for ${project.title}`}
                      >
                        Source
                      </a>
                    </Button>
                  )}
                  {project.liveUrl && (
                    <Button variant="default" size="sm" asChild>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View live demo of ${project.title}`}
                      >
                        Live Demo
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
