import { describePreviewLinkCard } from './preview-link-card';

describePreviewLinkCard({
  library: 'base-ui',
  selector: '[data-slot="preview-link-card-popup"]',
  // Base UI's defaults (v1's demo keeps them).
  openDelay: 600,
  closeDelay: 300,
});
