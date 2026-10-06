import { disclosureDemoTests } from './disclosure-timeline';

// shadcn's React Aria Collapsible: a Disclosure.
disclosureDemoTests('react-aria collapsible demo', {
  url: '/tests/demos/react-aria/collapsible',
  panel: '[data-slot="collapsible-content"]',
  closed: {
    trigger: 'Toggle details',
    text: '100 Market St, San Francisco',
  },
  // React Aria keeps closed panels mounted, hidden until found.
  closedState: 'hidden',
});
