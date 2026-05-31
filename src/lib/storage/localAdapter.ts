import fs from 'fs/promises';
import path from 'path';
import type { StorageAdapter } from './index';

export class LocalAdapter implements StorageAdapter {
  private basePath: string;
  
  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH || '/app/uploads';
  }
  
  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const filepath = path.join(this.basePath, filename);
    
    // Ensure directory exists
    await fs.mkdir(this.basePath, { recursive: true });
    
    // Write file
    await fs.writeFile(filepath, buffer);
    
    return this.getPublicUrl(filename);
  }
  
  async delete(url: string): Promise<void> {
    const filename = path.basename(url);
    const filepath = path.join(this.basePath, filename);
    
    // Ignore errors if file doesn't exist
    await fs.unlink(filepath).catch(() => {});
  }
  
  getPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
