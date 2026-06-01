import { describe, it, expect } from 'vitest';

/**
 * Integration test for Hero component
 * 
 * Verifies that the Hero component can be imported and has the correct export structure
 */
describe('Hero Component Integration', () => {
  it('should be importable as a default export', async () => {
    // Dynamic import to verify the component module structure
    const heroModule = await import('./Hero');
    
    expect(heroModule.default).toBeDefined();
    expect(typeof heroModule.default).toBe('function');
  });

  it('should have HeroClient as a separate module', async () => {
    const heroClientModule = await import('./HeroClient');
    
    expect(heroClientModule.default).toBeDefined();
    expect(typeof heroClientModule.default).toBe('function');
  });
});
