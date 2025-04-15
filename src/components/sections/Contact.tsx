import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Contact = () => {
  const email = 'me@haydenmenge.com';
  const linkedinUrl = 'https://linkedin.com/in/hayden-menge-548590167/';
  const githubUrl = 'https://github.com/hemenge133';

  return (
    <section id="contact" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>
        <Card className="max-w-lg mx-auto shadow-md flex items-center justify-center">
          <CardContent className="text-center w-full py-6">
            <div className="flex justify-center items-center gap-12">
              <a href={`mailto:${email}`} className="text-primary hover:underline font-medium">
                Email
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                LinkedIn
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                GitHub
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Contact;
