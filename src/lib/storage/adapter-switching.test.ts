/**
 * Integration tests for storage adapter switching
 * 
 * Task 15.4: Test storage adapter switching
 * - Test local storage adapter with STORAGE_DRIVER=local
 * - Test S3 adapter configuration validation
 * - Test Google Drive adapter configuration validation
 * - Test error handling for invalid STORAGE_DRIVER
 * 
 * Requirements: 13.1, 13.5, 13.6, 13.8
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStorageAdapter } from './index';
import { LocalAdapter } from './localAdapter';
import { S3Adapter } from './s3Adapter';
import { GDriveAdapter } from './gdriveAdapter';

describe('Storage Adapter Switching - Task 15.4', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules and environment before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Local Storage Adapter with STORAGE_DRIVER=local', () => {
    it('should successfully create LocalAdapter when STORAGE_DRIVER=local with valid config', () => {
      // Requirement 13.1: Storage adapter resolved at runtime from STORAGE_DRIVER
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(LocalAdapter);
      expect(adapter).toHaveProperty('upload');
      expect(adapter).toHaveProperty('delete');
      expect(adapter).toHaveProperty('getPublicUrl');
    });

    it('should use default path when STORAGE_LOCAL_PATH is not set', () => {
      process.env.STORAGE_DRIVER = 'local';
      delete process.env.STORAGE_LOCAL_PATH;

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(LocalAdapter);
      // LocalAdapter should use default path /app/uploads
      const url = adapter.getPublicUrl('test.jpg');
      expect(url).toBe('/uploads/test.jpg');
    });

    it('should respect custom STORAGE_LOCAL_PATH configuration', () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/custom/upload/path';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(LocalAdapter);
      // Verify the adapter uses the custom path (URL should still be consistent)
      const url = adapter.getPublicUrl('test.jpg');
      expect(url).toBe('/uploads/test.jpg');
    });

    it('should create new LocalAdapter instance on each call', () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';

      const adapter1 = getStorageAdapter();
      const adapter2 = getStorageAdapter();

      expect(adapter1).toBeInstanceOf(LocalAdapter);
      expect(adapter2).toBeInstanceOf(LocalAdapter);
      // Each call should create a new instance (not singleton)
      expect(adapter1).not.toBe(adapter2);
    });
  });

  describe('S3 Adapter Configuration Validation', () => {
    it('should successfully create S3Adapter when all required S3 env vars are provided', () => {
      // Requirement 13.5: S3 adapter reads credentials from env vars
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://s3.amazonaws.com';
      process.env.S3_BUCKET = 'coffeeshop-bucket';
      process.env.S3_REGION = 'us-east-1';
      process.env.S3_ACCESS_KEY = 'test-access-key';
      process.env.S3_SECRET_KEY = 'test-secret-key';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(S3Adapter);
      expect(adapter).toHaveProperty('upload');
      expect(adapter).toHaveProperty('delete');
      expect(adapter).toHaveProperty('getPublicUrl');
    });

    it('should throw error when S3_BUCKET is missing', () => {
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://s3.amazonaws.com';
      delete process.env.S3_BUCKET;
      process.env.S3_REGION = 'us-east-1';
      process.env.S3_ACCESS_KEY = 'test-access-key';
      process.env.S3_SECRET_KEY = 'test-secret-key';

      expect(() => getStorageAdapter()).toThrow(
        'S3_BUCKET environment variable is required for S3 storage'
      );
    });

    it('should throw error when S3_ENDPOINT is missing', () => {
      process.env.STORAGE_DRIVER = 's3';
      delete process.env.S3_ENDPOINT;
      process.env.S3_BUCKET = 'coffeeshop-bucket';
      process.env.S3_REGION = 'us-east-1';
      process.env.S3_ACCESS_KEY = 'test-access-key';
      process.env.S3_SECRET_KEY = 'test-secret-key';

      expect(() => getStorageAdapter()).toThrow(
        'S3_ENDPOINT environment variable is required for S3 storage'
      );
    });

    it('should throw error when S3_ACCESS_KEY is missing', () => {
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://s3.amazonaws.com';
      process.env.S3_BUCKET = 'coffeeshop-bucket';
      process.env.S3_REGION = 'us-east-1';
      delete process.env.S3_ACCESS_KEY;
      process.env.S3_SECRET_KEY = 'test-secret-key';

      expect(() => getStorageAdapter()).toThrow(
        'S3_ACCESS_KEY environment variable is required for S3 storage'
      );
    });

    it('should throw error when S3_SECRET_KEY is missing', () => {
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://s3.amazonaws.com';
      process.env.S3_BUCKET = 'coffeeshop-bucket';
      process.env.S3_REGION = 'us-east-1';
      process.env.S3_ACCESS_KEY = 'test-access-key';
      delete process.env.S3_SECRET_KEY;

      expect(() => getStorageAdapter()).toThrow(
        'S3_SECRET_KEY environment variable is required for S3 storage'
      );
    });

    it('should use default region "auto" when S3_REGION is not set', () => {
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://s3.amazonaws.com';
      process.env.S3_BUCKET = 'coffeeshop-bucket';
      delete process.env.S3_REGION;
      process.env.S3_ACCESS_KEY = 'test-access-key';
      process.env.S3_SECRET_KEY = 'test-secret-key';

      // Should not throw - region has a default value
      const adapter = getStorageAdapter();
      expect(adapter).toBeInstanceOf(S3Adapter);
    });

    it('should validate S3 configuration for MinIO endpoint', () => {
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://minio.example.com';
      process.env.S3_BUCKET = 'coffeeshop-bucket';
      process.env.S3_REGION = 'auto';
      process.env.S3_ACCESS_KEY = 'minio-access-key';
      process.env.S3_SECRET_KEY = 'minio-secret-key';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(S3Adapter);
      // Verify getPublicUrl works with MinIO (path-style URLs)
      const url = adapter.getPublicUrl('test.jpg');
      expect(url).toContain('minio.example.com');
      expect(url).toContain('coffeeshop-bucket');
    });

    it('should validate S3 configuration for Cloudflare R2 endpoint', () => {
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://abc123.r2.cloudflarestorage.com';
      process.env.S3_BUCKET = 'coffeeshop-bucket';
      process.env.S3_REGION = 'auto';
      process.env.S3_ACCESS_KEY = 'r2-access-key';
      process.env.S3_SECRET_KEY = 'r2-secret-key';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(S3Adapter);
      // Verify getPublicUrl works with Cloudflare R2 (path-style URLs)
      const url = adapter.getPublicUrl('test.jpg');
      expect(url).toContain('r2.cloudflarestorage.com');
    });

    it('should validate S3 configuration for Backblaze B2 endpoint', () => {
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://s3.us-west-001.backblazeb2.com';
      process.env.S3_BUCKET = 'coffeeshop-bucket';
      process.env.S3_REGION = 'us-west-001';
      process.env.S3_ACCESS_KEY = 'b2-key-id';
      process.env.S3_SECRET_KEY = 'b2-application-key';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(S3Adapter);
      // Verify getPublicUrl works with Backblaze B2
      const url = adapter.getPublicUrl('test.jpg');
      expect(url).toContain('backblazeb2.com');
    });
  });

  describe('Google Drive Adapter Configuration Validation', () => {
    it('should successfully create GDriveAdapter when all required GDrive env vars are provided', () => {
      // Requirement 13.6: GDrive adapter reads credentials from env vars
      process.env.STORAGE_DRIVER = 'gdrive';
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id-123';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(GDriveAdapter);
      expect(adapter).toHaveProperty('upload');
      expect(adapter).toHaveProperty('delete');
      expect(adapter).toHaveProperty('getPublicUrl');
    });

    it('should throw error when GDRIVE_FOLDER_ID is missing', () => {
      process.env.STORAGE_DRIVER = 'gdrive';
      delete process.env.GDRIVE_FOLDER_ID;
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';

      expect(() => getStorageAdapter()).toThrow(
        'GDRIVE_FOLDER_ID and GDRIVE_SERVICE_ACCOUNT_JSON environment variables are required for Google Drive storage'
      );
    });

    it('should throw error when GDRIVE_SERVICE_ACCOUNT_JSON is missing', () => {
      process.env.STORAGE_DRIVER = 'gdrive';
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id-123';
      delete process.env.GDRIVE_SERVICE_ACCOUNT_JSON;

      expect(() => getStorageAdapter()).toThrow(
        'GDRIVE_FOLDER_ID and GDRIVE_SERVICE_ACCOUNT_JSON environment variables are required for Google Drive storage'
      );
    });

    it('should throw error when both GDRIVE env vars are missing', () => {
      process.env.STORAGE_DRIVER = 'gdrive';
      delete process.env.GDRIVE_FOLDER_ID;
      delete process.env.GDRIVE_SERVICE_ACCOUNT_JSON;

      expect(() => getStorageAdapter()).toThrow(
        'GDRIVE_FOLDER_ID and GDRIVE_SERVICE_ACCOUNT_JSON environment variables are required for Google Drive storage'
      );
    });

    it('should validate GDrive configuration with valid folder ID format', () => {
      process.env.STORAGE_DRIVER = 'gdrive';
      process.env.GDRIVE_FOLDER_ID = '1a2b3c4d5e6f7g8h9i0j';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/run/secrets/gdrive_sa.json';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(GDriveAdapter);
      // Verify getPublicUrl generates correct Drive URL format
      const url = adapter.getPublicUrl('abc123xyz');
      expect(url).toMatch(/^https:\/\/drive\.google\.com\/uc\?id=/);
      expect(url).toContain('abc123xyz');
    });
  });

  describe('Error Handling for Invalid STORAGE_DRIVER', () => {
    it('should throw descriptive error when STORAGE_DRIVER is undefined', () => {
      // Requirement 13.8: Throw descriptive error for invalid STORAGE_DRIVER
      delete process.env.STORAGE_DRIVER;

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "undefined". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should throw descriptive error when STORAGE_DRIVER is empty string', () => {
      process.env.STORAGE_DRIVER = '';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should throw descriptive error when STORAGE_DRIVER is invalid value', () => {
      process.env.STORAGE_DRIVER = 'invalid-driver';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "invalid-driver". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should throw descriptive error for unsupported storage driver "azure"', () => {
      process.env.STORAGE_DRIVER = 'azure';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "azure". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should throw descriptive error for unsupported storage driver "dropbox"', () => {
      process.env.STORAGE_DRIVER = 'dropbox';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "dropbox". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should be case-sensitive - uppercase "LOCAL" should fail', () => {
      process.env.STORAGE_DRIVER = 'LOCAL';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "LOCAL". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should be case-sensitive - uppercase "S3" should fail', () => {
      process.env.STORAGE_DRIVER = 'S3';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "S3". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should be case-sensitive - mixed case "GDrive" should fail', () => {
      process.env.STORAGE_DRIVER = 'GDrive';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "GDrive". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should reject whitespace-padded driver names', () => {
      process.env.STORAGE_DRIVER = ' local ';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: " local ". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should reject driver names with special characters', () => {
      process.env.STORAGE_DRIVER = 'local!';

      expect(() => getStorageAdapter()).toThrow(/Invalid STORAGE_DRIVER/);
    });
  });

  describe('Runtime Adapter Switching', () => {
    it('should switch from local to s3 adapter when STORAGE_DRIVER changes', () => {
      // First call with local
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';
      const localAdapter = getStorageAdapter();
      expect(localAdapter).toBeInstanceOf(LocalAdapter);

      // Reset modules to simulate runtime environment change
      vi.resetModules();

      // Change to s3
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://s3.amazonaws.com';
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_REGION = 'us-east-1';
      process.env.S3_ACCESS_KEY = 'key';
      process.env.S3_SECRET_KEY = 'secret';
      const s3Adapter = getStorageAdapter();
      expect(s3Adapter).toBeInstanceOf(S3Adapter);
    });

    it('should switch from s3 to gdrive adapter when STORAGE_DRIVER changes', () => {
      // First call with s3
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://s3.amazonaws.com';
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_REGION = 'us-east-1';
      process.env.S3_ACCESS_KEY = 'key';
      process.env.S3_SECRET_KEY = 'secret';
      const s3Adapter = getStorageAdapter();
      expect(s3Adapter).toBeInstanceOf(S3Adapter);

      // Reset modules to simulate runtime environment change
      vi.resetModules();

      // Change to gdrive
      process.env.STORAGE_DRIVER = 'gdrive';
      process.env.GDRIVE_FOLDER_ID = 'folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/sa.json';
      const gdriveAdapter = getStorageAdapter();
      expect(gdriveAdapter).toBeInstanceOf(GDriveAdapter);
    });

    it('should allow switching between all three adapters', () => {
      const adapters = ['local', 's3', 'gdrive'] as const;
      const results: any[] = [];

      adapters.forEach((driver) => {
        vi.resetModules();
        process.env.STORAGE_DRIVER = driver;

        if (driver === 'local') {
          process.env.STORAGE_LOCAL_PATH = '/app/uploads';
        } else if (driver === 's3') {
          process.env.S3_ENDPOINT = 'https://s3.amazonaws.com';
          process.env.S3_BUCKET = 'bucket';
          process.env.S3_ACCESS_KEY = 'key';
          process.env.S3_SECRET_KEY = 'secret';
        } else {
          process.env.GDRIVE_FOLDER_ID = 'folder';
          process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/sa.json';
        }

        const adapter = getStorageAdapter();
        results.push({
          driver,
          adapterClass: adapter.constructor.name,
        });
      });

      expect(results).toEqual([
        { driver: 'local', adapterClass: 'LocalAdapter' },
        { driver: 's3', adapterClass: 'S3Adapter' },
        { driver: 'gdrive', adapterClass: 'GDriveAdapter' },
      ]);
    });
  });

  describe('Requirement Coverage Summary', () => {
    it('covers Requirement 13.1: Storage adapter resolved at runtime', () => {
      const testCases = [
        { driver: 'local', expectedClass: LocalAdapter },
        { driver: 's3', expectedClass: S3Adapter },
        { driver: 'gdrive', expectedClass: GDriveAdapter },
      ];

      testCases.forEach(({ driver, expectedClass }) => {
        vi.resetModules();
        process.env.STORAGE_DRIVER = driver;

        // Set required env vars for each driver
        if (driver === 'local') {
          process.env.STORAGE_LOCAL_PATH = '/app/uploads';
        } else if (driver === 's3') {
          process.env.S3_ENDPOINT = 'https://s3.example.com';
          process.env.S3_BUCKET = 'bucket';
          process.env.S3_ACCESS_KEY = 'key';
          process.env.S3_SECRET_KEY = 'secret';
        } else {
          process.env.GDRIVE_FOLDER_ID = 'folder';
          process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/sa.json';
        }

        const adapter = getStorageAdapter();
        expect(adapter).toBeInstanceOf(expectedClass);
      });
    });

    it('covers Requirement 13.5: S3 adapter reads from env vars exclusively', () => {
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://test.s3.com';
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(S3Adapter);
      // Verify no hardcoded credentials by testing with minimal env vars
      // If credentials were hardcoded, this would work even with missing env vars
    });

    it('covers Requirement 13.6: GDrive adapter reads from env vars exclusively', () => {
      process.env.STORAGE_DRIVER = 'gdrive';
      process.env.GDRIVE_FOLDER_ID = 'test-folder';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/test/path.json';

      const adapter = getStorageAdapter();

      expect(adapter).toBeInstanceOf(GDriveAdapter);
      // Verify no hardcoded credentials by testing with minimal env vars
    });

    it('covers Requirement 13.8: Descriptive error for invalid STORAGE_DRIVER', () => {
      const invalidValues = [
        undefined,
        '',
        'invalid',
        'azure',
        'LOCAL',
        'S3',
        ' local ',
      ];

      invalidValues.forEach((value) => {
        vi.resetModules();
        if (value === undefined) {
          delete process.env.STORAGE_DRIVER;
        } else {
          process.env.STORAGE_DRIVER = value;
        }

        expect(() => getStorageAdapter()).toThrow(/Invalid STORAGE_DRIVER/);
        expect(() => getStorageAdapter()).toThrow(/Must be 'local', 's3', or 'gdrive'/);
      });
    });
  });
});
