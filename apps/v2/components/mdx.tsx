import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { ComponentPreview } from './docs/component-preview';
import { Installation } from './docs/installation';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    Installation,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
