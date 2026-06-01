import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pool } from '@/lib/db';
import { getStorageAdapter } from '@/lib/storage';
import sharp from 'sharp';
import type { MenuItem } from '@/types/menu';

/**
 * Menu Item API Route Handler
 * 
 * PUT /api/menu/[id] - Admin-only endpoint to update a menu item
 * DELETE /api/menu/[id] - Admin-only endpoint to delete a menu item
 * 
 * Requirements: 12.2, 12.3, 12.9
 */

/**
 * PUT /api/menu/[id]
 * Admin-only endpoint - requires valid NextAuth session
 * Updates an existing menu item, optionally with new image upload
 */
export async function PUT(
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
    const menuItemId = parseInt(id);

    if (isNaN(menuItemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' },
        { status: 400 }
      );
    }

    // Check if menu item exists
    const existingItem = await pool.query<MenuItem>(
      'SELECT * FROM menu_items WHERE id = $1',
      [menuItemId]
    );

    if (existingItem.rows.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    const title = formData.get('title') as string | null;
    const categoryId = formData.get('category_id') as string | null;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') as string | null;
    const isBestSeller = formData.get('is_best_seller');
    const imageFile = formData.get('image') as File | null;

    // Use existing values if not provided
    const currentItem = existingItem.rows[0];
    const updatedTitle = title || currentItem.title;
    const updatedCategoryId = categoryId !== null ? (categoryId ? parseInt(categoryId) : null) : currentItem.category_id;
    const updatedDescription = description !== undefined ? description : currentItem.description;
    const updatedIsBestSeller = isBestSeller !== null ? isBestSeller === 'true' : currentItem.is_best_seller;

    // Validate and parse price
    let updatedPrice = currentItem.price;
    if (price !== null) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json(
          { error: 'Invalid price: must be a non-negative number' },
          { status: 400 }
        );
      }
      updatedPrice = priceNum;
    }

    // Handle image upload if new image provided
    let imageUrl = currentItem.image_url;
    
    if (imageFile && imageFile.size > 0) {
      try {
        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert image to WebP format using Sharp
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 85, lossless: false })
          .toBuffer();

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `menu-${timestamp}.webp`;

        // Upload to storage adapter
        const storageAdapter = getStorageAdapter();
        imageUrl = await storageAdapter.upload(
          webpBuffer,
          filename,
          'image/webp'
        );

        // Delete old image if it exists
        if (currentItem.image_url) {
          try {
            await storageAdapter.delete(currentItem.image_url);
          } catch (deleteError) {
            console.error('Error deleting old image:', deleteError);
            // Continue even if delete fails
          }
        }
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        return NextResponse.json(
          { error: 'Failed to process image upload' },
          { status: 500 }
        );
      }
    }

    // Update menu item in database using parameterized query
    const result = await pool.query<MenuItem>(
      `UPDATE menu_items 
      SET 
        category_id = $1,
        title = $2,
        description = $3,
        price = $4,
        image_url = $5,
        is_best_seller = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *`,
      [
        updatedCategoryId,
        updatedTitle,
        updatedDescription,
        updatedPrice,
        imageUrl,
        updatedIsBestSeller,
        menuItemId
      ]
    );

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/menu/[id]
 * Admin-only endpoint - requires valid NextAuth session
 * Deletes a menu item and its associated image from storage
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
    const menuItemId = parseInt(id);

    if (isNaN(menuItemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' },
        { status: 400 }
      );
    }

    // Delete menu item and return image_url for cleanup
    const result = await pool.query<{ image_url: string | null }>(
      'DELETE FROM menu_items WHERE id = $1 RETURNING image_url',
      [menuItemId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
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
      { success: true, message: 'Menu item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}
