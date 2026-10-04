'use client';

import type * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { createRadixModal } from '../dialog/create-radix-modal';
import type { ModalAnimationProps } from '../../../internal/modal-motion';

// Same API as Radix's Alert Dialog, animated like the Dialog (Animate UI v1):
// the Overlay fades and un-blurs, the Content tips forward from
// `perspective(500px) rotateX(-20deg) scale(0.8)` on a spring.

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
  /**
   * Fade (and blur) in.
   * @default { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
   */
  transition?: ModalAnimationProps['transition'];
  /** Fade (and blur) out. Defaults to `transition`. */
  exitTransition?: ModalAnimationProps['transition'];
};

/** Animate UI's additions to `AlertDialog.Content`. */
type ContentAnimationProps = {
  /**
   * Transition of the opening.
   * @default { type: 'spring', stiffness: 150, damping: 25 }
   */
  transition?: ModalAnimationProps['transition'];
  /** Transition of the closing. Defaults to `transition`. */
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
