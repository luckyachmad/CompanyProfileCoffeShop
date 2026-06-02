import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // Local storage (served from Next.js public directory or mounted volume)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXTAUTH_URL
          ? new URL(process.env.NEXTAUTH_URL).hostname
          : 'yourdomain.com',
        pathname: '/uploads/**',
      },
      
      // S3-compatible storage (MinIO, Backblaze B2, Cloudflare R2, AWS S3)
      // Supports any S3_ENDPOINT configured via environment variables
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com', // Cloudflare R2
      },
      {
        protocol: 'https',
        hostname: '**.backblazeb2.com', // Backblaze B2
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com', // AWS S3
      },
      {
        protocol: 'https',
        hostname: 's3.**.amazonaws.com', // AWS S3 regional endpoints
      },
      {
        protocol: 'https',
        hostname: '**.minio.**.com', // MinIO instances
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000', // Local MinIO development
      },
      
      // Google Drive CDN
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/uc/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Drive thumbnail/image CDN
      },
      {
        protocol: 'https',
        hostname: 'drive.usercontent.google.com', // Google Drive direct content
      },
    ],
  },
};

export default nextConfig;
