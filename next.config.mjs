/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Konva and react-konva are client-only libraries
    // Exclude them from server-side bundling to avoid canvas module errors
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        'canvas',
        'konva',
        'react-konva',
      ];
    }
    
    // Ignore canvas module on client as well (not needed in browser)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    
    return config;
  },
};

export default nextConfig;

