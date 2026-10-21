import type { Metadata } from 'next';

import type { Controls } from '@/components/docs/controls-panel';

/** Vue's own colors, for the logo on the Vue pages. */
export const VUE_COLORS = { green: '#40B883', slate: '#34495E' } as const;

export const isVuePath = (pathname: string) =>
  pathname === '/docs/vue' || pathname.startsWith('/docs/vue/');

export const VUE_HOME = '/vue';

/** The site's favicons, in Vue green on the Vue pages. */
export const siteIcons = (vue = false): Metadata['icons'] => {
  const suffix = vue ? '-vue' : '';
  return [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: `/favicon${suffix}-32x32.png`,
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: `/favicon${suffix}-16x16.png`,
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: `/apple-touch-icon${suffix}.png`,
    },
  ];
};

/** The framework a home page or a docs page is about. */
export const frameworkOf = (pathname: string) =>
  pathname === VUE_HOME || isVuePath(pathname) ? 'vue' : 'react';

/** The tweakpane of each Vue demo in apps/vue-demos, by demo name. */
export const VUE_DEMO_CONTROLS: Record<string, Controls> = {
  'reka-ui/accordion': {
    Accordion: {
      multiple: { value: false },
      collapsible: { value: true },
    },
  },
  'reka-ui/toggle-group': {
    ToggleGroup: {
      multiple: { value: true },
      variant: {
        value: 'outline',
        options: { default: 'default', outline: 'outline' },
      },
      size: {
        value: 'default',
        options: { default: 'default', sm: 'sm', lg: 'lg' },
      },
      spacing: { value: 0, min: 0, max: 4, step: 1 },
    },
  },
  'reka-ui/checkbox': {
    Checkbox: {
      checked: {
        value: true,
        options: { true: true, false: false, indeterminate: 'indeterminate' },
      },
    },
    AnimateUIProvider: {
      checkAnimation: { value: 'draw', options: { draw: 'draw', pop: 'pop' } },
    },
  },
};
