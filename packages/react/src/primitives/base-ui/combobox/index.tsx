// Mirrors `@base-ui/react/combobox` (and the `Combobox` of `@base-ui/react`):
//   import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import type { Chip, ItemIndicator, Popup } from './combobox';

export * as Combobox from './combobox';
export type * from '@base-ui/react/combobox';

// The animated parts' flat types include Animate UI's props.
export type ComboboxPopupProps = Popup.Props;
export type ComboboxItemIndicatorProps = ItemIndicator.Props;
export type ComboboxChipProps = Chip.Props;
