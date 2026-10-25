import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ['127.0.0.1'],
  devIndicators: false,
  reactCompiler: true
};

export default nextConfig;
