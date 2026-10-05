'use client';

import * as React from 'react';
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  type HTMLMotionProps,
} from 'motion/react';

import { Slot, type WithAsChild } from '@/registry/primitives/animate/slot';
import { getStrictContext } from '@/registry/lib/get-strict-context';

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
      <motion.div data-slot="pinned-list" {...props}>
        <LayoutGroup>{children}</LayoutGroup>
      </motion.div>
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
  transition = { duration: 0.22, ease: 'easeInOut' },
  ...props
}: PinnedListLabelProps) {
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
          transition={transition}
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
  transition = { stiffness: 320, damping: 25, mass: 0.8, type: 'spring' },
  onClick,
  ...props
}: PinnedListItemProps) {
  const { movingId, setMovingId, onPinnedChange } = usePinnedList();

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
        transition={transition}
        whileHover={!customTrigger ? { scale: 1.05 } : undefined}
        whileTap={!customTrigger ? { scale: 0.95 } : undefined}
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
  const { setMovingId, onPinnedChange } = usePinnedList();
  const { id } = usePinnedListItem();

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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
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
