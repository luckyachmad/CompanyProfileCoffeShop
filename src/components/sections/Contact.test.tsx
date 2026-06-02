/**
 * Unit Tests for Contact Section Component
 * 
 * Tests verify:
 * - Component structure and required content elements
 * - Google Maps iframe embed with proper attributes
 * - Full address, operating hours, and phone number display
 * - Social media links with correct accessibility attributes
 * - Framer Motion whileInView animation
 * - Proper use of design tokens and typography
 * 
 * These tests validate requirements 7.1, 7.2, 7.3, 7.4, 7.5 by reading
 * the source code directly and verifying all required elements are present.
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const contactPath = join(__dirname, 'Contact.tsx');
const contactClientPath = join(__dirname, 'ContactClient.tsx');

describe('Contact Component', () => {
  it('should have required structural elements', () => {
    const contactContent = readFileSync(contactPath, 'utf-8');
    
    // Verify Server Component structure
    expect(contactContent).toContain('export default function Contact()');
    expect(contactContent).toContain('<ContactClient>');
    expect(contactContent).toContain('id="contact"');
  });

  it('should render with proper section padding', () => {
    const contactContent = readFileSync(contactPath, 'utf-8');
    
    // Verify section has minimum padding per requirement 1.4
    expect(contactContent).toContain('py-20');
    expect(contactContent).toContain('px-4');
    expect(contactContent).toContain('md:px-8');
    expect(contactContent).toContain('lg:px-16');
  });

  it('should use bg-background for section', () => {
    const contactContent = readFileSync(contactPath, 'utf-8');
    
    // Verify background color token per requirement 1.3
    expect(contactContent).toContain('bg-background');
  });

  it('should be a static Server Component with no API calls (Requirement 7.1)', () => {
    const contactContent = readFileSync(contactPath, 'utf-8');
    
    // Verify no fetch calls or API imports - all content is hardcoded
    expect(contactContent).not.toContain('fetch(');
    expect(contactContent).not.toContain('useSWR');
    expect(contactContent).not.toContain('/api/');
  });

  describe('Google Maps Embed (Requirement 7.2)', () => {
    it('should embed interactive Google Maps iframe', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify Google Maps iframe is embedded
      expect(contactContent).toContain('<iframe');
      expect(contactContent).toContain('google.com/maps/embed');
      expect(contactContent).toContain('title="Coffee Shop Location Map"');
    });

    it('should have correct iframe attributes for accessibility and performance', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify required iframe attributes per requirement 7.2
      expect(contactContent).toContain('allowFullScreen');
      expect(contactContent).toContain('loading="lazy"');
      expect(contactContent).toContain('referrerPolicy="no-referrer-when-downgrade"');
      expect(contactContent).toContain('width="100%"');
      expect(contactContent).toContain('height="100%"');
    });

    it('should have rounded corners and shadow for maps container', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify design system styling
      expect(contactContent).toContain('rounded-2xl');
      expect(contactContent).toContain('shadow-lg');
    });
  });

  describe('Address Information (Requirement 7.3)', () => {
    it('should display full street address', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify full address is displayed per requirement 7.3
      expect(contactContent).toContain('Jl. Kopi Nikmat No. 123');
      expect(contactContent).toContain('Menteng, Jakarta Pusat');
      expect(contactContent).toContain('DKI Jakarta 10310');
      expect(contactContent).toContain('Indonesia');
    });

    it('should have Address heading with icon', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify Address heading exists
      expect(contactContent).toContain('Address');
      expect(contactContent).toContain('<h3');
    });

    it('should use proper typography for address', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify font-body and text-muted for address text
      expect(contactContent).toContain('font-body');
      expect(contactContent).toContain('text-text-muted');
    });
  });

  describe('Operating Hours (Requirement 7.3)', () => {
    it('should display operating hours with days and times', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify operating hours are displayed per requirement 7.3
      expect(contactContent).toContain('Operating Hours');
      expect(contactContent).toContain('Monday - Friday');
      expect(contactContent).toContain('07:00 - 22:00');
      expect(contactContent).toContain('Saturday');
      expect(contactContent).toContain('08:00 - 23:00');
      expect(contactContent).toContain('Sunday');
      expect(contactContent).toContain('08:00 - 21:00');
    });

    it('should have structured layout for hours', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify hours are in structured format with proper styling
      expect(contactContent).toContain('flex justify-between');
      expect(contactContent).toContain('font-medium');
    });
  });

  describe('Phone Number (Requirement 7.3)', () => {
    it('should display phone number as clickable link', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify phone number is displayed per requirement 7.3
      expect(contactContent).toContain('Phone');
      expect(contactContent).toContain('+62 21 2345 6789');
      expect(contactContent).toContain('href="tel:+622123456789"');
    });

    it('should have hover transition on phone link', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify button hover transition per design system
      expect(contactContent).toContain('transition-colors');
      expect(contactContent).toContain('duration-300');
      expect(contactContent).toContain('hover:text-primary');
    });
  });

  describe('Social Media Links (Requirement 7.4)', () => {
    it('should render Instagram link with correct attributes', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify Instagram link per requirement 7.4
      expect(contactContent).toContain('href="https://instagram.com/coffeeshop"');
      expect(contactContent).toContain('target="_blank"');
      expect(contactContent).toContain('rel="noopener noreferrer"');
      expect(contactContent).toContain('aria-label="Follow us on Instagram"');
    });

    it('should render Facebook link with correct attributes', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify Facebook link per requirement 7.4
      expect(contactContent).toContain('href="https://facebook.com/coffeeshop"');
      expect(contactContent).toContain('target="_blank"');
      expect(contactContent).toContain('rel="noopener noreferrer"');
      expect(contactContent).toContain('aria-label="Follow us on Facebook"');
    });

    it('should render Twitter link with correct attributes', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify Twitter link per requirement 7.4
      expect(contactContent).toContain('href="https://twitter.com/coffeeshop"');
      expect(contactContent).toContain('target="_blank"');
      expect(contactContent).toContain('rel="noopener noreferrer"');
      expect(contactContent).toContain('aria-label="Follow us on Twitter"');
    });

    it('should have hover transitions and scale effect on social media buttons', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify button hover transitions per design system
      expect(contactContent).toContain('transition-all');
      expect(contactContent).toContain('duration-300');
      expect(contactContent).toContain('ease-in-out');
      expect(contactContent).toContain('hover:scale-110');
    });

    it('should use primary color scheme for social media buttons', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify design system colors
      expect(contactContent).toContain('bg-primary');
      expect(contactContent).toContain('hover:bg-primary-hover');
    });
  });

  describe('Design System Compliance', () => {
    it('should use proper typography tokens', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify font-heading for headings and font-body for content per requirement 1.6
      expect(contactContent).toContain('font-heading');
      expect(contactContent).toContain('font-body');
      expect(contactContent).toContain('text-text-primary');
      expect(contactContent).toContain('text-text-muted');
      expect(contactContent).toContain('text-primary');
    });

    it('should be responsive with grid layout', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify responsive layout per requirement 1.7
      expect(contactContent).toContain('grid');
      expect(contactContent).toContain('grid-cols-1');
      expect(contactContent).toContain('lg:grid-cols-2');
    });

    it('should have responsive text sizes for headings', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify responsive typography
      expect(contactContent).toContain('text-3xl');
      expect(contactContent).toContain('md:text-4xl');
      expect(contactContent).toContain('lg:text-5xl');
    });

    it('should use semantic HTML with proper headings', () => {
      const contactContent = readFileSync(contactPath, 'utf-8');
      
      // Verify semantic HTML structure
      expect(contactContent).toContain('<section');
      expect(contactContent).toContain('<h2');
      expect(contactContent).toContain('<h3');
    });
  });
});

describe('ContactClient Component', () => {
  it('should be a client component with Framer Motion', () => {
    const clientContent = readFileSync(contactClientPath, 'utf-8');
    
    // Verify client component directive
    expect(clientContent).toContain("'use client'");
    expect(clientContent).toContain("import { motion } from 'framer-motion'");
  });

  it('should use whileInView animation with correct parameters (Requirement 7.5)', () => {
    const clientContent = readFileSync(contactClientPath, 'utf-8');
    
    // Verify Framer Motion whileInView usage per requirement 7.5
    expect(clientContent).toContain('motion.div');
    expect(clientContent).toContain('whileInView');
    expect(clientContent).toContain('opacity: 0, y: 30');
    expect(clientContent).toContain('opacity: 1, y: 0');
    expect(clientContent).toContain("duration: 0.5, ease: 'easeOut'");
  });

  it('should trigger animation once per page load', () => {
    const clientContent = readFileSync(contactClientPath, 'utf-8');
    
    // Verify viewport.once: true per requirement 7.5
    expect(clientContent).toContain('viewport');
    expect(clientContent).toContain('once: true');
  });

  it('should accept children prop for content composition', () => {
    const clientContent = readFileSync(contactClientPath, 'utf-8');
    
    // Verify proper component composition
    expect(clientContent).toContain('children');
    expect(clientContent).toContain('ReactNode');
  });

  it('should have proper documentation', () => {
    const clientContent = readFileSync(contactClientPath, 'utf-8');
    
    // Verify component documentation references requirement
    expect(clientContent).toContain('Requirement 7.5');
  });
});
