// Mirrors `@base-ui/react/tooltip`: the `Tooltip` namespace (with each part's
// `Props`/`State` types) and the flat types.
import type { Popup } from './tooltip';

export * as Tooltip from './tooltip';
export type * from '@base-ui/react/tooltip';
/** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
export type TooltipPopupProps = Popup.Props;
