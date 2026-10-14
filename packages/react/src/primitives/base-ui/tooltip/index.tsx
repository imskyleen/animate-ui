import type { Popup, Root } from './tooltip';

export * as Tooltip from './tooltip';
export type * from '@base-ui/react/tooltip';
export type TooltipPopupProps = Popup.Props;
export type TooltipRootProps<Payload = unknown> = Root.Props<Payload>;
