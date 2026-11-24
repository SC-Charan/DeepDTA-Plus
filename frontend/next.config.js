/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Vercel handles image optimization natively
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pubchem.ncbi.nlm.nih.gov" },
    ],
    unoptimized: false,
  },
  // Proxy to FastAPI backend and serve 3D front-end at root
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL;
    const backendRewrites = backend
      ? [
          {
            source: "/api/backend/:path*",
            destination: `${backend}/:path*`,
          },
        ]
      : [];

    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/demo.html",
        },
      ],
      afterFiles: backendRewrites,
      fallback: [],
    };
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
