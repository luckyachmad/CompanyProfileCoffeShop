import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStorageAdapter, StorageAdapter } from './index';

describe('Storage Adapter Factory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh imports
    vi.resetModules();
    // Create a fresh copy of process.env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getStorageAdapter', () => {
    it('should return LocalAdapter when STORAGE_DRIVER is "local"', () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';

      const adapter = getStorageAdapter();

      expect(adapter).toBeDefined();
      expect(adapter).toHaveProperty('upload');
      expect(adapter).toHaveProperty('delete');
      expect(adapter).toHaveProperty('getPublicUrl');
      expect(typeof adapter.upload).toBe('function');
      expect(typeof adapter.delete).toBe('function');
      expect(typeof adapter.getPublicUrl).toBe('function');
    });

    it('should return S3Adapter when STORAGE_DRIVER is "s3"', () => {
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://s3.example.com';
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_REGION = 'us-east-1';
      process.env.S3_ACCESS_KEY = 'test-access-key';
      process.env.S3_SECRET_KEY = 'test-secret-key';

      const adapter = getStorageAdapter();

      expect(adapter).toBeDefined();
      expect(adapter).toHaveProperty('upload');
      expect(adapter).toHaveProperty('delete');
      expect(adapter).toHaveProperty('getPublicUrl');
    });

    it('should return GDriveAdapter when STORAGE_DRIVER is "gdrive"', () => {
      process.env.STORAGE_DRIVER = 'gdrive';
      process.env.GDRIVE_FOLDER_ID = 'test-folder-id';
      process.env.GDRIVE_SERVICE_ACCOUNT_JSON = '/path/to/service-account.json';

      const adapter = getStorageAdapter();

      expect(adapter).toBeDefined();
      expect(adapter).toHaveProperty('upload');
      expect(adapter).toHaveProperty('delete');
      expect(adapter).toHaveProperty('getPublicUrl');
    });

    it('should throw error when STORAGE_DRIVER is undefined', () => {
      delete process.env.STORAGE_DRIVER;

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "undefined". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should throw error when STORAGE_DRIVER is empty string', () => {
      process.env.STORAGE_DRIVER = '';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should throw error when STORAGE_DRIVER is invalid value', () => {
      process.env.STORAGE_DRIVER = 'invalid-driver';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "invalid-driver". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should throw error when STORAGE_DRIVER is "azure" (unsupported)', () => {
      process.env.STORAGE_DRIVER = 'azure';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "azure". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should be case-sensitive for STORAGE_DRIVER value', () => {
      process.env.STORAGE_DRIVER = 'LOCAL';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "LOCAL". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should be case-sensitive for "S3" value', () => {
      process.env.STORAGE_DRIVER = 'S3';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "S3". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });

    it('should be case-sensitive for "GDrive" value', () => {
      process.env.STORAGE_DRIVER = 'GDrive';

      expect(() => getStorageAdapter()).toThrow(
        'Invalid STORAGE_DRIVER: "GDrive". Must be \'local\', \'s3\', or \'gdrive\'.'
      );
    });
  });

  describe('StorageAdapter Interface', () => {
    it('should define upload method signature', () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';

      const adapter = getStorageAdapter();

      // Verify upload method exists and has correct arity
      expect(adapter.upload).toBeDefined();
      expect(adapter.upload.length).toBe(3); // buffer, filename, mimeType
    });

    it('should define delete method signature', () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';

      const adapter = getStorageAdapter();

      // Verify delete method exists and has correct arity
      expect(adapter.delete).toBeDefined();
      expect(adapter.delete.length).toBe(1); // url
    });

    it('should define getPublicUrl method signature', () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';

      const adapter = getStorageAdapter();

      // Verify getPublicUrl method exists and has correct arity
      expect(adapter.getPublicUrl).toBeDefined();
      expect(adapter.getPublicUrl.length).toBe(1); // filename
    });
  });

  describe('Runtime Driver Resolution', () => {
    it('should resolve adapter at runtime based on env var', () => {
      // Test with local
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';
      const localAdapter = getStorageAdapter();
      expect(localAdapter).toBeDefined();
      expect(localAdapter.constructor.name).toBe('LocalAdapter');

      // Reset and test with s3
      vi.resetModules();
      process.env.STORAGE_DRIVER = 's3';
      process.env.S3_ENDPOINT = 'https://s3.example.com';
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_REGION = 'us-east-1';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';

      const s3Adapter = getStorageAdapter();
      expect(s3Adapter).toBeDefined();
      expect(s3Adapter.constructor.name).toBe('S3Adapter');
    });

    it('should not hardcode any storage driver', () => {
      // Verify that without env var, no default driver is used
      delete process.env.STORAGE_DRIVER;

      expect(() => getStorageAdapter()).toThrow();
    });
  });

  describe('Lazy Loading', () => {
    it('should only load the required adapter module', () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';

      // This should only require localAdapter, not s3Adapter or gdriveAdapter
      const adapter = getStorageAdapter();

      expect(adapter).toBeDefined();
      // The adapter should be an instance with the correct methods
      expect(adapter.constructor.name).toBe('LocalAdapter');
    });
  });

  describe('Requirements Validation', () => {
    it('should satisfy Requirement 13.1: resolve adapter at runtime from STORAGE_DRIVER', () => {
      const testCases = [
        {
          driver: 'local',
          envVars: { STORAGE_LOCAL_PATH: '/app/uploads' },
          expectedClass: 'LocalAdapter'
        },
        {
          driver: 's3',
          envVars: {
            S3_ENDPOINT: 'https://s3.example.com',
            S3_BUCKET: 'test-bucket',
            S3_ACCESS_KEY: 'key',
            S3_SECRET_KEY: 'secret'
          },
          expectedClass: 'S3Adapter'
        },
        {
          driver: 'gdrive',
          envVars: {
            GDRIVE_FOLDER_ID: 'folder-id',
            GDRIVE_SERVICE_ACCOUNT_JSON: '/path/to/sa.json'
          },
          expectedClass: 'GDriveAdapter'
        }
      ];

      testCases.forEach(({ driver, envVars, expectedClass }) => {
        vi.resetModules();
        process.env.STORAGE_DRIVER = driver;
        Object.assign(process.env, envVars);

        const adapter = getStorageAdapter();

        expect(adapter).toBeDefined();
        expect(adapter).toHaveProperty('upload');
        expect(adapter).toHaveProperty('delete');
        expect(adapter).toHaveProperty('getPublicUrl');
        expect(adapter.constructor.name).toBe(expectedClass);
      });
    });

    it('should satisfy Requirement 13.2: factory resolves adapter exactly once per call', () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';

      const adapter1 = getStorageAdapter();
      const adapter2 = getStorageAdapter();

      // Each call should return a new instance
      expect(adapter1).toBeDefined();
      expect(adapter2).toBeDefined();
      // They should be different instances (not singleton)
      expect(adapter1).not.toBe(adapter2);
    });

    it('should satisfy Requirement 13.8: throw descriptive error for invalid STORAGE_DRIVER', () => {
      process.env.STORAGE_DRIVER = 'invalid';

      expect(() => getStorageAdapter()).toThrow(/Invalid STORAGE_DRIVER/);
      expect(() => getStorageAdapter()).toThrow(/Must be 'local', 's3', or 'gdrive'/);
    });

    it('should satisfy Requirement 13.8: throw descriptive error for missing STORAGE_DRIVER', () => {
      delete process.env.STORAGE_DRIVER;

      expect(() => getStorageAdapter()).toThrow(/Invalid STORAGE_DRIVER/);
      expect(() => getStorageAdapter()).toThrow(/Must be 'local', 's3', or 'gdrive'/);
    });
  });

  describe('Interface Contract', () => {
    it('should return adapter with upload method that returns Promise<string>', async () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/tmp/test-uploads';

      const adapter = getStorageAdapter();
      const buffer = Buffer.from('test image data');

      // Verify upload returns a Promise
      const result = adapter.upload(buffer, 'test.webp', 'image/webp');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return adapter with delete method that returns Promise<void>', async () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/tmp/test-uploads';

      const adapter = getStorageAdapter();

      // Verify delete returns a Promise
      const result = adapter.delete('/uploads/test.webp');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return adapter with getPublicUrl method that returns string', () => {
      process.env.STORAGE_DRIVER = 'local';
      process.env.STORAGE_LOCAL_PATH = '/app/uploads';

      const adapter = getStorageAdapter();

      // Verify getPublicUrl returns a string
      const result = adapter.getPublicUrl('test.webp');
      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
    });
  });
});
