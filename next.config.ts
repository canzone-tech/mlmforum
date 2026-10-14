import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    return [{
      source: "/teamwork.jpg",
      destination: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85"
    }];
  }
};
export default config;
