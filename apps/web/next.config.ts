import type { NextConfig } from 'next';
import path from 'path';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['http://localhost:3001'],
  transpilePackages: ['@repo/ui'],

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${API_URL}/api/:path*`,
        },
      ],
    };
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  turbopack: {
    // monorepo root so Turbopack can resolve hoisted node_modules (e.g. next/package.json)
    root: path.resolve(__dirname, '../..'),
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default nextConfig;
