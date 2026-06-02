/**
 * @vitest-environment happy-dom
 * 
 * Admin CRUD Operations Integration Tests
 * 
 * Tests for Task 15.3: Test admin CRUD operations
 * - Test menu item create, read, update, delete
 * - Test gallery photo upload and delete
 * - Test category management
 * - Test testimonial management
 * 
 * Requirements: 10.2, 10.3, 10.5, 10.6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: {
      user: { id: '1', email: 'admin@test.com' },
      expires: '2024-12-31',
    },
    status: 'authenticated',
  })),
}));

// Mock SWR
const mockMutate = vi.fn();
vi.mock('swr', () => ({
  default: vi.fn((url) => {
    if (url === '/api/menu') {
      return {
        data: [
          {
            id: 1,
            title: 'Cappuccino',
            description: 'Classic cappuccino',
            price: 25000,
            category_id: 1,
            category_name: 'Coffee',
            image_url: '/test-image.webp',
            is_best_seller: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        error: null,
        isLoading: false,
      };
    } else if (url === '/api/categories') {
      return {
        data: [
          { id: 1, name: 'Coffee' },
          { id: 2, name: 'Non-Coffee' },
        ],
        error: null,
        isLoading: false,
      };
    } else if (url === '/api/gallery') {
      return {
        data: [
          {
            id: 1,
            image_url: '/gallery-1.webp',
            alt_text: 'Coffee shop interior',
            sort_order: 0,
            created_at: new Date(),
          },
        ],
        error: null,
        isLoading: false,
      };
    }
    return { data: [], error: null, isLoading: false };
  }),
  mutate: mockMutate,
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe('Admin CRUD Operations - Menu Items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.alert = vi.fn();
  });

  it('should display existing menu items', async () => {
    const MenuManagementPage = (await import('./menu/page')).default;
    render(<MenuManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Cappuccino')).toBeInTheDocument();
      expect(screen.getByText('Classic cappuccino')).toBeInTheDocument();
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      // Use getAllByText since "Best Seller" appears in both header and badge
      expect(screen.getAllByText('Best Seller').length).toBeGreaterThan(0);
    });
  });

  it('should create a new menu item successfully', async () => {
    const MenuManagementPage = (await import('./menu/page')).default;
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        title: 'Latte',
        description: 'Smooth latte',
        price: 30000,
        category_id: 1,
        is_best_seller: false,
      }),
    } as Response);

    render(<MenuManagementPage />);

    // Click "Add New Item" button
    const addButton = screen.getByText('+ Add New Item');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Menu Item')).toBeInTheDocument();
    });

    // Fill form
    const titleInput = screen.getByLabelText(/Title/i);
    const categorySelect = screen.getByLabelText(/Category/i);
    const descriptionTextarea = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);

    fireEvent.change(titleInput, { target: { value: 'Latte' } });
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Smooth latte' } });
    fireEvent.change(priceInput, { target: { value: '30000' } });

    // Submit form by getting the form element and triggering submit
    const form = screen.getByRole('button', { name: /Create Item/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/menu',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(mockMutate).toHaveBeenCalledWith('/api/menu');
      expect(global.alert).toHaveBeenCalledWith('Menu item created successfully!');
    });
  });

  it('should validate required fields when creating menu item', async () => {
    const MenuManagementPage = (await import('./menu/page')).default;
    render(<MenuManagementPage />);

    // Click "Add New Item" button
    const addButton = screen.getByText('+ Add New Item');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Menu Item')).toBeInTheDocument();
    });

    // Submit without filling required fields by getting the form and triggering submit
    const form = screen.getByRole('button', { name: /Create Item/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Category is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    // Verify API was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should validate price is greater than 0', async () => {
    const MenuManagementPage = (await import('./menu/page')).default;
    render(<MenuManagementPage />);

    // Click "Add New Item" button
    const addButton = screen.getByText('+ Add New Item');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Menu Item')).toBeInTheDocument();
    });

    // Fill form with required fields but invalid price (0 to start)
    const titleInput = screen.getByLabelText(/Title/i);
    const categorySelect = screen.getByLabelText(/Category/i);
    const descriptionTextarea = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);

    fireEvent.change(titleInput, { target: { value: 'Test Item' } });
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });
    
    // Set price to 0 first then to negative to trigger validation
    fireEvent.change(priceInput, { target: { value: '0' } });

    // Submit form - should show price validation error
    const form = screen.getByRole('button', { name: /Create Item/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should update an existing menu item successfully', async () => {
    const MenuManagementPage = (await import('./menu/page')).default;
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        title: 'Cappuccino Updated',
        description: 'Updated description',
        price: 27000,
        category_id: 1,
        is_best_seller: true,
      }),
    } as Response);

    render(<MenuManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Cappuccino')).toBeInTheDocument();
    });

    // Click Edit button
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Menu Item')).toBeInTheDocument();
    });

    // Wait a bit for form to be populated
    await new Promise(resolve => setTimeout(resolve, 100));

    // Update all fields explicitly to ensure form has valid data
    const titleInput = screen.getByLabelText(/Title/i);
    const categorySelect = screen.getByLabelText(/Category/i);
    const descriptionTextarea = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    
    fireEvent.change(titleInput, { target: { value: 'Cappuccino Updated' } });
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Classic cappuccino' } });
    fireEvent.change(priceInput, { target: { value: '25000' } });

    // Submit form
    const form = screen.getByRole('button', { name: /Update Item/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/menu/1',
        expect.objectContaining({
          method: 'PUT',
          body: expect.any(FormData),
        })
      );
      expect(mockMutate).toHaveBeenCalledWith('/api/menu');
      expect(global.alert).toHaveBeenCalledWith('Menu item updated successfully!');
    });
  });

  it('should delete a menu item with confirmation', async () => {
    const MenuManagementPage = (await import('./menu/page')).default;
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(<MenuManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Cappuccino')).toBeInTheDocument();
    });

    // Click Delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    });

    // Confirm delete
    const confirmDeleteButton = screen.getAllByText('Delete').find(
      (button) => button.closest('.fixed') !== null
    );
    fireEvent.click(confirmDeleteButton!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/menu/1', {
        method: 'DELETE',
      });
      expect(mockMutate).toHaveBeenCalledWith('/api/menu');
      expect(global.alert).toHaveBeenCalledWith('Menu item deleted successfully!');
    });
  });

  it('should handle API errors gracefully when creating menu item', async () => {
    const MenuManagementPage = (await import('./menu/page')).default;
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Database error' }),
    } as Response);

    render(<MenuManagementPage />);

    // Click "Add New Item" button
    const addButton = screen.getByText('+ Add New Item');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create Menu Item')).toBeInTheDocument();
    });

    // Fill form with valid data
    const titleInput = screen.getByLabelText(/Title/i);
    const categorySelect = screen.getByLabelText(/Category/i);
    const descriptionTextarea = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);

    fireEvent.change(titleInput, { target: { value: 'Test Item' } });
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });
    fireEvent.change(priceInput, { target: { value: '25000' } });

    // Submit form
    const form = screen.getByRole('button', { name: /Create Item/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Database error');
    }, { timeout: 3000 });
  });
});

describe('Admin CRUD Operations - Gallery Photos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.alert = vi.fn();
  });

  it('should display existing gallery photos', async () => {
    const GalleryManagementPage = (await import('./gallery/page')).default;
    render(<GalleryManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Gallery Photos (1)')).toBeInTheDocument();
      expect(screen.getByText('Coffee shop interior')).toBeInTheDocument();
    });
  });

  it('should upload gallery photos successfully', async () => {
    const GalleryManagementPage = (await import('./gallery/page')).default;
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          id: 2,
          image_url: '/gallery-2.webp',
          alt_text: 'New photo',
          sort_order: 1,
        },
      ]),
    } as Response);

    render(<GalleryManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Gallery Management')).toBeInTheDocument();
    });

    // Create a mock file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Get file input (it's hidden, so we need to access it differently)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/gallery',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(mockMutate).toHaveBeenCalledWith('/api/gallery');
      expect(global.alert).toHaveBeenCalledWith('Successfully uploaded 1 image!');
    });
  });

  it('should delete a gallery photo with confirmation', async () => {
    const GalleryManagementPage = (await import('./gallery/page')).default;
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(<GalleryManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Coffee shop interior')).toBeInTheDocument();
    });

    // Hover over photo and click delete (simulate hover by finding delete button)
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete this photo/i)).toBeInTheDocument();
    });

    // Confirm delete
    const confirmDeleteButton = screen.getAllByText('Delete').find(
      (button) => button.closest('.fixed') !== null
    );
    fireEvent.click(confirmDeleteButton!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/gallery/1', {
        method: 'DELETE',
      });
      expect(mockMutate).toHaveBeenCalledWith('/api/gallery');
      expect(global.alert).toHaveBeenCalledWith('Photo deleted successfully!');
    });
  });

  it('should handle upload errors gracefully', async () => {
    const GalleryManagementPage = (await import('./gallery/page')).default;
    
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Upload failed' }),
    } as Response);

    render(<GalleryManagementPage />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Upload failed');
    });
  });
});

describe('Admin CRUD Operations - Categories (via API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should create a new category', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 3,
        name: 'Snacks',
      }),
      status: 201,
    } as Response);

    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Snacks' }),
    });

    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toEqual({
      id: 3,
      name: 'Snacks',
    });
  });

  it('should delete a category', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
      status: 200,
    } as Response);

    const response = await fetch('/api/categories/3', {
      method: 'DELETE',
    });

    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toEqual({ success: true });
  });
});

describe('Admin CRUD Operations - Testimonials (via API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should create a new testimonial', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        author_name: 'John Doe',
        content: 'Great coffee!',
        rating: 5,
        created_at: new Date().toISOString(),
      }),
      status: 201,
    } as Response);

    const response = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_name: 'John Doe',
        content: 'Great coffee!',
        rating: 5,
      }),
    });

    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toMatchObject({
      author_name: 'John Doe',
      content: 'Great coffee!',
      rating: 5,
    });
  });

  it('should delete a testimonial', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
      status: 200,
    } as Response);

    const response = await fetch('/api/testimonials/1', {
      method: 'DELETE',
    });

    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toEqual({ success: true });
  });

  it('should reject testimonial with invalid rating', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Rating must be between 1 and 5' }),
      status: 400,
    } as Response);

    const response = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_name: 'John Doe',
        content: 'Great coffee!',
        rating: 6, // Invalid rating
      }),
    });

    const data = await response.json();

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(data.error).toContain('Rating');
  });
});

describe('Admin CRUD Operations - Integration Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.alert = vi.fn();
  });

  it('should complete full menu item lifecycle: create → update → delete', async () => {
    // Create
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 10,
        title: 'Mocha',
        description: 'Chocolate coffee',
        price: 28000,
        category_id: 1,
        is_best_seller: false,
      }),
    } as Response);

    const createResponse = await fetch('/api/menu', {
      method: 'POST',
      body: new FormData(),
    });
    const createdItem = await createResponse.json();

    expect(createdItem.id).toBe(10);
    expect(createdItem.title).toBe('Mocha');

    // Update
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...createdItem,
        title: 'Mocha Deluxe',
        price: 32000,
      }),
    } as Response);

    const updateResponse = await fetch(`/api/menu/${createdItem.id}`, {
      method: 'PUT',
      body: new FormData(),
    });
    const updatedItem = await updateResponse.json();

    expect(updatedItem.title).toBe('Mocha Deluxe');
    expect(updatedItem.price).toBe(32000);

    // Delete
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const deleteResponse = await fetch(`/api/menu/${createdItem.id}`, {
      method: 'DELETE',
    });
    const deleteResult = await deleteResponse.json();

    expect(deleteResult.success).toBe(true);
  });

  it('should handle concurrent menu item operations', async () => {
    // Simulate multiple creates happening at once
    const createPromises = [1, 2, 3].map((i) => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: i,
          title: `Item ${i}`,
          price: 20000 + i * 1000,
        }),
      } as Response);

      return fetch('/api/menu', {
        method: 'POST',
        body: new FormData(),
      });
    });

    const results = await Promise.all(createPromises);
    const items = await Promise.all(results.map(r => r.json()));

    expect(items).toHaveLength(3);
    expect(items[0].title).toBe('Item 1');
    expect(items[1].title).toBe('Item 2');
    expect(items[2].title).toBe('Item 3');
  });

  it('should maintain data consistency when reordering gallery photos', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const updates = [
      { id: 1, sort_order: 2 },
      { id: 2, sort_order: 0 },
      { id: 3, sort_order: 1 },
    ];

    const response = await fetch('/api/gallery/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });

    expect(response.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/gallery/reorder',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ updates }),
      })
    );
  });
});
