/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: "Flowt AI",
    NEXT_PUBLIC_APP_VERSION: "4.0",
  },
};

module.exports = nextConfig;
