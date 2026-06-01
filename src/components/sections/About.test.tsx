import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit tests for About component
 * 
 * Tests verify:
 * - Component structure and required content elements
 * - Proper use of design tokens and typography
 * - Supporting photo with correct aspect ratio
 * - Framer Motion whileInView animation
 * 
 * These tests validate requirements 3.1, 3.2, 3.3, 3.4 by reading
 * the source code directly and verifying all required elements are present.
 */

const aboutPath = join(__dirname, 'About.tsx');
const aboutClientPath = join(__dirname, 'AboutClient.tsx');

describe('About Component', () => {
  it('should have required structural elements', () => {
    const aboutContent = readFileSync(aboutPath, 'utf-8');
    
    // Verify Server Component structure
    expect(aboutContent).toContain('export default function About()');
    expect(aboutContent).toContain('<AboutClient>');
  });

  it('should render with proper section padding', () => {
    const aboutContent = readFileSync(aboutPath, 'utf-8');
    
    // Verify section has minimum padding per requirement 1.4
    expect(aboutContent).toContain('py-20');
    expect(aboutContent).toContain('px-4');
    expect(aboutContent).toContain('md:px-8');
    expect(aboutContent).toContain('lg:px-16');
  });

  it('should use bg-background for section', () => {
    const aboutContent = readFileSync(aboutPath, 'utf-8');
    
    // Verify background color token per requirement 1.3
    expect(aboutContent).toContain('bg-background');
  });

  it('should have brand story content', () => {
    const aboutContent = readFileSync(aboutPath, 'utf-8');
    
    // Verify non-empty brand story text per requirement 3.1
    expect(aboutContent).toContain('Our Story');
    expect(aboutContent).toMatch(/Founded with a passion/);
    expect(aboutContent).toMatch(/community gathering place/);
  });

  it('should have philosophy statement', () => {
    const aboutContent = readFileSync(aboutPath, 'utf-8');
    
    // Verify non-empty philosophy statement per requirement 3.1
    expect(aboutContent).toContain('Our Philosophy');
    expect(aboutContent).toMatch(/sourcing only the finest beans/);
    expect(aboutContent).toMatch(/Coffee is more than a beverage/);
  });

  it('should have unique value proposition', () => {
    const aboutContent = readFileSync(aboutPath, 'utf-8');
    
    // Verify non-empty value proposition per requirement 3.1
    expect(aboutContent).toContain('What Makes Us Special');
    expect(aboutContent).toMatch(/personalized experience/);
    expect(aboutContent).toMatch(/artisanal coffee craftsmanship/);
  });

  it('should have supporting photo with 16:9 aspect ratio', () => {
    const aboutContent = readFileSync(aboutPath, 'utf-8');
    
    // Verify supporting photo at 16:9 aspect ratio per requirement 3.2
    expect(aboutContent).toContain('import Image from');
    expect(aboutContent).toContain('aspect-video'); // aspect-video is 16:9 in Tailwind
    expect(aboutContent).toContain('object-cover');
    expect(aboutContent).toContain('fill');
  });

  it('should have non-empty alt attribute on image', () => {
    const aboutContent = readFileSync(aboutPath, 'utf-8');
    
    // Verify non-empty alt text per requirement 3.2
    expect(aboutContent).toMatch(/alt="[^"]+coffee[^"]*"/i);
  });

  it('should use proper typography tokens', () => {
    const aboutContent = readFileSync(aboutPath, 'utf-8');
    
    // Verify font-heading for headings and font-body for paragraphs per requirement 1.6
    expect(aboutContent).toContain('font-heading');
    expect(aboutContent).toContain('font-body');
    expect(aboutContent).toContain('text-text-primary');
    expect(aboutContent).toContain('text-text-muted');
    expect(aboutContent).toContain('text-primary');
  });

  it('should be responsive with grid layout', () => {
    const aboutContent = readFileSync(aboutPath, 'utf-8');
    
    // Verify responsive layout per requirement 1.7
    expect(aboutContent).toContain('grid');
    expect(aboutContent).toContain('lg:grid-cols-2');
  });
});

describe('AboutClient Component', () => {
  it('should be a client component with Framer Motion', () => {
    const clientContent = readFileSync(aboutClientPath, 'utf-8');
    
    // Verify client component directive
    expect(clientContent).toContain("'use client'");
    expect(clientContent).toContain("import { motion } from 'framer-motion'");
  });

  it('should use whileInView animation with correct parameters', () => {
    const clientContent = readFileSync(aboutClientPath, 'utf-8');
    
    // Verify Framer Motion whileInView usage per requirement 3.3
    expect(clientContent).toContain('motion.div');
    expect(clientContent).toContain('whileInView');
    expect(clientContent).toContain('opacity: 0, y: 30');
    expect(clientContent).toContain('opacity: 1, y: 0');
    expect(clientContent).toContain("duration: 0.5, ease: 'easeOut'");
  });

  it('should trigger animation once per page load', () => {
    const clientContent = readFileSync(aboutClientPath, 'utf-8');
    
    // Verify viewport.once: true per requirement 3.3
    expect(clientContent).toContain('viewport');
    expect(clientContent).toContain('once: true');
  });

  it('should accept children prop', () => {
    const clientContent = readFileSync(aboutClientPath, 'utf-8');
    
    // Verify proper component composition
    expect(clientContent).toContain('children');
    expect(clientContent).toContain('ReactNode');
  });
});
