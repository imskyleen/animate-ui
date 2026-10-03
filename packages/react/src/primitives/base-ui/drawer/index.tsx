// Mirrors `@base-ui/react/drawer`: the `Drawer` namespace of parts, plus the
// flat types, with Animate UI's props on animated parts.
import type { Backdrop, Popup } from './drawer';

export * as Drawer from './drawer';
export type * from '@base-ui/react/drawer';
export type DrawerBackdropProps = Backdrop.Props;
export type DrawerPopupProps = Popup.Props;
