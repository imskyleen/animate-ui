import { describePreviewLinkCard } from './preview-link-card';

describePreviewLinkCard({
  library: 'react-aria',
  selector: '[data-slot="preview-link-card-popover"]',
  // PreviewTrigger's defaults.
  openDelay: 600,
  closeDelay: 200,
});
