import {
  Accordion,
  type AccordionPanelProps,
} from '../src/primitives/base-ui/accordion';
import {
  Checkbox,
  type CheckboxIndicatorProps,
} from '../src/primitives/base-ui/checkbox';
import {
  Collapsible,
  type CollapsiblePanelProps,
} from '../src/primitives/base-ui/collapsible';
import {
  Menu,
  type MenuPopupProps,
  type MenuCheckboxItemIndicatorProps,
  type MenuRadioItemIndicatorProps,
} from '../src/primitives/base-ui/menu';
import {
  NavigationMenu,
  type NavigationMenuPopupProps,
  type NavigationMenuContentProps,
} from '../src/primitives/base-ui/navigation-menu';
import {
  Progress,
  type ProgressRootProps,
  type ProgressIndicatorProps,
  type ProgressValueProps,
} from '../src/primitives/base-ui/progress';
import {
  Radio,
  type RadioRootProps,
  type RadioIndicatorProps,
} from '../src/primitives/base-ui/radio';
import {
  Slider,
  type SliderControlProps,
  type SliderIndicatorProps,
  type SliderThumbProps,
} from '../src/primitives/base-ui/slider';
import {
  Switch,
  type SwitchThumbProps,
} from '../src/primitives/base-ui/switch';
import {
  Tabs,
  type TabsRootProps,
  type TabsListProps,
  type TabsTabProps,
  type TabsIndicatorProps,
  type TabsPanelProps,
} from '../src/primitives/base-ui/tabs';
import {
  Toast,
  type ToastProviderProps,
  type ToastRootProps,
  type ToastContentProps,
} from '../src/primitives/base-ui/toast';
import { Toggle, type ToggleProps } from '../src/primitives/base-ui/toggle';
import {
  ToggleGroup,
  type ToggleGroupProps,
} from '../src/primitives/base-ui/toggle-group';
import {
  Tooltip,
  type TooltipRootProps,
} from '../src/primitives/base-ui/tooltip';
import {
  PreviewCard,
  type PreviewCardRootProps,
} from '../src/primitives/base-ui/preview-card';

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

export const flatProps: [
  Same<AccordionPanelProps, Accordion.Panel.Props>,
  Same<CheckboxIndicatorProps, Checkbox.Indicator.Props>,
  Same<CollapsiblePanelProps, Collapsible.Panel.Props>,
  Same<MenuPopupProps, Menu.Popup.Props>,
  Same<MenuCheckboxItemIndicatorProps, Menu.CheckboxItemIndicator.Props>,
  Same<MenuRadioItemIndicatorProps, Menu.RadioItemIndicator.Props>,
  Same<NavigationMenuPopupProps, NavigationMenu.Popup.Props>,
  Same<NavigationMenuContentProps, NavigationMenu.Content.Props>,
  Same<ProgressRootProps, Progress.Root.Props>,
  Same<ProgressIndicatorProps, Progress.Indicator.Props>,
  Same<ProgressValueProps, Progress.Value.Props>,
  Same<RadioRootProps, Radio.Root.Props>,
  Same<RadioIndicatorProps, Radio.Indicator.Props>,
  Same<SliderControlProps, Slider.Control.Props>,
  Same<SliderIndicatorProps, Slider.Indicator.Props>,
  Same<SliderThumbProps, Slider.Thumb.Props>,
  Same<SwitchThumbProps, Switch.Thumb.Props>,
  Same<TabsRootProps, Tabs.Root.Props>,
  Same<TabsListProps, Tabs.List.Props>,
  Same<TabsTabProps, Tabs.Tab.Props>,
  Same<TabsIndicatorProps, Tabs.Indicator.Props>,
  Same<TabsPanelProps, Tabs.Panel.Props>,
  Same<ToastProviderProps, Toast.Provider.Props>,
  Same<ToastRootProps, Toast.Root.Props>,
  Same<ToastContentProps, Toast.Content.Props>,
  Same<ToggleProps, Toggle.Props>,
  Same<ToggleGroupProps, ToggleGroup.Props>,
  Same<TooltipRootProps, Tooltip.Root.Props>,
  Same<PreviewCardRootProps, PreviewCard.Root.Props>,
] = [
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
];
