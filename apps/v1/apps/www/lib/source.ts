import { docs } from '@/.source';
import { LucideIcons } from '@/components/icons/lucide-icons';
import { attachFile } from '@/lib/attach-file';
import { attachSeparator } from '@/lib/attach-separator';
import AnimateUIIcon from '@workspace/ui/components/icons/animateui-icon';
import {
  loader,
  type InferMetaType,
  type InferPageType,
} from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  pageTree: {
    attachFile,
    attachSeparator,
  },
  icon(icon) {
    if (!icon) return;
    if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
    if (icon === 'AnimateUIIcon') return createElement(AnimateUIIcon);
    if (icon === 'LucideIcons') return createElement(LucideIcons);
  },
});

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;
