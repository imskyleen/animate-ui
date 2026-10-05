import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen } from 'lucide-react';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  links: [
    {
      type: 'separator',
      name: 'Guide',
      icon: <BookOpen fill="currentColor" strokeWidth={2.5} />,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    {
      text: 'Introduction',
      url: '/docs',
      secondary: false,
    },
    {
      text: 'Installation',
      url: '/docs/installation',
      secondary: false,
    },
    {
      text: 'Accessibility',
      url: '/docs/accessibility',
      secondary: false,
    },
    {
      text: 'MCP',
      url: '/docs/mcp',
      secondary: false,
    },
    {
      text: 'Troubleshooting',
      url: '/docs/troubleshooting',
      secondary: false,
    },
    {
      text: 'Changelog',
      url: '/docs/changelog',
      secondary: false,
    },
    {
      text: 'Roadmap',
      url: '/docs/roadmap',
      secondary: false,
    },
    {
      text: 'Other animated distributions',
      url: '/docs/other-animated-distributions',
      secondary: false,
    },
  ],
};
