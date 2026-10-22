import { defineComponent, h, type Component } from 'vue';
import { Motion } from 'motion-v';

/**
 * Renders its child, animated: the child takes the motion props (and the
 * other attributes) given to the Slot.
 */
const Slot = defineComponent({
  name: 'Slot',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(Motion as Component, { ...attrs, asChild: true }, slots);
  },
});

export { Slot };
