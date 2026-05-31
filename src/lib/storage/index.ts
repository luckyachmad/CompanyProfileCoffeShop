import { LocalAdapter } from './localAdapter';
import { S3Adapter } from './s3Adapter';
import { GDriveAdapter } from './gdriveAdapter';

// Storage adapter interface
export interface StorageAdapter {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(url: string): Promise<void>;
  getPublicUrl(filename: string): string;
}

// Factory function to resolve storage adapter at runtime
export function getStorageAdapter(): StorageAdapter {
  const driver = process.env.STORAGE_DRIVER;
  
  switch (driver) {
    case 'local':
      return new LocalAdapter();
    
    case 's3':
      return new S3Adapter();
    
    case 'gdrive':
      return new GDriveAdapter();
    
    default:
      throw new Error(
        `Invalid STORAGE_DRIVER: "${driver}". Must be 'local', 's3', or 'gdrive'.`
      );
  }
}
