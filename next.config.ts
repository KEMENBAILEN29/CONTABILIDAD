import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer", "@prisma/client"],
  },
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
