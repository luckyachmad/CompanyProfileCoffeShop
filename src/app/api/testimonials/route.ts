import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';
import type { Testimonial } from '@/types/testimonial';

/**
 * Testimonials API Route Handler
 * 
 * GET /api/testimonials - Public endpoint to fetch all testimonials
 * POST /api/testimonials - Admin-only endpoint to create a new testimonial
 * DELETE /api/testimonials - Admin-only endpoint to delete a testimonial by ID
 * 
 * Requirements: 12.6
 */

/**
 * GET /api/testimonials
 * Public endpoint - no authentication required
 * Returns all testimonials ordered by created_at descending (newest first)
 */
export async function GET() {
  try {
    // Parameterized query to fetch all testimonials ordered by created_at DESC
    const result = await pool.query<Testimonial>(
      'SELECT id, author_name, content, rating, created_at FROM testimonials ORDER BY created_at DESC'
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/testimonials
 * Admin-only endpoint - requires valid NextAuth session
 * Creates a new testimonial with rating constraint validation (1-5)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin session required' },
        { status: 401 }
      );
    }

    // Parse JSON body
    const body = await request.json();
    const { author_name, content, rating } = body;

    // Validate required fields
    if (!author_name || typeof author_name !== 'string' || author_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: author_name must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: content must be a non-empty string' },
        { status: 400 }
      );
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { error: 'Missing required field: rating' },
        { status: 400 }
      );
    }

    // Validate author_name length
    const trimmedAuthorName = author_name.trim();
    if (trimmedAuthorName.length > 255) {
      return NextResponse.json(
        { error: 'Invalid author_name: must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Validate rating constraint (must be integer between 1 and 5)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating: must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    // Insert testimonial into database using parameterized query
    const result = await pool.query<Testimonial>(
      'INSERT INTO testimonials (author_name, content, rating) VALUES ($1, $2, $3) RETURNING *',
      [trimmedAuthorName, trimmedContent, rating]
    );

    const newTestimonial = result.rows[0];

    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/testimonials
 * Admin-only endpoint - requires valid NextAuth session
 * Deletes a testimonial by ID (passed as query parameter)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin session required' },
        { status: 401 }
      );
    }

    // Extract testimonial ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    const testimonialId = parseInt(id);
    if (isNaN(testimonialId) || testimonialId <= 0) {
      return NextResponse.json(
        { error: 'Invalid id: must be a positive integer' },
        { status: 400 }
      );
    }

    // Delete testimonial from database using parameterized query
    const result = await pool.query(
      'DELETE FROM testimonials WHERE id = $1 RETURNING id',
      [testimonialId]
    );

    // Check if testimonial was found and deleted
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Testimonial deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
