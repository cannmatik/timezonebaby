import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['flagcdn.com'], // Bayrak resimleri için izin verilen domain
  },
  // İsteğe bağlı: Deneysel özellikler, webpack ayarları vb. ekleyebilirsiniz.
  experimental: {
    // Örneğin, Turbopack kullanıyorsanız aktif hale getirebilirsiniz:
    // turbopack: true,
  },
};

export default nextConfig;
