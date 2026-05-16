/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Allow the Chrome extension to call these APIs
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, x-api-key" },
        ],
      },
    ];
  },
};
export default nextConfig;
