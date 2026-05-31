import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // Add storage domain patterns here as needed
      // Example for S3:
      // {
      //   protocol: 'https',
      //   hostname: 's3.example.com',
      // },
      // Example for Google Drive:
      // {
      //   protocol: 'https',
      //   hostname: 'drive.google.com',
      // },
    ],
  },
};

export default nextConfig;
