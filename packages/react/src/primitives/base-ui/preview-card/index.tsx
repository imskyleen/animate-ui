import type { Popup, Root } from './preview-card';

export * as PreviewCard from './preview-card';
export type * from '@base-ui/react/preview-card';
export type PreviewCardPopupProps = Popup.Props;
export type PreviewCardRootProps<Payload = unknown> = Root.Props<Payload>;
