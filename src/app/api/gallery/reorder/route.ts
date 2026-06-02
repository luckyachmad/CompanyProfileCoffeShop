import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';

/**
 * Gallery Reorder API Route Handler
 * 
 * PATCH /api/gallery/reorder - Admin-only endpoint to update sort_order for multiple photos
 * 
 * Used for drag-and-drop reordering in the gallery management interface.
 * Requirements: 10.6
 */

interface ReorderUpdate {
  id: number;
  sort_order: number;
}

/**
 * PATCH /api/gallery/reorder
 * Admin-only endpoint - requires valid NextAuth session
 * Updates sort_order for multiple gallery photos in a single transaction
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin session required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { updates } = body as { updates: ReorderUpdate[] };

    // Validate updates array
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request - updates array is required' },
        { status: 400 }
      );
    }

    // Validate each update object
    for (const update of updates) {
      if (typeof update.id !== 'number' || typeof update.sort_order !== 'number') {
        return NextResponse.json(
          { error: 'Invalid update format - id and sort_order must be numbers' },
          { status: 400 }
        );
      }
    }

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update each photo's sort_order
      for (const update of updates) {
        await client.query(
          'UPDATE gallery_photos SET sort_order = $1 WHERE id = $2',
          [update.sort_order, update.id]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json(
        { success: true, message: 'Sort order updated successfully' },
        { status: 200 }
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating gallery sort order:', error);
    return NextResponse.json(
      { error: 'Failed to update sort order' },
      { status: 500 }
    );
  }
}
