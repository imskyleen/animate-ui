import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/shared';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/examples/', '/tests/', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
