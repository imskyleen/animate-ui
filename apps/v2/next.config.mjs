import { createMDX } from 'fumadocs-mdx/next';

import v1Redirects from './v1-redirects.json' with { type: 'json' };

const withMDX = createMDX();

const V1 = 'https://v1.animate-ui.com';

/** Old v1 doc URLs without a v2 page stay readable on the v1 site. */
const toV1 = [
  '/docs/components/:path*',
  '/docs/primitives/:group(radix|base|headless|animate|buttons|effects|texts)/:path*',
  '/docs/:group(radix|base|headless|buttons|effects|ui-elements)/:path*',
  '/docs/:page(roadmap|troubleshooting|other-animated-distributions)',
].map((source) => ({
  source,
  destination: V1 + source.replace(/\([^)]*\)/g, ''),
  permanent: true,
}));

const config = {
  reactStrictMode: false,
  transpilePackages: ['@animate-ui/react'],
  async redirects() {
    return [
      ...v1Redirects,
      {
        source: '/docs/icons/usage/:path*',
        destination: '/docs/icons/get-started',
        permanent: true,
      },
      ...toV1,
    ];
  },
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
