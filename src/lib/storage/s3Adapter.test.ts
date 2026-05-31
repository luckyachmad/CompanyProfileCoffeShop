import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { S3Adapter } from './s3Adapter';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Mock the AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

describe('S3Adapter', () => {
  const originalEnv = process.env;
  let mockSend: any;
  
  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    vi.clearAllMocks();
    
    // Mock S3Client.send method
    mockSend = vi.fn().mockResolvedValue({});
    (S3Client as any).mockImplementation(function(this: any) {
      this.send = mockSend;
    });
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  describe('constructor', () => {
    it('should throw error if S3_BUCKET is missing', () => {
      process.env.S3_ENDPOINT = 'https://s3.example.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      expect(() => new S3Adapter()).toThrow('S3_BUCKET environment variable is required');
    });
    
    it('should throw error if S3_ENDPOINT is missing', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      expect(() => new S3Adapter()).toThrow('S3_ENDPOINT environment variable is required');
    });
    
    it('should throw error if S3_ACCESS_KEY is missing', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://s3.example.com';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      expect(() => new S3Adapter()).toThrow('S3_ACCESS_KEY environment variable is required');
    });
    
    it('should throw error if S3_SECRET_KEY is missing', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://s3.example.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      
      expect(() => new S3Adapter()).toThrow('S3_SECRET_KEY environment variable is required');
    });
    
    it('should initialize successfully with all required env vars', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://s3.example.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      expect(() => new S3Adapter()).not.toThrow();
    });
    
    it('should use "auto" as default region if S3_REGION is not set', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://s3.example.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      new S3Adapter();
      
      expect(S3Client).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'auto',
        })
      );
    });
    
    it('should use forcePathStyle for non-AWS endpoints', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://minio.example.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      new S3Adapter();
      
      expect(S3Client).toHaveBeenCalledWith(
        expect.objectContaining({
          forcePathStyle: true,
        })
      );
    });
    
    it('should not use forcePathStyle for AWS endpoints', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://s3.amazonaws.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      new S3Adapter();
      
      expect(S3Client).toHaveBeenCalledWith(
        expect.objectContaining({
          forcePathStyle: false,
        })
      );
    });
  });
  
  describe('upload', () => {
    it('should upload file and return public URL', async () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://minio.example.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      const adapter = new S3Adapter();
      const buffer = Buffer.from('test content');
      const filename = 'test.jpg';
      const mimeType = 'image/jpeg';
      
      const url = await adapter.upload(buffer, filename, mimeType);
      
      expect(url).toBe('https://minio.example.com/test-bucket/test.jpg');
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
      });
    });
    
    it('should throw error with context if upload fails', async () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://minio.example.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      const failMockSend = vi.fn().mockRejectedValue(new Error('Network error'));
      (S3Client as any).mockImplementation(function(this: any) {
        this.send = failMockSend;
      });
      
      const adapter = new S3Adapter();
      const buffer = Buffer.from('test content');
      
      await expect(adapter.upload(buffer, 'test.jpg', 'image/jpeg')).rejects.toThrow(
        'Failed to upload file to S3: Network error'
      );
    });
  });
  
  describe('delete', () => {
    it('should delete file by extracting filename from URL', async () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://minio.example.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      const adapter = new S3Adapter();
      const url = 'https://minio.example.com/test-bucket/test.jpg';
      
      await adapter.delete(url);
      
      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'test.jpg',
      });
    });
    
    it('should not throw error if delete fails', async () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://minio.example.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      const failMockSend = vi.fn().mockRejectedValue(new Error('File not found'));
      (S3Client as any).mockImplementation(function(this: any) {
        this.send = failMockSend;
      });
      
      const adapter = new S3Adapter();
      
      // Should not throw
      await expect(adapter.delete('https://minio.example.com/test-bucket/test.jpg')).resolves.toBeUndefined();
    });
  });
  
  describe('getPublicUrl', () => {
    it('should return path-style URL for non-AWS endpoints', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://minio.example.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      const adapter = new S3Adapter();
      const url = adapter.getPublicUrl('test.jpg');
      
      expect(url).toBe('https://minio.example.com/test-bucket/test.jpg');
    });
    
    it('should return virtual-hosted-style URL for AWS endpoints', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://s3.amazonaws.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      const adapter = new S3Adapter();
      const url = adapter.getPublicUrl('test.jpg');
      
      expect(url).toBe('https://test-bucket.s3.amazonaws.com/test.jpg');
    });
    
    it('should handle Cloudflare R2 endpoints', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://abc123.r2.cloudflarestorage.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      const adapter = new S3Adapter();
      const url = adapter.getPublicUrl('test.jpg');
      
      expect(url).toBe('https://abc123.r2.cloudflarestorage.com/test-bucket/test.jpg');
    });
    
    it('should handle Backblaze B2 endpoints', () => {
      process.env.S3_BUCKET = 'test-bucket';
      process.env.S3_ENDPOINT = 'https://s3.us-west-001.backblazeb2.com';
      process.env.S3_ACCESS_KEY = 'test-key';
      process.env.S3_SECRET_KEY = 'test-secret';
      
      const adapter = new S3Adapter();
      const url = adapter.getPublicUrl('test.jpg');
      
      expect(url).toBe('https://s3.us-west-001.backblazeb2.com/test-bucket/test.jpg');
    });
  });
  
  describe('S3-compatible service compatibility', () => {
    it('should work with MinIO configuration', () => {
      process.env.S3_BUCKET = 'coffeeshop-media';
      process.env.S3_ENDPOINT = 'https://minio.myserver.com';
      process.env.S3_REGION = 'us-east-1';
      process.env.S3_ACCESS_KEY = 'minioadmin';
      process.env.S3_SECRET_KEY = 'minioadmin';
      
      expect(() => new S3Adapter()).not.toThrow();
    });
    
    it('should work with Cloudflare R2 configuration', () => {
      process.env.S3_BUCKET = 'coffeeshop-media';
      process.env.S3_ENDPOINT = 'https://abc123.r2.cloudflarestorage.com';
      process.env.S3_REGION = 'auto';
      process.env.S3_ACCESS_KEY = 'r2-access-key';
      process.env.S3_SECRET_KEY = 'r2-secret-key';
      
      expect(() => new S3Adapter()).not.toThrow();
    });
    
    it('should work with Backblaze B2 configuration', () => {
      process.env.S3_BUCKET = 'coffeeshop-media';
      process.env.S3_ENDPOINT = 'https://s3.us-west-001.backblazeb2.com';
      process.env.S3_REGION = 'us-west-001';
      process.env.S3_ACCESS_KEY = 'b2-key-id';
      process.env.S3_SECRET_KEY = 'b2-application-key';
      
      expect(() => new S3Adapter()).not.toThrow();
    });
    
    it('should work with AWS S3 configuration', () => {
      process.env.S3_BUCKET = 'coffeeshop-media';
      process.env.S3_ENDPOINT = 'https://s3.us-east-1.amazonaws.com';
      process.env.S3_REGION = 'us-east-1';
      process.env.S3_ACCESS_KEY = 'aws-access-key';
      process.env.S3_SECRET_KEY = 'aws-secret-key';
      
      expect(() => new S3Adapter()).not.toThrow();
    });
  });
});
