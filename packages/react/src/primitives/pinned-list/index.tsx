'use client';

import * as React from 'react';
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  type HTMLMotionProps,
} from 'motion/react';

import { Slot, type WithAsChild } from '../slot';
import { getStrictContext } from '../../utils/strict-context';
import {
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../utils/motion';

const PINNED_LIST_HOVER_SCALE = 1.02;

type PinnedListContextType = {
  movingId: string | null;
  setMovingId: (id: string | null) => void;
  onPinnedChange?: (id: string) => void;
};

type PinnedListItemContextType = {
  id: string;
};

const [PinnedListProvider, usePinnedList] =
  getStrictContext<PinnedListContextType>('PinnedListContext');

const [PinnedListItemProvider, usePinnedListItem] =
  getStrictContext<PinnedListItemContextType>('PinnedListItemContext');

type PinnedListProps = HTMLMotionProps<'div'> & {
  children: React.ReactNode;
  onPinnedChange?: (id: string) => void;
};

function PinnedList({ children, onPinnedChange, ...props }: PinnedListProps) {
  const [movingId, setMovingId] = React.useState<string | null>(null);

  return (
    <PinnedListProvider value={{ movingId, setMovingId, onPinnedChange }}>
      <ReducedMotionConfig>
        <motion.div data-slot="pinned-list" {...props}>
          <LayoutGroup>{children}</LayoutGroup>
        </motion.div>
      </ReducedMotionConfig>
    </PinnedListProvider>
  );
}

type PinnedListPinnedProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
};

function PinnedListPinned(props: PinnedListPinnedProps) {
  return <div data-slot="pinned-list-pinned" {...props} />;
}

type PinnedListUnpinnedProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
};

function PinnedListUnpinned(props: PinnedListUnpinnedProps) {
  return <div data-slot="pinned-list-unpinned" {...props} />;
}

type PinnedListLabelProps = WithAsChild<
  HTMLMotionProps<'p'> & {
    hide?: boolean;
  }
>;

function PinnedListLabel({
  hide = false,
  asChild = false,
  transition,
  ...props
}: PinnedListLabelProps) {
  const tokens = useMotionTokens();
  const Component = asChild ? Slot : motion.p;

  return (
    <AnimatePresence initial={false}>
      {!hide && (
        <Component
          layout
          key="pinned-list-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition ?? tokens.transition.change}
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

type PinnedListItemsProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
};

function PinnedListItems(props: PinnedListItemsProps) {
  return <div data-slot="pinned-list-items" {...props} />;
}

type PinnedListItemProps = WithAsChild<
  HTMLMotionProps<'div'> & {
    id: string;
    children: React.ReactNode;
    customTrigger?: boolean;
  }
>;

function PinnedListItem({
  id,
  asChild = false,
  customTrigger = false,
  transition,
  onClick,
  ...props
}: PinnedListItemProps) {
  const {
    spring,
    scale: motionScale,
    transition: motionTransition,
  } = useMotionTokens();
  const { movingId, setMovingId, onPinnedChange } = usePinnedList();
  const reduce = useShouldReduceMotion();

  const Component = asChild ? Slot : motion.div;

  return (
    <PinnedListItemProvider value={{ id }}>
      <Component
        data-slot="pinned-list-item"
        layoutId={`pinned-list-item-${id}`}
        style={{
          position: 'relative',
          zIndex: movingId === id ? 10 : undefined,
        }}
        onLayoutAnimationComplete={() => {
          if (id === movingId) setMovingId(null);
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!customTrigger) {
            setMovingId(id);
            onPinnedChange?.(id);
          }
          onClick?.(e);
        }}
        transition={transition ?? spring.default}
        whileHover={
          !customTrigger
            ? {
                scale: reduce ? 1 : PINNED_LIST_HOVER_SCALE,
                transition: motionTransition.press,
              }
            : undefined
        }
        whileTap={
          !customTrigger
            ? {
                scale: reduce ? 1 : motionScale.press,
                transition: motionTransition.press,
              }
            : undefined
        }
        {...props}
      />
    </PinnedListItemProvider>
  );
}

type PinnedListTriggerProps = WithAsChild<HTMLMotionProps<'button'>>;

function PinnedListTrigger({
  asChild = false,
  onClick,
  ...props
}: PinnedListTriggerProps) {
  const { scale: motionScale, transition: motionTransition } =
    useMotionTokens();
  const { setMovingId, onPinnedChange } = usePinnedList();
  const { id } = usePinnedListItem();
  const reduce = useShouldReduceMotion();

  const Component = asChild ? Slot : motion.button;

  return (
    <Component
      data-slot="pinned-list-trigger"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setMovingId(id);
        onPinnedChange?.(id);
        onClick?.(e);
      }}
      whileHover={{
        scale: reduce ? 1 : PINNED_LIST_HOVER_SCALE,
        transition: motionTransition.press,
      }}
      whileTap={{
        scale: reduce ? 1 : motionScale.press,
        transition: motionTransition.press,
      }}
      transition={motionTransition.press}
      {...props}
    />
  );
}

export {
  PinnedList,
  PinnedListPinned,
  PinnedListUnpinned,
  PinnedListLabel,
  PinnedListItems,
  PinnedListItem,
  PinnedListTrigger,
  usePinnedList,
  usePinnedListItem,
  type PinnedListProps,
  type PinnedListPinnedProps,
  type PinnedListUnpinnedProps,
  type PinnedListLabelProps,
  type PinnedListItemsProps,
  type PinnedListItemProps,
  type PinnedListTriggerProps,
  type PinnedListContextType,
  type PinnedListItemContextType,
};
