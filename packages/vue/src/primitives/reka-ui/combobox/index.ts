import {
  ComboboxContent as RekaComboboxContent,
  ComboboxItem as RekaComboboxItem,
  ComboboxItemIndicator as RekaComboboxItemIndicator,
  ComboboxPortal as RekaComboboxPortal,
  ComboboxRoot as RekaComboboxRoot,
  type ComboboxContentProps as RekaComboboxContentProps,
  type ComboboxItemIndicatorProps as RekaComboboxItemIndicatorProps,
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

type ComboboxContentProps = RekaComboboxContentProps & {
  transition?: Transition;
  exitTransition?: Transition;
};
type ComboboxItemIndicatorProps = RekaComboboxItemIndicatorProps &
  ItemCheckAnimationProps;

/** The combobox: its open state, and whether it closed on a pick, its parts read. */
const ComboboxRoot = createListRoot(
  RekaComboboxRoot,
  'ComboboxRoot',
) as unknown as typeof RekaComboboxRoot;

const ComboboxPortal = createListPortal(
  RekaComboboxPortal,
  'ComboboxPortal',
) as unknown as typeof RekaComboboxPortal;

/**
 * The list: from its anchor (`position="popper"`), it scales in from 0.9
 * with a fade; inline, it only fades. It leaves the same way, a beat later
 * after a pick, so the check is seen.
 */
const ComboboxContent = createListContent(
  RekaComboboxContent,
  'ComboboxContent',
  { origin: '--reka-combobox-content-transform-origin' },
) as unknown as typeof RekaComboboxContent;

const ComboboxItem = createListItem(
  RekaComboboxItem,
  'ComboboxItem',
) as unknown as typeof RekaComboboxItem;

const ComboboxItemIndicator = createListItemIndicator(
  RekaComboboxItemIndicator,
  'ComboboxItemIndicator',
) as unknown as typeof RekaComboboxItemIndicator;

export {
  ComboboxAnchor,
  ComboboxArrow,
  ComboboxCancel,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxLabel,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxViewport,
  ComboboxVirtualizer,
  type ComboboxRootProps,
  type ComboboxRootEmits,
  type ComboboxPortalProps,
  type ComboboxContentEmits,
  type ComboboxItemProps,
  type ComboboxItemEmits,
} from 'reka-ui';

export {
  ComboboxRoot,
  ComboboxPortal,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemIndicator,
  type ComboboxContentProps,
  type ComboboxItemIndicatorProps,
};
