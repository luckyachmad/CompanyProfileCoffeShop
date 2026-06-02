import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Root Layout Configuration', () => {
  const layoutContent = readFileSync(
    join(__dirname, 'layout.tsx'),
    'utf-8'
  );

  it('should load Poppins font with correct weights', () => {
    // Requirement 1.5: Poppins with weights 600, 700, 800
    expect(layoutContent).toContain('Poppins');
    expect(layoutContent).toContain("weight: ['600', '700', '800']");
    expect(layoutContent).toContain("variable: '--font-poppins'");
  });

  it('should load Inter font with correct weights', () => {
    // Requirement 1.5: Inter with weights 400, 500
    expect(layoutContent).toContain('Inter');
    expect(layoutContent).toContain("weight: ['400', '500']");
    expect(layoutContent).toContain("variable: '--font-inter'");
  });

  it('should apply font CSS variables to html element', () => {
    // Requirement 1.5: CSS variables applied in root layout
    // Check that both font variables are applied to the html element
    expect(layoutContent).toMatch(/className.*poppins\.variable.*inter\.variable/s);
  });

  it('should import global Tailwind CSS', () => {
    // Requirement from task: Set up global Tailwind CSS imports
    expect(layoutContent).toContain("'../styles/globals.css'");
  });

  it('should have metadata export with title', () => {
    // Requirement 16.2: Non-empty title
    expect(layoutContent).toContain('export const metadata');
    expect(layoutContent).toMatch(/title:\s*['"][^'"]+['"]/);
  });

  it('should have metadata with description', () => {
    // Requirement 16.2: Non-empty description
    expect(layoutContent).toMatch(/description:\s*['"][^'"]+['"]/);
  });

  it('should have Open Graph metadata', () => {
    // Requirement 16.2: Open Graph tags
    expect(layoutContent).toContain('openGraph');
    expect(layoutContent).toMatch(/type:\s*['"]website['"]/);
  });
});
