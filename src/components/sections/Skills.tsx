import React, { useState, useId } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Using buttons for filtering
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';

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

// Predefined rotation values to avoid hydration mismatch
const rotationValues = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

// Create a client-side only component for the skills badges to avoid hydration issues
const SkillsBadges = ({ filteredSkills }: { filteredSkills: Skill[] }) => {
  // Function to get deterministic rotation based on index
  const getRotation = (index: number) => {
    return rotationValues[index % rotationValues.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto"
    >
      {filteredSkills.map((skill, index) => (
        <motion.div
          key={skill.name + skill.category}
          initial={{ opacity: 0, rotate: getRotation(index), scale: 0.9 }}
          whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{
            duration: 0.5,
            delay: 0.1 + (index % 10) * 0.05,
            type: 'spring',
            damping: 8,
          }}
        >
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1 transition-all duration-300 ease-in-out"
          >
            {skill.name}
          </Badge>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Use dynamic import with SSR disabled to avoid hydration issues
const ClientSkillsBadges = dynamic(() => Promise.resolve(SkillsBadges), {
  ssr: false,
});

const Skills = () => {
  const [filter, setFilter] = useState<string>('All');
  // Use componentId to generate consistent patterns on server and client
  const componentId = useId();

  // Extract unique categories for filtering controls
  const categories = ['All', ...new Set(allSkills.map((skill) => skill.category))];

  // Filter skills based on the selected category
  const filteredSkills =
    filter === 'All' ? allSkills : allSkills.filter((skill) => skill.category === filter);

  return (
    <section id="skills" className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, rotate: -3 }}
          whileInView={{ opacity: 1, rotate: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-12"
        >
          Skills & Technologies
        </motion.h2>

        {/* Filtering Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex justify-center flex-wrap gap-3 mb-10"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, rotate: -5 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.2 + index * 0.05,
                type: 'spring',
                stiffness: 200,
              }}
            >
              <Button
                variant={filter === category ? 'default' : 'outline'}
                onClick={() => setFilter(category)}
                size="sm" // Make buttons slightly smaller
              >
                {category}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Client-side rendered skills badges */}
        <ClientSkillsBadges filteredSkills={filteredSkills} />
      </div>
    </section>
  );
};

export default Skills;
