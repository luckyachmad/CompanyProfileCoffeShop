import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';
import { getStorageAdapter } from '@/lib/storage';

/**
 * Gallery Photo API Route Handler
 * 
 * DELETE /api/gallery/[id] - Admin-only endpoint to delete a gallery photo
 * 
 * Requirements: 12.5
 */

/**
 * DELETE /api/gallery/[id]
 * Admin-only endpoint - requires valid NextAuth session
 * Deletes a gallery photo and its associated image from storage
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin session required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId)) {
      return NextResponse.json(
        { error: 'Invalid photo ID' },
        { status: 400 }
      );
    }

    // Delete gallery photo and return image_url for cleanup
    const result = await pool.query<{ image_url: string }>(
      'DELETE FROM gallery_photos WHERE id = $1 RETURNING image_url',
      [photoId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Gallery photo not found' },
        { status: 404 }
      );
    }

    // Delete associated image from storage if it exists
    const imageUrl = result.rows[0].image_url;
    if (imageUrl) {
      try {
        const storageAdapter = getStorageAdapter();
        await storageAdapter.delete(imageUrl);
      } catch (deleteError) {
        console.error('Error deleting image from storage:', deleteError);
        // Continue even if storage delete fails - DB record is already deleted
      }
    }

    return NextResponse.json(
      { success: true, message: 'Gallery photo deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting gallery photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery photo' },
      { status: 500 }
    );
  }
}
