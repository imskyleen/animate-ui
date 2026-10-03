'use client';

import type * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { createRadixModal } from './create-radix-modal';
import type { ModalAnimationProps } from '../../../internal/modal-motion';

// Same API as Radix's Dialog. The Overlay fades, the Content scales from 0.95
// around its center, or slides from its edge when it has `data-side`
// (shadcn/ui's Sheet). See create-radix-modal.tsx for the wiring.

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
  /** Fade in. Defaults to `transition.modal` (600ms). */
  transition?: ModalAnimationProps['transition'];
  /** Fade out. Defaults to `transition.modalExit` (400ms). */
  exitTransition?: ModalAnimationProps['transition'];
};

/** Animate UI's additions to `Dialog.Content`. */
type ContentAnimationProps = {
  /**
   * Transition of the opening. Defaults to `transition.modal` (600ms), or
   * `transition.drawer` when the content has `data-side`.
   */
  transition?: ModalAnimationProps['transition'];
  /**
   * Transition of the closing. Defaults to `transition.modalExit` (400ms), or
   * `transition.drawerExit` when the content has `data-side`.
   */
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
};
