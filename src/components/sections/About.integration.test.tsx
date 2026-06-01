import { describe, it, expect } from 'vitest';

/**
 * Integration test for About component
 * 
 * Verifies that the About component can be imported and has the correct export structure
 */
describe('About Component Integration', () => {
  it('should be importable as a default export', async () => {
    // Dynamic import to verify the component module structure
    const aboutModule = await import('./About');
    
    expect(aboutModule.default).toBeDefined();
    expect(typeof aboutModule.default).toBe('function');
  });

  it('should have AboutClient as a separate module', async () => {
    const aboutClientModule = await import('./AboutClient');
    
    expect(aboutClientModule.default).toBeDefined();
    expect(typeof aboutClientModule.default).toBe('function');
  });
});
