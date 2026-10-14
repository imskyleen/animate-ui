'use client';

import type * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { createRadixModal } from './create-radix-modal';
import type {
  FlipDirection,
  ModalAnimationProps,
} from '../../../internal/modal-motion';
import { type Part } from '../../../internal/part';

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

type OverlayAnimationProps = {
  transition?: ModalAnimationProps['transition'];
  exitTransition?: ModalAnimationProps['transition'];
};

type DialogFlipDirection = FlipDirection;

type ContentAnimationProps = {
  from?: DialogFlipDirection;
  transition?: ModalAnimationProps['transition'];
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
const Overlay: Part<DialogOverlayProps & React.RefAttributes<HTMLDivElement>> =
  modal.Overlay;
Overlay.displayName = 'DialogOverlay';
const Content: Part<DialogContentProps & React.RefAttributes<HTMLDivElement>> =
  modal.Content;
Content.displayName = 'DialogContent';

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
  Root as Dialog,
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
