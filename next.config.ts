import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['flagcdn.com'], // Bayrak resimleri için izin verilen domain
  },
  eslint: {
    ignoreDuringBuilds: true, // Üretim build sırasında ESLint hatalarını yoksay
  },
  experimental: {
    // İsteğe bağlı: Deneysel özellikler (örneğin Turbopack) buraya eklenebilir
    // turbopack: true,
  },
};

export default nextConfig;
