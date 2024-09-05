/** @type {import('next').NextConfig} */
const config = {
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '18.217.76.208',
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
      },
    experimental: {esmExternals: false,}
};

export default config;