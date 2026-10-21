import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  useId,
  type InjectionKey,
} from 'vue';
import {
  MenubarCheckboxItem as RekaMenubarCheckboxItem,
  MenubarContent as RekaMenubarContent,
  MenubarItem as RekaMenubarItem,
  MenubarItemIndicator as RekaMenubarItemIndicator,
  MenubarMenu as RekaMenubarMenu,
  MenubarPortal as RekaMenubarPortal,
  MenubarRadioGroup as RekaMenubarRadioGroup,
  MenubarRadioItem as RekaMenubarRadioItem,
  MenubarRoot as RekaMenubarRoot,
  MenubarSub as RekaMenubarSub,
  MenubarSubContent as RekaMenubarSubContent,
  MenubarSubTrigger as RekaMenubarSubTrigger,
  MenubarTrigger as RekaMenubarTrigger,
  type MenubarContentProps as RekaMenubarContentProps,
  type MenubarItemIndicatorProps as RekaMenubarItemIndicatorProps,
  type MenubarSubContentProps as RekaMenubarSubContentProps,
} from 'reka-ui';
import type { Transition } from 'motion-v';

import { ReducedMotionConfig } from '../../../utils/motion';
import {
  createMenuCheckItem,
  createMenuContent,
  createMenuItem,
  createMenuItemIndicator,
  createMenuPortal,
  createMenuRadioGroup,
  createMenuRoot,
  MenuStateKey,
} from '../../../internal/reka-menu';
import {
  provideTriggerHighlightScope,
  useTriggerHighlight,
} from '../../../internal/item-highlight';
import { provideHandoffGroup } from '../../../internal/menu-handoff';
import {
  providePicks,
  type ItemCheckAnimationProps,
  type Picked,
} from '../../../internal/item-indicator';

type PresenceAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type MenubarContentProps = RekaMenubarContentProps & PresenceAnimationProps;
type MenubarSubContentProps = RekaMenubarSubContentProps &
  PresenceAnimationProps;
type MenubarItemIndicatorProps = RekaMenubarItemIndicatorProps &
  ItemCheckAnimationProps;

const ORIGIN = '--reka-menubar-content-transform-origin';

type MenubarState = { value: () => string; picked: () => Picked };

const MenubarStateKey: InjectionKey<MenubarState> = Symbol(
  'AnimateUIMenubarState',
);

const isOn = (value: unknown) => value === '' || value === true;

const elementOf = (node: unknown) =>
  ((node as { $el?: unknown } | null)?.$el ?? node) as HTMLElement | null;

/** The menubar: one popover handed from menu to menu, one highlight along its triggers. */
const MenubarRoot = defineComponent({
  name: 'MenubarRoot',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    const own = ref(props.defaultValue);
    const value = () =>
      props.modelValue === undefined ? own.value : props.modelValue;
    const picked = ref<Picked>(false);
    const picks = providePicks();
    provide(MenubarStateKey, { value, picked: () => picked.value });
    provideHandoffGroup();
    provideTriggerHighlightScope();
    const setValue = (next: string) => {
      picked.value = next === '' && picks.wasPicked();
      own.value = next;
      emit('update:modelValue', next);
    };
    return () =>
      h(ReducedMotionConfig, null, () =>
        h(
          RekaMenubarRoot,
          {
            ...attrs,
            style: [{ isolation: 'isolate' }, attrs.style],
            modelValue: value(),
            'onUpdate:modelValue': (next: unknown) =>
              setValue(String(next ?? '')),
          },
          slots,
        ),
      );
  },
}) as unknown as typeof RekaMenubarRoot;

const MenubarMenu = defineComponent({
  name: 'MenubarMenu',
  inheritAttrs: false,
  props: { value: String },
  setup(props, { attrs, slots }) {
    const fallback = useId();
    const value = computed(() => props.value || fallback);
    const menubar = inject(MenubarStateKey, null);
    if (menubar)
      provide(MenuStateKey, {
        open: () => menubar.value() === value.value,
        picked: menubar.picked,
      });
    return () => h(RekaMenubarMenu, { ...attrs, value: value.value }, slots);
  },
}) as unknown as typeof RekaMenubarMenu;

const MenubarTrigger = defineComponent({
  name: 'MenubarTrigger',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const highlight = useTriggerHighlight(() => isOn(attrs.disabled));
    return () =>
      h(
        RekaMenubarTrigger,
        {
          ...attrs,
          ref: (node: unknown) => highlight.setElement(elementOf(node)),
        },
        {
          default: (slotProps: Record<string, unknown>) => [
            slots.default?.(slotProps),
            ...highlight.render(),
          ],
        },
      );
  },
}) as unknown as typeof RekaMenubarTrigger;

const MenubarPortal = createMenuPortal(
  RekaMenubarPortal,
  'MenubarPortal',
) as unknown as typeof RekaMenubarPortal;
const MenubarContent = createMenuContent(RekaMenubarContent, 'MenubarContent', {
  origin: ORIGIN,
  returnFocus: 'trigger',
  handoff: true,
}) as unknown as typeof RekaMenubarContent;
const MenubarItem = createMenuItem(
  RekaMenubarItem,
  'MenubarItem',
) as unknown as typeof RekaMenubarItem;
const MenubarCheckboxItem = createMenuCheckItem(
  RekaMenubarCheckboxItem,
  'MenubarCheckboxItem',
  'checkbox',
) as unknown as typeof RekaMenubarCheckboxItem;
const MenubarRadioGroup = createMenuRadioGroup(
  RekaMenubarRadioGroup,
  'MenubarRadioGroup',
) as unknown as typeof RekaMenubarRadioGroup;
const MenubarRadioItem = createMenuCheckItem(
  RekaMenubarRadioItem,
  'MenubarRadioItem',
  'radio',
) as unknown as typeof RekaMenubarRadioItem;
const MenubarItemIndicator = createMenuItemIndicator(
  RekaMenubarItemIndicator,
  'MenubarItemIndicator',
) as unknown as typeof RekaMenubarItemIndicator;
const MenubarSub = createMenuRoot(RekaMenubarSub, 'MenubarSub', {
  sub: true,
}) as unknown as typeof RekaMenubarSub;
const MenubarSubTrigger = createMenuItem(
  RekaMenubarSubTrigger,
  'MenubarSubTrigger',
) as unknown as typeof RekaMenubarSubTrigger;
const MenubarSubContent = createMenuContent(
  RekaMenubarSubContent,
  'MenubarSubContent',
  { origin: ORIGIN, sub: true, returnFocus: 'none' },
) as unknown as typeof RekaMenubarSubContent;

export {
  MenubarGroup,
  MenubarLabel,
  MenubarSeparator,
  MenubarArrow,
  type MenubarRootProps,
  type MenubarRootEmits,
  type MenubarMenuProps,
  type MenubarTriggerProps,
  type MenubarPortalProps,
  type MenubarContentEmits,
  type MenubarItemProps,
  type MenubarItemEmits,
  type MenubarCheckboxItemProps,
  type MenubarCheckboxItemEmits,
  type MenubarRadioGroupProps,
  type MenubarRadioGroupEmits,
  type MenubarRadioItemProps,
  type MenubarRadioItemEmits,
  type MenubarSubProps,
  type MenubarSubEmits,
  type MenubarSubTriggerProps,
  type MenubarSubContentEmits,
} from 'reka-ui';

export {
  MenubarRoot,
  MenubarMenu,
  MenubarTrigger,
  MenubarPortal,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarItemIndicator,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  type MenubarContentProps,
  type MenubarSubContentProps,
  type MenubarItemIndicatorProps,
};
