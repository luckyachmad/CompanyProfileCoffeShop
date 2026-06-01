import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';
import type { Category } from '@/types/menu';

/**
 * Categories API Route Handler
 * 
 * GET /api/categories - Public endpoint to fetch all categories
 * POST /api/categories - Admin-only endpoint to create a new category
 * DELETE /api/categories - Admin-only endpoint to delete a category by ID
 * 
 * Requirements: 12.7
 */

/**
 * GET /api/categories
 * Public endpoint - no authentication required
 * Returns all categories ordered by name ascending
 */
export async function GET() {
  try {
    // Parameterized query to fetch all categories ordered by name
    const result = await pool.query<Category>(
      'SELECT id, name FROM categories ORDER BY name ASC'
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Admin-only endpoint - requires valid NextAuth session
 * Creates a new category with unique name constraint
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
    const { name } = body;

    // Validate required field
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: name must be a non-empty string' },
        { status: 400 }
      );
    }

    // Trim and validate name length
    const trimmedName = name.trim();
    if (trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'Invalid name: must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Insert category into database using parameterized query
    try {
      const result = await pool.query<Category>(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [trimmedName]
      );

      const newCategory = result.rows[0];

      return NextResponse.json(newCategory, { status: 201 });
    } catch (dbError: any) {
      // Handle unique constraint violation (duplicate category name)
      if (dbError.code === '23505') { // PostgreSQL unique violation error code
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 409 }
        );
      }
      throw dbError; // Re-throw other database errors
    }
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories
 * Admin-only endpoint - requires valid NextAuth session
 * Deletes a category by ID (passed as query parameter)
 * Note: Foreign key constraint ON DELETE SET NULL handles orphaned menu items
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

    // Extract category ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    const categoryId = parseInt(id);
    if (isNaN(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { error: 'Invalid id: must be a positive integer' },
        { status: 400 }
      );
    }

    // Delete category from database using parameterized query
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [categoryId]
    );

    // Check if category was found and deleted
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
