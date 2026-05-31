import { google } from 'googleapis';
import { Readable } from 'stream';
import type { StorageAdapter } from './index';

export class GDriveAdapter implements StorageAdapter {
  private drive: any;
  private folderId: string;
  
  constructor() {
    this.folderId = process.env.GDRIVE_FOLDER_ID!;
    const serviceAccountPath = process.env.GDRIVE_SERVICE_ACCOUNT_JSON!;
    
    if (!this.folderId || !serviceAccountPath) {
      throw new Error('GDRIVE_FOLDER_ID and GDRIVE_SERVICE_ACCOUNT_JSON environment variables are required for Google Drive storage');
    }
    
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    
    this.drive = google.drive({ version: 'v3', auth });
  }
  
  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const stream = Readable.from(buffer);
    
    const response = await this.drive.files.create({
      requestBody: {
        name: filename,
        parents: [this.folderId],
        mimeType,
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    });
    
    // Make file publicly accessible
    await this.drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    
    return this.getPublicUrl(response.data.id);
  }
  
  async delete(url: string): Promise<void> {
    const fileId = url.match(/id=([^&]+)/)?.[1];
    
    if (fileId) {
      await this.drive.files.delete({ fileId });
    }
  }
  
  getPublicUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}`;
  }
}
