import type { ToggleGroup } from './toggle-group';

export { ToggleGroup } from './toggle-group';
export type * from '@base-ui/react/toggle-group';
export type ToggleGroupProps<Value extends string = string> =
  ToggleGroup.Props<Value>;
