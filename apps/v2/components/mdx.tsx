import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';

import {
  Callout,
  CalloutContainer,
  CalloutDescription,
  CalloutTitle,
} from './docs/callout';
import { Card, Cards } from './docs/cards';
import { LucideLogo } from '@/lib/icon-libraries';
import { CodeBlock, Pre, type CodeBlockProps } from './docs/codeblock';
import { ComponentPreview } from './docs/component-preview';
import { IconsGallery } from './docs/icons-gallery';
import {
  BackgroundsGrid,
  IconLibrariesGrid,
  PrimitivesGrid,
} from './docs/preview-grids';
import { Installation } from './docs/installation';
import { RegistryInstallation } from './docs/registry-installation';
import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  Tab,
  Tabs,
} from './docs/tabs';
import { TypeTable } from './docs/type-table';

// Fumadocs stays the primitive layer (MDX pipeline, Shiki, headings, links);
// what readers see is Animate UI's components, in v1's design.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    pre: (props: ComponentProps<'pre'> & CodeBlockProps) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    CodeBlockTab,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    Tab,
    Tabs,
    Callout,
    CalloutContainer,
    CalloutDescription,
    CalloutTitle,
    Card,
    LucideLogo,
    Cards,
    ComponentPreview,
    IconsGallery,
    PrimitivesGrid,
    BackgroundsGrid,
    IconLibrariesGrid,
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
