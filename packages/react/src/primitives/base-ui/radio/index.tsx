import type { Indicator, Root } from './radio';

export * as Radio from './radio';
export type * from '@base-ui/react/radio';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RadioRootProps<Value = any> = Root.Props<Value>;
export type RadioIndicatorProps = Indicator.Props;
