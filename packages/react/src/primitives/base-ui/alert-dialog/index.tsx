// Mirrors `@base-ui/react/alert-dialog`: the `AlertDialog` namespace of parts,
// plus the flat types, with Animate UI's props on animated parts.
import type { Backdrop, Popup } from './alert-dialog';

export type { AlertDialogFlipDirection } from './alert-dialog';

export * as AlertDialog from './alert-dialog';
export type * from '@base-ui/react/alert-dialog';
export type AlertDialogBackdropProps = Backdrop.Props;
export type AlertDialogPopupProps = Popup.Props;
