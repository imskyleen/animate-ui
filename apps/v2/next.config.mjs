import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // The workspace package is consumed from its sources.
  transpilePackages: ['@animate-ui/react'],
};

export default withMDX(config);
