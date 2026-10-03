// Mirrors `@base-ui/react/select`:
//   import { Select as SelectPrimitive } from '@base-ui/react/select'
import type { ItemIndicator, Popup } from './select';

export * as Select from './select';
export type * from '@base-ui/react/select';

// The animated parts' flat types include Animate UI's props.
export type SelectPopupProps = Popup.Props;
export type SelectItemIndicatorProps = ItemIndicator.Props;
