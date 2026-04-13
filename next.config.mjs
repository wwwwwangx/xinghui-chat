/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',   // 允许上传最大 50MB 的请求体
    },
  },
};

export default nextConfig;