import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from './route';
import { getServerSession } from 'next-auth';
import { pool } from '@/lib/db';
import { getStorageAdapter } from '@/lib/storage';
import sharp from 'sharp';

// Mock dependencies
vi.mock('next-auth');
vi.mock('@/lib/db');
vi.mock('@/lib/storage');
vi.mock('sharp');

describe('Gallery API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/gallery', () => {
    it('should return all gallery photos ordered by sort_order ascending', async () => {
      // Arrange
      const mockPhotos = [
        {
          id: 1,
          image_url: 'https://example.com/photo1.webp',
          alt_text: 'Coffee shop interior',
          sort_order: 0,
          created_at: new Date('2024-01-01')
        },
        {
          id: 2,
          image_url: 'https://example.com/photo2.webp',
          alt_text: 'Latte art',
          sort_order: 1,
          created_at: new Date('2024-01-02')
        }
      ];

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: mockPhotos,
        command: 'SELECT',
        rowCount: 2,
        oid: 0,
        fields: []
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].id).toBe(1);
      expect(data[0].sort_order).toBe(0);
      expect(data[1].id).toBe(2);
      expect(data[1].sort_order).toBe(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY sort_order ASC')
      );
    });

    it('should return empty array when no photos exist', async () => {
      // Arrange
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      });

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return 500 error when database query fails', async () => {
      // Arrange
      vi.mocked(pool.query).mockRejectedValueOnce(new Error('Database error'));

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch gallery photos' });
    });
  });

  describe('POST /api/gallery', () => {
    it('should return 401 when no session exists', async () => {
      // Arrange
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      const formData = new FormData();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('images', mockFile);

      const mockRequest = {
        formData: vi.fn().mockResolvedValueOnce(formData)
      } as any;

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized - Admin session required' });
    });

    it('should return 400 when no images are provided', async () => {
      // Arrange
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: '1', email: 'admin@test.com' }
      } as any);

      const formData = new FormData();
      const mockRequest = {
        formData: vi.fn().mockResolvedValueOnce(formData)
      } as any;

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'No images provided - at least one image is required' });
    });

    it('should upload single image with WebP conversion and auto-increment sort_order', async () => {
      // Arrange
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: '1', email: 'admin@test.com' }
      } as any);

      // Mock max sort_order query
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ max: 5 }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      // Mock insert query
      const mockPhoto = {
        id: 1,
        image_url: 'https://example.com/gallery-123.webp',
        alt_text: 'Test photo',
        sort_order: 6,
        created_at: new Date()
      };

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockPhoto],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      // Mock Sharp
      const mockWebpBuffer = Buffer.from('webp-data');
      const mockSharpInstance = {
        webp: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValueOnce(mockWebpBuffer)
      };
      vi.mocked(sharp).mockReturnValueOnce(mockSharpInstance as any);

      // Mock storage adapter
      const mockStorageAdapter = {
        upload: vi.fn().mockResolvedValueOnce('https://example.com/gallery-123.webp'),
        delete: vi.fn(),
        getPublicUrl: vi.fn()
      };
      vi.mocked(getStorageAdapter).mockReturnValueOnce(mockStorageAdapter);

      const formData = new FormData();
      const mockFile = new File(['test-image-data'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('images', mockFile);
      formData.append('alt_text', 'Test photo');

      const mockRequest = {
        formData: vi.fn().mockResolvedValueOnce(formData)
      } as any;

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(1);
      expect(data[0].image_url).toBe('https://example.com/gallery-123.webp');
      expect(data[0].alt_text).toBe('Test photo');
      expect(data[0].sort_order).toBe(6);
      expect(sharp).toHaveBeenCalled();
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 85, lossless: false });
      expect(mockStorageAdapter.upload).toHaveBeenCalledWith(
        mockWebpBuffer,
        expect.stringMatching(/^gallery-\d+-[a-z0-9]+\.webp$/),
        'image/webp'
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO gallery_photos'),
        ['https://example.com/gallery-123.webp', 'Test photo', 6]
      );
    });

    it('should upload multiple images with auto-incrementing sort_order', async () => {
      // Arrange
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: '1', email: 'admin@test.com' }
      } as any);

      // Mock max sort_order query
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ max: 2 }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      // Mock insert queries for two photos
      const mockPhoto1 = {
        id: 1,
        image_url: 'https://example.com/gallery-1.webp',
        alt_text: 'Photo 1',
        sort_order: 3,
        created_at: new Date()
      };

      const mockPhoto2 = {
        id: 2,
        image_url: 'https://example.com/gallery-2.webp',
        alt_text: 'Photo 2',
        sort_order: 4,
        created_at: new Date()
      };

      vi.mocked(pool.query)
        .mockResolvedValueOnce({
          rows: [mockPhoto1],
          command: 'INSERT',
          rowCount: 1,
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: [mockPhoto2],
          command: 'INSERT',
          rowCount: 1,
          oid: 0,
          fields: []
        });

      // Mock Sharp for both images
      const mockWebpBuffer = Buffer.from('webp-data');
      const mockSharpInstance = {
        webp: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(mockWebpBuffer)
      };
      vi.mocked(sharp).mockReturnValue(mockSharpInstance as any);

      // Mock storage adapter
      const mockStorageAdapter = {
        upload: vi.fn()
          .mockResolvedValueOnce('https://example.com/gallery-1.webp')
          .mockResolvedValueOnce('https://example.com/gallery-2.webp'),
        delete: vi.fn(),
        getPublicUrl: vi.fn()
      };
      vi.mocked(getStorageAdapter).mockReturnValueOnce(mockStorageAdapter);

      const formData = new FormData();
      const mockFile1 = new File(['image1'], 'test1.jpg', { type: 'image/jpeg' });
      const mockFile2 = new File(['image2'], 'test2.jpg', { type: 'image/jpeg' });
      formData.append('images', mockFile1);
      formData.append('images', mockFile2);
      formData.append('alt_text', 'Photo 1,Photo 2');

      const mockRequest = {
        formData: vi.fn().mockResolvedValueOnce(formData)
      } as any;

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toHaveLength(2);
      expect(data[0].id).toBe(1);
      expect(data[0].sort_order).toBe(3);
      expect(data[1].id).toBe(2);
      expect(data[1].sort_order).toBe(4);
      expect(mockStorageAdapter.upload).toHaveBeenCalledTimes(2);
      
      // Verify sort_order increments correctly
      const insertCalls = vi.mocked(pool.query).mock.calls.filter(
        call => call[0].includes('INSERT INTO gallery_photos')
      );
      expect(insertCalls[0][1]).toEqual(expect.arrayContaining([3])); // First photo: sort_order = 3
      expect(insertCalls[1][1]).toEqual(expect.arrayContaining([4])); // Second photo: sort_order = 4
    });

    it('should handle null max sort_order (empty table) and start from 0', async () => {
      // Arrange
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: '1', email: 'admin@test.com' }
      } as any);

      // Mock max sort_order query returning null (empty table)
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ max: null }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      // Mock insert query
      const mockPhoto = {
        id: 1,
        image_url: 'https://example.com/gallery-123.webp',
        alt_text: null,
        sort_order: 0,
        created_at: new Date()
      };

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [mockPhoto],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      // Mock Sharp
      const mockWebpBuffer = Buffer.from('webp-data');
      const mockSharpInstance = {
        webp: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValueOnce(mockWebpBuffer)
      };
      vi.mocked(sharp).mockReturnValueOnce(mockSharpInstance as any);

      // Mock storage adapter
      const mockStorageAdapter = {
        upload: vi.fn().mockResolvedValueOnce('https://example.com/gallery-123.webp'),
        delete: vi.fn(),
        getPublicUrl: vi.fn()
      };
      vi.mocked(getStorageAdapter).mockReturnValueOnce(mockStorageAdapter);

      const formData = new FormData();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('images', mockFile);

      const mockRequest = {
        formData: vi.fn().mockResolvedValueOnce(formData)
      } as any;

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data[0].sort_order).toBe(0);
    });

    it('should return 500 when all image processing fails', async () => {
      // Arrange
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: '1', email: 'admin@test.com' }
      } as any);

      // Mock max sort_order query
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ max: 0 }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      });

      // Mock Sharp to throw error
      vi.mocked(sharp).mockImplementationOnce(() => {
        throw new Error('Sharp processing failed');
      });

      const formData = new FormData();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('images', mockFile);

      const mockRequest = {
        formData: vi.fn().mockResolvedValueOnce(formData)
      } as any;

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to process any images' });
    });
  });
});
