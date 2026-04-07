'use client';

import React, { useState, useId } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import dynamic from 'next/dynamic';

interface Skill {
  name: string;
  category: string;
}

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
  { name: 'Python', category: 'Python Backend' },
  { name: 'Flask', category: 'Python Backend' },
  // Java Backend
  { name: 'Java', category: 'Java Backend' },
  { name: 'Spring Boot', category: 'Java Backend' },
  // Data Science & AI/ML
  { name: 'Python', category: 'Data Science & AI/ML' },
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
  { name: 'Node.js', category: 'Cloud & DevOps' },
  { name: 'GitHub Actions', category: 'Cloud & DevOps' },
  { name: 'Jenkins', category: 'Cloud & DevOps' },
  { name: 'Linux/UNIX', category: 'Cloud & DevOps' },
  // Databases
  { name: 'MySQL', category: 'Databases' },
  { name: 'DynamoDB', category: 'Databases' },
  { name: 'SQL', category: 'Databases' },
  // Core/Foundational
  { name: 'Distributed Computing', category: 'Core/Foundational' },
  { name: 'Microservices', category: 'Core/Foundational' },
  { name: 'REST APIs', category: 'Core/Foundational' },
  { name: 'C', category: 'Core/Foundational' },
  { name: 'C++', category: 'Core/Foundational' },
  // Testing
  { name: 'Jest', category: 'Testing' },
  { name: 'Playwright', category: 'Testing' },
];

const SkillsBadges = ({
  filteredSkills,
  isFilterChanging,
}: {
  filteredSkills: Skill[];
  isFilterChanging: boolean;
}) => {
  return (
    <LayoutGroup id="skills-grid">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap gap-2.5 justify-center max-w-4xl mx-auto min-h-[120px]"
      >
        <AnimatePresence mode="popLayout">
          {!isFilterChanging &&
            filteredSkills.map((skill) => (
              <motion.div
                key={`skill-${skill.name}-${skill.category}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                layout="position"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                  mass: 0.8,
                }}
              >
                <Badge
                  variant="outline"
                  className="text-sm px-3 py-1.5 cursor-default hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  {skill.name}
                </Badge>
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
};

const ClientSkillsBadges = dynamic(() => Promise.resolve(SkillsBadges), {
  ssr: false,
});

const Skills = () => {
  const [filter, setFilter] = useState<string>('All');
  const [isFilterChanging, setIsFilterChanging] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const componentId = useId();

  const categories = ['All', ...new Set(allSkills.map((skill) => skill.category))];

  const filteredSkills =
    activeFilter === 'All'
      ? allSkills
      : allSkills.filter((skill) => skill.category === activeFilter);

  const handleFilterChange = (category: string) => {
    if (category === activeFilter) return;

    setIsFilterChanging(true);
    setFilter(category);

    setTimeout(() => {
      setActiveFilter(category);
      setIsFilterChanging(false);
    }, 50);
  };

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight">Skills & Technologies</h2>
          <div className="mx-auto mt-3 w-12 h-px bg-foreground/20" />
        </motion.div>

        {/* Filter controls */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center flex-wrap gap-2 mb-10"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              onClick={() => handleFilterChange(category)}
              disabled={isFilterChanging}
              size="sm"
              className="transition-all duration-300"
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Skills badges */}
        <ClientSkillsBadges filteredSkills={filteredSkills} isFilterChanging={isFilterChanging} />
      </div>
    </section>
  );
};

export default Skills;
