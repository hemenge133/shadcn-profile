import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Data structure for experience
interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  blurb?: string; // Added optional blurb field
}

// Pull existing data (can be refined)
const education = 'The University of Florida, B.Sc in Computer Engineering';
const experience: ExperienceItem[] = [
  {
    role: 'Software Engineer',
    company: 'Salesforce',
    period: '2024-Present', // Duration not applicable
    blurb: '', // No details provided in resume snippet
  },
  {
    role: 'L4 Software Development Engineer',
    company: 'AWS',
    period: '2022-2023 (16.0 months)', // Added duration
    blurb:
      'Developed and scaled a high-volume AWS data streaming service using Java; designed a critical migration tool reducing errors by 90%; improved monitoring and CI/CD pipelines to enhance system reliability and efficiency.',
  },
  {
    role: 'Software Engineer',
    company: 'UF ML Lab',
    period: '2021-2022 (15.0 months)', // Added duration
    blurb:
      'Researched AI models for crop yield improvement using ML/DL; developed a Python computer vision tool reducing processing time by 60%; optimized deep learning workflows on HPC infrastructure.',
  },
];
const location = 'Seattle, Washington';
// const totalExperience = "3 years"; // Commenting out as individual durations are now shown
const personalBio =
  'With 3 years of experience building robust backend systems (Java/Spring Boot, AWS, k8s), I have a strong foundation in creating scalable and reliable software. Based in Seattle, I am particularly passionate about the intersection of backend architecture and AI, actively exploring how machine learning (PyTorch, Pandas, Scikit-learn) can enhance system efficiency and unlock new capabilities. I thrive on tackling complex challenges and delivering elegant, high-performance solutions.';

const About = () => {
  return (
    <section id="about" className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">About Me</h2>

        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Personal Bio Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{personalBio}</p>
            </CardContent>
          </Card>

          {/* Experience Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {experience.map((item) => (
                  <li key={item.company + item.role} className="mb-4 pb-4 border-b last:border-b-0">
                    <h3 className="font-semibold">{item.role}</h3>
                    <p className="text-sm text-primary">{item.company}</p>
                    <p className="text-xs text-muted-foreground mb-2">{item.period}</p>
                    {/* Added blurb rendering */}
                    {item.blurb && (
                      <p className="text-sm text-muted-foreground italic">{item.blurb}</p>
                    )}
                  </li>
                ))}
                {/* Moved location info outside the loop */}
                <li className="mt-4">
                  <p className="text-sm text-muted-foreground">Location: {location}</p>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Education Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Education</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{education}</p>
            </CardContent>
          </Card>

          {/* Optional Resume Download */}
          {/* 
          <div className="text-center mt-6">
            <Button asChild>
              <a href="/path/to/your/resume.pdf" download>Download Resume</a>
            </Button>
          </div>
          */}
        </div>
      </div>
    </section>
  );
};

export default About;
