import { createApp, h, reactive, type Component } from 'vue'

type Props = Record<string, unknown>

const demos: Record<string, () => Promise<{ default: Component }>> = {
  'reka-ui/accordion': () => import('./demos/reka-ui/accordion.vue'),
  'reka-ui/collapsible': () => import('./demos/reka-ui/collapsible.vue'),
  'reka-ui/checkbox': () => import('./demos/reka-ui/checkbox.vue'),
  'reka-ui/toggle': () => import('./demos/reka-ui/toggle.vue'),
  'fixtures/reka-ui-toggle': () => import('./fixtures/reka-ui-toggle.vue'),
  'reka-ui/progress': () => import('./demos/reka-ui/progress.vue'),
  'fixtures/reka-ui-progress': () => import('./fixtures/reka-ui-progress.vue'),
  'reka-ui/switch': () => import('./demos/reka-ui/switch.vue'),
  'fixtures/reka-ui-checkbox': () => import('./fixtures/reka-ui-checkbox.vue'),
  'fixtures/reka-ui-switch': () => import('./fixtures/reka-ui-switch.vue'),
  'fixtures/reka-ui-accordion': () =>
    import('./fixtures/reka-ui-accordion.vue'),
  'fixtures/reka-ui-collapsible': () =>
    import('./fixtures/reka-ui-collapsible.vue'),
}

export const names = Object.keys(demos)

/** Mounts a demo into `element`; the handle updates its props and unmounts it. */
export async function mount(name: string, element: Element, props: Props = {}) {
  const load = demos[name]
  if (!load) throw new Error(`No Vue demo named "${name}"`)
  const { default: Demo } = await load()
  const state = reactive({ ...props })
  const app = createApp({ render: () => h(Demo, state) })
  app.mount(element)
  return {
    update(next: Props) {
      for (const key of Object.keys(state)) if (!(key in next)) delete state[key]
      Object.assign(state, next)
    },
    unmount() {
      app.unmount()
    },
  }
}
