import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { SiSalesforce } from 'react-icons/si';
import { FaAws, FaLinkedin } from 'react-icons/fa';
import { Mail, ChevronDown } from 'lucide-react';

const Hero = () => {
  // Placeholder data - replace with actual content
  const name = 'Hayden Menge';
  const title = 'Software Engineer';
  const intro =
    'Seattle-based Software Engineer specializing in distributed systems, passionate about exploring the potential of AI and Machine Learning';
  const avatarSrc = '/32338288 (1).png';
  const avatarAlt = 'Hayden Menge, Software Engineer';
  const email = 'me@haydenmenge.com';
  const linkedinUrl = 'https://linkedin.com/in/hayden-menge-548590167/';

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative px-4 pt-8 pb-8 md:pt-16 md:pb-16 bg-background text-foreground"
    >
      <Card className="w-full max-w-4xl mx-auto p-4 md:p-8 shadow-lg backdrop-blur-sm bg-card/80 relative">
        <CardContent className="flex flex-col md:flex-row items-center gap-8 pt-4 pb-4 md:pt-0 md:pb-0">
          <div className="relative aspect-square w-32 md:w-56 overflow-hidden rounded-full border-4 border-primary">
            <Image
              src={avatarSrc}
              alt={avatarAlt}
              fill
              sizes="(max-width: 768px) 128px, 224px"
              priority
              className="object-cover aspect-square"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="text-left w-full">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xl md:text-2xl text-muted-foreground">{title}</p>
              <SiSalesforce
                aria-label="Current Employer: Salesforce"
                className="h-6 w-6 md:h-7 md:w-7 text-blue-500"
              />
              <FaAws
                aria-label="Previous Employer: Amazon Web Services"
                className="h-6 w-6 md:h-7 md:w-7 text-orange-500"
              />
            </div>
            <p className="text-lg mb-6">{intro}</p>
            <div className="flex items-center gap-3 mt-2">
              <Button asChild size="default" className="shadow-md h-9 px-3 sm:px-4">
                <a href={`mailto:${email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="default"
                className="shadow-sm h-9 px-3 sm:px-4"
              >
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Down arrow - visible only on mobile */}
        <div className="absolute bottom-2 right-2 md:hidden animate-bounce">
          <ChevronDown className="w-5 h-5 text-muted-foreground/70" />
        </div>
      </Card>
      {/* Optional: Add subtle background elements/animations here */}
    </section>
  );
};

export default Hero;
