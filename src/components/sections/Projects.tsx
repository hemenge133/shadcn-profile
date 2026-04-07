'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

import projectsData from '@/data/projects.json';
import { Project } from '@/types';

const allProjects: Project[] = projectsData;

const Projects = () => {
  const [filter, setFilter] = useState<string>('All');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isFilterChanging, setIsFilterChanging] = useState<boolean>(false);
  const router = useRouter();

  const categories = ['All', ...new Set(allProjects.flatMap((p) => p.categories))];

  const filteredProjects = React.useMemo(
    () =>
      activeFilter === 'All'
        ? allProjects
        : allProjects.filter((p) => p.categories.includes(activeFilter)),
    [activeFilter]
  );

  const handleFilterChange = useCallback(
    (category: string) => {
      if (category === activeFilter || isFilterChanging) return;

      setIsFilterChanging(true);
      setFilter(category);

      setTimeout(() => {
        setActiveFilter(category);
        setIsFilterChanging(false);
      }, 50);
    },
    [activeFilter, isFilterChanging]
  );

  const handleProjectClick = useCallback(
    (projectId: string) => {
      router.push(`/projects/${projectId}`);
    },
    [router]
  );

  return (
    <section id="projects" aria-labelledby="projects-heading" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 id="projects-heading" className="text-3xl font-bold tracking-tight">
            Projects
          </h2>
          <div className="mx-auto mt-3 w-12 h-px bg-foreground/20" />
        </motion.div>

        {/* Filter controls */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center flex-wrap gap-2 mb-10"
          role="tablist"
          aria-label="Project categories"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              onClick={() => handleFilterChange(category)}
              disabled={isFilterChanging}
              size="sm"
              role="tab"
              aria-selected={filter === category}
              aria-controls="projects-panel"
              id={`tab-${category}`}
              className="transition-all duration-300"
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Project grid */}
        <LayoutGroup id="projects-grid">
          <div
            id="projects-panel"
            role="tabpanel"
            aria-labelledby={`tab-${filter}`}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            <AnimatePresence mode="popLayout">
              {!isFilterChanging &&
                filteredProjects.map((project) => (
                  <motion.div
                    key={`project-${project.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    layout="position"
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                  >
                    <Card
                      className="group overflow-hidden hover:border-foreground/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer h-full flex flex-col"
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
                      {/* Project image with grayscale hover */}
                      {project.imageUrl && (
                        <div className="relative w-full h-44 overflow-hidden">
                          <Image
                            src={project.imageUrl}
                            alt={`Screenshot of ${project.title}`}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, 50vw"
                            loading="lazy"
                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                          />
                        </div>
                      )}

                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-lg">
                          {project.title}
                          <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 shrink-0 ml-2" />
                        </CardTitle>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs font-normal">
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

                      <CardFooter className="p-4 flex gap-3 justify-start items-center border-t mt-auto">
                        {project.sourceUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={project.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View source code for ${project.title}`}
                              onClick={(e) => e.stopPropagation()}
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
                              onClick={(e) => e.stopPropagation()}
                            >
                              Live Demo
                            </a>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>
    </section>
  );
};

export default Projects;
