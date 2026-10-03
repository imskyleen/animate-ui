import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // The workspace package is consumed from its sources.
  transpilePackages: ['@animate-ui/react'],
  // v1 registry items (`shadcn add @animate-ui/<v1 item>`) that v2 doesn't
  // serve keep resolving from the v1 site.
  async rewrites() {
    return {
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
