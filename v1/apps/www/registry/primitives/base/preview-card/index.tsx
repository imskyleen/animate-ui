'use client';

import * as React from 'react';
import { PreviewCard as PreviewCardPrimitive } from '@base-ui-components/react/preview-card';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
  type MotionValue,
  type SpringOptions,
} from 'motion/react';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { useControlledState } from '@/registry/hooks/use-controlled-state';

type PreviewCardContextType = {
  isOpen: boolean;
  setIsOpen: PreviewCardProps['onOpenChange'];
  x: MotionValue<number>;
  y: MotionValue<number>;
  followCursor?: boolean | 'x' | 'y';
  followCursorSpringOptions?: SpringOptions;
};

const [PreviewCardProvider, usePreviewCard] =
  getStrictContext<PreviewCardContextType>('PreviewCardContext');

type PreviewCardProps = React.ComponentProps<
  typeof PreviewCardPrimitive.Root
> & {
  followCursor?: boolean | 'x' | 'y';
  followCursorSpringOptions?: SpringOptions;
};

function PreviewCard({
  followCursor = false,
  followCursorSpringOptions = { stiffness: 200, damping: 17 },
  ...props
}: PreviewCardProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <PreviewCardProvider
      value={{
        isOpen,
        setIsOpen,
        x,
        y,
        followCursor,
        followCursorSpringOptions,
      }}
    >
      <PreviewCardPrimitive.Root
        data-slot="preview-card"
        {...props}
        onOpenChange={setIsOpen}
      />
    </PreviewCardProvider>
  );
}

type PreviewCardTriggerProps = React.ComponentProps<
  typeof PreviewCardPrimitive.Trigger
>;

function PreviewCardTrigger({
  onMouseMove,
  ...props
}: PreviewCardTriggerProps) {
  const { x, y, followCursor } = usePreviewCard();

  const handleMouseMove = (
    event: Parameters<NonNullable<PreviewCardTriggerProps['onMouseMove']>>[0],
  ) => {
    onMouseMove?.(event);

    const target = event.currentTarget.getBoundingClientRect();

    if (followCursor === 'x' || followCursor === true) {
      const eventOffsetX = event.clientX - target.left;
      const offsetXFromCenter = (eventOffsetX - target.width / 2) / 2;
      x.set(offsetXFromCenter);
    }

    if (followCursor === 'y' || followCursor === true) {
      const eventOffsetY = event.clientY - target.top;
      const offsetYFromCenter = (eventOffsetY - target.height / 2) / 2;
      y.set(offsetYFromCenter);
    }
  };

  return (
    <PreviewCardPrimitive.Trigger
      data-slot="preview-card-trigger"
      onMouseMove={handleMouseMove}
      {...props}
    />
  );
}

type PreviewCardPortalProps = Omit<
  React.ComponentProps<typeof PreviewCardPrimitive.Portal>,
  'keepMounted'
>;

function PreviewCardPortal(props: PreviewCardPortalProps) {
  const { isOpen } = usePreviewCard();

  return (
    <AnimatePresence>
      {isOpen && (
        <PreviewCardPrimitive.Portal
          keepMounted
          data-slot="preview-card-portal"
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

type PreviewCardPositionerProps = React.ComponentProps<
  typeof PreviewCardPrimitive.Positioner
>;

function PreviewCardPositioner(props: PreviewCardPositionerProps) {
  return (
    <PreviewCardPrimitive.Positioner
      data-slot="preview-card-positioner"
      {...props}
    />
  );
}

type PreviewCardPopupProps = Omit<
  React.ComponentProps<typeof PreviewCardPrimitive.Popup>,
  'render'
> &
  HTMLMotionProps<'div'>;

function PreviewCardPopup({
  transition = { type: 'spring', stiffness: 300, damping: 25 },
  style,
  ...props
}: PreviewCardPopupProps) {
  const { x, y, followCursor, followCursorSpringOptions } = usePreviewCard();
  const translateX = useSpring(x, followCursorSpringOptions);
  const translateY = useSpring(y, followCursorSpringOptions);

  return (
    <PreviewCardPrimitive.Popup
      render={
        <motion.div
          key="preview-card-popup"
          data-slot="preview-card-popup"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={transition}
          style={{
            x:
              followCursor === 'x' || followCursor === true
                ? translateX
                : undefined,
            y:
              followCursor === 'y' || followCursor === true
                ? translateY
                : undefined,
            ...style,
          }}
          {...props}
        />
      }
    />
  );
}

type PreviewCardBackdropProps = React.ComponentProps<
  typeof PreviewCardPrimitive.Backdrop
>;

function PreviewCardBackdrop(props: PreviewCardBackdropProps) {
  return (
    <PreviewCardPrimitive.Backdrop
      data-slot="preview-card-backdrop"
      {...props}
    />
  );
}

type PreviewCardArrowProps = React.ComponentProps<
  typeof PreviewCardPrimitive.Arrow
>;

function PreviewCardArrow(props: PreviewCardArrowProps) {
  return (
    <PreviewCardPrimitive.Arrow data-slot="preview-card-arrow" {...props} />
  );
}

export {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardPortal,
  PreviewCardPositioner,
  PreviewCardPopup,
  PreviewCardBackdrop,
  PreviewCardArrow,
  usePreviewCard,
  type PreviewCardProps,
  type PreviewCardTriggerProps,
  type PreviewCardPortalProps,
  type PreviewCardPositionerProps,
  type PreviewCardPopupProps,
  type PreviewCardBackdropProps,
  type PreviewCardArrowProps,
  type PreviewCardContextType,
};
