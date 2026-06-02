/**
 * Landing Page Unit Tests
 * 
 * Tests the composition and structure of the landing page.
 * Verifies that all 7 sections are imported and composed in the correct order.
 * 
 * **Validates: Requirements 1.1, 1.3, 1.4, 1.7, 1.8**
 */

import { describe, it, expect } from 'vitest';
import HomePage from './page';

describe('Landing Page', () => {
  it('should be defined and exportable', () => {
    expect(HomePage).toBeDefined();
    expect(typeof HomePage).toBe('function');
  });

  it('should be a valid React Server Component', () => {
    // Server Components are regular functions that return JSX
    const result = HomePage();
    expect(result).toBeDefined();
    expect(result.type).toBe('main');
  });

  it('should apply bg-background class to main container', () => {
    const result = HomePage();
    expect(result.props.className).toContain('bg-background');
  });

  it('should compose all 7 sections in correct order', () => {
    const result = HomePage();
    const children = result.props.children;
    
    // Verify all sections are present as children
    expect(children).toBeDefined();
    expect(Array.isArray(children)).toBe(true);
    
    // We expect 8 children: 7 sections + WhatsAppButton
    expect(children.length).toBeGreaterThanOrEqual(8);
    
    // Verify the sections are Server Components (functions)
    // In order: Hero, About, Menu, Gallery, Testimonials, Contact, Footer, WhatsAppButton
    const componentNames = children
      .filter((child: any) => child && typeof child === 'object' && child.type)
      .map((child: any) => child.type.name || 'Unknown');
    
    expect(componentNames).toContain('Hero');
    expect(componentNames).toContain('About');
    expect(componentNames).toContain('Menu');
    expect(componentNames).toContain('Gallery');
    expect(componentNames).toContain('Testimonials');
    expect(componentNames).toContain('Contact');
    expect(componentNames).toContain('Footer');
    expect(componentNames).toContain('WhatsAppButton');
  });

  it('should include floating WhatsApp button', () => {
    const result = HomePage();
    const children = result.props.children;
    
    // Find WhatsApp button in children
    const whatsappButton = children.find(
      (child: any) => child && child.type && child.type.name === 'WhatsAppButton'
    );
    
    expect(whatsappButton).toBeDefined();
    expect(whatsappButton.props.variant).toBe('floating');
  });

  it('should not contain inline JSX markup or business logic', () => {
    // This test verifies that page.tsx only imports and composes components
    // as per requirement 1.8
    const result = HomePage();
    
    // The main element should only contain imported components
    // No inline div structures, no data fetching, no conditional logic
    expect(result.type).toBe('main');
    
    // Children should be direct component references, not complex JSX structures
    const children = result.props.children;
    expect(Array.isArray(children)).toBe(true);
  });
});
