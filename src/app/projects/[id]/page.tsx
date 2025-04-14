'use client'; // Assuming client-side data fetching or interactions might be needed

import React from 'react';
import { notFound } from 'next/navigation'; // To handle cases where project ID is invalid
import Link from 'next/link'; // Make sure Link is imported

import projectsData from '@/data/projects.json'; // Import the JSON data
import { Project } from '@/types'; // Import the Project type
import Image from 'next/image'; // Import Image component
import { Badge } from '@/components/ui/badge'; // Import Badge component
import { Button } from '@/components/ui/button'; // Import Button component
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'; // Import Carousel components

const allProjects: Project[] = projectsData;

// Updated function to get project data from the imported JSON
const getProjectById = (id: number): Project | undefined => {
  return allProjects.find((p) => p.id === id);
};

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>; // Type params as a Promise
}

const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ params }) => {
  // Unwrap the params Promise using React.use()
  const resolvedParams = React.use(params);

  const projectId = parseInt(resolvedParams.id, 10); // Access id from resolvedParams

  // Validate the ID
  if (isNaN(projectId)) {
    notFound(); // Show 404 if ID is not a valid number
  }

  // Fetch the project data
  const project = getProjectById(projectId);

  // Handle project not found
  if (!project) {
    notFound(); // Show 404 if project with the given ID doesn't exist
  }

  return (
    <section className="container mx-auto py-16 px-4 md:px-8">
      {/* Back Button */}
      <div className="mb-8">
        <Button variant="outline" asChild>
          <Link href="/#projects">&larr; Back to Projects</Link>
        </Button>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
      <p className="text-lg text-muted-foreground mb-6">{project.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {project.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Image Gallery/Carousel */}
      {(project.images && project.images.length > 0) || project.imageUrl ? (
        <div className="w-full max-w-2xl mx-auto mb-8">
          <Carousel className="w-full">
            <CarouselContent>
              {/* Add main image first if it exists */}
              {project.imageUrl && (
                <CarouselItem>
                  <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow-md">
                    <Image
                      src={project.imageUrl}
                      alt={`${project.title} - Main Image`}
                      layout="fill"
                      objectFit="cover"
                      priority // Prioritize loading the main image
                    />
                  </div>
                </CarouselItem>
              )}
              {/* Add additional images */}
              {project.images?.map((imgSrc, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow-md">
                    <Image
                      src={imgSrc}
                      alt={`${project.title} - Image ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
          </Carousel>
        </div>
      ) : (
        <div className="w-full h-64 md:h-96 bg-muted rounded-lg flex items-center justify-center mb-8 text-muted-foreground">
          <span>No image available</span>
        </div>
      )}

      {/* Long Description */}
      <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
        {/* Using dangerouslySetInnerHTML if description contains HTML, otherwise just render */}
        <p>{project.longDescription}</p>
      </div>

      {/* Links */}
      <div className="flex gap-4">
        {project.sourceUrl && (
          <Button variant="outline" asChild>
            <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">
              View Source
            </a>
          </Button>
        )}
        {project.liveUrl && (
          <Button variant="default" asChild>
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              Live Demo
            </a>
          </Button>
        )}
      </div>

      {/* TODO: Related Projects Section */}
    </section>
  );
};

export default ProjectDetailsPage;
