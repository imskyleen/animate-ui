import { describePreviewLinkCard } from './preview-link-card';

describePreviewLinkCard({
  library: 'radix-ui',
  selector: '[data-slot="preview-link-card-content"]',
  // Radix's defaults (v1's demo keeps them).
  openDelay: 700,
  closeDelay: 300,
});
