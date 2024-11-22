/** @type {import('next').NextConfig} */
const config = {
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '3.135.82.239',
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
        // disableStaticImages: true,
      },
    experimental: {esmExternals: false,},
    reactStrictMode: true,
    async redirects() {
      return [
        {
          source: "/",
          destination: "/admin/dashboard",
          permanent: true,
        },
      ];
    },

};

export default config;
