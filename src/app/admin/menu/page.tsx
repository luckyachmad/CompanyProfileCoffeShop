'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import Image from 'next/image';
import type { MenuItemWithCategory, Category } from '@/types/menu';

/**
 * Menu Management Page Component
 * 
 * Client Component providing full CRUD interface for menu items including:
 * - SWR data fetching for menu items and categories
 * - Form modal for create/edit with all fields
 * - Client-side validation (required fields, price > 0)
 * - Delete confirmation dialog
 * - Image preview and upload handling
 * 
 * Requirements: 10.2, 10.3, 10.4, 10.7, 10.8, 10.9
 * 
 * Design tokens: bg-surface, bg-background, bg-primary, text-primary, border-border
 */

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface FormData {
  title: string;
  category_id: string;
  description: string;
  price: string;
  is_best_seller: boolean;
  image: File | null;
}

interface FormErrors {
  title?: string;
  category_id?: string;
  price?: string;
  description?: string;
}

export default function MenuManagementPage() {
  // SWR data fetching
  const { data: menuItems = [], error: menuError, isLoading: menuLoading } = useSWR<MenuItemWithCategory[]>(
    '/api/menu',
    fetcher,
    { revalidateOnFocus: false }
  );
  
  const { data: categories = [], error: categoriesError } = useSWR<Category[]>(
    '/api/categories',
    fetcher,
    { revalidateOnFocus: false }
  );

  // State management
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemWithCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category_id: '',
    description: '',
    price: '',
    is_best_seller: false,
    image: null,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isFormOpen) {
      setFormData({
        title: '',
        category_id: '',
        description: '',
        price: '',
        is_best_seller: false,
        image: null,
      });
      setFormErrors({});
      setImagePreview(null);
      setSelectedItem(null);
    }
  }, [isFormOpen]);

  // Populate form when editing
  useEffect(() => {
    if (selectedItem && isFormOpen) {
      setFormData({
        title: selectedItem.title,
        category_id: selectedItem.category_id?.toString() || '',
        description: selectedItem.description || '',
        price: selectedItem.price.toString(),
        is_best_seller: selectedItem.is_best_seller,
        image: null,
      });
      setImagePreview(selectedItem.image_url);
    }
  }, [selectedItem, isFormOpen]);

  // Handle form field changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.category_id) {
      errors.category_id = 'Category is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('is_best_seller', formData.is_best_seller.toString());
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = selectedItem
        ? `/api/menu/${selectedItem.id}`
        : '/api/menu';
      
      const method = selectedItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save menu item');
      }

      // Revalidate SWR cache
      await mutate('/api/menu');

      // Close modal
      setIsFormOpen(false);
      
      // Show success message (you can replace with a toast notification)
      alert(selectedItem ? 'Menu item updated successfully!' : 'Menu item created successfully!');
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert(error instanceof Error ? error.message : 'Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/menu/${selectedItem.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete menu item');
      }

      // Revalidate SWR cache
      await mutate('/api/menu');

      // Close dialog
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      
      alert('Menu item deleted successfully!');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  // Open edit modal
  const openEditModal = (item: MenuItemWithCategory) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (item: MenuItemWithCategory) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  // Loading state
  if (menuLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-text-primary font-body">Loading menu items...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (menuError || categoriesError) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <p className="text-red-600 font-body">
          Error loading menu data. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">
            Menu Management
          </h1>
          <p className="mt-2 text-text-muted font-body">
            Create, edit, and manage your coffee shop menu items
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-6 py-3 rounded-lg font-body font-medium transition-all duration-300 ease-in-out hover:bg-primary-hover hover:shadow-md hover:scale-[1.03] active:scale-[0.98]"
        >
          + Add New Item
        </button>
      </div>

      {/* Menu Items Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {menuItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-muted font-body text-lg">
              No menu items yet. Click "Add New Item" to create your first menu item.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-body font-semibold text-text-primary">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-body font-semibold text-text-primary">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-body font-semibold text-text-primary">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-body font-semibold text-text-primary">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-body font-semibold text-text-primary">
                    Best Seller
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-body font-semibold text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-background transition-colors duration-200">
                    <td className="px-6 py-4">
                      {item.image_url ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center text-text-muted">
                          <span className="text-2xl">🖼️</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-body font-medium text-text-primary">
                        {item.title}
                      </p>
                      <p className="text-sm text-text-muted font-body line-clamp-1">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-background text-text-primary text-sm font-body font-medium rounded-full">
                        {item.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-body font-medium text-text-primary">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {item.is_best_seller && (
                        <span className="inline-block px-3 py-1 bg-secondary text-white text-xs font-body font-medium rounded-full">
                          Best Seller
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-4 py-2 text-sm font-body font-medium text-primary border border-primary rounded-lg transition-all duration-300 ease-in-out hover:bg-primary hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteDialog(item)}
                          className="px-4 py-2 text-sm font-body font-medium text-red-600 border border-red-600 rounded-lg transition-all duration-300 ease-in-out hover:bg-red-600 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-heading font-bold text-primary">
                {selectedItem ? 'Edit Menu Item' : 'Create Menu Item'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors duration-200"
                disabled={isSubmitting}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-body font-medium text-text-primary mb-2">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg font-body transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.title ? 'border-red-600' : 'border-border'
                  }`}
                  placeholder="e.g., Cappuccino"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600 font-body">{formErrors.title}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-body font-medium text-text-primary mb-2">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg font-body transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.category_id ? 'border-red-600' : 'border-border'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formErrors.category_id && (
                  <p className="mt-1 text-sm text-red-600 font-body">{formErrors.category_id}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-body font-medium text-text-primary mb-2">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg font-body transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.description ? 'border-red-600' : 'border-border'
                  }`}
                  placeholder="Brief description of the menu item"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600 font-body">{formErrors.description}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-body font-medium text-text-primary mb-2">
                  Price (Rp) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg font-body transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.price ? 'border-red-600' : 'border-border'
                  }`}
                  placeholder="25000"
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-600 font-body">{formErrors.price}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="image" className="block text-sm font-body font-medium text-text-primary mb-2">
                  Image
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg font-body font-medium text-text-muted hover:border-primary hover:text-primary transition-all duration-300 ease-in-out"
                  >
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>
              </div>

              {/* Best Seller Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_best_seller"
                  name="is_best_seller"
                  checked={formData.is_best_seller}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                />
                <label htmlFor="is_best_seller" className="text-sm font-body font-medium text-text-primary">
                  Mark as Best Seller
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-border rounded-lg font-body font-medium text-text-primary hover:bg-background transition-all duration-300 ease-in-out disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-white rounded-lg font-body font-medium transition-all duration-300 ease-in-out hover:bg-primary-hover hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : selectedItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-heading font-bold text-text-primary mb-4">
              Confirm Delete
            </h3>
            <p className="text-text-muted font-body mb-6">
              Are you sure you want to delete <strong>{selectedItem.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedItem(null);
                }}
                disabled={isSubmitting}
                className="px-6 py-2 border border-border rounded-lg font-body font-medium text-text-primary hover:bg-background transition-all duration-300 ease-in-out disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-body font-medium transition-all duration-300 ease-in-out hover:bg-red-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
