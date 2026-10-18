import { generateOGImage } from 'fumadocs-ui/og';
import { appName } from '@/lib/shared';

export const revalidate = false;

export function GET() {
  return generateOGImage({
    title: 'Animated primitives for React',
    description:
      'Drop-in primitives for Radix UI, Base UI and React Aria, built with Motion.',
    site: appName,
  });
}
