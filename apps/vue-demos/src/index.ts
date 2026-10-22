import { createApp, h, reactive, type Component } from 'vue';

type Props = Record<string, unknown>;

const demos: Record<string, () => Promise<{ default: Component }>> = {
  'animate-ui/auto-height': () => import('./demos/animate-ui/auto-height.vue'),
  'animate-ui/image-zoom': () => import('./demos/animate-ui/image-zoom.vue'),
  'animate-ui/scroll-fade': () =>
    import('./demos/animate-ui/scroll-fade.vue'),
  'animate-ui/shine': () => import('./demos/animate-ui/shine.vue'),
  'animate-ui/magnetic': () => import('./demos/animate-ui/magnetic.vue'),
  'animate-ui/tilt': () => import('./demos/animate-ui/tilt.vue'),
  'animate-ui/blur': () => import('./demos/animate-ui/blur.vue'),
  'animate-ui/effect': () => import('./demos/animate-ui/effect.vue'),
  'animate-ui/fade': () => import('./demos/animate-ui/fade.vue'),
  'animate-ui/slide': () => import('./demos/animate-ui/slide.vue'),
  'animate-ui/zoom': () => import('./demos/animate-ui/zoom.vue'),
  'animate-ui/click': () => import('./demos/animate-ui/click.vue'),
  'animate-ui/counting-number': () =>
    import('./demos/animate-ui/counting-number.vue'),
  'animate-ui/morphing-text': () =>
    import('./demos/animate-ui/morphing-text.vue'),
  'animate-ui/rotating-text': () =>
    import('./demos/animate-ui/rotating-text.vue'),
  'animate-ui/splitting-text': () =>
    import('./demos/animate-ui/splitting-text.vue'),
  'animate-ui/scrolling-number': () =>
    import('./demos/animate-ui/scrolling-number.vue'),
  'animate-ui/sliding-number': () =>
    import('./demos/animate-ui/sliding-number.vue'),
  'animate-ui/shimmering-text': () =>
    import('./demos/animate-ui/shimmering-text.vue'),
  'animate-ui/sliding-text': () =>
    import('./demos/animate-ui/sliding-text.vue'),
  'animate-ui/gradient-text': () =>
    import('./demos/animate-ui/gradient-text.vue'),
  'animate-ui/highlight': () =>
    import('./demos/animate-ui/highlight.vue'),
  'animate-ui/highlight-text': () =>
    import('./demos/animate-ui/highlight-text.vue'),
  'animate-ui/swapping-text': () =>
    import('./demos/animate-ui/swapping-text.vue'),
  'animate-ui/typing-text': () =>
    import('./demos/animate-ui/typing-text.vue'),
  'animate-ui/particles': () => import('./demos/animate-ui/particles.vue'),
  'animate-ui/theme-toggler': () => import('./demos/animate-ui/theme-toggler.vue'),
  'animate-ui/rolling-text': () =>
    import('./demos/animate-ui/rolling-text.vue'),
  'reka-ui/accordion': () => import('./demos/reka-ui/accordion.vue'),
  'reka-ui/collapsible': () => import('./demos/reka-ui/collapsible.vue'),
  'reka-ui/checkbox': () => import('./demos/reka-ui/checkbox.vue'),
  'reka-ui/toggle': () => import('./demos/reka-ui/toggle.vue'),
  'reka-ui/dialog': () => import('./demos/reka-ui/dialog.vue'),
  'reka-ui/alert-dialog': () => import('./demos/reka-ui/alert-dialog.vue'),
  'reka-ui/sheet': () => import('./demos/reka-ui/sheet.vue'),
  'reka-ui/dropdown-menu': () => import('./demos/reka-ui/dropdown-menu.vue'),
  'reka-ui/combobox': () => import('./demos/reka-ui/combobox.vue'),
  'reka-ui/context-menu': () => import('./demos/reka-ui/context-menu.vue'),
  'reka-ui/menubar': () => import('./demos/reka-ui/menubar.vue'),
  'reka-ui/select': () => import('./demos/reka-ui/select.vue'),
  'reka-ui/slider': () => import('./demos/reka-ui/slider.vue'),
  'reka-ui/tabs': () => import('./demos/reka-ui/tabs.vue'),
  'reka-ui/navigation-menu': () =>
    import('./demos/reka-ui/navigation-menu.vue'),
  'reka-ui/popover': () => import('./demos/reka-ui/popover.vue'),
  'reka-ui/tooltip': () => import('./demos/reka-ui/tooltip.vue'),
  'reka-ui/hover-card': () => import('./demos/reka-ui/hover-card.vue'),
  'reka-ui/toggle-group': () => import('./demos/reka-ui/toggle-group.vue'),
  'reka-ui/preview-link-card': () =>
    import('./demos/reka-ui/preview-link-card.vue'),
  'reka-ui/radio-group': () => import('./demos/reka-ui/radio-group.vue'),
  'fixtures/animate-ui-highlight-cases': () =>
    import('./fixtures/animate-ui-highlight-cases.vue'),
  'fixtures/animate-ui-scroll-fade': () =>
    import('./fixtures/animate-ui-scroll-fade.vue'),
  'fixtures/animate-ui-image-zoom-props': () =>
    import('./fixtures/animate-ui-image-zoom-props.vue'),
  'fixtures/reka-ui-toggle': () => import('./fixtures/reka-ui-toggle.vue'),
  'fixtures/reka-ui-dialog': () => import('./fixtures/reka-ui-dialog.vue'),
  'fixtures/reka-ui-menubar': () => import('./fixtures/reka-ui-menubar.vue'),
  'fixtures/reka-ui-navigation-menu': () =>
    import('./fixtures/reka-ui-navigation-menu.vue'),
  'fixtures/reka-ui-navigation-menu-swap': () =>
    import('./fixtures/reka-ui-navigation-menu-swap.vue'),
  'fixtures/reka-ui-select': () => import('./fixtures/reka-ui-select.vue'),
  'fixtures/reka-ui-slider': () => import('./fixtures/reka-ui-slider.vue'),
  'fixtures/reka-ui-tabs': () => import('./fixtures/reka-ui-tabs.vue'),
  'fixtures/reka-ui-tabs-indicator-mount': () =>
    import('./fixtures/reka-ui-tabs-indicator-mount.vue'),
  'fixtures/reka-ui-menubar-triggers': () =>
    import('./fixtures/reka-ui-menubar-triggers.vue'),
  'fixtures/reka-ui-dropdown-menu': () =>
    import('./fixtures/reka-ui-dropdown-menu.vue'),
  'fixtures/reka-ui-combobox': () => import('./fixtures/reka-ui-combobox.vue'),
  'fixtures/reka-ui-context-menu': () =>
    import('./fixtures/reka-ui-context-menu.vue'),
  'fixtures/reka-ui-follow-cursor': () =>
    import('./fixtures/reka-ui-follow-cursor.vue'),
  'fixtures/reka-ui-popover': () => import('./fixtures/reka-ui-popover.vue'),
  'fixtures/reka-ui-tooltip': () => import('./fixtures/reka-ui-tooltip.vue'),
  'fixtures/reka-ui-hover-card': () =>
    import('./fixtures/reka-ui-hover-card.vue'),
  'fixtures/reka-ui-sheet-side': () =>
    import('./fixtures/reka-ui-sheet-side.vue'),
  'fixtures/reka-ui-toggle-group': () =>
    import('./fixtures/reka-ui-toggle-group.vue'),
  'fixtures/reka-ui-toggle-group-surfaces': () =>
    import('./fixtures/reka-ui-toggle-group-surfaces.vue'),
  'fixtures/preview-link-card': () =>
    import('./fixtures/preview-link-card.vue'),
  'fixtures/reka-ui-radio-group': () =>
    import('./fixtures/reka-ui-radio-group.vue'),
  'reka-ui/progress': () => import('./demos/reka-ui/progress.vue'),
  'fixtures/reka-ui-progress': () => import('./fixtures/reka-ui-progress.vue'),
  'reka-ui/switch': () => import('./demos/reka-ui/switch.vue'),
  'fixtures/reka-ui-checkbox': () => import('./fixtures/reka-ui-checkbox.vue'),
  'fixtures/reka-ui-switch': () => import('./fixtures/reka-ui-switch.vue'),
  'fixtures/reka-ui-accordion': () =>
    import('./fixtures/reka-ui-accordion.vue'),
  'fixtures/reka-ui-collapsible': () =>
    import('./fixtures/reka-ui-collapsible.vue'),
};

export const names = Object.keys(demos);

/** Mounts a demo into `element`; the handle updates its props and unmounts it. */
export async function mount(name: string, element: Element, props: Props = {}) {
  const load = demos[name];
  if (!load) throw new Error(`No Vue demo named "${name}"`);
  const { default: Demo } = await load();
  const state = reactive({ ...props });
  const app = createApp({ render: () => h(Demo, state) });
  app.mount(element);
  return {
    update(next: Props) {
      for (const key of Object.keys(state))
        if (!(key in next)) delete state[key];
      Object.assign(state, next);
    },
    unmount() {
      app.unmount();
    },
  };
}
