import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { SiSalesforce } from 'react-icons/si';
import { FaAws, FaLinkedin } from 'react-icons/fa';
import { Mail, Check, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

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

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative px-4 pt-8 pb-8 md:pt-16 md:pb-16 bg-background/50 text-foreground"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-4xl mx-auto p-4 md:p-8 shadow-lg backdrop-blur-lg bg-card/80 relative">
          <CardContent className="flex flex-col md:flex-row items-center gap-8 pt-4 pb-4 md:pt-0 md:pb-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative aspect-square w-32 md:w-56 overflow-hidden rounded-full border-4 border-primary"
            >
              <Image
                src={avatarSrc}
                alt={avatarAlt}
                width={224}
                height={224}
                sizes="(max-width: 768px) 128px, 224px"
                priority
                unoptimized
                className="object-cover w-full h-full"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-left w-full"
            >
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center gap-3 mt-2"
              >
                <Button
                  size="default"
                  className="shadow-md h-9 px-3 sm:px-4 gap-2"
                  onClick={copyToClipboard}
                  aria-label={copied ? 'Email copied to clipboard' : 'Copy email to clipboard'}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </>
                  )}
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
              </motion.div>
            </motion.div>
          </CardContent>

          {/* Down arrow - visible only on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute bottom-2 right-2 md:hidden animate-bounce"
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground/70" />
          </motion.div>
        </Card>
      </motion.div>
      {/* Optional: Add subtle background elements/animations here */}
    </section>
  );
};

export default Hero;
