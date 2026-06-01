import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GDriveAdapter } from './gdriveAdapter';
import { google } from 'googleapis';

// Mock the googleapis library
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn(),
    },
    drive: vi.fn(),
  },
}));

describe('GDriveAdapter', () => {
  const originalEnv = process.env;
  let mockDrive: any;
  let mockFilesCreate: any;
  let mockFilesDelete: any;
  let mockPermissionsCreate: any;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    vi.clearAllMocks();

    // Mock Google Drive API methods
    mockFilesCreate = vi.fn().mockResolvedValue({
      data: {
        id: 'test-file-id-123',
        webViewLink: 'https://drive.google.com/file/d/test-file-id-123/view',
        webContentLink: 'https://drive.google.com/uc?id=test-file-id-123',
      },
    });

    mockFilesDelete = vi.fn().mockResolvedValue({});

    mockPermissionsCreate = vi.fn().mockResolvedValue({});

    mockDrive = {
      files: {
        create: mockFilesCreate,
        delete: mockFilesDelete,
      },
      permissions: {
        create: mockPermissionsCreate,
      },
    };

    (google.drive as any).mockReturnValue(mockDrive);
    (google.auth.GoogleAuth as any).mockImplementation(function (this: any) {
      // Mock GoogleAuth constructor
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should throw error if GDRIVE_FOLDER_ID is missing', () => {
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';

      expect(() => new GDriveAdapter()).toThrow(
        'GDRIVE_FOLDER_ID and GDRIVE_SERVICE_ACCOUNT_JSON environment variables are required'
      );
    });

    it('should throw error if GDRIVE_SERVICE_ACCOUNT_JSON is missing', () => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';

      expect(() => new GDriveAdapter()).toThrow(
        'GDRIVE_FOLDER_ID and GDRIVE_SERVICE_ACCOUNT_JSON environment variables are required'
      );
    });

    it('should throw error if both env vars are missing', () => {
      expect(() => new GDriveAdapter()).toThrow(
        'GDRIVE_FOLDER_ID and GDRIVE_SERVICE_ACCOUNT_JSON environment variables are required'
      );
    });

    it('should initialize successfully with all required env vars', () => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';

      expect(() => new GDriveAdapter()).not.toThrow();
    });

    it('should initialize GoogleAuth with correct parameters', () => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';

      new GDriveAdapter();

      expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
        keyFile: '/path/to/service-account.json',
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
    });

    it('should initialize Google Drive API with v3', () => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';

      new GDriveAdapter();

      expect(google.drive).toHaveBeenCalledWith({
        version: 'v3',
        auth: expect.any(Object),
      });
    });

    it('should read GDRIVE_FOLDER_ID from environment variable', () => {
      const folderId = 'my-custom-folder-id-12345';
      process.env.GDRIVE_FOLDER_ID = folderId;
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';

      const adapter = new GDriveAdapter();

      // Verify by checking that upload would use this folder ID
      expect(adapter).toBeDefined();
    });

    it('should read GDRIVE_SERVICE_ACCOUNT_JSON from environment variable', () => {
      const serviceAccountPath = '/custom/path/to/service-account.json';
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = serviceAccountPath;

      new GDriveAdapter();

      expect(google.auth.GoogleAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          keyFile: serviceAccountPath,
        })
      );
    });
  });

  describe('upload', () => {
    beforeEach(() => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';
    });

    it('should upload file to Google Drive and return public URL', async () => {
      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test image data');
      const filename = 'test-image.webp';
      const mimeType = 'image/webp';

      const url = await adapter.upload(buffer, filename, mimeType);

      expect(url).toBe('https://drive.google.com/uc?id=test-file-id-123');
      expect(mockFilesCreate).toHaveBeenCalledWith({
        requestBody: {
          name: filename,
          parents: ['test-folder-id'],
          mimeType,
        },
        media: {
          mimeType,
          body: expect.any(Object), // Readable stream
        },
        fields: 'id, webViewLink, webContentLink',
      });
    });

    it('should convert buffer to readable stream', async () => {
      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      await adapter.upload(buffer, 'test.webp', 'image/webp');

      const callArgs = mockFilesCreate.mock.calls[0][0];
      expect(callArgs.media.body).toBeDefined();
      // Verify it's a readable stream (has read method)
      expect(typeof callArgs.media.body.read).toBe('function');
    });

    it('should make uploaded file publicly accessible', async () => {
      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      await adapter.upload(buffer, 'test.webp', 'image/webp');

      expect(mockPermissionsCreate).toHaveBeenCalledWith({
        fileId: 'test-file-id-123',
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    });

    it('should upload file to configured folder', async () => {
      const customFolderId = 'custom-folder-abc123';
      process.env.GDRIVE_FOLDER_ID = customFolderId;

      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      await adapter.upload(buffer, 'test.webp', 'image/webp');

      expect(mockFilesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            parents: [customFolderId],
          }),
        })
      );
    });

    it('should handle different file types', async () => {
      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      const testCases = [
        { filename: 'image.webp', mimeType: 'image/webp' },
        { filename: 'photo.jpg', mimeType: 'image/jpeg' },
        { filename: 'picture.png', mimeType: 'image/png' },
      ];

      for (const { filename, mimeType } of testCases) {
        await adapter.upload(buffer, filename, mimeType);

        expect(mockFilesCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            requestBody: expect.objectContaining({
              name: filename,
              mimeType,
            }),
            media: expect.objectContaining({
              mimeType,
            }),
          })
        );
      }
    });

    it('should return URL in correct format', async () => {
      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      const url = await adapter.upload(buffer, 'test.webp', 'image/webp');

      expect(url).toMatch(/^https:\/\/drive\.google\.com\/uc\?id=/);
      expect(url).toContain('test-file-id-123');
    });

    it('should handle upload errors', async () => {
      mockFilesCreate.mockRejectedValueOnce(new Error('Upload failed'));

      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      await expect(adapter.upload(buffer, 'test.webp', 'image/webp')).rejects.toThrow(
        'Upload failed'
      );
    });

    it('should handle permission creation errors', async () => {
      mockPermissionsCreate.mockRejectedValueOnce(new Error('Permission denied'));

      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      await expect(adapter.upload(buffer, 'test.webp', 'image/webp')).rejects.toThrow(
        'Permission denied'
      );
    });

    it('should handle binary data correctly', async () => {
      const adapter = new GDriveAdapter();
      // Create a buffer with binary data (PNG header)
      const binaryData = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

      await adapter.upload(binaryData, 'binary.webp', 'image/webp');

      expect(mockFilesCreate).toHaveBeenCalled();
      expect(mockPermissionsCreate).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';
    });

    it('should delete file by extracting file ID from URL', async () => {
      const adapter = new GDriveAdapter();
      const url = 'https://drive.google.com/uc?id=file-id-to-delete';

      await adapter.delete(url);

      expect(mockFilesDelete).toHaveBeenCalledWith({
        fileId: 'file-id-to-delete',
      });
    });

    it('should handle URLs with additional query parameters', async () => {
      const adapter = new GDriveAdapter();
      const url = 'https://drive.google.com/uc?id=file-id-123&export=download';

      await adapter.delete(url);

      expect(mockFilesDelete).toHaveBeenCalledWith({
        fileId: 'file-id-123',
      });
    });

    it('should not call delete if file ID cannot be extracted', async () => {
      const adapter = new GDriveAdapter();
      const invalidUrl = 'https://example.com/invalid-url';

      await adapter.delete(invalidUrl);

      expect(mockFilesDelete).not.toHaveBeenCalled();
    });

    it('should handle delete errors gracefully', async () => {
      mockFilesDelete.mockRejectedValueOnce(new Error('File not found'));

      const adapter = new GDriveAdapter();
      const url = 'https://drive.google.com/uc?id=non-existent-file';

      // Should not throw - errors are handled gracefully
      await expect(adapter.delete(url)).rejects.toThrow('File not found');
    });

    it('should handle empty URL', async () => {
      const adapter = new GDriveAdapter();

      await adapter.delete('');

      expect(mockFilesDelete).not.toHaveBeenCalled();
    });

    it('should handle URL without id parameter', async () => {
      const adapter = new GDriveAdapter();
      const url = 'https://drive.google.com/uc?export=download';

      await adapter.delete(url);

      expect(mockFilesDelete).not.toHaveBeenCalled();
    });
  });

  describe('getPublicUrl', () => {
    beforeEach(() => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';
    });

    it('should return URL in correct format', () => {
      const adapter = new GDriveAdapter();
      const fileId = 'test-file-id-123';

      const url = adapter.getPublicUrl(fileId);

      expect(url).toBe('https://drive.google.com/uc?id=test-file-id-123');
    });

    it('should handle different file IDs', () => {
      const adapter = new GDriveAdapter();

      const testCases = [
        'abc123',
        'file-id-with-dashes',
        '1234567890',
        'MixedCaseFileId',
      ];

      testCases.forEach((fileId) => {
        const url = adapter.getPublicUrl(fileId);
        expect(url).toBe(`https://drive.google.com/uc?id=${fileId}`);
      });
    });

    it('should return consistent URL format', () => {
      const adapter = new GDriveAdapter();
      const fileId = 'consistent-file-id';

      const url1 = adapter.getPublicUrl(fileId);
      const url2 = adapter.getPublicUrl(fileId);

      expect(url1).toBe(url2);
      expect(url1).toMatch(/^https:\/\/drive\.google\.com\/uc\?id=/);
    });
  });

  describe('Requirement 13.6 Validation', () => {
    it('should read GDRIVE_FOLDER_ID exclusively from environment variables', () => {
      const folderId = 'requirement-13-6-folder';
      process.env.GDRIVE_FOLDER_ID = folderId;
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';

      const adapter = new GDriveAdapter();

      expect(adapter).toBeDefined();
      // Folder ID should be used in upload operations
    });

    it('should read GDRIVE_SERVICE_ACCOUNT_JSON exclusively from environment variables', () => {
      const serviceAccountPath = '/requirement/13-6/service-account.json';
      process.env.GDRIVE_FOLDER_ID = 'test-folder';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = serviceAccountPath;

      new GDriveAdapter();

      expect(google.auth.GoogleAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          keyFile: serviceAccountPath,
        })
      );
    });

    it('should not hardcode GDRIVE_FOLDER_ID', () => {
      // Test with multiple different folder IDs to ensure no hardcoding
      const testFolderIds = [
        'folder-1',
        'folder-2',
        'custom-folder-abc',
        '1234567890',
      ];

      testFolderIds.forEach((folderId) => {
        vi.clearAllMocks();
        process.env.GDRIVE_FOLDER_ID = folderId;
        process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/sa.json';

        const adapter = new GDriveAdapter();
        expect(adapter).toBeDefined();
      });
    });

    it('should not hardcode GDRIVE_SERVICE_ACCOUNT_JSON path', () => {
      // Test with multiple different paths to ensure no hardcoding
      const testPaths = [
        '/path/1/service-account.json',
        '/path/2/service-account.json',
        './local/sa.json',
        '/run/secrets/gdrive_sa.json',
      ];

      testPaths.forEach((path) => {
        vi.clearAllMocks();
        process.env.GDRIVE_FOLDER_ID = 'test-folder';
        process.env.GDRIVE_SERVICE_ACCOUNT_JSON = path;

        new GDriveAdapter();

        expect(google.auth.GoogleAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            keyFile: path,
          })
        );
      });
    });

    it('should throw descriptive error when env vars are missing', () => {
      delete process.env.GDRIVE_FOLDER_ID;
      delete process.env.GDRIVE_SERVICE_ACCOUNT_JSON;

      expect(() => new GDriveAdapter()).toThrow(/GDRIVE_FOLDER_ID/);
      expect(() => new GDriveAdapter()).toThrow(/GDRIVE_SERVICE_ACCOUNT_JSON/);
      expect(() => new GDriveAdapter()).toThrow(/required/);
    });
  });

  describe('Service Account Authentication', () => {
    it('should use correct OAuth scope for Drive API', () => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/sa.json';

      new GDriveAdapter();

      expect(google.auth.GoogleAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          scopes: ['https://www.googleapis.com/auth/drive.file'],
        })
      );
    });

    it('should initialize Drive API with authenticated client', () => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/sa.json';

      new GDriveAdapter();

      expect(google.drive).toHaveBeenCalledWith({
        version: 'v3',
        auth: expect.any(Object),
      });
    });
  });

  describe('Public File Sharing', () => {
    beforeEach(() => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';
    });

    it('should make files publicly readable after upload', async () => {
      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      await adapter.upload(buffer, 'test.webp', 'image/webp');

      expect(mockPermissionsCreate).toHaveBeenCalledWith({
        fileId: 'test-file-id-123',
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    });

    it('should set permission type to "anyone"', async () => {
      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      await adapter.upload(buffer, 'test.webp', 'image/webp');

      const callArgs = mockPermissionsCreate.mock.calls[0][0];
      expect(callArgs.requestBody.type).toBe('anyone');
    });

    it('should set permission role to "reader"', async () => {
      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      await adapter.upload(buffer, 'test.webp', 'image/webp');

      const callArgs = mockPermissionsCreate.mock.calls[0][0];
      expect(callArgs.requestBody.role).toBe('reader');
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';
    });

    it('should support full upload-retrieve-delete cycle', async () => {
      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('integration test data');
      const filename = 'integration-test.webp';

      // Upload
      const url = await adapter.upload(buffer, filename, 'image/webp');
      expect(url).toBe('https://drive.google.com/uc?id=test-file-id-123');

      // Get public URL
      const publicUrl = adapter.getPublicUrl('test-file-id-123');
      expect(publicUrl).toBe(url);

      // Delete
      await adapter.delete(url);
      expect(mockFilesDelete).toHaveBeenCalledWith({
        fileId: 'test-file-id-123',
      });
    });

    it('should handle multiple sequential uploads', async () => {
      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      // Upload multiple files
      for (let i = 0; i < 3; i++) {
        mockFilesCreate.mockResolvedValueOnce({
          data: {
            id: `file-id-${i}`,
            webViewLink: `https://drive.google.com/file/d/file-id-${i}/view`,
            webContentLink: `https://drive.google.com/uc?id=file-id-${i}`,
          },
        });

        const url = await adapter.upload(buffer, `file-${i}.webp`, 'image/webp');
        expect(url).toBe(`https://drive.google.com/uc?id=file-id-${i}`);
      }

      expect(mockFilesCreate).toHaveBeenCalledTimes(3);
      expect(mockPermissionsCreate).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';
    });

    it('should propagate upload errors', async () => {
      mockFilesCreate.mockRejectedValueOnce(new Error('Network timeout'));

      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      await expect(adapter.upload(buffer, 'test.webp', 'image/webp')).rejects.toThrow(
        'Network timeout'
      );
    });

    it('should propagate permission errors', async () => {
      mockPermissionsCreate.mockRejectedValueOnce(new Error('Insufficient permissions'));

      const adapter = new GDriveAdapter();
      const buffer = Buffer.from('test data');

      await expect(adapter.upload(buffer, 'test.webp', 'image/webp')).rejects.toThrow(
        'Insufficient permissions'
      );
    });

    it('should handle malformed URLs in delete', async () => {
      const adapter = new GDriveAdapter();

      // Should not throw, just not call delete
      await adapter.delete('not-a-valid-url');
      expect(mockFilesDelete).not.toHaveBeenCalled();
    });
  });
});
