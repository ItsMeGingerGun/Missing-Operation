/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: ['i.imgur.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'Access-Control-Allow-Origin', value: '*' }
        ]
      },
      {
        source: '/.well-known/farcaster.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Access-Control-Allow-Origin', value: '*' }
        ]
      }
    ];
  }
};
