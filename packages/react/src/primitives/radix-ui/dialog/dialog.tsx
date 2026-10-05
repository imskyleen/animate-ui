'use client';

import type * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { createRadixModal } from './create-radix-modal';
import type {
  FlipDirection,
  ModalAnimationProps,
} from '../../../internal/modal-motion';

// Same API as Radix's Dialog, animated like Animate UI v1: the Overlay fades
// and un-blurs, the Content tips forward from `perspective(500px)
// rotateX(-20deg) scale(0.8)` on a spring, or slides and fades in from its edge
// when it has `data-side` (shadcn/ui's Sheet). See create-radix-modal.tsx for
// the wiring and ../../../internal/modal-motion.ts for the motion.

type DialogProps = DialogPrimitive.DialogProps;
type DialogTriggerProps = DialogPrimitive.DialogTriggerProps;
type DialogPortalProps = DialogPrimitive.DialogPortalProps;
type DialogOverlayProps = DialogPrimitive.DialogOverlayProps &
  OverlayAnimationProps;
type DialogContentProps = DialogPrimitive.DialogContentProps &
  ContentAnimationProps;
type DialogTitleProps = DialogPrimitive.DialogTitleProps;
type DialogDescriptionProps = DialogPrimitive.DialogDescriptionProps;
type DialogCloseProps = DialogPrimitive.DialogCloseProps;

/** Animate UI's additions to `Dialog.Overlay`. */
type OverlayAnimationProps = {
  /**
   * Fade (and blur) in.
   * @default { duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }
   */
  transition?: ModalAnimationProps['transition'];
  /** Fade (and blur) out. Defaults to `transition`. */
  exitTransition?: ModalAnimationProps['transition'];
};

/** The edge `Dialog.Content` tips from (Animate UI v1's `from`). */
type DialogFlipDirection = FlipDirection;

/** Animate UI's additions to `Dialog.Content`. */
type ContentAnimationProps = {
  /**
   * The edge the content tips from as it comes in (and goes back to), as in
   * Animate UI v1. Ignored by a sheet (`data-side`), which slides from its
   * side.
   * @default 'top'
   */
  from?: DialogFlipDirection;
  /**
   * Transition of the opening, a sheet's slide from its `data-side` edge
   * included.
   * @default { type: 'spring', stiffness: 150, damping: 25 } (damping 22 for a
   * sheet, with `data-side`)
   */
  transition?: ModalAnimationProps['transition'];
  /** Transition of the closing. Defaults to `transition`. */
  exitTransition?: ModalAnimationProps['transition'];
};

const modal = createRadixModal(
  {
    Root: DialogPrimitive.Root,
    Portal: DialogPrimitive.Portal,
    Overlay: DialogPrimitive.Overlay,
    Content: DialogPrimitive.Content,
  },
  'Dialog',
);

const Root: React.FC<DialogProps> = modal.Root;
const Portal: React.FC<DialogPortalProps> = modal.Portal;
const Overlay: React.FC<
  DialogOverlayProps & React.RefAttributes<HTMLDivElement>
> = modal.Overlay;
const Content: React.FC<
  DialogContentProps & React.RefAttributes<HTMLDivElement>
> = modal.Content;

const Trigger = DialogPrimitive.Trigger;
const Title = DialogPrimitive.Title;
const Description = DialogPrimitive.Description;
const Close = DialogPrimitive.Close;

const WarningProvider: typeof DialogPrimitive.WarningProvider =
  DialogPrimitive.WarningProvider;
const createDialogScope: typeof DialogPrimitive.createDialogScope =
  DialogPrimitive.createDialogScope;

export {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Close,
  Trigger as DialogTrigger,
  Portal as DialogPortal,
  Overlay as DialogOverlay,
  Content as DialogContent,
  Title as DialogTitle,
  Description as DialogDescription,
  Close as DialogClose,
  WarningProvider,
  createDialogScope,
  type DialogProps,
  type DialogTriggerProps,
  type DialogPortalProps,
  type DialogOverlayProps,
  type DialogContentProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogCloseProps,
  type DialogFlipDirection,
};
