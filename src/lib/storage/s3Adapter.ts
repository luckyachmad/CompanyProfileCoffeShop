import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { StorageAdapter } from './index';

/**
 * S3-compatible storage adapter
 * 
 * Supports:
 * - AWS S3
 * - MinIO
 * - Cloudflare R2
 * - Backblaze B2
 * - Any S3-compatible object storage service
 * 
 * Required environment variables:
 * - S3_ENDPOINT: The S3 endpoint URL (e.g., https://s3.amazonaws.com, https://minio.example.com)
 * - S3_BUCKET: The bucket name
 * - S3_REGION: The region (default: 'auto' for services like Cloudflare R2)
 * - S3_ACCESS_KEY: Access key ID
 * - S3_SECRET_KEY: Secret access key
 */
export class S3Adapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;
  private endpoint: string;
  private region: string;
  
  constructor() {
    // Validate required environment variables
    this.bucket = process.env.S3_BUCKET!;
    this.endpoint = process.env.S3_ENDPOINT!;
    this.region = process.env.S3_REGION || 'auto';
    
    const accessKey = process.env.S3_ACCESS_KEY;
    const secretKey = process.env.S3_SECRET_KEY;
    
    if (!this.bucket) {
      throw new Error('S3_BUCKET environment variable is required for S3 storage');
    }
    
    if (!this.endpoint) {
      throw new Error('S3_ENDPOINT environment variable is required for S3 storage');
    }
    
    if (!accessKey) {
      throw new Error('S3_ACCESS_KEY environment variable is required for S3 storage');
    }
    
    if (!secretKey) {
      throw new Error('S3_SECRET_KEY environment variable is required for S3 storage');
    }
    
    // Initialize S3 client with configuration
    this.client = new S3Client({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      // Force path-style URLs for compatibility with MinIO and other S3-compatible services
      // AWS S3 uses virtual-hosted-style by default, but path-style works for all
      forcePathStyle: this.shouldUsePathStyle(),
    });
  }
  
  /**
   * Determine if path-style URLs should be used based on the endpoint
   * Path-style: https://endpoint/bucket/key
   * Virtual-hosted-style: https://bucket.endpoint/key
   */
  private shouldUsePathStyle(): boolean {
    // Use path-style for non-AWS endpoints (MinIO, Cloudflare R2, Backblaze B2)
    // AWS S3 endpoints typically contain 'amazonaws.com'
    return !this.endpoint.includes('amazonaws.com');
  }
  
  /**
   * Upload a file buffer to S3-compatible storage
   * 
   * @param buffer - The file buffer to upload
   * @param filename - The filename/key to store the file under
   * @param mimeType - The MIME type of the file
   * @returns The public URL of the uploaded file
   */
  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
        // Note: ACL is omitted for compatibility with services like Cloudflare R2
        // that don't support ACLs. Ensure your bucket is configured for public access
        // or use signed URLs if needed.
      });
      
      await this.client.send(command);
      
      return this.getPublicUrl(filename);
    } catch (error) {
      // Provide more context in error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload file to S3: ${errorMessage}`);
    }
  }
  
  /**
   * Delete a file from S3-compatible storage
   * 
   * @param url - The public URL of the file to delete
   */
  async delete(url: string): Promise<void> {
    try {
      // Extract filename from URL
      // Handles both path-style and virtual-hosted-style URLs
      const filename = url.split('/').pop();
      
      if (!filename) {
        throw new Error('Could not extract filename from URL');
      }
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: filename,
      });
      
      await this.client.send(command);
    } catch (error) {
      // Log error but don't throw - file might already be deleted
      // This matches the behavior of the local adapter
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Failed to delete file from S3: ${errorMessage}`);
    }
  }
  
  /**
   * Get the public URL for a file
   * 
   * @param filename - The filename/key of the file
   * @returns The public URL
   */
  getPublicUrl(filename: string): string {
    // Construct URL based on path-style or virtual-hosted-style
    if (this.shouldUsePathStyle()) {
      // Path-style: https://endpoint/bucket/key
      return `${this.endpoint}/${this.bucket}/${filename}`;
    } else {
      // Virtual-hosted-style: https://bucket.s3.region.amazonaws.com/key
      // For AWS S3, construct the proper virtual-hosted URL
      const baseUrl = this.endpoint.replace('https://', '').replace('http://', '');
      return `https://${this.bucket}.${baseUrl}/${filename}`;
    }
  }
}
