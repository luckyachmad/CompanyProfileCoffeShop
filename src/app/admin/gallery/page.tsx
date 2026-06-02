'use client';

import { useState, useRef, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import Image from 'next/image';
import type { GalleryPhoto } from '@/types/gallery';

/**
 * Gallery Management Page Component
 * 
 * Client Component providing full gallery management interface including:
 * - SWR data fetching for gallery photos
 * - Drag-and-drop upload zone with multi-file support
 * - Delete confirmation dialog
 * - Drag-to-reorder for sort_order management
 * 
 * Requirements: 10.5, 10.6, 10.7, 10.9
 * 
 * Design tokens: bg-surface, bg-background, bg-primary, text-primary, border-border
 */

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function GalleryManagementPage() {
  // SWR data fetching
  const { data: photos = [], error, isLoading } = useSWR<GalleryPhoto[]>(
    '/api/gallery',
    fetcher,
    { revalidateOnFocus: false }
  );

  // State management
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [draggedPhotoId, setDraggedPhotoId] = useState<number | null>(null);
  const [dragOverPhotoId, setDragOverPhotoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(Array.from(files));
    }
    // Reset input value to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop file upload
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      handleUpload(files);
    } else {
      alert('Please drop only image files');
    }
  }, []);

  // Handle multi-file upload
  const handleUpload = async (files: File[]) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      
      // Collect alt texts as comma-separated string
      const altTexts: string[] = [];
      
      files.forEach((file) => {
        formData.append('images', file);
        // Use filename as alt text by default (without extension)
        const altText = file.name.replace(/\.[^/.]+$/, '');
        altTexts.push(altText);
      });
      
      // Add comma-separated alt texts
      if (altTexts.length > 0) {
        formData.append('alt_text', altTexts.join(','));
      }

      const response = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload images');
      }

      // Revalidate SWR cache
      await mutate('/api/gallery');
      
      alert(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedPhoto) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/gallery/${selectedPhoto.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete photo');
      }

      // Revalidate SWR cache
      await mutate('/api/gallery');

      // Close dialog
      setIsDeleteDialogOpen(false);
      setSelectedPhoto(null);
      
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete photo');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete dialog
  const openDeleteDialog = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo);
    setIsDeleteDialogOpen(true);
  };

  // Drag-to-reorder handlers
  const handlePhotoeDragStart = (e: React.DragEvent, photoId: number) => {
    setDraggedPhotoId(photoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePhotoDragOver = (e: React.DragEvent, photoId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPhotoId(photoId);
  };

  const handlePhotoDragEnd = () => {
    setDraggedPhotoId(null);
    setDragOverPhotoId(null);
  };

  const handlePhotoDrop = async (e: React.DragEvent, targetPhotoId: number) => {
    e.preventDefault();
    
    if (!draggedPhotoId || draggedPhotoId === targetPhotoId) {
      setDraggedPhotoId(null);
      setDragOverPhotoId(null);
      return;
    }

    try {
      // Find indexes
      const draggedIndex = photos.findIndex(p => p.id === draggedPhotoId);
      const targetIndex = photos.findIndex(p => p.id === targetPhotoId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      // Create new order
      const newPhotos = [...photos];
      const [draggedPhoto] = newPhotos.splice(draggedIndex, 1);
      newPhotos.splice(targetIndex, 0, draggedPhoto);

      // Update sort_order for all affected photos
      const updates = newPhotos.map((photo, index) => ({
        id: photo.id,
        sort_order: index,
      }));

      // Optimistically update UI
      mutate('/api/gallery', newPhotos, false);

      // Send update to server
      const response = await fetch('/api/gallery/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update sort order');
      }

      // Revalidate to get server state
      await mutate('/api/gallery');
    } catch (error) {
      console.error('Error reordering photos:', error);
      alert('Failed to reorder photos');
      // Revert optimistic update
      await mutate('/api/gallery');
    } finally {
      setDraggedPhotoId(null);
      setDragOverPhotoId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-text-primary font-body">Loading gallery...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <p className="text-red-600 font-body">
          Error loading gallery. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">
          Gallery Management
        </h1>
        <p className="mt-2 text-text-muted font-body">
          Upload and manage your coffee shop gallery photos
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-surface border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDraggingFile
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary'
        }`}
      >
        <div className="space-y-4">
          <div className="text-6xl">📸</div>
          <div>
            <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
              {isDraggingFile ? 'Drop images here' : 'Upload Photos'}
            </h3>
            <p className="text-text-muted font-body mb-4">
              Drag and drop images here, or click to select files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-6 py-3 bg-primary text-white rounded-lg font-body font-medium transition-all duration-300 ease-in-out hover:bg-primary-hover hover:shadow-md hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Select Files'}
            </button>
          </div>
          <p className="text-sm text-text-muted font-body">
            Supports: JPG, PNG, WebP • Multiple files allowed • Images will be converted to WebP
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-text-primary">
            Gallery Photos ({photos.length})
          </h2>
          {photos.length > 0 && (
            <p className="text-sm text-text-muted font-body">
              💡 Drag photos to reorder
            </p>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-text-muted font-body text-lg">
              No photos yet. Upload your first photo to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                draggable
                onDragStart={(e) => handlePhotoeDragStart(e, photo.id)}
                onDragOver={(e) => handlePhotoDragOver(e, photo.id)}
                onDragEnd={handlePhotoDragEnd}
                onDrop={(e) => handlePhotoDrop(e, photo.id)}
                className={`group relative bg-background border rounded-xl overflow-hidden transition-all duration-300 cursor-move ${
                  draggedPhotoId === photo.id
                    ? 'opacity-50 scale-95'
                    : dragOverPhotoId === photo.id
                    ? 'border-primary border-2 scale-105'
                    : 'border-border hover:border-primary hover:shadow-md'
                }`}
              >
                {/* Image */}
                <div className="relative aspect-square">
                  <Image
                    src={photo.image_url}
                    alt={photo.alt_text || 'Gallery photo'}
                    fill
                    className="object-cover"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => openDeleteDialog(photo)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-body font-medium transition-all duration-300 ease-in-out hover:bg-red-700 hover:shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-surface">
                  <p className="text-sm text-text-muted font-body truncate">
                    {photo.alt_text || 'No description'}
                  </p>
                  <p className="text-xs text-text-muted font-body mt-1">
                    Order: {photo.sort_order}
                  </p>
                </div>

                {/* Drag handle indicator */}
                <div className="absolute top-2 right-2 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-heading font-bold text-text-primary mb-4">
              Confirm Delete
            </h3>
            
            {/* Preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4 border border-border">
              <Image
                src={selectedPhoto.image_url}
                alt={selectedPhoto.alt_text || 'Photo to delete'}
                fill
                className="object-cover"
              />
            </div>

            <p className="text-text-muted font-body mb-6">
              Are you sure you want to delete this photo? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedPhoto(null);
                }}
                disabled={isDeleting}
                className="px-6 py-2 border border-border rounded-lg font-body font-medium text-text-primary hover:bg-background transition-all duration-300 ease-in-out disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-body font-medium transition-all duration-300 ease-in-out hover:bg-red-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
