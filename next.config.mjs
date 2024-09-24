/** @type {import('next').NextConfig} */
const config = {
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '18.188.170.111',
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
    experimental: {esmExternals: false,},
    async redirects() {
      return [
        {
          source: "/",
          destination: "/dashboard",
          permanent: true,
        },
      ];
    },
};

export default config;