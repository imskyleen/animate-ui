import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPortal,
  DialogBackdrop,
  DialogClose,
  type DialogFlipDirection,
} from '@/registry/primitives/base/dialog';
import { X } from 'lucide-react';

type BaseDialogDemoProps = {
  from: DialogFlipDirection;
};

export const BaseDialogDemo = ({ from }: BaseDialogDemoProps) => {
  return (
    <Dialog>
      <DialogTrigger className="bg-primary text-primary-foreground px-4 py-2 text-sm">
        Open Dialog
      </DialogTrigger>

      <DialogPortal>
        <DialogBackdrop className="fixed inset-0 z-50 bg-black/80" />
        <DialogPopup
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
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
};
