import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, DELETE } from './route';
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

import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';

describe('GET /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all categories ordered by name', async () => {
    const mockCategories = [
      { id: 1, name: 'Coffee' },
      { id: 3, name: 'Light Bites' },
      { id: 2, name: 'Non-Coffee' },
    ];

    vi.mocked(pool.query).mockResolvedValue({
      rows: mockCategories,
      command: 'SELECT',
      rowCount: 3,
      oid: 0,
      fields: [],
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({ id: 1, name: 'Coffee' });
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT id, name FROM categories ORDER BY name ASC'
    );
  });

  it('should return empty array when no categories exist', async () => {
    vi.mocked(pool.query).mockResolvedValue({
      rows: [],
      command: 'SELECT',
      rowCount: 0,
      oid: 0,
      fields: [],
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should return 500 on database error', async () => {
    vi.mocked(pool.query).mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch categories' });
  });
});

describe('POST /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Category' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Admin session required' });
  });

  it('should create a new category successfully', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const mockCreatedCategory = {
      id: 4,
      name: 'Desserts',
    };

    vi.mocked(pool.query).mockResolvedValue({
      rows: [mockCreatedCategory],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: 'Desserts' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toMatchObject({ id: 4, name: 'Desserts' });
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      ['Desserts']
    );
  });

  it('should trim whitespace from category name', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const mockCreatedCategory = {
      id: 5,
      name: 'Smoothies',
    };

    vi.mocked(pool.query).mockResolvedValue({
      rows: [mockCreatedCategory],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: '  Smoothies  ' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      ['Smoothies']
    );
  });

  it('should return 400 if name is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required field');
  });

  it('should return 400 if name is empty string', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: '   ' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required field');
  });

  it('should return 400 if name exceeds 100 characters', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const longName = 'A'.repeat(101);

    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: longName }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('100 characters or less');
  });

  it('should return 409 if category name already exists', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const duplicateError = new Error('Duplicate key') as any;
    duplicateError.code = '23505'; // PostgreSQL unique violation

    vi.mocked(pool.query).mockRejectedValue(duplicateError);

    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: 'Coffee' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toEqual({ error: 'Category name already exists' });
  });

  it('should return 500 on other database errors', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Category' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to create category' });
  });
});

describe('DELETE /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/categories?id=1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Admin session required' });
  });

  it('should delete category successfully', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockResolvedValue({
      rows: [{ id: 1 }],
      command: 'DELETE',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/categories?id=1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, message: 'Category deleted successfully' });
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [1]
    );
  });

  it('should return 400 if id parameter is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Missing required parameter: id' });
  });

  it('should return 400 if id is not a valid integer', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/categories?id=abc', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid id');
  });

  it('should return 400 if id is negative', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/categories?id=-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid id');
  });

  it('should return 404 if category not found', async () => {
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

    const request = new NextRequest('http://localhost:3000/api/categories?id=999', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Category not found' });
  });

  it('should return 500 on database error', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/categories?id=1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to delete category' });
  });
});
