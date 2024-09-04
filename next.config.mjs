/** @type {import('next').NextConfig} */
const config = {
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '192.168.1.16',
            port: '3001',
            pathname: '/public/**',
          },
          {
              protocol: 'http',
              hostname: 'localhost',
              port: '3001',
              pathname: '/public/**',
            },
        ],
      }
};

export default config;