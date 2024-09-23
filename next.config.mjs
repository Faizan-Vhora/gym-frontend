/** @type {import('next').NextConfig} */
const config = {
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '3.138.244.242',
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
          destination: "/auth/sign-in",
          permanent: true,
        },
      ];
    },
};

export default config;