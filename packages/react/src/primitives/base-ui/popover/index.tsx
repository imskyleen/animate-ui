// Mirrors `@base-ui/react/popover`: the `Popover` namespace (with each part's
// `Props`/`State` types) and the flat types.
import type { Popup } from './popover';

export * as Popover from './popover';
export type * from '@base-ui/react/popover';
/** Base UI's props, plus Animate UI's `transition` and `exitTransition`. */
export type PopoverPopupProps = Popup.Props;
