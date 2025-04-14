import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Using buttons for filtering

// Define a structure for individual skills
interface Skill {
  name: string;
  category: string;
}

// Updated flat list of skills with STACK-BASED categories
const allSkills: Skill[] = [
  // Frontend
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'JavaScript', category: 'Frontend' },
  { name: 'HTML', category: 'Frontend' },
  { name: 'CSS', category: 'Frontend' },
  { name: 'Redux', category: 'Frontend' },
  // Python Backend
  { name: 'Python', category: 'Python Backend' }, // Also in Data Science
  { name: 'Flask', category: 'Python Backend' },
  // Java Backend
  { name: 'Java', category: 'Java Backend' },
  { name: 'Spring Boot', category: 'Java Backend' },
  // Data Science & AI/ML
  { name: 'Python', category: 'Data Science & AI/ML' }, // Also in Python Backend
  { name: 'PyTorch', category: 'Data Science & AI/ML' },
  { name: 'NumPy', category: 'Data Science & AI/ML' },
  { name: 'Pandas', category: 'Data Science & AI/ML' },
  { name: 'Scikit-learn', category: 'Data Science & AI/ML' },
  { name: 'OpenCV', category: 'Data Science & AI/ML' },
  { name: 'Matplotlib', category: 'Data Science & AI/ML' },
  { name: 'Seaborn', category: 'Data Science & AI/ML' },
  { name: 'Jupyter', category: 'Data Science & AI/ML' },
  // Cloud & DevOps
  { name: 'AWS EC2', category: 'Cloud & DevOps' },
  { name: 'AWS S3', category: 'Cloud & DevOps' },
  { name: 'AWS VPC', category: 'Cloud & DevOps' },
  { name: 'AWS API Gateway', category: 'Cloud & DevOps' },
  { name: 'AWS Kinesis', category: 'Cloud & DevOps' },
  { name: 'Kubernetes (k8s)', category: 'Cloud & DevOps' },
  { name: 'Docker', category: 'Cloud & DevOps' },
  { name: 'Node.js', category: 'Cloud & DevOps' }, // Moved here from Backend
  { name: 'GitHub Actions', category: 'Cloud & DevOps' },
  { name: 'Jenkins', category: 'Cloud & DevOps' },
  { name: 'Linux/UNIX', category: 'Cloud & DevOps' },
  // Databases
  { name: 'MySQL', category: 'Databases' },
  { name: 'DynamoDB', category: 'Databases' },
  { name: 'SQL', category: 'Databases' }, // Moved here from Programming Languages
  // Core/Foundational
  { name: 'Distributed Computing', category: 'Core/Foundational' },
  { name: 'Microservices', category: 'Core/Foundational' },
  { name: 'REST APIs', category: 'Core/Foundational' },
  { name: 'C', category: 'Core/Foundational' }, // Moved here from Programming Languages
  { name: 'C++', category: 'Core/Foundational' }, // Moved here from Programming Languages
  // Testing
  { name: 'Jest', category: 'Testing' },
  { name: 'Playwright', category: 'Testing' },
];

const Skills = () => {
  const [filter, setFilter] = useState<string>('All');

  // Extract unique categories for filtering controls
  const categories = ['All', ...new Set(allSkills.map((skill) => skill.category))];

  // Filter skills based on the selected category
  const filteredSkills =
    filter === 'All' ? allSkills : allSkills.filter((skill) => skill.category === filter);

  return (
    <section id="skills" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Skills & Technologies</h2>

        {/* Filtering Controls */}
        <div className="flex justify-center flex-wrap gap-3 mb-10">
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              onClick={() => setFilter(category)}
              size="sm" // Make buttons slightly smaller
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Justified Grid of Badges */}
        <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
          {filteredSkills.map((skill) => (
            <Badge
              key={skill.name + skill.category} // Use combo key due to Python in multiple categories
              variant="secondary"
              className="text-sm px-3 py-1 transition-all duration-300 ease-in-out"
            >
              {skill.name}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
