import { disclosureDemoTests } from './disclosure-timeline';

// shadcn's React Aria Accordion: a DisclosureGroup of Disclosures.
disclosureDemoTests('react-aria accordion demo', {
  url: '/tests/demos/react-aria/accordion',
  panel: '[data-slot="accordion-content"]',
  closed: {
    trigger: 'How is it different from other libraries?',
    text: 'You keep your own components',
  },
  open: {
    trigger: 'What is Animate UI?',
    text: 'Animated drop-in primitives',
  },
  // React Aria keeps closed panels mounted, hidden until found.
  closedState: 'hidden',
});
