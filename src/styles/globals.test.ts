import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Global Styles (globals.css)', () => {
  const cssContent = readFileSync(
    join(__dirname, 'globals.css'),
    'utf-8'
  );

  it('should import Tailwind CSS', () => {
    // Task 10.3: Tailwind imports
    expect(cssContent).toContain('@import "tailwindcss"');
  });

  it('should define CSS font variables', () => {
    // Task 10.3: Font CSS variables
    expect(cssContent).toContain('--font-poppins');
    expect(cssContent).toContain('--font-inter');
  });

  it('should apply font-heading to h1-h3 elements', () => {
    // Requirement 1.6: Apply font-heading to h1, h2, h3
    // Task 10.3: Apply font-heading to h1-h3 elements
    expect(cssContent).toMatch(/h1[,\s]+h2[,\s]+h3\s*\{[^}]*font-family:\s*var\(--font-poppins\)/s);
  });

  it('should apply font-body to text elements', () => {
    // Requirement 1.6: Apply font-body to p, span, label, figcaption, caption
    // Task 10.3: Apply font-body to p, span, label, figcaption, caption elements
    const expectedElements = ['p', 'span', 'label', 'figcaption', 'caption'];
    
    // Check that all elements are listed in the CSS
    expectedElements.forEach(element => {
      expect(cssContent).toContain(element);
    });
    
    // Check for the font-body application
    expect(cssContent).toMatch(/[p,\s]+[span,\s]+[label,\s]+[figcaption,\s]+[caption,\s]+\{[^}]*font-family:\s*var\(--font-inter\)/s);
  });

  it('should define background color variable', () => {
    // Requirement 1.3: bg-background token
    expect(cssContent).toContain('--color-background: #F5F0E8');
  });

  it('should set body background to soft beige', () => {
    // Requirement 1.3: Page background must be soft beige
    expect(cssContent).toMatch(/body\s*\{[^}]*background-color:\s*#F5F0E8/s);
  });

  it('should enable smooth scroll behavior', () => {
    // Requirement 1.2: Smooth scrolling for CTA buttons
    expect(cssContent).toMatch(/html\s*\{[^}]*scroll-behavior:\s*smooth/s);
  });

  it('should define Tailwind design tokens in @theme', () => {
    // Requirement 16.3: All brand colors as Tailwind tokens
    expect(cssContent).toContain('@theme');
    expect(cssContent).toContain('--color-primary: #3B1F0A');
    expect(cssContent).toContain('--color-secondary: #C8A97E');
    expect(cssContent).toContain('--color-surface: #FFFFFF');
  });

  it('should define font family tokens in @theme', () => {
    // Tailwind v4 font family tokens
    expect(cssContent).toContain('--font-family-heading: var(--font-poppins)');
    expect(cssContent).toContain('--font-family-body: var(--font-inter)');
  });

  it('should define transition timing defaults', () => {
    // All transitions use duration-300 and ease-in-out
    expect(cssContent).toContain('--transition-duration-default: 300ms');
    expect(cssContent).toContain('--transition-timing-function-default: ease-in-out');
  });

  it('should have focus styles for accessibility', () => {
    // Focus-visible outline for keyboard navigation
    expect(cssContent).toContain('focus-visible');
    expect(cssContent).toMatch(/outline:\s*2px\s+solid\s+#3B1F0A/);
  });
});
