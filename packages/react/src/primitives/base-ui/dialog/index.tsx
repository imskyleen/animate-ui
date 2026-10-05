// Mirrors `@base-ui/react/dialog`: the `Dialog` namespace of parts, plus the
// flat types (`DialogPopupProps`…), with Animate UI's props on animated parts.
import type { Backdrop, Popup } from './dialog';

export type { DialogFlipDirection } from './dialog';

export * as Dialog from './dialog';
export type * from '@base-ui/react/dialog';
export type DialogBackdropProps = Backdrop.Props;
export type DialogPopupProps = Popup.Props;
