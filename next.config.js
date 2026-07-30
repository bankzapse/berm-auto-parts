/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // เราจะ lint แยกต่างหาก ไม่ให้ build ล้มเพราะ warning
    ignoreDuringBuilds: true,
  },
  images: {
    // ใช้ <img> ธรรมดา แต่เผื่อไว้กรณีใช้ next/image ในอนาคต
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

module.exports = nextConfig;
