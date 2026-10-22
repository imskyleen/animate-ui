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
import {
  Changelog,
  ChangelogItem,
  ChangelogItemDescription,
  ChangelogItemTitle,
  ChangelogItemVersion,
} from './docs/changelog';
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
import { PageTransitionEffects } from './docs/page-transition-effects';
import { VueComponentPreview } from './docs/vue-component-preview';
import {
  RegistryInstallation,
  VueRegistryInstallation,
} from './docs/registry-installation';
import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  Tab,
  Tabs,
} from './docs/tabs';
import { TypeTable } from './docs/type-table';

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
    VueRegistryInstallation,
    PageTransitionEffects,
    VueComponentPreview,
    Changelog,
    ChangelogItem,
    ChangelogItemDescription,
    ChangelogItemTitle,
    ChangelogItemVersion,
    TypeTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
