'use client';

import * as React from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  type DialogFlipDirection,
} from '@/registry/primitives/headless/dialog';
import { X } from 'lucide-react';

type RadixDialogDemoProps = {
  from: DialogFlipDirection;
};

export const RadixDialogDemo = ({ from }: RadixDialogDemoProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <button
        className="bg-primary text-primary-foreground px-4 py-2 text-sm"
        onClick={() => setIsOpen(true)}
      >
        Open Dialog
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogBackdrop className="fixed inset-0 z-50 bg-black/80" />
        <DialogPanel
          from={from}
          className="sm:max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 border bg-background p-6"
        >
          <DialogHeader>
            <DialogTitle className="text-lg">Terms of Service</DialogTitle>
            <DialogDescription className="text-sm">
              Please read the following terms of service carefully.
            </DialogDescription>
          </DialogHeader>

          <p className="py-4 text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
            quos. Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Quisquam, quos.
          </p>

          <DialogFooter>
            <button className="bg-primary text-primary-foreground px-4 py-2 text-sm">
              Accept
            </button>
          </DialogFooter>

          <DialogClose className="absolute top-4 right-4">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogPanel>
      </Dialog>
    </div>
  );
};
