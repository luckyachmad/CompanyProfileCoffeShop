import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT, DELETE } from './route';
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
    upload: vi.fn().mockResolvedValue('https://example.com/menu-456.webp'),
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

describe('PUT /api/menu/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('title', 'Updated Item');

    const request = new NextRequest('http://localhost:3000/api/menu/1', {
      method: 'PUT',
      body: formData,
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Admin session required' });
  });

  it('should return 400 for invalid ID', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const formData = new FormData();
    const request = new NextRequest('http://localhost:3000/api/menu/invalid', {
      method: 'PUT',
      body: formData,
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'invalid' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid menu item ID' });
  });

  it('should return 404 if menu item not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockResolvedValue({
      rows: [],
      command: 'SELECT',
      rowCount: 0,
      oid: 0,
      fields: [],
    });

    const formData = new FormData();
    const request = new NextRequest('http://localhost:3000/api/menu/999', {
      method: 'PUT',
      body: formData,
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Menu item not found' });
  });

  it('should update menu item successfully', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const existingItem = {
      id: 1,
      category_id: 1,
      title: 'Old Title',
      description: 'Old description',
      price: 3.50,
      image_url: 'https://example.com/old.webp',
      is_best_seller: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedItem = {
      ...existingItem,
      title: 'Updated Title',
      price: 4.00,
      updated_at: new Date(),
    };

    vi.mocked(pool.query)
      .mockResolvedValueOnce({
        rows: [existingItem],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      })
      .mockResolvedValueOnce({
        rows: [updatedItem],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

    const formData = new FormData();
    formData.append('title', 'Updated Title');
    formData.append('price', '4.00');

    const request = new NextRequest('http://localhost:3000/api/menu/1', {
      method: 'PUT',
      body: formData,
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('Updated Title');
    expect(data.price).toBe(4.00);
  });

  it('should return 400 for invalid price', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const existingItem = {
      id: 1,
      category_id: 1,
      title: 'Item',
      description: 'Description',
      price: 3.50,
      image_url: null,
      is_best_seller: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    vi.mocked(pool.query).mockResolvedValue({
      rows: [existingItem],
      command: 'SELECT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const formData = new FormData();
    formData.append('price', '-10.00');

    const request = new NextRequest('http://localhost:3000/api/menu/1', {
      method: 'PUT',
      body: formData,
    });

    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid price');
  });
});

describe('DELETE /api/menu/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/menu/1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Admin session required' });
  });

  it('should return 400 for invalid ID', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/menu/invalid', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'invalid' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid menu item ID' });
  });

  it('should return 404 if menu item not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockResolvedValue({
      rows: [],
      command: 'DELETE',
      rowCount: 0,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/menu/999', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Menu item not found' });
  });

  it('should delete menu item successfully', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ image_url: 'https://example.com/menu-123.webp' }],
      command: 'DELETE',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/menu/1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, message: 'Menu item deleted successfully' });
  });

  it('should delete menu item without image', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ image_url: null }],
      command: 'DELETE',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/menu/1', {
      method: 'DELETE',
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, message: 'Menu item deleted successfully' });
  });
});
