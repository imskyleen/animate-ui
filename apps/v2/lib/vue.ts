import type { Controls } from '@/components/docs/controls-panel';

/** Vue's own colors, for the logo on the Vue pages. */
export const VUE_COLORS = { green: '#40B883', slate: '#34495E' } as const;

export const isVuePath = (pathname: string) =>
  pathname === '/docs/vue' || pathname.startsWith('/docs/vue/');

/** The tweakpane of each Vue demo in apps/vue-demos, by demo name. */
export const VUE_DEMO_CONTROLS: Record<string, Controls> = {
  'reka-ui/accordion': {
    Accordion: {
      multiple: { value: false },
      collapsible: { value: true },
    },
  },
};
