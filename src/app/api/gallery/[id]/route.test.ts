import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from './route';
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
    delete: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { getStorageAdapter } from '@/lib/storage';

describe('DELETE /api/gallery/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session exists', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/gallery/1', {
      method: 'DELETE'
    });
    const params = Promise.resolve({ id: '1' });

    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Admin session required' });
  });

  it('should return 400 if photo ID is invalid', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/gallery/invalid', {
      method: 'DELETE'
    });
    const params = Promise.resolve({ id: 'invalid' });

    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid photo ID' });
  });

  it('should return 404 if photo does not exist', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockResolvedValue({
      rows: [],
      command: 'DELETE',
      rowCount: 0,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/gallery/999', {
      method: 'DELETE'
    });
    const params = Promise.resolve({ id: '999' });

    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Gallery photo not found' });
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM gallery_photos WHERE id = $1 RETURNING image_url',
      [999]
    );
  });

  it('should delete photo and associated image from storage', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ image_url: '/uploads/gallery-123.webp' }],
      command: 'DELETE',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/gallery/1', {
      method: 'DELETE'
    });
    const params = Promise.resolve({ id: '1' });

    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, message: 'Gallery photo deleted successfully' });
    
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM gallery_photos WHERE id = $1 RETURNING image_url',
      [1]
    );
    
    // Verify storage adapter was called
    expect(getStorageAdapter).toHaveBeenCalled();
  });

  it('should succeed even if storage deletion fails', async () => {
    // Create a new mock that will throw an error
    const mockDeleteFn = vi.fn().mockRejectedValue(new Error('Storage error'));
    vi.mocked(getStorageAdapter).mockReturnValue({
      delete: mockDeleteFn,
    } as any);

    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ image_url: '/uploads/gallery-123.webp' }],
      command: 'DELETE',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/gallery/1', {
      method: 'DELETE'
    });
    const params = Promise.resolve({ id: '1' });

    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, message: 'Gallery photo deleted successfully' });
    
    // Verify storage delete was attempted
    expect(mockDeleteFn).toHaveBeenCalledWith('/uploads/gallery-123.webp');
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/gallery/1', {
      method: 'DELETE'
    });
    const params = Promise.resolve({ id: '1' });

    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to delete gallery photo' });
  });

  it('should use parameterized query to prevent SQL injection', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ image_url: '/uploads/gallery-123.webp' }],
      command: 'DELETE',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/gallery/1', {
      method: 'DELETE'
    });
    const params = Promise.resolve({ id: '1' });

    await DELETE(request, { params });

    // Verify parameterized query was used
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM gallery_photos WHERE id = $1 RETURNING image_url',
      [1]
    );
  });
});
