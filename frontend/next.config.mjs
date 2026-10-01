/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Khi chạy production / Docker build, mặc định trỏ tới http://backend:8000
    // Khi chạy development trên máy local (ngoài Docker), mặc định trỏ tới http://127.0.0.1:8000
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      (process.env.IS_DOCKER ? 'http://backend:8000' : 'http://127.0.0.1:8000');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${backendUrl}/health`,
      },
    ];
  },
};

export default nextConfig;
