import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit tests for Hero component
 * 
 * Tests verify:
 * - Component structure and required elements
 * - Proper use of design tokens
 * - Accessibility attributes
 * 
 * These tests validate the static structure and styling of the components
 * by reading the source code directly, verifying requirements are met.
 */

const heroPath = join(__dirname, 'Hero.tsx');
const heroClientPath = join(__dirname, 'HeroClient.tsx');

describe('Hero Component', () => {
  it('should have required structural elements', () => {
    const heroContent = readFileSync(heroPath, 'utf-8');
    
    // Verify Server Component structure
    expect(heroContent).toContain('export default function Hero()');
    expect(heroContent).toContain('hero-background.webp');
    expect(heroContent).toContain('<HeroClient />');
  });

  it('should render with full-viewport height and background image', () => {
    const heroContent = readFileSync(heroPath, 'utf-8');
    
    // Verify full-viewport styling per requirement 2.1
    expect(heroContent).toContain('h-screen');
    expect(heroContent).toContain('w-full');
    expect(heroContent).toContain('object-cover');
  });

  it('should have dark overlay for text readability', () => {
    const heroContent = readFileSync(heroPath, 'utf-8');
    
    // Verify bg-black/40 overlay as per requirement 2.1
    expect(heroContent).toContain('bg-black/40');
  });

  it('should use Next.js Image component with priority loading', () => {
    const heroContent = readFileSync(heroPath, 'utf-8');
    
    // Verify proper image component usage
    expect(heroContent).toContain('import Image from');
    expect(heroContent).toContain('priority');
    expect(heroContent).toContain('fill');
  });
});

describe('HeroClient Component', () => {
  it('should be a client component with Framer Motion', () => {
    const clientContent = readFileSync(heroClientPath, 'utf-8');
    
    // Verify client component directive
    expect(clientContent).toContain("'use client'");
    expect(clientContent).toContain("import { motion } from 'framer-motion'");
  });

  it('should have CTA button with all required styling', () => {
    const clientContent = readFileSync(heroClientPath, 'utf-8');
    
    // Verify button has all required classes from requirement 2.3
    expect(clientContent).toContain('rounded-full');
    expect(clientContent).toContain('bg-primary');
    expect(clientContent).toContain('transition-all duration-300 ease-in-out');
    expect(clientContent).toContain('hover:bg-primary-hover');
    expect(clientContent).toContain('hover:scale-[1.03]');
    expect(clientContent).toContain('active:scale-[0.98]');
  });

  it('should implement smooth scroll to menu section', () => {
    const clientContent = readFileSync(heroClientPath, 'utf-8');
    
    // Verify smooth scroll functionality per requirement 2.6
    expect(clientContent).toContain("getElementById('menu')");
    expect(clientContent).toContain("scrollIntoView({ behavior: 'smooth' })");
  });

  it('should use Framer Motion animations with correct parameters', () => {
    const clientContent = readFileSync(heroClientPath, 'utf-8');
    
    // Verify Framer Motion usage per requirement 2.4
    expect(clientContent).toContain('motion.h1');
    expect(clientContent).toContain('motion.p');
    expect(clientContent).toContain('motion.button');
    expect(clientContent).toContain('opacity: 0, y: 30');
    expect(clientContent).toContain('opacity: 1, y: 0');
    expect(clientContent).toContain("duration: 0.5, ease: 'easeOut'");
  });

  it('should have proper font classes for typography', () => {
    const clientContent = readFileSync(heroClientPath, 'utf-8');
    
    // Verify font-heading for h1 and font-body for p per requirement 1.6
    expect(clientContent).toContain('font-heading');
    expect(clientContent).toContain('font-body');
  });

  it('should have headline and sub-headline content', () => {
    const clientContent = readFileSync(heroClientPath, 'utf-8');
    
    // Verify required content per requirement 2.2
    expect(clientContent).toMatch(/Crafted with Passion/);
    expect(clientContent).toMatch(/Experience the perfect blend/);
  });

  it('should have accessibility attributes', () => {
    const clientContent = readFileSync(heroClientPath, 'utf-8');
    
    // Verify aria-label for button
    expect(clientContent).toContain('aria-label');
  });
});
