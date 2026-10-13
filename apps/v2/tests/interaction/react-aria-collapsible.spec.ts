import { disclosureDemoTests } from './disclosure-timeline';

disclosureDemoTests('react-aria collapsible demo', {
  url: '/tests/demos/react-aria/collapsible',
  panel: '[data-slot="collapsible-content"]',
  closed: {
    trigger: 'Toggle details',
    text: '100 Market St, San Francisco',
  },
  closedState: 'hidden',
});
