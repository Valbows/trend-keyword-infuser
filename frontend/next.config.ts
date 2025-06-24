import type { NextConfig } from 'next';

// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Elegant' Proxy Configuration
const nextConfig: NextConfig = {
  // 'Clairvoyant' and 'Tactical' rewrite rule to bridge frontend and backend.
  // This 'Altruistically' directs all API calls to the correct backend service,
  // ensuring 'Durable' and seamless communication.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
