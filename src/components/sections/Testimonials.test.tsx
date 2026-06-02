import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit tests for Testimonials component
 * 
 * Tests verify:
 * - Component structure and data fetching with 10-minute revalidation
 * - Testimonial cards display author_name, content, and star rating
 * - Card grid layout with Framer Motion stagger animation
 * - Empty/error state handling with static fallback testimonials
 * 
 * These tests validate requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

const testimonialsPath = join(__dirname, 'Testimonials.tsx');

describe('Testimonials Server Component', () => {

  it('should fetch testimonials from API with 10-minute revalidation', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify fetch with 10-minute (600 seconds) revalidation per requirement 6.1
    expect(testimonialsContent).toContain('revalidate: 600');
    expect(testimonialsContent).toContain('/api/testimonials');
  });

  it('should render testimonials with author_name, content, and rating', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify component displays all required fields per requirement 6.2
    expect(testimonialsContent).toContain('testimonial.author_name');
    expect(testimonialsContent).toContain('testimonial.content');
    expect(testimonialsContent).toContain('testimonial.rating');
  });

  it('should render star rating as visual indicator', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify star rating component per requirement 6.3
    expect(testimonialsContent).toContain('StarRating');
    expect(testimonialsContent).toContain('rating={testimonial.rating}');
  });

  it('should pass testimonials to TestimonialsClient component', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify TestimonialsClient receives testimonials per requirement 6.4
    expect(testimonialsContent).toContain('TestimonialsClient');
  });

  it('should use responsive card grid layout', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify responsive grid layout per requirement 6.4
    expect(testimonialsContent).toContain('grid grid-cols-1');
    expect(testimonialsContent).toContain('md:grid-cols-2');
    expect(testimonialsContent).toContain('lg:grid-cols-3');
  });

  it('should use card styling with border and shadow', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify card styling per requirement 6.2
    expect(testimonialsContent).toContain('rounded-2xl');
    expect(testimonialsContent).toContain('shadow-sm');
    expect(testimonialsContent).toContain('bg-surface');
    expect(testimonialsContent).toContain('border border-border');
  });

  it('should fall back to static testimonials on API error', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify fallback testimonials per requirement 6.6
    expect(testimonialsContent).toContain('FALLBACK_TESTIMONIALS');
    expect(testimonialsContent).toContain('return FALLBACK_TESTIMONIALS');
  });

  it('should fall back to static testimonials when API returns empty array', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify empty array handling returns fallback per requirement 6.6
    expect(testimonialsContent).toContain('data.length === 0');
    expect(testimonialsContent).toContain('return FALLBACK_TESTIMONIALS');
  });

  it('should have at least three fallback testimonials', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify at least 3 testimonials per requirement 6.1
    expect(testimonialsContent).toContain('FALLBACK_TESTIMONIALS');
    // Check for multiple testimonial objects in the fallback array
    const fallbackMatches = testimonialsContent.match(/author_name:/g);
    expect(fallbackMatches).toBeDefined();
    expect(fallbackMatches!.length).toBeGreaterThanOrEqual(3);
  });

  it('should apply correct section styling classes', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify section styling per requirement 1.3, 1.4
    expect(testimonialsContent).toContain('bg-background');
    expect(testimonialsContent).toContain('py-20');
    expect(testimonialsContent).toContain('px-4');
    expect(testimonialsContent).toContain('md:px-8');
    expect(testimonialsContent).toContain('lg:px-16');
  });

  it('should use font-heading for section title', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify font-heading used on h2 per requirement 1.6
    expect(testimonialsContent).toContain('font-heading');
    expect(testimonialsContent).toContain('<h2');
  });

  it('should use font-body for testimonial content', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify font-body used on content text per requirement 1.6
    expect(testimonialsContent).toContain('font-body');
  });

  it('should have testimonials section id for navigation', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify section id for smooth scrolling per requirement 1.2
    expect(testimonialsContent).toContain('id="testimonials"');
  });

  it('should render star rating with 5 stars', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify StarRating component renders 5 stars per requirement 6.3
    expect(testimonialsContent).toContain('Array.from({ length: 5 }');
  });

  it('should use secondary color for filled stars', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify star styling uses secondary color token
    expect(testimonialsContent).toContain('text-secondary');
    expect(testimonialsContent).toContain('fill-secondary');
  });

  it('should handle API errors with try-catch', () => {
    const testimonialsContent = readFileSync(testimonialsPath, 'utf-8');
    
    // Verify error handling
    expect(testimonialsContent).toContain('try {');
    expect(testimonialsContent).toContain('catch (error)');
  });
});
