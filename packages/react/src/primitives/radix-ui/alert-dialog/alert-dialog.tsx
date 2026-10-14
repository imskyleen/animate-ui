'use client';

import type * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { createRadixModal } from '../dialog/create-radix-modal';
import type {
  FlipDirection,
  ModalAnimationProps,
} from '../../../internal/modal-motion';
import { type Part } from '../../../internal/part';

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

type OverlayAnimationProps = {
  transition?: ModalAnimationProps['transition'];
  exitTransition?: ModalAnimationProps['transition'];
};

type AlertDialogFlipDirection = FlipDirection;

type ContentAnimationProps = {
  from?: AlertDialogFlipDirection;
  transition?: ModalAnimationProps['transition'];
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
const Overlay: Part<
  AlertDialogOverlayProps & React.RefAttributes<HTMLDivElement>
> = modal.Overlay;
Overlay.displayName = 'AlertDialogOverlay';
const Content: Part<
  AlertDialogContentProps & React.RefAttributes<HTMLDivElement>
> = modal.Content;
Content.displayName = 'AlertDialogContent';

const Trigger = AlertDialogPrimitive.Trigger;
const Action = AlertDialogPrimitive.Action;
const Cancel = AlertDialogPrimitive.Cancel;
const Title = AlertDialogPrimitive.Title;
const Description = AlertDialogPrimitive.Description;

const createAlertDialogScope: typeof AlertDialogPrimitive.createAlertDialogScope =
  AlertDialogPrimitive.createAlertDialogScope;

export {
  Root,
  Root as AlertDialog,
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
  type AlertDialogFlipDirection,
};
