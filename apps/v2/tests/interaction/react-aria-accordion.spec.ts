import { disclosureDemoTests } from './disclosure-timeline';

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
  closedState: 'hidden',
});
