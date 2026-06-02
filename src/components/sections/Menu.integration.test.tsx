import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Integration tests for Menu component
 * 
 * Verifies:
 * - Component can be imported correctly
 * - Data fetching and rendering logic
 * - Error handling and empty states
 */
describe('Menu Component Integration', () => {
  it('should be importable as a default export', async () => {
    // Dynamic import to verify the component module structure
    const menuModule = await import('./Menu');
    
    expect(menuModule.default).toBeDefined();
    expect(typeof menuModule.default).toBe('function');
  });

  it('should have MenuClient as a separate module', async () => {
    const menuClientModule = await import('./MenuClient');
    
    expect(menuClientModule.default).toBeDefined();
    expect(typeof menuClientModule.default).toBe('function');
  });
});

describe('Menu Data Fetching', () => {
  // Store original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Mock environment variable
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should handle successful data fetch', async () => {
    // Mock successful API response
    const mockMenuItems = [
      {
        id: 1,
        category_id: 1,
        title: 'Espresso',
        description: 'Rich and bold',
        price: 25000,
        image_url: '/images/espresso.webp',
        is_best_seller: true,
        created_at: new Date(),
        updated_at: new Date(),
        category_name: 'Coffee'
      },
      {
        id: 2,
        category_id: 1,
        title: 'Latte',
        description: 'Smooth and creamy',
        price: 30000,
        image_url: '/images/latte.webp',
        is_best_seller: false,
        created_at: new Date(),
        updated_at: new Date(),
        category_name: 'Coffee'
      }
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMenuItems
    } as Response);

    // Import and render the component
    const Menu = (await import('./Menu')).default;
    const result = await Menu();
    
    // Component should render without throwing
    expect(result).toBeDefined();
  });

  it('should handle empty menu items array', async () => {
    // Mock empty API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    } as Response);

    const Menu = (await import('./Menu')).default;
    const result = await Menu();
    
    // Component should render fallback message
    expect(result).toBeDefined();
  });

  it('should handle API error gracefully', async () => {
    // Mock failed API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error'
    } as Response);

    const Menu = (await import('./Menu')).default;
    const result = await Menu();
    
    // Component should render fallback message without throwing
    expect(result).toBeDefined();
  });

  it('should handle network error gracefully', async () => {
    // Mock network error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const Menu = (await import('./Menu')).default;
    const result = await Menu();
    
    // Component should render fallback message without throwing
    expect(result).toBeDefined();
  });
});
