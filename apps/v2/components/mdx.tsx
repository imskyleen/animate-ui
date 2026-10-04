import { TypeTable } from 'fumadocs-ui/components/type-table';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { ComponentPreview } from './docs/component-preview';
import { IconsGallery } from './docs/icons-gallery';
import { Installation } from './docs/installation';
import { RegistryInstallation } from './docs/registry-installation';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    IconsGallery,
    Installation,
    RegistryInstallation,
    TypeTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
