'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  blurb?: string;
}

const education = 'The University of Florida, B.Sc in Computer Engineering';
const experience: ExperienceItem[] = [
  {
    role: 'Senior Associate Database Engineer',
    company: 'Salesforce',
    period: '2024-Present',
    blurb: '',
  },
  {
    role: 'L4 Software Development Engineer',
    company: 'AWS',
    period: '2022-2023 (16.0 months)',
    blurb:
      'Developed and scaled a high-volume AWS data streaming service using Java; designed a critical migration tool reducing errors by 90%; improved monitoring and CI/CD pipelines to enhance system reliability and efficiency.',
  },
  {
    role: 'Software Engineer',
    company: 'UF ML Lab',
    period: '2021-2022 (15.0 months)',
    blurb:
      'Researched AI models for crop yield improvement using ML/DL; developed a Python computer vision tool reducing processing time by 60%; optimized deep learning workflows on HPC infrastructure.',
  },
];
const location = 'Seattle, Washington';
const personalBio =
  'With 3 years of experience building robust backend systems (Java/Spring Boot, AWS, k8s), I have a strong foundation in creating scalable and reliable software. Based in Seattle, I am particularly passionate about the intersection of backend architecture and AI, actively exploring how machine learning (PyTorch, Pandas, Scikit-learn) can enhance system efficiency and unlock new capabilities. I thrive on tackling complex challenges and delivering elegant, high-performance solutions.';

const About = () => {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight">About Me</h2>
          <div className="mx-auto mt-3 w-12 h-px bg-foreground/20" />
        </motion.div>

        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Bio Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-l-2 border-l-transparent hover:border-l-foreground transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{personalBio}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Experience Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-l-2 border-l-transparent hover:border-l-foreground transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-0">
                  {experience.map((item, index) => (
                    <motion.li
                      key={item.company + item.role}
                      className="relative pl-6 py-4 border-l border-border hover:border-foreground/40 transition-colors duration-300 group"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-[-5px] top-5 w-2 h-2 rounded-full bg-border group-hover:bg-foreground transition-colors duration-300" />
                      <h3 className="font-semibold text-sm">{item.role}</h3>
                      <p className="text-sm font-medium text-foreground/70">{item.company}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.period}</p>
                      {item.blurb && (
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {item.blurb}
                        </p>
                      )}
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Location: {location}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Education Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-l-2 border-l-transparent hover:border-l-foreground transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">Education</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{education}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
