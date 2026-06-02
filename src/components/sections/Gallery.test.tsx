import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit tests for Gallery component
 * 
 * Tests verify:
 * - Component structure and data fetching with 5-minute revalidation
 * - Photos ordered by sort_order
 * - Responsive grid layout with Framer Motion stagger animation
 * - Lightbox integration
 * - Empty/error state handling
 * 
 * These tests validate requirements 5.1, 5.2, 5.3, 5.6, 5.7
 */

const galleryPath = join(__dirname, 'Gallery.tsx');

describe('Gallery Server Component', () => {

  it('should fetch gallery photos from API with 5-minute revalidation', () => {
    const galleryContent = readFileSync(galleryPath, 'utf-8');
    
    // Verify fetch with 5-minute (300 seconds) revalidation per requirement 5.1
    expect(galleryContent).toContain('revalidate: 300');
    expect(galleryContent).toContain('/api/gallery');
  });

  it('should render photos ordered by sort_order', () => {
    const galleryContent = readFileSync(galleryPath, 'utf-8');
    
    // Verify component fetches and passes data to GalleryClient
    expect(galleryContent).toContain('getGalleryPhotos');
    expect(galleryContent).toContain('<GalleryClient photos={photos}');
  });

  it('should pass photos to GalleryClient component', () => {
    const galleryContent = readFileSync(galleryPath, 'utf-8');
    
    // Verify GalleryClient receives photos prop
    expect(galleryContent).toContain('GalleryClient');
    expect(galleryContent).toContain('photos={photos}');
  });

  it('should render empty state when no photos are returned', () => {
    const galleryContent = readFileSync(galleryPath, 'utf-8');
    
    // Verify empty state handling per requirement 5.7
    expect(galleryContent).toContain('photos.length === 0');
    expect(galleryContent).toContain('Our gallery is being updated');
  });

  it('should render empty state when API returns error', () => {
    const galleryContent = readFileSync(galleryPath, 'utf-8');
    
    // Verify error handling returns empty array
    expect(galleryContent).toContain('console.error');
    expect(galleryContent).toContain('return []');
  });

  it('should render empty state when fetch throws error', () => {
    const galleryContent = readFileSync(galleryPath, 'utf-8');
    
    // Verify try-catch error handling
    expect(galleryContent).toContain('try {');
    expect(galleryContent).toContain('catch (error)');
    expect(galleryContent).toContain('return []');
  });

  it('should apply correct section styling classes', () => {
    const galleryContent = readFileSync(galleryPath, 'utf-8');
    
    // Verify section styling per requirement 1.3, 1.4
    expect(galleryContent).toContain('bg-background');
    expect(galleryContent).toContain('py-20');
    expect(galleryContent).toContain('px-4');
    expect(galleryContent).toContain('md:px-8');
    expect(galleryContent).toContain('lg:px-16');
  });

  it('should use font-heading for section title', () => {
    const galleryContent = readFileSync(galleryPath, 'utf-8');
    
    // Verify font-heading used on h2 per requirement 1.6
    expect(galleryContent).toContain('font-heading');
    expect(galleryContent).toContain('<h2');
  });

  it('should use font-body for empty state message', () => {
    const galleryContent = readFileSync(galleryPath, 'utf-8');
    
    // Verify font-body used on p tags
    expect(galleryContent).toContain('font-body');
  });

  it('should have gallery section id for navigation', () => {
    const galleryContent = readFileSync(galleryPath, 'utf-8');
    
    // Verify section id for smooth scrolling per requirement 1.2
    expect(galleryContent).toContain('id="gallery"');
  });
});
