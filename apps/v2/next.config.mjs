import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const config = {
  reactStrictMode: false,
  transpilePackages: ['@animate-ui/react'],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/r/v1/:path*',
          destination: 'https://v1.animate-ui.com/r/:path*',
        },
      ],
      fallback: [
        {
          source: '/r/:path*',
          destination: 'https://v1.animate-ui.com/r/:path*',
        },
      ],
    };
  },
};

export default withMDX(config);
