'use client';

import type * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { createRadixModal } from '../dialog/create-radix-modal';
import type { ModalAnimationProps } from '../../../internal/modal-motion';

// Same API as Radix's Alert Dialog, animated like the Dialog: the Overlay
// fades, the Content scales from 0.95 around its center.

type AlertDialogProps = AlertDialogPrimitive.AlertDialogProps;
type AlertDialogTriggerProps = AlertDialogPrimitive.AlertDialogTriggerProps;
type AlertDialogPortalProps = AlertDialogPrimitive.AlertDialogPortalProps;
type AlertDialogOverlayProps = AlertDialogPrimitive.AlertDialogOverlayProps &
  OverlayAnimationProps;
type AlertDialogContentProps = AlertDialogPrimitive.AlertDialogContentProps &
  ContentAnimationProps;
type AlertDialogActionProps = AlertDialogPrimitive.AlertDialogActionProps;
type AlertDialogCancelProps = AlertDialogPrimitive.AlertDialogCancelProps;
type AlertDialogTitleProps = AlertDialogPrimitive.AlertDialogTitleProps;
type AlertDialogDescriptionProps =
  AlertDialogPrimitive.AlertDialogDescriptionProps;

/** Animate UI's additions to `AlertDialog.Overlay`. */
type OverlayAnimationProps = {
  /** Fade in. Defaults to `transition.modal` (600ms). */
  transition?: ModalAnimationProps['transition'];
  /** Fade out. Defaults to `transition.modalExit` (400ms). */
  exitTransition?: ModalAnimationProps['transition'];
};

/** Animate UI's additions to `AlertDialog.Content`. */
type ContentAnimationProps = {
  /** Transition of the opening. Defaults to `transition.modal` (600ms). */
  transition?: ModalAnimationProps['transition'];
  /** Transition of the closing. Defaults to `transition.modalExit` (400ms). */
  exitTransition?: ModalAnimationProps['transition'];
};

const modal = createRadixModal(
  {
    Root: AlertDialogPrimitive.Root,
    Portal: AlertDialogPrimitive.Portal,
    Overlay: AlertDialogPrimitive.Overlay,
    Content: AlertDialogPrimitive.Content,
  },
  'AlertDialog',
);

const Root: React.FC<AlertDialogProps> = modal.Root;
const Portal: React.FC<AlertDialogPortalProps> = modal.Portal;
const Overlay: React.FC<
  AlertDialogOverlayProps & React.RefAttributes<HTMLDivElement>
> = modal.Overlay;
const Content: React.FC<
  AlertDialogContentProps & React.RefAttributes<HTMLDivElement>
> = modal.Content;

const Trigger = AlertDialogPrimitive.Trigger;
const Action = AlertDialogPrimitive.Action;
const Cancel = AlertDialogPrimitive.Cancel;
const Title = AlertDialogPrimitive.Title;
const Description = AlertDialogPrimitive.Description;

const createAlertDialogScope: typeof AlertDialogPrimitive.createAlertDialogScope =
  AlertDialogPrimitive.createAlertDialogScope;

export {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Action,
  Cancel,
  Title,
  Description,
  Trigger as AlertDialogTrigger,
  Portal as AlertDialogPortal,
  Overlay as AlertDialogOverlay,
  Content as AlertDialogContent,
  Action as AlertDialogAction,
  Cancel as AlertDialogCancel,
  Title as AlertDialogTitle,
  Description as AlertDialogDescription,
  createAlertDialogScope,
  type AlertDialogProps,
  type AlertDialogTriggerProps,
  type AlertDialogPortalProps,
  type AlertDialogOverlayProps,
  type AlertDialogContentProps,
  type AlertDialogActionProps,
  type AlertDialogCancelProps,
  type AlertDialogTitleProps,
  type AlertDialogDescriptionProps,
};
