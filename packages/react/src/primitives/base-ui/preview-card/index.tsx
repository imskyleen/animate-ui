// Mirrors `@base-ui/react/preview-card`: the `PreviewCard` namespace (with
// each part's `Props`/`State` types) and the flat types.
import type { Popup } from './preview-card';

export * as PreviewCard from './preview-card';
export type * from '@base-ui/react/preview-card';
/** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
export type PreviewCardPopupProps = Popup.Props;
