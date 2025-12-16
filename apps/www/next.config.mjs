import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        hostname: 'ui.aceternity.com',
      },
      {
        hostname: 'ui.paceui.com',
      },
      {
        hostname: 'images.pexels.com',
      },
      {
        hostname: 'ph-files.imgix.net',
      },
      {
        hostname: 'headlessui.com',
      },
      {
        hostname: '30tools.com',
      },
    ],
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/docs/components/avatar-group',
        destination: '/docs/components/animate/avatar-group',
        permanent: true,
      },
      {
        source: '/docs/components/code-editor',
        destination: '/docs/components/animate/code',
        permanent: true,
      },
      {
        source: '/docs/components/code-tabs',
        destination: '/docs/components/animate/code-tabs',
        permanent: true,
      },
      {
        source: '/docs/components/cursor',
        destination: '/docs/components/animate/cursor',
        permanent: true,
      },
      {
        source: '/docs/components/files',
        destination: '/docs/components/radix/files',
        permanent: true,
      },
      {
        source: '/docs/components/motion-grid',
        destination: '/docs/primitives/animate/motion-grid',
        permanent: true,
      },
      {
        source: '/docs/components/pinned-list',
        destination: '/docs/primitives/animate/pinned-list',
        permanent: true,
      },
      {
        source: '/docs/components/scroll-progress',
        destination: '/docs/primitives/animate/scroll-progress',
        permanent: true,
      },
      {
        source: '/docs/components/spring-element',
        destination: '/docs/primitives/animate/spring',
        permanent: true,
      },
      {
        source: '/docs/components/stars-scrolling-wheel',
        destination: '/docs/components/animate/github-stars-wheel',
        permanent: true,
      },
      {
        source: '/docs/components/tabs',
        destination: '/docs/components/animate/tabs',
        permanent: true,
      },
      {
        source: '/docs/components/tooltip',
        destination: '/docs/components/animate/tooltip',
        permanent: true,
      },
      {
        source: '/docs/radix/:path*',
        destination: '/docs/components/radix/:path*',
        permanent: true,
      },
      {
        source: '/docs/base/:path*',
        destination: '/docs/components/radix/:path*',
        permanent: true,
      },
      {
        source: '/docs/headless/:path*',
        destination: '/docs/components/radix/:path*',
        permanent: true,
      },
      {
        source: '/docs/buttons/:path*',
        destination: '/docs/primitives/buttons/:path*',
        permanent: true,
      },
      {
        source: '/docs/backgrounds/:path*',
        destination: '/docs/components/backgrounds/:path*',
        permanent: true,
      },
      {
        source: '/docs/effects/motion-effect',
        destination: '/docs/primitives/effects/effect',
        permanent: true,
      },
      {
        source: '/docs/effects/motion-highlight',
        destination: '/docs/primitives/effects/highlight',
        permanent: true,
      },
      {
        source: '/docs/effects/:path*',
        destination: '/docs/primitives/effects/:path*',
        permanent: true,
      },
      {
        source: '/docs/ui-elements/:path*',
        destination: '/docs/components/community/:path*',
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
