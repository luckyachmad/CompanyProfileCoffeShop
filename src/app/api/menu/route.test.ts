import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/storage', () => ({
  getStorageAdapter: vi.fn(() => ({
    upload: vi.fn().mockResolvedValue('https://example.com/menu-123.webp'),
    delete: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    webp: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('webp-data')),
  })),
}));

import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';

describe('GET /api/menu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all menu items with category names', async () => {
    const mockMenuItems = [
      {
        id: 1,
        category_id: 1,
        title: 'Espresso',
        description: 'Strong coffee',
        price: 3.50,
        image_url: 'https://example.com/espresso.webp',
        is_best_seller: true,
        created_at: new Date(),
        updated_at: new Date(),
        category_name: 'Coffee',
      },
      {
        id: 2,
        category_id: 2,
        title: 'Lemonade',
        description: 'Fresh lemonade',
        price: 2.50,
        image_url: 'https://example.com/lemonade.webp',
        is_best_seller: false,
        created_at: new Date(),
        updated_at: new Date(),
        category_name: 'Non-Coffee',
      },
    ];

    vi.mocked(pool.query).mockResolvedValue({
      rows: mockMenuItems,
      command: 'SELECT',
      rowCount: 2,
      oid: 0,
      fields: [],
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({
      id: 1,
      title: 'Espresso',
      category_name: 'Coffee',
      price: 3.50,
      is_best_seller: true,
    });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT')
    );
  });

  it('should return 500 on database error', async () => {
    vi.mocked(pool.query).mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch menu items' });
  });
});

describe('POST /api/menu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('title', 'New Item');
    formData.append('price', '5.00');

    const request = new NextRequest('http://localhost:3000/api/menu', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Admin session required' });
  });

  it('should create menu item without image', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const mockCreatedItem = {
      id: 3,
      category_id: 1,
      title: 'New Coffee',
      description: 'Delicious coffee',
      price: 4.50,
      image_url: null,
      is_best_seller: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(pool.query).mockResolvedValue({
      rows: [mockCreatedItem],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const formData = new FormData();
    formData.append('title', 'New Coffee');
    formData.append('category_id', '1');
    formData.append('description', 'Delicious coffee');
    formData.append('price', '4.50');
    formData.append('is_best_seller', 'false');

    const request = new NextRequest('http://localhost:3000/api/menu', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toMatchObject({
      id: 3,
      title: 'New Coffee',
      description: 'Delicious coffee',
      price: 4.50,
      is_best_seller: false,
    });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO menu_items'),
      expect.arrayContaining([1, 'New Coffee', 'Delicious coffee', 4.50, null, false])
    );
  });

  it('should return 400 if required fields are missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const formData = new FormData();
    formData.append('title', 'New Item');
    // Missing price

    const request = new NextRequest('http://localhost:3000/api/menu', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });

  it('should return 400 if price is invalid', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const formData = new FormData();
    formData.append('title', 'New Item');
    formData.append('price', '-5.00');

    const request = new NextRequest('http://localhost:3000/api/menu', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid price');
  });
});
