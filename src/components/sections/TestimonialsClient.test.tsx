import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit tests for TestimonialsClient component
 * 
 * Tests verify:
 * - Client Component with Framer Motion whileInView animation
 * - Stagger animation with 0.1s delay between children
 * - viewport={{ once: true }} to animate only once
 * - Proper animation variants (opacity, y transform)
 * 
 * These tests validate requirement 6.5
 */

const testimonialsClientPath = join(__dirname, 'TestimonialsClient.tsx');

describe('TestimonialsClient Component', () => {

  it('should be a client component', () => {
    const testimonialsClientContent = readFileSync(testimonialsClientPath, 'utf-8');
    
    // Verify 'use client' directive
    expect(testimonialsClientContent).toContain("'use client'");
  });

  it('should import framer-motion', () => {
    const testimonialsClientContent = readFileSync(testimonialsClientPath, 'utf-8');
    
    // Verify Framer Motion import
    expect(testimonialsClientContent).toContain("from 'framer-motion'");
    expect(testimonialsClientContent).toContain('motion');
  });

  it('should use whileInView with viewport once true', () => {
    const testimonialsClientContent = readFileSync(testimonialsClientPath, 'utf-8');
    
    // Verify whileInView animation with once: true per requirement 6.5
    expect(testimonialsClientContent).toContain('whileInView');
    expect(testimonialsClientContent).toContain('viewport={{ once: true }}');
  });

  it('should implement stagger animation with 0.1s delay', () => {
    const testimonialsClientContent = readFileSync(testimonialsClientPath, 'utf-8');
    
    // Verify staggerChildren: 0.1 per requirement 6.5
    expect(testimonialsClientContent).toContain('staggerChildren: 0.1');
  });

  it('should define hidden and visible variants', () => {
    const testimonialsClientContent = readFileSync(testimonialsClientPath, 'utf-8');
    
    // Verify animation variants
    expect(testimonialsClientContent).toContain('hidden');
    expect(testimonialsClientContent).toContain('visible');
    expect(testimonialsClientContent).toContain('variants');
  });

  it('should animate opacity from 0 to 1', () => {
    const testimonialsClientContent = readFileSync(testimonialsClientPath, 'utf-8');
    
    // Verify opacity animation
    expect(testimonialsClientContent).toContain('opacity: 0');
    expect(testimonialsClientContent).toContain('opacity: 1');
  });

  it('should animate y position from 30 to 0', () => {
    const testimonialsClientContent = readFileSync(testimonialsClientPath, 'utf-8');
    
    // Verify y transform animation
    expect(testimonialsClientContent).toContain('y: 30');
    expect(testimonialsClientContent).toContain('y: 0');
  });

  it('should use easeOut transition with 0.5s duration', () => {
    const testimonialsClientContent = readFileSync(testimonialsClientPath, 'utf-8');
    
    // Verify transition settings
    expect(testimonialsClientContent).toContain('duration: 0.5');
    expect(testimonialsClientContent).toContain("ease: 'easeOut'");
  });

  it('should accept children prop', () => {
    const testimonialsClientContent = readFileSync(testimonialsClientPath, 'utf-8');
    
    // Verify children prop is accepted and rendered
    expect(testimonialsClientContent).toContain('children: React.ReactNode');
    expect(testimonialsClientContent).toContain('{children}');
  });

  it('should wrap content in motion.div', () => {
    const testimonialsClientContent = readFileSync(testimonialsClientPath, 'utf-8');
    
    // Verify motion.div wrapper
    expect(testimonialsClientContent).toContain('motion.div');
  });
});
