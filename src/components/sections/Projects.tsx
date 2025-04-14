import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
    (projectId: number) => {
      router.push(`/projects/${projectId}`);
    },
    [router]
  );

  return (
    <section id="projects" aria-labelledby="projects-heading" className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 id="projects-heading" className="text-3xl font-bold text-center mb-12">
          Projects
        </h2>

        {/* Filtering Controls */}
        <div
          className="flex justify-center flex-wrap gap-3 mb-10"
          role="tablist"
          aria-label="Project categories"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              onClick={() => handleFilterChange(category)}
              role="tab"
              aria-selected={filter === category}
              aria-controls="projects-panel"
              id={`tab-${category}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Project Grid */}
        <div
          id="projects-panel"
          role="tabpanel"
          aria-labelledby={`tab-${filter}`}
          className="flex flex-wrap justify-center gap-8"
        >
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg group w-full md:w-auto md:max-w-sm lg:w-auto lg:max-w-xs"
            >
              <div
                className="block cursor-pointer flex-grow flex flex-col"
                onClick={() => handleProjectClick(project.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProjectClick(project.id);
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
