import { disclosureDemoTests } from './disclosure-timeline';

// shadcn's React Aria Accordion: a DisclosureGroup of Disclosures.
disclosureDemoTests('react-aria accordion demo', {
  url: '/tests/demos/react-aria/accordion',
  panel: '[data-slot="accordion-content"]',
  closed: {
    trigger: 'What is your return policy?',
    text: 'Returns accepted within 30 days',
  },
  open: {
    trigger: 'What are your shipping options?',
    text: 'We offer standard (5-7 days)',
  },
  // React Aria keeps closed panels mounted, hidden until found.
  closedState: 'hidden',
});
