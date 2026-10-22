import {
  SelectContent as RekaSelectContent,
  SelectItem as RekaSelectItem,
  SelectItemIndicator as RekaSelectItemIndicator,
  SelectPortal as RekaSelectPortal,
  SelectRoot as RekaSelectRoot,
  SelectValue as RekaSelectValue,
  type SelectContentProps as RekaSelectContentProps,
  type SelectItemIndicatorProps as RekaSelectItemIndicatorProps,
} from 'reka-ui';
import type { Transition } from 'motion-v';

import type { ItemCheckAnimationProps } from '../../../internal/item-indicator';
import {
  createListContent,
  createListItem,
  createListItemIndicator,
  createListPortal,
  createListRoot,
} from '../../../internal/reka-list';
import { withValueSwap } from '../../../internal/value-swap';

type SelectContentProps = RekaSelectContentProps & {
  transition?: Transition;
  exitTransition?: Transition;
};
type SelectItemIndicatorProps = RekaSelectItemIndicatorProps &
  ItemCheckAnimationProps;

/** The select: its open state, and whether it closed on a pick, its parts read. */
const SelectRoot = createListRoot(
  RekaSelectRoot,
  'SelectRoot',
) as unknown as typeof RekaSelectRoot;

const SelectPortal = createListPortal(
  RekaSelectPortal,
  'SelectPortal',
) as unknown as typeof RekaSelectPortal;

/**
 * The list: below the trigger (`position="popper"`), it scales in from 0.9
 * with a fade, from the trigger; over it (item-aligned), it only fades. It
 * leaves the same way, a beat later after a pick, so the check is seen.
 */
const SelectContent = createListContent(RekaSelectContent, 'SelectContent', {
  origin: '--reka-select-content-transform-origin',
}) as unknown as typeof RekaSelectContent;

const SelectItem = createListItem(
  RekaSelectItem,
  'SelectItem',
) as unknown as typeof RekaSelectItem;

const SelectItemIndicator = createListItemIndicator(
  RekaSelectItemIndicator,
  'SelectItemIndicator',
) as unknown as typeof RekaSelectItemIndicator;

/** The picked value: its text swaps through a blur as it changes. */
const SelectValue = withValueSwap(RekaSelectValue, 'SelectValue');

export {
  SelectArrow,
  SelectGroup,
  SelectIcon,
  SelectItemText,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectViewport,
  type SelectRootProps,
  type SelectRootEmits,
  type SelectPortalProps,
  type SelectContentEmits,
  type SelectItemProps,
  type SelectItemEmits,
} from 'reka-ui';

export {
  SelectRoot,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  type SelectContentProps,
  type SelectItemIndicatorProps,
};
