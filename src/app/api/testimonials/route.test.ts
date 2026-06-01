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

describe('GET /api/testimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all testimonials ordered by created_at DESC', async () => {
    const mockTestimonials = [
      {
        id: 3,
        author_name: 'Alice Johnson',
        content: 'Amazing coffee!',
        rating: 5,
        created_at: new Date('2024-01-03'),
      },
      {
        id: 2,
        author_name: 'Bob Smith',
        content: 'Great atmosphere',
        rating: 4,
        created_at: new Date('2024-01-02'),
      },
      {
        id: 1,
        author_name: 'Charlie Brown',
        content: 'Good service',
        rating: 5,
        created_at: new Date('2024-01-01'),
      },
    ];

    vi.mocked(pool.query).mockResolvedValue({
      rows: mockTestimonials,
      command: 'SELECT',
      rowCount: 3,
      oid: 0,
      fields: [],
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({ id: 3, author_name: 'Alice Johnson' });
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT id, author_name, content, rating, created_at FROM testimonials ORDER BY created_at DESC'
    );
  });

  it('should return empty array when no testimonials exist', async () => {
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
    expect(data).toEqual({ error: 'Failed to fetch testimonials' });
  });
});

describe('POST /api/testimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: 'John Doe',
        content: 'Great coffee!',
        rating: 5,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Admin session required' });
  });

  it('should create a new testimonial successfully', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const mockCreatedTestimonial = {
      id: 1,
      author_name: 'John Doe',
      content: 'Great coffee!',
      rating: 5,
      created_at: new Date('2024-01-15'),
    };

    vi.mocked(pool.query).mockResolvedValue({
      rows: [mockCreatedTestimonial],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: 'John Doe',
        content: 'Great coffee!',
        rating: 5,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toMatchObject({
      id: 1,
      author_name: 'John Doe',
      content: 'Great coffee!',
      rating: 5,
    });
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO testimonials (author_name, content, rating) VALUES ($1, $2, $3) RETURNING *',
      ['John Doe', 'Great coffee!', 5]
    );
  });

  it('should trim whitespace from author_name and content', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const mockCreatedTestimonial = {
      id: 2,
      author_name: 'Jane Smith',
      content: 'Excellent service',
      rating: 4,
      created_at: new Date('2024-01-16'),
    };

    vi.mocked(pool.query).mockResolvedValue({
      rows: [mockCreatedTestimonial],
      command: 'INSERT',
      rowCount: 1,
      oid: 0,
      fields: [],
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: '  Jane Smith  ',
        content: '  Excellent service  ',
        rating: 4,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO testimonials (author_name, content, rating) VALUES ($1, $2, $3) RETURNING *',
      ['Jane Smith', 'Excellent service', 4]
    );
  });

  it('should return 400 if author_name is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Great coffee!',
        rating: 5,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('author_name must be a non-empty string');
  });

  it('should return 400 if author_name is empty string', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: '   ',
        content: 'Great coffee!',
        rating: 5,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('author_name must be a non-empty string');
  });

  it('should return 400 if author_name exceeds 255 characters', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const longName = 'A'.repeat(256);

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: longName,
        content: 'Great coffee!',
        rating: 5,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('255 characters or less');
  });

  it('should return 400 if content is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: 'John Doe',
        rating: 5,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('content must be a non-empty string');
  });

  it('should return 400 if content is empty string', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: 'John Doe',
        content: '   ',
        rating: 5,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('content must be a non-empty string');
  });

  it('should return 400 if rating is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: 'John Doe',
        content: 'Great coffee!',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required field: rating');
  });

  it('should return 400 if rating is not an integer', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: 'John Doe',
        content: 'Great coffee!',
        rating: 4.5,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('must be an integer between 1 and 5');
  });

  it('should return 400 if rating is less than 1', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: 'John Doe',
        content: 'Great coffee!',
        rating: 0,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('must be an integer between 1 and 5');
  });

  it('should return 400 if rating is greater than 5', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: 'John Doe',
        content: 'Great coffee!',
        rating: 6,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('must be an integer between 1 and 5');
  });

  it('should accept valid ratings from 1 to 5', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    for (let rating = 1; rating <= 5; rating++) {
      const mockCreatedTestimonial = {
        id: rating,
        author_name: 'Test User',
        content: 'Test content',
        rating,
        created_at: new Date(),
      };

      vi.mocked(pool.query).mockResolvedValue({
        rows: [mockCreatedTestimonial],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const request = new NextRequest('http://localhost:3000/api/testimonials', {
        method: 'POST',
        body: JSON.stringify({
          author_name: 'Test User',
          content: 'Test content',
          rating,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    }
  });

  it('should return 500 on database error', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        author_name: 'John Doe',
        content: 'Great coffee!',
        rating: 5,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to create testimonial' });
  });
});

describe('DELETE /api/testimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/testimonials?id=1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Admin session required' });
  });

  it('should delete testimonial successfully', async () => {
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

    const request = new NextRequest('http://localhost:3000/api/testimonials?id=1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, message: 'Testimonial deleted successfully' });
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM testimonials WHERE id = $1 RETURNING id',
      [1]
    );
  });

  it('should return 400 if id parameter is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials', {
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

    const request = new NextRequest('http://localhost:3000/api/testimonials?id=abc', {
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

    const request = new NextRequest('http://localhost:3000/api/testimonials?id=-1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid id');
  });

  it('should return 400 if id is zero', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    const request = new NextRequest('http://localhost:3000/api/testimonials?id=0', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid id');
  });

  it('should return 404 if testimonial not found', async () => {
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

    const request = new NextRequest('http://localhost:3000/api/testimonials?id=999', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Testimonial not found' });
  });

  it('should return 500 on database error', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'admin@example.com' },
      expires: '2024-12-31',
    });

    vi.mocked(pool.query).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/testimonials?id=1', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to delete testimonial' });
  });
});
