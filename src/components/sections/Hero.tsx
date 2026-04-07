'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { SiSalesforce } from 'react-icons/si';
import { FaAws, FaLinkedin } from 'react-icons/fa';
import { Mail, Check, ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';

const Hero = () => {
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
      className="relative px-4 pt-24 pb-16 md:pt-32 md:pb-24"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Avatar with grayscale → color hover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="group relative shrink-0"
          >
            <div className="relative w-32 md:w-44 aspect-square rounded-full overflow-hidden border-2 border-border group-hover:border-foreground/30 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(0,0,0,0.08)] dark:group-hover:shadow-[0_0_40px_rgba(255,255,255,0.04)]">
              <Image
                src={avatarSrc}
                alt={avatarAlt}
                width={176}
                height={176}
                priority
                unoptimized
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
            </div>
          </motion.div>

          {/* Text content */}
          <div className="text-center md:text-left flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-[-0.04em]"
            >
              {name}
            </motion.h1>

            {/* Animated line under name */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-foreground/15 mt-4 mb-4 origin-left hidden md:block"
              style={{ maxWidth: '120px' }}
            />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3 mt-3 md:mt-0 justify-center md:justify-start"
            >
              <p className="text-lg text-muted-foreground font-medium">{title}</p>
              <span className="text-border">|</span>
              <SiSalesforce
                aria-label="Current Employer: Salesforce"
                className="h-5 w-5 text-muted-foreground/40 hover:text-foreground transition-colors duration-300 cursor-default"
              />
              <FaAws
                aria-label="Previous Employer: Amazon Web Services"
                className="h-5 w-5 text-muted-foreground/40 hover:text-foreground transition-colors duration-300 cursor-default"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground mt-4 max-w-lg leading-relaxed mx-auto md:mx-0"
            >
              {intro}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-3 mt-6 justify-center md:justify-start"
            >
              <Button
                size="default"
                className="gap-2 group/btn hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200"
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
                    <Mail className="h-4 w-4 group-hover/btn:rotate-[-6deg] transition-transform duration-300" />
                    <span>Email</span>
                  </>
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                size="default"
                className="group/btn hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-200"
              >
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                  LinkedIn
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
