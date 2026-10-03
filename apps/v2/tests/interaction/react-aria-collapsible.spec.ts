import { disclosureDemoTests } from './disclosure-timeline';

// shadcn's React Aria Collapsible: a Disclosure.
disclosureDemoTests('react-aria collapsible demo', {
  url: '/tests/demos/react-aria/collapsible',
  panel: '[data-slot="collapsible-content"]',
  closed: {
    trigger: 'Show all changes',
    text: 'A CLI that animates your shadcn/ui components',
  },
  // React Aria keeps closed panels mounted, hidden until found.
  closedState: 'hidden',
});
