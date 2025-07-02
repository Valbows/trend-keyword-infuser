/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Tactical' Next.js configuration.
   * This configuration establishes the critical communication bridge between the frontend and backend.
   */
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
